import React, { useState } from 'react';
import { FaDocker, FaGitAlt, FaLinux, FaArrowRight } from 'react-icons/fa';
import { SiKubernetes, SiTerraform } from 'react-icons/si';
import { GrCircleInformation } from 'react-icons/gr';

// const iconMap = {
//   Docker: FaDocker,
//   Kubernetes: SiKubernetes,
//   Git: FaGitAlt,
//   Terraform: SiTerraform,
//   Linux: FaLinux,
//   DevOps: GrCircleInformation,
// };

const toolsData = [
  { name: 'Docker', icon: FaDocker, labCount: 9, description: "Version control your projects Version control your projects" },
  { name: 'Git', icon: FaGitAlt, labCount: 15, description: 'Version control your projects Version control your projects' },
  { name: 'Kubernetes', icon: SiKubernetes, labCount: 7, description: 'Master container orchestration Version control your projects' },
  { name: 'Terraform', icon: SiTerraform, labCount: 26, description: 'Infrastructure as Code Version control your projects' },
  { name: 'Linux', icon: FaLinux, labCount: 20, description: 'Explore the world of open-source OS Version control your projects' },
  { name: 'Jenkins', icon: SiTerraform, labCount: 26, description: 'Infrastructure as Code Version control your projects' },
];

const Tools = () => {
  const [hoveredTool, setHoveredTool] = useState(null);

  const handleToolClick = (toolName) => {
    console.log(`Opening labs for ${toolName}`);
    // Add your logic here to open the respective labs component
  };

  return (
    <div className=" p-8 rounded-lg text-white max-w-6xl mx-auto">
      <h1 className="text-4xl mb-8 text-center  font-bold text-cgrad">DevOps Tools</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {toolsData.map((tool) => {
          const IconComponent = tool.icon || GrCircleInformation;
          return (
            <div
              key={tool.name}
              className="  bg-gray-800 rounded-lg h-72 p-4 flex flex-col cursor-pointer transform transition-all duration-300 hover:scale-105 relative overflow-hidden group"
              onClick={() => handleToolClick(tool.name)}
              onMouseEnter={() => setHoveredTool(tool.name)}
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
              <div className={`absolute inset-0 bg-gray-900/90 p-4 pt-0 flex flex-col justify-between transform transition-all duration-500 ${hoveredTool === tool.name ? 'translate-y-0' : 'translate-y-full'}`}>
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
