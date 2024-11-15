import React, { useState, useEffect, useCallback } from 'react';
import { FaArrowRight, FaDocker } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';

const Labs = () => {
  const [hoveredLab, setHoveredLab] = useState(null);
  const [labs, setLabs] = useState([]);
  const [toolName, setToolName] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toolId } = useParams();
  const navigate = useNavigate();

  const handleLabClick = (labId) => {
    navigate(`/dashboard/${toolId}/labs/${labId}/questions`);
  };

  const fetchLabs = useCallback(async () => {
    if (!toolId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/tools/${toolId}/labs`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data.labs)) {
        throw new Error('Labs data is not an array');
      }
      setLabs(data.labs);
      setToolName(data.toolName);
    } catch (error) {
      console.error('Error fetching labs:', error);
      setError(`Failed to load labs. Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  }, [toolId]);

  useEffect(() => {
    fetchLabs();
  }, [fetchLabs]);

  if (isLoading) {
    return <div className="text-white text-center">Loading labs...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="p-8 rounded-lg text-white max-w-6xl mx-auto">
      <h1 className="text-4xl mb-8 text-center font-bold text-cgrad">{toolName} Labs</h1>
      {labs.length === 0 ? (
        <p className="text-center text-xl">No labs available for this tool.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {labs.map((lab) => (
            <div
              key={lab.id}
              className="bg-gray-800 rounded-lg h-72 p-4 flex flex-col cursor-pointer transform transition-all duration-300 hover:scale-105 relative overflow-hidden group"
              onClick={() => handleLabClick(lab.id)}
              onMouseEnter={() => setHoveredLab(lab.id)}
              onMouseLeave={() => setHoveredLab(null)}
            >
              <div className="flex justify-between items-start mb-auto">
                <h2 className="text-2xl font-semibold  text-cgrad">{lab.name}</h2>
                <FaDocker className="text-8xl text-cyan-400" />
              </div>
              <div className="mt-auto flex justify-between items-end">
                <p className="text-cgrad text-xl">Start Lab</p>
                <FaArrowRight className="text-cyan-400" />
              </div>
              <div className={`absolute inset-0 bg-gray-900/90 p-4 pt-0 flex flex-col justify-between transform transition-all duration-500 ${hoveredLab === lab.id ? 'translate-y-0' : 'translate-y-full'}`}>
                <h2 className="text-2xl font-semibold pt-6 text-cgrad">{lab.name}</h2>
                <p className="text-lg">{lab.description}</p>
                <div className="mt-auto flex justify-between items-end">
                  <p className="text-cgrad text-xl">Start Lab</p>
                  <FaArrowRight className="text-cyan-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Labs;