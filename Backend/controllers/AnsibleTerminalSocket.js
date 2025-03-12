const { setUpSocketServer, getIo } = require("../socketServer/socket");
const redisClientPool = require("../redis/redis-server");
const Docker = require("dockerode");
const path = require("path");
const { promisify } = require("util");
const childProcess = require("child_process");
const exec = promisify(childProcess.exec);
const Convert = require("ansi-to-html");
const convert = new Convert();

const setupAnsibleTerminalNamespace = async () => {
  const io = getIo();
  const AnsibleterminalNamespace = io.of("/Ansible-terminal");
  const docker = new Docker();
  console.log("Initializing Ansible Namespace");

  AnsibleterminalNamespace.on("connection", async (socket) => {
    const redisClient = await redisClientPool.borrowClient();
    const uniqueNetworkName = `network_${socket.id}`;
    console.log(`User connected to terminal: ${socket.id}`);

    try {
      // Create a unique network
      const network = await docker.createNetwork({
        Name: uniqueNetworkName,
        Driver: "bridge",
      });

      // Define your container configurations
      const containersConfig = [
        {
          name: `control-node`,
          image: "ahmad7867/ansible-control-node:latest",
        },
        {
          name: `worker-node-1`,
          image: "ahmad7867/ansible-managed-node-1:latest",
        },
        {
          name: `worker-node-2`,
          image: "ahmad7867/ansible-managed-node-2:latest",
        },
      ];

      const containerIds = {};

      // Create and start containers
      for (const config of containersConfig) {
        const container = await docker.createContainer({
          Image: config.image,
          name: config.name,
          Tty: true,
          Env: ["LANG=C.UTF-8", "LC_ALL=C.UTF-8", "TERM=xterm-256color"],
          HostConfig: {
            NetworkMode: uniqueNetworkName,
          },
        });

        await container.start();
        containerIds[config.name] = container.id;
      }

      // Save to Redis
      await redisClient.set(
        `container:${socket.id}`,
        JSON.stringify({
          network: uniqueNetworkName,
          containers: containerIds,
        })
      );

      console.log(`Containers and network set up for socket: ${socket.id}`);

      // Handle exec (example with control_node)
      const controlContainer = docker.getContainer(
        containerIds[`control-node`]
      );
      const execInstance = await controlContainer.exec({
        Cmd: ["/bin/bash"],
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
      });
      const stream = await execInstance.start({ hijack: true, stdin: true });

      stream.on("data", (chunk) => {
        socket.emit("output", chunk.toString());
      });

      socket.on("command", (command) => {
        if (command !== "done_lab") {
          stream.write(command);
        }
      });

      socket.on("disconnect", async () => {
        console.log(`User disconnected: ${socket.id}`);

        try {
          const storedData = await redisClient.get(`container:${socket.id}`);
          if (!storedData)
            throw new Error("No containers found for this socket.");
          if (storedData) {
            const { network, containers } = JSON.parse(storedData);

            // Stop and remove containers
            for (const id of Object.values(containers)) {
              const container = docker.getContainer(id);
              await container.stop().catch(() => {});
              await container.remove().catch(() => {});
            }

            // Remove the network
            const net = docker.getNetwork(network);
            await net.remove().catch(() => {});

            await redisClient.del(`container:${socket.id}`);
            console.log(
              `Cleaned up containers and network for socket: ${socket.id}`
            );
          }
        } catch (err) {
          console.error("Error during cleanup:", err);
        }

        stream.end();
      });
    } catch (err) {
      console.error("Error:", err);
      socket.emit("error", "Failed to set up the environment.");
    } finally {
      redisClientPool.returnClient(redisClient);
    }
  });
};

module.exports = setupAnsibleTerminalNamespace;
