const Bull = require("bull");
const Docker = require("dockerode");
const dockerClientPool = require("../docker/docker_connection");
const redisClientPool = require("../redis/redis-server");

const containerExec = new Bull("linuxContainerExecute", {
  redis: { port: 6379, host: "localhost" },
});

containerExec.process(async (job) => {
  const { socketId, script, toolName } = job.data;
  let dockerClient;
  let redisClient;

  console.log("Processing job for:", socketId, toolName);

  try {
    dockerClient = await dockerClientPool.borrowClient();
    redisClient = await redisClientPool.borrowClient();

    let containerId;

    if (toolName === "Ansible") {
      console.log("Inside the Ansible section");
      const storedData = await redisClient.get(`container:${socketId}`);
      if (!storedData) throw new Error("No containers found for this socket.");

      const { containers } = JSON.parse(storedData);
      containerId = containers[`control-node`];

    } else if (toolName === "Jenkins") {
      console.log("Inside the Jenkins section");

      const storedData = await redisClient.get(`jenkins:${socketId}`);
      if (!storedData) throw new Error(`No Jenkins container found for SocketID: ${socketId}`);

      const parsedData = JSON.parse(storedData);
      if (!parsedData.containerId) throw new Error("Jenkins container ID is missing.");

      containerId = parsedData.containerId; // Assign Jenkins container ID

    } else {
      // Generic case for other containers
      containerId = await redisClient.get(`container:${socketId}`);
      if (!containerId) throw new Error(`No container found for socket: ${socketId}`);
    }

    const container = dockerClient.getContainer(containerId);

    const execCheck = await container.exec({
      Cmd: ["bash", "-c", script],
      AttachStdout: true,
      AttachStderr: true,
    });

    const stream = await execCheck.start();
    const output = await new Promise((resolve, reject) => {
      let result = "";
      stream.on("data", (chunk) => (result += chunk.toString()));
      stream.on("end", () => resolve(result));
      stream.on("error", reject);
    });

    console.log(`Script executed for socket: ${socketId}`);
    return output.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();
  } catch (error) {
    console.error("Error during script execution:", error);
    throw new Error("Script execution failed");
  } finally {
    if (redisClient) redisClientPool.returnClient(redisClient);
    if (dockerClient) dockerClientPool.returnClient(dockerClient);
  }
});

module.exports.scriptExecute = async (req, res) => {
  const { socketId, script, toolName } = req.body;
  console.log("Script execution request:", socketId, toolName);

  if (!socketId || !script) {
    return res.status(400).json({ message: "Socket ID, user ID, and script are required" });
  }

  try {
    const job = await containerExec.add(
      { socketId, script, toolName },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
      }
    );

    const results = await job.finished();

    res.status(200).json({
      message: "Script execution request completed",
      result: results,
    });
  } catch (error) {
    console.error("Error enqueuing script execution:", error);
    res.status(500).json({
      message: "Failed to enqueue script execution request",
      error: error.message,
    });
  }
};

containerExec.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed with result: ${result}`);
});

containerExec.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
});
