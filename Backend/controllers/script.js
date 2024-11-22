const Bull = require("bull");
const Docker = require("dockerode");
const dockerClientPool = require("../docker/docker_connection");
const redisClientPool = require("../redis/redis-server");

const containerExec = new Bull("linuxContainerExecute",
    { redis: { port: 6379, host: "localhost" } });

/*containerExec.process(async (job) => {
    const { socketId, shellScript } = job.data;
    let dockerClient = await dockerClientPool.borrowClient();
    let redisClient = await redisClientPool.borrowClient();

    try {

        const containerId = await redisClient.get(`container:${socketId}`);
        if (!containerId) {
            throw new Error(`No container found for socket: ${socketId}`);
        }

        const container = dockerClient.getContainer(containerId);


        const exec = await container.exec({
            Cmd: ['/bin/bash', '-c', shellScript],
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
        });

        
        const output = await new Promise((resolve, reject) => {
            exec.start((err, stream) => {
                if (err) return reject(err);

                let outputData = '';
                stream.on('data', (chunk) => {
                    outputData += chunk.toString('utf8');
                });

                stream.on('end', () => {
                    console.log('output is ', outputData);
                    resolve(outputData);
                });

                stream.on('error', (err) => {
                    reject(err);
                });
            });
        });
            
        return { output };
    } catch (error) {
        console.error(`Error executing script for socket ${socketId}:`, error);
        throw error;
    } finally {
        if (redisClient) redisClientPool.returnClient(redisClient);
        if (dockerClient) dockerClientPool.returnClient(dockerClient);
    }
});


module.exports.scriptExecute= async (req, res) => {
    console.log(req.body);
    const { socketId, script } = req.body;

    if (!socketId || !script) {
        return res.status(400).json({ message: "Socket ID and script are required" });
    }

    try {
        // Add the job to the Bull queue for asynchronous execution
        const job = await containerExec.add(
            { socketId, command: script },
            {
                attempts: 3,
                backoff: { type: 'exponential', delay: 2000 },
            }
        );

        // Wait for the job to finish and then return the result
        const result = await job.finished();
        res.status(200).json({ output: result.output });
    } catch (error) {
        console.error("Error adding job to Bull queue:", error);
        res.status(500).json({ message: "Failed to add job to queue", error: error.message });
    }

};*/

/*containerExec.process(async (job) => {
    const { socketId, shellScript } = job.data;
    let dockerClient = await dockerClientPool.borrowClient();
    let redisClient = await redisClientPool.borrowClient();

    try {
        const containerId = await redisClient.get(`container:${socketId}`);
        if (!containerId) {
            throw new Error(`No container found for socket: ${socketId}`);
        }

        const container = dockerClient.getContainer(containerId);

        const execCheck = await container.exec({
            Cmd: ['/bin/bash', '-c', shellScript],
            AttachStdout: true,
            AttachStderr: true,
        });

        const stream = await execCheck.start();
        console.log('ffffffff');
        return new Promise((resolve, reject) => {
            let output = '';
            stream.on('data', (chunk) => {
                output += chunk.toString();
            });
            stream.on('end', () => {
                console.log("Verification output:", output.trim());
                resolve({ output: output.trim() });
            });
            stream.on('error', (err) => {
                reject(err);
            });
        });
    } catch (error) {
        console.error(`Error executing script for socket ${socketId}:`, error);
        return { output: null, error: error.message };
    } finally {
        if (redisClient) redisClientPool.returnClient(redisClient);
        if (dockerClient) dockerClientPool.returnClient(dockerClient);
    }
});*/


/*module.exports.scriptExecute = async (req, res) => {
    console.log("Request body:", req.body);
    const { socketId, script } = req.body;

    if (!socketId || !script) {
        return res.status(400).json({ message: "Socket ID and script are required" });
    }

    try {
        // Add the job to the Bull queue for asynchronous execution
        const job = await containerExec.add(
            { socketId, shellScript: script },  // Changed 'command' to 'shellScript' to match the job data structure
            {
                attempts: 3,
                backoff: { type: 'exponential', delay: 2000 },
            }
        );

        console.log(`Job added to queue with ID: ${job.id}`);

        // Wait for the job to finish and then return the result
        const result = await job.finished();
        console.log("Job result:", result);

        if (result && result.output !== undefined) {
            res.status(200).json({ output: result.output });
        } else {
            console.error("Job completed but output is undefined:", result);
            res.status(500).json({ message: "Job completed but output is undefined" });
        }
    } catch (error) {
        console.error("Error in scriptExecute:", error);
        res.status(500).json({ message: "Failed to execute script", error: error.message });
    }
};*/


/*module.exports.scriptExecute = async (req, res) => {
    console.log("Received script execution request");

    const { socketId, script } = req.body;  // Extract socketId and script from request body

    // Check if both socketId and script are provided
    if (!socketId || !script) {
        return res.status(400).json({ message: "Socket ID and script are required" });
    }

    let dockerClient;
    let redisClient;

    try {
        // Borrow clients from the pools
        dockerClient = await dockerClientPool.borrowClient();
        redisClient = await redisClientPool.borrowClient();

        // Fetch the containerId from Redis using the socketId
        const containerId = await redisClient.get(`container:${socketId}`);
        if (!containerId) {
            throw new Error(`No container found for socket: ${socketId}`);
        }

        const container = dockerClient.getContainer(containerId);

        // Execute the provided script inside the container
        const execCheck = await container.exec({
            Cmd: ['bash', '-c', script],  // Run the passed script inside the container
            AttachStdout: true,
            AttachStderr: true
        });

        const stream = await execCheck.start();

        // Collect the output of the command
        let output = '';
        stream.on('data', (chunk) => {
            output += chunk.toString();
        });

        // Send the output back to the client
        stream.on('end', () => {
            console.log("Verification output:", output.trim());
            //let result = output.trim();
            console.log("Raw output before processing:", JSON.stringify(output));
            const sanitizedOutput = output
                .replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();

            res.status(200).json({ output: sanitizedOutput });
        });

    } catch (error) {
        console.error("Error during script execution:", error);
        res.status(500).json({ message: "Error during script execution. Please check server logs.", error: error.message });
    } finally {
        // Return clients to the pools after use
        if (redisClient) redisClientPool.returnClient(redisClient);
        if (dockerClient) dockerClientPool.returnClient(dockerClient);
    }
};*/




containerExec.process(async (job) => {
    const { socketId, script } = job.data;
    console.log('hhhhhhh');
    let dockerClient;
    let redisClient;

    try {
        // Borrow clients from the pools
        dockerClient = await dockerClientPool.borrowClient();
        redisClient = await redisClientPool.borrowClient();

        // Fetch the containerId from Redis using the socketId
        const containerId = await redisClient.get(`container:${socketId}`);
        if (!containerId) {
            throw new Error(`No container found for socket: ${socketId}`);
        }

        const container = dockerClient.getContainer(containerId);

        // Execute the provided script inside the container
        const execCheck = await container.exec({
            Cmd: ['bash', '-c', script],  // Run the passed script inside the container
            AttachStdout: true,
            AttachStderr: true
        });

        const stream = await execCheck.start();
       /* let output = '';
        await stream.on('data', (chunk) => {
            output += chunk.toString();
        });

        // Send the output back to the client
        await stream.on('end', () => {
            console.log("Verification output:", output.trim());
            //let result = output.trim();
            console.log("Raw output before processing:", JSON.stringify(output));
            const sanitizedOutput = output
                .replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();
            return sanitizedOutput;
            
        });*/
        const output = await new Promise((resolve, reject) => {
            let result = '';
            stream.on('data', (chunk) => {
                result += chunk.toString();
            });

            stream.on('end', () => {
                resolve(result);
            });

            stream.on('error', (err) => {
                reject(err);
            });
        });

        console.log(`Script executed for socket: ${socketId}`);
        console.log("Verification output:", output.trim());

        // Sanitize and return the output
        return output.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();

        
       // return output.trim(); // Return the sanitized output for further use if needed
    } catch (error) {
        console.error("Error during script execution:", error);
        throw new Error("Script execution failed");
    } finally {
        // Return clients to the pools after use
        if (redisClient) redisClientPool.returnClient(redisClient);
        if (dockerClient) dockerClientPool.returnClient(dockerClient);
    }
});


module.exports.scriptExecute = async (req, res) => {
    console.log("Received script execution request");

    const { socketId, script } = req.body;  // Extract socketId and script from request body

    // Check if both socketId and script are provided
    if (!socketId || !script) {
        return res.status(400).json({ message: "Socket ID and script are required" });
    }

    try {
        // Enqueue the job
        await containerExec.add({ socketId, script });
        const job = await containerExec.add(
            { socketId, script },
            {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 2000,
                },
            }
        );

        const results = await job.finished();

        res.status(200).json({ message: "Script execution request added to the queue", result :results });
    } catch (error) {
        console.error("Error adding job to queue:", error);
        res.status(500).json({ message: "Failed to enqueue script execution request", error: error.message });
    }
};

containerExec.on('completed', (job, result) => {
    console.log(`Job ${job.id} completed with result: ${result}`);
});

containerExec.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed with error: ${err.message}`);
});

