"use client";

import React, { useState, useEffect, useRef } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";

const TerminalIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="4 17 10 11 4 5"></polyline>
    <line x1="12" y1="19" x2="20" y2="19"></line>
  </svg>
);

const CheckCircle2 = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const Clock = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const Maximize2 = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 3 21 3 21 9"></polyline>
    <polyline points="9 21 3 21 3 15"></polyline>
    <line x1="21" y1="3" x2="14" y2="10"></line>
    <line x1="3" y1="21" x2="10" y2="14"></line>
  </svg>
);

const Plus = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const X = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default function Component() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isChecked, setIsChecked] = useState(false);
  const [containerStopped, setContainerStopped] = useState(false);
  const [time, setTime] = useState(3600); // 1 hour in seconds
  const [isDragging, setIsDragging] = useState(false);
  const [terminalWidth, setTerminalWidth] = useState(50); // 50% by default
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);
  const terminalRef = useRef(null);
  const socketRef = useRef(null);
  const termInstanceRef = useRef(null);

  const questions = [
    {
      id: 1,
      text: "Stop the container you just created",
      hint: "Use the docker stop command",
    },
    {
      id: 2,
      text: "How do you stop a running container?",
      hint: "Use the container ID or name",
    },
    {
      id: 3,
      text: "What command creates a new container from an image?",
      hint: "Start a new container instance",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    socketRef.current = new WebSocket("ws://localhost:6060");
    termInstanceRef.current = new Terminal({ cursorBlink: true });
    termInstanceRef.current.open(terminalRef.current);

    socketRef.current.onmessage = (event) => {
      termInstanceRef.current.write(event.data);
    };

    termInstanceRef.current.onKey(({ key }) => {
      socketRef.current.send(key);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const containerRect = document
        .querySelector(".container")
        ?.getBoundingClientRect();
      if (!containerRect) return;
      const newWidth =
        ((containerRect.right - e.clientX) / containerRect.width) * 100;
      setTerminalWidth(Math.min(Math.max(newWidth, 30), 70));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    const handleResize = () => {
      const containerRect = document
        .querySelector(".container")
        ?.getBoundingClientRect();
      if (containerRect) {
        const newWidth = (terminalWidth / 100) * containerRect.width;
        setTerminalWidth((newWidth / containerRect.width) * 100);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [terminalWidth]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleCheck = () => {
    setIsChecked(true);
    setContainerStopped(true);
    fetch("http://localhost:5500/done_lab", { method: "GET" })
      .then((response) => {
        if (response.ok) {
          console.log("Lab checked successfully");
        } else {
          console.error("Error checking lab");
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setIsChecked(false);
      setContainerStopped(false);
    }
  };

  const handleDragStart = (e) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    const containerRect = document
      .querySelector(".container")
      ?.getBoundingClientRect();
    if (containerRect) {
      dragStartWidth.current = (terminalWidth / 100) * containerRect.width;
    }
  };

  return (
    <div className="mt-2">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <span className="text-white font-mono">sk</span>
            <button className="text-gray-400 bg-transparent border-none cursor-pointer">
              Hint
            </button>
          </div>
          <div className="flex items-center gap-2 text-white">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{formatTime(time)}</span>
          </div>
        </div>

        <div className="flex flex-row relative h-[calc(95vh-120px)]">
          {/* Question Section */}
          <div
            className="relative overflow-hidden backdrop-blur-md bg-white bg-opacity-10 border-none transition-all duration-300 h-full"
            style={{ width: `${100 - terminalWidth}%` }}
          >
            <div className="p-6 relative z-10">
              <div className="flex flex-col gap-2">
                <div className="flex gap-1">
                  {Array.from({ length: 17 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 w-6 rounded-full ${
                        i <= currentQuestion ? "bg-blue-500" : "bg-gray-700"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="min-h-[120px] text-white mt-6">
                <p className="text-xl font-semibold mb-4">
                  {questions[currentQuestion].text}
                </p>
                {containerStopped && (
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Container Stopped</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={handleCheck}
                  className={`w-full py-3 text-base font-medium rounded-full overflow-hidden relative ${
                    isChecked ? "text-green-500" : "text-white"
                  } bg-gradient-to-r from-blue-500 to-blue-600 border-2 border-transparent bg-clip-padding cursor-pointer`}
                >
                  <div className="relative z-10 flex items-center justify-center">
                    {isChecked ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Checked
                      </>
                    ) : (
                      "Check"
                    )}
                  </div>
                </button>
                {isChecked && (
                  <button
                    onClick={handleNext}
                    className="w-full py-3 text-base font-medium text-white rounded-full bg-gradient-to-r from-blue-500 to-blue-600 border-none cursor-pointer"
                  >
                    Next
                  </button>
                )}
              </div>

              <div className="flex justify-between text-gray-400 text-sm mt-4">
                <span>{currentQuestion + 1} / 17</span>
              </div>
            </div>
          </div>

          {/* Terminal Section */}
          <div
            className="relative overflow-hidden backdrop-blur-md bg-white bg-opacity-10 border-none transition-all duration-300 h-full"
            style={{ width: `${terminalWidth}%` }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between border-b border-white border-opacity-10 p-2">
                <div className="flex items-center gap-2">
                  <TerminalIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-white font-mono text-sm">
                    Terminal 1
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="bg-transparent border-none text-gray-400 cursor-pointer">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button className="bg-transparent border-none text-gray-400 cursor-pointer">
                    <Plus className="w-4 h-4" />
                  </button>
                  <button className="bg-transparent border-none text-gray-400 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div ref={terminalRef} className="h-[400px]" />
            </div>
            <div
              className="absolute left-0 top-0 bottom-0 w-3 bg-gray-600 hover:bg-cyan-600 transition-colors duration-500 cursor-ew-resize flex items-center justify-center z-[100]"
              onMouseDown={handleDragStart}
            >
              <div className="h-8 w-[10px] bg-current rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
