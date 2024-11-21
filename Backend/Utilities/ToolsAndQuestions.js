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
      },
      {
        _id: "kubernetes",
        name: "Kubernetes",
        description: "Learn container orchestration with Kubernetes, covering deployment, scaling, and management of containerized applications in a distributed environment.",
        labs: [
          {
            id: "1",
            name: "Introduction to Kubernetes",
            description: "Understand the fundamentals of Kubernetes, including Pods, Deployments, and Services, and how to set up a Kubernetes cluster."
          },
          {
            id: "2",
            name: "Kubernetes Networking and Services",
            description: "Explore Kubernetes networking, how Services enable communication between Pods, and how to expose applications to the outside world."
          },
          {
            id: "3",
            name: "Kubernetes Scaling and Auto-scaling",
            description: "Learn about scaling applications in Kubernetes using Horizontal Pod Autoscaler, and how Kubernetes can manage resource utilization."
          },
          {
            id: "4",
            name: "Kubernetes Storage and Volumes",
            description: "Understand how Kubernetes manages persistent storage with Persistent Volumes and Persistent Volume Claims for stateful applications."
          },
          {
            id: "5",
            name: "Kubernetes Security and Best Practices",
            description: "Learn about security practices in Kubernetes, including Role-Based Access Control (RBAC), secrets management, and ensuring secure deployments."
          }
        ]
      },
      {
        _id: "terraform",
        name: "Terraform",
        description: "Learn Infrastructure as Code (IaC) with Terraform to automate the provisioning and management of cloud resources.",
        labs: [
          {
            id: "1",
            name: "Introduction to Terraform",
            description: "Get familiar with Terraform basics, including writing configuration files, initializing projects, and applying changes."
          },
          {
            id: "2",
            name: "Terraform State Management",
            description: "Learn how to manage Terraform state files, including using remote state and state locking for team collaboration."
          },
          {
            id: "3",
            name: "Working with Providers and Resources",
            description: "Understand how to use Terraform providers and resources to interact with different cloud platforms like AWS, Azure, or GCP."
          },
          {
            id: "4",
            name: "Terraform Modules",
            description: "Learn how to create and use Terraform modules for better reusability and organization in complex configurations."
          },
          {
            id: "5",
            name: "Terraform and Cloud Automation",
            description: "Automate cloud infrastructure provisioning with Terraform and integrate it into a CI/CD pipeline for continuous deployment."
          }
        ]
      },
      {
        _id: "linux",
        name: "Linux",
        description: "Master Linux administration and command-line skills to manage systems, automate tasks, and enhance security.",
        labs: [
          {
            id: "1",
            name: "Introduction to Linux Command Line",
            description: "Learn basic Linux commands for file manipulation, navigation, and system information retrieval."
          },
          {
            id: "2",
            name: "Linux File System and Permissions",
            description: "Understand the Linux file system structure and how to manage file and directory permissions using `chmod`, `chown`, and `ls`."
          },
          {
            id: "3",
            name: "Process Management in Linux",
            description: "Explore how to manage running processes, use job control, and monitor system performance with tools like `ps`, `top`, and `htop`."
          },
          {
            id: "4",
            name: "Linux Networking and Firewalls",
            description: "Learn to configure network interfaces, troubleshoot networking issues, and set up firewalls using `iptables`."
          },
          {
            id: "5",
            name: "Linux Automation and Scripting",
            description: "Automate repetitive tasks and system management with Bash scripting, cron jobs, and other automation tools."
          }
        ]
      },
      {
        _id: "git",
        name: "Git",
        description: "Master version control with Git to manage source code changes, collaborate with teams, and maintain project history.",
        labs: [
          {
            id: "1",
            name: "Introduction to Git",
            description: "Learn the basics of Git, including initializing repositories, committing changes, and understanding the staging area."
          },
          {
            id: "2",
            name: "Branching and Merging in Git",
            description: "Understand how to create branches, manage merges, and resolve conflicts in Git for effective parallel development."
          },
          {
            id: "3",
            name: "Git Remote Repositories",
            description: "Learn how to work with remote repositories, including cloning, pushing, pulling, and managing multiple remotes."
          },
          {
            id: "4",
            name: "Git Workflows",
            description: "Explore different Git workflows like GitFlow, feature branching, and how to integrate them into your team's development cycle."
          },
          {
            id: "5",
            name: "Advanced Git Features",
            description: "Learn about advanced Git features such as rebasing, stashing, and using submodules to manage complex projects."
          }
        ]
      },
      {
        _id: "jenkins",
        name: "Jenkins",
        description: "Learn continuous integration and delivery (CI/CD) using Jenkins, an automation server for building, testing, and deploying applications.",
        labs: [
          {
            id: "1",
            name: "Introduction to Jenkins",
            description: "Get started with Jenkins by installing and configuring it, and creating your first Jenkins job."
          },
          {
            id: "2",
            name: "Jenkins Pipelines",
            description: "Understand the fundamentals of Jenkins pipelines, including declarative and scripted pipelines to automate builds and deployments."
          },
          {
            id: "3",
            name: "Integrating Jenkins with Git",
            description: "Learn how to integrate Jenkins with Git repositories for automated builds triggered by code changes in your repository."
          },
          {
            id: "4",
            name: "Jenkins and Continuous Deployment",
            description: "Set up Jenkins for continuous deployment by automating deployment processes and integrating with cloud platforms and servers."
          },
          {
            id: "5",
            name: "Jenkins Security and Best Practices",
            description: "Learn how to secure your Jenkins instance, configure user roles, and follow best practices for Jenkins administration."
          }
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
  