'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { FaDocker, FaGitAlt, FaLinux, FaArrowRight } from "react-icons/fa";
import { SiKubernetes, SiTerraform } from "react-icons/si";
import { GrCircleInformation } from "react-icons/gr";
import { useParams, useNavigate } from 'react-router-dom'
// import { Loader2 } from 'lucide-react'
import LoadingScreen from './LoadingPage'

const iconMap = {
  Docker: FaDocker,
  Kubernetes: SiKubernetes,
  Git: FaGitAlt,
  Terraform: SiTerraform,
  Linux: FaLinux,
};

const Labs = () => {
  const [hoveredLab, setHoveredLab] = useState(null)
  const [labs, setLabs] = useState([])
  const [toolName, setToolName] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLab, setSelectedLab] = useState(null)
  const { toolId } = useParams()
  const navigate = useNavigate()

  const handleLabClick = async (lab) => {
    setSelectedLab(lab)
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    navigate(`/dashboard/${toolId}/labs/${lab.id}/questions`)
  }

  const fetchLabs = useCallback(async () => {
    if (!toolId) return
    setIsLoading(true)
    try {
      const response = await fetch(`http://localhost:8000/api/tools/${toolId}/labs`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (!Array.isArray(data.labs)) {
        throw new Error('Labs data is not an array')
      }
      setLabs(data.labs)
      setToolName(data.toolName)
    } catch (error) {
      console.error('Error fetching labs:', error)
      setError(`Failed to load labs. Please try again later.`)
    } finally {
      setIsLoading(false)
    }
  }, [toolId])

  useEffect(() => {
    fetchLabs()
  }, [fetchLabs])

  if (isLoading) {
    return <LoadingScreen toolName={toolName} labName={selectedLab ? selectedLab.name : 'Loading Lab'} />
    
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl mb-12 text-center font-bold text-cyan-400">{toolName} Labs</h1>
      {labs.length === 0 ? (
        <p className="text-center text-xl text-gray-300">No labs available for this tool.</p>
      ) : (
        <div className="relative">
          {/* Vertical Timeline Line */}
          <div
            className="absolute left-1/2 top-0 bottom-0 w-1 bg-cyan-400/20 transform -translate-x-1/2"
            style={{ zIndex: 0 }}
          />

          {labs.map((lab, index) => {
            const isEven = index % 2 === 0
            const IconComponent = iconMap[toolName] || GrCircleInformation;

            return (
              <div key={lab.id} className="relative mb-16">
                {/* Timeline Content */}
                <div className="flex justify-center items-center">
                  {/* Card Container */}
                  <div className={`w-5/12 ${isEven ? "ml-auto" : "mr-auto"}`}>
                    <div
                      className="bg-gray-800 rounded-lg h-72 p-4 flex flex-col cursor-pointer transform transition-all duration-300 hover:scale-105 relative overflow-hidden"
                      onClick={() => handleLabClick(lab)}
                      onMouseEnter={() => setHoveredLab(lab.id)}
                      onMouseLeave={() => setHoveredLab(null)}
                    >
                      <div className="flex justify-between items-start mb-auto">
                        <h2 className="text-2xl font-semibold text-cyan-400">{lab.name}</h2>
                        <FaDocker className="text-6xl text-cyan-400" />
                      </div>
                      <div className="mt-auto flex justify-between items-end">
                        <p className="text-cyan-400 text-xl">Start Lab</p>
                        <FaArrowRight className="text-cyan-400" />
                      </div>

                      {/* Hover Overlay */}
                      <div
                        className={`absolute inset-0 bg-gray-900/90 p-4 flex flex-col justify-between transform transition-all duration-500 ${
                          hoveredLab === lab.id ? "translate-y-0" : "translate-y-full"
                        }`}
                      >
                        <h2 className="text-2xl font-semibold text-cyan-400">{lab.name}</h2>
                        <p className="text-lg text-gray-200">{lab.description}</p>
                        <div className="mt-auto flex justify-between items-end">
                          <p className="text-cyan-400 text-xl">Start Lab</p>
                          <FaArrowRight className="text-cyan-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2">
                    <div className="w-16 h-16 rounded-full bg-gray-800 border-4 border-cyan-400 flex items-center justify-center">
                    <IconComponent className="text-4xl text-cyan-400" />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Labs