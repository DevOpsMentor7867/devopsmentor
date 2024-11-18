module.exports = {
    tools: [
      {
        _id: "docker",
        name: "Docker",
        description: "Learn containerization with Docker through hands-on labs, enabling you to build, manage, and deploy applications efficiently in isolated environments.",
        labs: [
          {
            id: "1",
            name: "Introduction to Docker Basics",
            description: "Learn the basics of Docker, including pulling images, managing containers, and checking system status.",
          },
          {
            id: "2",
            name: "Docker Advanced Concepts",
            description: "Dive deeper into Docker networking and orchestration.",
          },
        ]
      }
    ],
    questions: [
      {
        _id: "1",
        toolId: "docker",
        labId: "1",
        text: "Pull an official Docker image for Ubuntu and verify its presence.",
        hint: "Use docker pull command with the ubuntu image.",
        script: "scripts/docker-basics/question-1.sh",
      },
      {
        _id: "2",
        toolId: "docker",
        labId: "1",
        text: "Run a basic Ubuntu container in detached mode.",
        hint: "Use the docker run command with the -d flag.",
        script: "scripts/docker-basics/question-2.sh",
      },
      {
        _id: "3",
        
        toolId: "docker",
        labId: "2",
        text: "Run a basic Ubuntu container in detached mode.",
        hint: "Use the docker run command with the -d flag.",
        script: "scripts/docker-basics/question-2.sh",
      }
    ]
  };
  