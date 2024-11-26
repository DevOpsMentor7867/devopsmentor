import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import LoadingScreen from "./LoadingPage";
import { Button } from "../UI/button";
import { Card } from "../UI/Card";
import { CardContent } from "../UI/CardContent";
const Labs = () => {
  const [labs, setLabs] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLab, setSelectedLab] = useState(null);
  const { toolId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toolName, toolDescription } = location.state || {};

  const handleLabClick = async (lab) => {
    setSelectedLab(lab);
    setIsLoading(true);
    navigate(`/dashboard/labs/${lab._id}/questions`, {
      state: {
        toolName: toolName,
        labName: lab.name,
      },
    });
  };

  const fetchLabs = useCallback(async () => {
    if (!toolId) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/user/${toolId}/labs`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data.labs)) {
        throw new Error("Labs data is not an array");
      }
      setLabs(data.labs);
    } catch (error) {
      console.error("Error fetching labs:", error);
      setError(`Failed to load labs. Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  }, [toolId]);

  useEffect(() => {
    fetchLabs();
  }, [fetchLabs]);

  if (isLoading) {
    return (
      <LoadingScreen
        toolName={toolName}
        labName={selectedLab ? selectedLab.name : "Loading Lab"}
      />
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="p-4 w-full mt-3 mx-auto">
      <div className="relative">
        <div className="bg-gradient-to-r from-[#09D1C7] to-[#80EE98]/80 p-6 text-[#1A202C]">
          <div className="flex">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2 ">{toolName} Labs</h2>
              <p className="text-lg">{toolDescription}</p>
            </div>
            <img
              src={`/${toolName.toLowerCase()}.png`}
              className="w-20 h-20 ml-4 flex-shrink-0"
              alt={`${toolName} logo`}
            />
          </div>
        </div>

        <div className="relative p-6">
          <div className="absolute inset-0 opacity-5" />
          <div className="relative max-w-5xl mx-auto">
            {/* Timeline */}
            <div className="space-y-8">
              {/* Timeline Line */}
              <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-[#09D1C7]/20" />

              {labs.map((lab, index) => (
                <div key={lab.name} className="relative pl-14 ">
                  <div className="absolute left-0 w-14 h-14 rounded-full bg-[#1A202C] border-4 border-[#09D1C7]/20 flex items-center justify-center">
                    <div
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
                    className={`
                    ${
                      index % 3 === 0
                        ? "bg-[#1A202C]/50 border-[#09D1C7]/20 hover:bg-[#09D1C7]/5"
                        : index % 3 === 1
                        ? "bg-[#1A202C]/50 border-[#80EE98]/20 hover:bg-[#80EE98]/5"
                        : "bg-[#1A202C]/50 border-white/10 hover:bg-white/5"
                    }
                    transition-colors group
                  `}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2
                            className={`text-2xl font-bold mb-2 pt-4 ${
                              index % 3 === 0
                                ? "text-[#09D1C7]"
                                : index % 3 === 1
                                ? "text-[#80EE98]"
                                : "text-white"
                            }`}
                          >
                            {lab.name}
                          </h2>
                          <p className="text-white/80">{lab.description}</p>
                        </div>
                        <Button
                          className={`
                            ${
                              index % 3 === 0
                                ? "bg-[#09D1C7]/10 text-[#09D1C7] hover:bg-[#09D1C7]/20"
                                : index % 3 === 1
                                ? "bg-[#80EE98]/10 text-[#80EE98] hover:bg-[#80EE98]/20"
                                : "bg-white/10 text-white hover:bg-white/20"
                            }
                            transition-colors mt-8 p-2 pl-6 pr-6
                          `}
                          onClick={() => handleLabClick(lab)}
                        >
                          Start Lab
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Labs;
