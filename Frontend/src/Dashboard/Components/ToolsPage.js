import React, { useState, useEffect } from "react";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function DevOpsTools() {
  const [hoveredTool, setHoveredTool] = useState(null);
  const [tools, setTools] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleToolClick = (toolId, toolName) => {
    navigate(`/dashboard/${toolId}/labs`, { state: { toolName } });
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
    } catch (error) {
      console.error("Error fetching tools:", error);
      setError(`Failed to load tools. Error: ${error.message}`);
    }
  };

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl md:text-4xl mb-8 md:mb-12 text-center font-bold text-cyan-400">
        DevOps Tools
      </h1>
      <div className="relative">
        {/* Vertical Timeline Line - hidden on mobile */}
        <div
          className="absolute left-1/2 top-0 bottom-0 w-1 bg-cyan-400/20 transform -translate-x-1/2 hidden md:block"
          style={{ zIndex: 0 }}
        />

        {tools.map((tool, index) => {
          const isEven = index % 2 === 0;

          return (
            <div key={tool._id} className="relative mb-8 md:mb-16">
              {/* Timeline Content */}
              <div className="flex flex-col md:flex-row justify-center items-center">
                {/* Card Container */}
                <div className={`w-full md:w-5/12 ${isEven ? "md:mr-auto" : "md:ml-auto"}`}>
                  <div
                    className="bg-gray-800 rounded-lg h-auto md:h-60 p-4 flex flex-col cursor-pointer transform transition-all duration-300 hover:scale-105 relative overflow-hidden"
                    onClick={() => handleToolClick(tool._id, tool.name)}
                    onMouseEnter={() => setHoveredTool(tool._id)}
                    onMouseLeave={() => setHoveredTool(null)}
                  >
                    <div className="flex justify-between items-start mb-4 md:mb-auto">
                      <h2 className="text-2xl md:text-4xl font-semibold pt-2 md:pt-6 text-cyan-400">
                        {tool.name}
                      </h2>
                      <img 
                        src={`/${tool.name.toLowerCase()}.png`} 
                        className="w-32 h-32 " 
                        alt={`${tool.name} logo`}
                      />
                    </div>
                    <div className="mt-4 md:mt-auto flex justify-between items-end">
                      <p className="text-cyan-400 text-xl md:text-2xl">
                        Explore Now
                      </p>
                      <FaArrowRight className="text-cyan-400" />
                    </div>

                    {/* Hover Overlay */}
                    <div
                      className={`absolute inset-0 bg-gray-900/90 p-4 flex flex-col justify-between transform transition-all duration-500 ${
                        hoveredTool === tool._id
                          ? "translate-y-0"
                          : "translate-y-full"
                      }`}
                    >
                      <h2 className="text-2xl md:text-4xl font-semibold pt-2 md:pt-6 text-cyan-400">
                        {tool.name}
                      </h2>
                      <p className="text-base md:text-lg text-gray-200">
                        {tool.description}
                      </p>
                      <div className="mt-4 md:mt-auto flex justify-between items-end">
                        <p className="text-cyan-400 text-xl md:text-2xl">
                          Master {tool.name}
                        </p>
                        <FaArrowRight className="text-cyan-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline Dot - hidden on mobile */}
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-800 border-4 border-cyan-400 flex items-center justify-center overflow-hidden">
                    <img 
                      src={`/${tool.name.toLowerCase()}.png`} 
                      className="w-8 h-8 md:w-12 md:h-12" 
                      alt={`${tool.name} logo`}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

