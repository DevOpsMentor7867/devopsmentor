import React, { useState, useEffect } from 'react';
import { FaDocker, FaGitAlt, FaLinux, FaArrowRight } from 'react-icons/fa';
import { SiKubernetes, SiTerraform } from 'react-icons/si';
import { GrCircleInformation } from 'react-icons/gr';
import { useNavigate } from 'react-router-dom';

const iconMap = {
  Docker: FaDocker,
  Kubernetes: SiKubernetes,
  Git: FaGitAlt,
  Terraform: SiTerraform,
  Linux: FaLinux,
};

const Tools = () => {
  const [hoveredTool, setHoveredTool] = useState(null);
  const [tools, setTools] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleToolClick = (toolId) => {
    navigate(`/dashboard/${toolId}/labs`);
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/tools');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Data is not an array');
      }
      setTools(data);
    } catch (error) {
      console.error('Error fetching tools:', error);
      setError(`Failed to load tools. Error: ${error.message}`);
    }
  };

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="p-8 rounded-lg text-white max-w-6xl mx-auto">
      <h1 className="text-4xl mb-8 text-center font-bold text-cgrad">DevOps Tools</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => {
          const IconComponent = iconMap[tool.name] || GrCircleInformation;
          return (
            <div
              key={tool._id}
              className="bg-gray-800 rounded-lg h-72 p-4 flex flex-col cursor-pointer transform transition-all duration-300 hover:scale-105 relative overflow-hidden group"
              onClick={() => handleToolClick(tool._id)}
              onMouseEnter={() => setHoveredTool(tool._id)}
              onMouseLeave={() => setHoveredTool(null)}
            >
              <div className="flex justify-between items-start mb-auto">
                <h2 className="text-4xl font-semibold pt-6 text-cgrad">{tool.name}</h2>
                <IconComponent className="text-8xl text-cyan-400" />
              </div>
              <div className="mt-auto flex justify-between items-end">
                <p className="text-cgrad text-2xl">{tool.labCount} Labs</p>
                <FaArrowRight className="text-cyan-400" />
              </div>
              <div className={`absolute inset-0 bg-gray-900/90 p-4 pt-0 flex flex-col justify-between transform transition-all duration-500 ${hoveredTool === tool._id ? 'translate-y-0' : 'translate-y-full'}`}>
                <h2 className="text-4xl font-semibold pt-6 text-cgrad">{tool.name}</h2>
                <p className="text-lg">{tool.description}</p>
                <div className="mt-auto flex justify-between items-end">
                  <p className="text-cgrad text-2xl">{tool.labCount} Labs</p>
                  <FaArrowRight className="text-cyan-400" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Tools;