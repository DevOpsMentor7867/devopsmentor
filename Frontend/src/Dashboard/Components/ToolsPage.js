import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../UI/button";
import { Card } from "../UI/Card";
import { CardContent } from "../UI/CardContent";
import {
  Settings,
  Home,
  Wrench,
  Beaker,
  GraduationCap,
  User,
  Expand,
  Menu,
  ChevronRight,
  Terminal,
  GitBranch,
  Container,
  Cloud,
  Box,
  FileCode,
} from "lucide-react";

const devOpsTools = [
  {
    name: "Linux Foundation",
    description: "Master the fundamentals of Linux operating system",
    longDescription:
      "The Linux Foundation provides a comprehensive introduction to Linux, covering system architecture, installation, command line operations, and system administration. This foundational knowledge is crucial for any DevOps engineer.",
    icon: Terminal,
  },
  {
    name: "Git",
    description: "Distributed version control system",
    longDescription:
      "Git is essential for version control in software development. It allows multiple developers to work on the same project simultaneously, tracking changes, managing branches, and facilitating collaboration across teams.",
    icon: GitBranch,
  },
  {
    name: "Docker",
    description: "Containerization platform",
    longDescription:
      "Docker enables developers to package applications with all their dependencies into standardized units called containers. This ensures consistency across different development and production environments, simplifying deployment and scaling.",
    icon: Container,
  },
  {
    name: "Kubernetes",
    description: "Container orchestration system",
    longDescription:
      "Kubernetes automates the deployment, scaling, and management of containerized applications. It provides a robust platform for managing clusters of containers, ensuring high availability and efficient resource utilization.",
    icon: Cloud,
  },
  {
    name: "Terraform",
    description: "Infrastructure as Code tool",
    longDescription:
      "Terraform allows you to define and provide data center infrastructure using a declarative configuration language. It enables version control of your infrastructure and supports multiple cloud providers, facilitating consistent and repeatable deployments.",
    icon: Box,
  },
  {
    name: "Ansible",
    description: "Automation tool",
    longDescription:
      "Ansible is an open-source automation tool that simplifies complex tasks like application deployment, configuration management, and orchestration. It uses simple YAML syntax and doesn't require agents on remote systems, making it easy to learn and use.",
    icon: FileCode,
  },
];

const ToolsPage = () => {
  const [tools, setTools] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleToolClick = (toolId, toolName, toolDescription) => {
    navigate(`/dashboard/${toolId}/labs`, {
      state: { toolName, toolDescription },
    });
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/user/gettools");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data.tools)) {
        throw new Error("Tools data is not an array");
      }
      setTools(data.tools);
      console.log(data.tools);
    } catch (error) {
      console.error("Error fetching tools:", error);
      setError(`Failed to load tools. Error: ${error.message}`);
    }
  };

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className=" w-full p-4 overflow-y-auto  mt-3">
      <div className="bg-gradient-to-r from-[#09D1C7] to-[#80EE98]/70 p-6 text-black/70 ">
        <h2 className="text-3xl font-bold mb-2">DevOps Tools and Concepts</h2>
        <p className="text-lg">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex molestias
          deleniti aperiam totam minus neque voluptates aliquam quos dignissimos
          et!
        </p>
      </div>
      {/* <div className="absolute inset-0 opacity-5" /> */}
      <div className="relative p-4 overflow-y-auto  ">
        <div className="absolute inset-0 opacity-5 " />
        <div className="relative max-w-4xl mx-auto">
          {/* Timeline */}
          <div className="space-y-16">
            {/* Timeline Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#09D1C7] transform -translate-x-1/2" />

            {tools.map((tool, index) => (
              <div
                key={tool.name}
                className="relative flex items-center justify-between"
              >
                <Card
                  className={`w-[calc(60%)] border-[#09D1C7]/20 transition-colors group
                    ${
                      index % 3 === 0
                        ? "bg-[#1A202C]/50 hover:bg-[#09D1C7]/5"
                        : index % 3 === 1
                        ? "bg-[#1A202C]/50 hover:bg-[#80EE98]/5"
                        : "bg-[#1A202C]/50 hover:bg-white/5"
                    }
                    ${index % 2 === 0 ? "mr-16" : "order-2 ml-16"}`}
                >
                  <CardContent className="pt-5">
                    <div className="flex  ">
                      <div className="flex-1">
                        <h2
                          className={`text-2xl font-bold mb-1
                          ${
                            index % 3 === 0
                              ? "text-[#09D1C7]"
                              : index % 3 === 1
                              ? "text-[#80EE98]"
                              : "text-white"
                          }`}
                        >
                          {tool.name}
                        </h2>
                        <p className="text-white/70 text-sm mb-2">
                          {tool.description}
                        </p>
                      </div>
                      <img
                        src={`/${tool.name.toLowerCase()}.png`}
                        className="w-28 h-28 ml-4 flex-shrink-0"
                        alt={`${tool.name} logo`}
                      />
                    </div>
                    <Button
                      onClick={() =>
                        handleToolClick(tool._id, tool.name, tool.description)
                      }
                      className={`text-sm px-3 py-1 mt-3
                            ${
                              index % 3 === 0
                                ? "bg-[#09D1C7]/10 text-[#09D1C7] hover:bg-[#09D1C7]/20"
                                : index % 3 === 1
                                ? "bg-[#80EE98]/10 text-[#80EE98] hover:bg-[#80EE98]/20"
                                : "bg-white/10 text-white hover:bg-white/20"
                            }`}
                    >
                      Explore Now <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
                <div
                  className={`absolute left-1/2 w-12 h-12 rounded-full bg-[#1A202C] border-2 flex items-center justify-center z-10 transform -translate-x-1/2
                    ${
                      index % 3 === 0
                        ? "border-[#09D1C7] text-[#09D1C7]"
                        : index % 3 === 1
                        ? "border-[#80EE98] text-[#80EE98]"
                        : "border-white text-white"
                    }`}
                >
                  <motion.div
                    className={`w-8 h-8 rounded-full ${
                      index % 3 === 0
                        ? "bg-[#09D1C7]"
                        : index % 3 === 1
                        ? "bg-[#80EE98]"
                        : "bg-white"
                    }`}
                  />
                </div>
                <Card
                  className={`w-[calc(62%)] border-[#09D1C7]/20 transition-colors group
                    ${
                      index % 3 === 0
                        ? "bg-[#09D1C7]/5 hover:bg-[#09D1C7]/10"
                        : index % 3 === 1
                        ? "bg-[#80EE98]/5 hover:bg-[#80EE98]/10"
                        : "bg-white/5 hover:bg-white/10"
                    }
                    ${index % 2 === 0 ? "order-2 ml-16" : "mr-16"}`}
                >
                  <CardContent className="p-4">
                    <p
                      className={`text-sm pt-4 pb-3
                        ${
                          index % 3 === 0
                            ? "text-[#09D1C7]"
                            : index % 3 === 1
                            ? "text-[#80EE98]"
                            : "text-white"
                        }`}
                    >
                      {tool.intro}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}

            {/* Timer */}
            <div className="fixed bottom-3 right-3 bg-[#1A202C] border border-[#09D1C7]/20 rounded-lg px-3 py-1 font-mono text-[#09D1C7] text-sm">
              01:55:58
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsPage;
