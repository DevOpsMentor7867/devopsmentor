const redisClientPool = require('../redis/redis-server');
const dockerClientPool = require('../docker/docker_connection');
const { setUpSocketServer, getIo } = require('../socketServer/socket');
const Bull = require("bull");
const stream = require('stream');
const pty = require('node-pty');

const containerStart = new Bull("linuxContainerStart", { redis: { port: 6379, host: "localhost" } });
const containerExec = new Bull("linuxContainerExecute", { redis: { port: 6379, host: "localhost" } });
const containerClose = new Bull("linuxContainerClose", { redis: { port: 6379, host: "localhost" } });

const ptySessions = {};

const setupTerminalNamespace = async () => {
    const io = getIo();
    const terminalNamespace = io.of('/terminal');
  
    console.log("Initializing Terminal Namespace...");
    terminalNamespace.on('connection', async (socket) => {
      let dockerClient = await dockerClientPool.borrowClient();
      let redisClient = await redisClientPool.borrowClient();
      const docker_image = socket.handshake.auth.docker_image;

      // Create and start a new container for each connection
      const container = await dockerClient.createContainer({
        Image: docker_image,
        Cmd: ['/bin/bash'],
        Tty: true,
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        OpenStdin: true,
        StdinOnce: false,
        HostConfig: {
          Privileged: true,
          CapAdd: ['ALL'],
        },
      });
  
      console.log(`Starting the container for socket ID: ${socket.id}...`);
      await container.start();
  
      const containerId = container.id;
      await redisClient.set(`container:${socket.id}`, containerId);
  
      // Create a PTY instance and attach it to the running container
      const ptyProcess = pty.spawn('docker', ['exec', '-it', containerId, '/bin/bash'], {
        name: 'xterm-color',
        cols: 80,
        rows: 24,
      });
  
      // Store PTY process for this user
      ptySessions[socket.id] = ptyProcess;
  
      // Handle output from PTY and send it to frontend
      ptyProcess.onData((data) => {
        socket.emit('output', data);
      });
  
      socket.on('command', (command) => {
        if (command !== "done_lab") {
          ptySessions[socket.id]?.write(command); // Use stored PTY instance
        }
      });
  
      socket.on('resize', ({ cols, rows }) => {
        ptySessions[socket.id]?.resize(cols, rows);
      });
  
      socket.on('disconnect', async () => {
        console.log(`User disconnected: ${socket.id}`);
        if (ptySessions[socket.id]) {
          ptySessions[socket.id].kill(); // Kill PTY session
          delete ptySessions[socket.id]; // Remove PTY reference
        }
  
        const storedContainerId = await redisClient.get(`container:${socket.id}`);
        if (storedContainerId) {
          const containerToStop = dockerClient.getContainer(storedContainerId);
          await containerToStop.stop();
          await containerToStop.remove();
          console.log(`Container ${storedContainerId} stopped and removed for socket ID: ${socket.id}`);
        }
  
        await redisClient.del(`container:${socket.id}`);
      });
    });
  };
  
  module.exports = setupTerminalNamespace;