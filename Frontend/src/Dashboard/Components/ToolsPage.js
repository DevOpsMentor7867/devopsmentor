import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../UI/button";
import { Card } from "../UI/Card";
import { CardContent } from "../UI/CardContent";
import { ChevronRight } from 'lucide-react';

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
    <div className="w-full pr-4 pt-4 pb-4 md:p-4 overflow-y-auto mt-10 md:mt-3">
      <div className="bg-gradient-to-r from-[#09D1C7] to-[#80EE98]/80 p-4 md:p-6 text-black/70">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">DevOps Tools and Concepts</h2>
        <p className="text-base md:text-lg">
          Providing hands-on experience with industry-standard DevOps Tools, fostering
          expertise in areas like containerization, CI/CD pipelines, and
          cloud-native technologies.
        </p>
      </div>
      <div className="relative p-4 overflow-y-auto">
        <div className="absolute inset-0 opacity-5" />
        <div className="relative max-w-4xl mx-auto">
          {/* Timeline */}
          <div className="space-y-8 md:space-y-16">
            {/* Timeline Line */}
            <div className="md:absolute md:left-1/2 md:top-0 md:bottom-0 md:w-0.5 bg-[#09D1C7] transform md:-translate-x-1/2" />

            {tools.map((tool, index) => (
              <div
                key={tool.name}
                className="relative flex flex-col md:flex-row md:items-center md:justify-between"
              >
                <Card
                  className={`w-full md:w-[calc(60%)] border-[#09D1C7]/20 transition-colors group mb-4 md:mb-0
                    ${
                      index % 3 === 0
                        ? "bg-[#1A202C]/50 hover:bg-[#09D1C7]/5"
                        : index % 3 === 1
                        ? "bg-[#1A202C]/50 hover:bg-[#80EE98]/5"
                        : "bg-[#1A202C]/50 hover:bg-white/5"
                    }
                    ${index % 2 === 0 ? "md:mr-16" : "md:order-2 md:ml-16"}`}
                >
                  <CardContent className="pt-5">
                    <div className="flex flex-row md:flex-row">
                      <div className="flex-1">
                        <h2
                          className={`text-xl md:text-2xl font-bold mb-1
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
                        className="w-24 h-24 md:w-28 md:h-28 mx-auto md:ml-4 md:flex-shrink-0 mb-2 md:mb-0"
                        alt={`${tool.name} logo`}
                      />
                    </div>
                    <Button
                      onClick={() =>
                        handleToolClick(tool._id, tool.name, tool.description)
                      }
                      className={`text-sm px-3 py-1 mt-3 w-auto  md:w-auto
                            ${
                              index % 3 === 0
                                ? "bg-[#09D1C7]/10 text-[#09D1C7] hover:bg-[#09D1C7]/20"
                                : index % 3 === 1
                                ? "bg-[#80EE98]/10 text-[#80EE98] hover:bg-[#80EE98]/20"
                                : "bg-white/10 text-white hover:bg-white/20"
                            }`}
                    >
                      Explore Now <ChevronRight className="ml-1 h-3 w-3 inline" />
                    </Button>
                  </CardContent>
                </Card>
                <div
                  className={`md:absolute  md:left-1/2  md:w-12 md:h-12 md:rounded-full md:bg-[#1A202C] md:border-2 md:flex md:items-center md:justify-center md:z-10 md:transform -translate-y-1/2 md:-translate-x-1/2 md:translate-y-0
                    ${
                      index % 3 === 0
                        ? "md:border-[#09D1C7] text-[#09D1C7]"
                        : index % 3 === 1
                        ? "md:border-[#80EE98] text-[#80EE98]"
                        : "md:border-white text-white"
                    }`}
                >
                  <motion.div
                    className={` md:w-8 md:h-8 md:rounded-full ${
                      index % 3 === 0
                        ? "md:bg-[#09D1C7]"
                        : index % 3 === 1
                        ? "md:bg-[#80EE98]"
                        : "md:bg-white"
                    }`}
                  />
                </div>
                <Card
                  className={`w-full md:w-[calc(62%)] border-[#09D1C7]/20 transition-colors group mt-4 md:mt-0
                    ${
                      index % 3 === 0
                        ? "bg-[#09D1C7]/5 hover:bg-[#09D1C7]/10"
                        : index % 3 === 1
                        ? "bg-[#80EE98]/5 hover:bg-[#80EE98]/10"
                        : "bg-white/5 hover:bg-white/10"
                    }
                    ${index % 2 === 0 ? "md:order-2 md:ml-16" : "md:mr-16"}`}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsPage;

