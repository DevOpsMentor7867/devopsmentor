import React, { useState, useEffect, useRef, useCallback } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { Users, Brain, CheckCircle2, Clock, Maximize2, X } from 'lucide-react';
import { useParams } from 'react-router-dom';
import Collaboration from "./Collaboration";
import AiAssistant from "./AiAssistant";
import "xterm/css/xterm.css";
import { motion, AnimatePresence } from "framer-motion";

const TerminalIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="red"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="4 17 10 11 4 5"></polyline>
    <line x1="12" y1="19" x2="20" y2="19"></line>
  </svg>
);

function TerminalComponent() {
  const [questions, setQuestions] = useState([]);
  const [ToolName, setToolName] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isChecked, setIsChecked] = useState(false);
  const [containerStopped, setContainerStopped] = useState(false);
  const [time, setTime] = useState(3600);
  const [isDragging, setIsDragging] = useState(false);
  const [terminalWidth, setTerminalWidth] = useState(55);
  const [showHint, setShowHint] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [labName, setLabName] = useState('');

  const { toolId, labId } = useParams();

  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);
  const terminalRef = useRef(null);
  const socketRef = useRef(null);
  const termInstanceRef = useRef(null);

  useEffect(() => {
    fetchQuestions();
    //eslint-disable-next-line
  }, [toolId, labId]);

  const fetchQuestions = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/tools/${toolId}/labs/${labId}/questions`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setQuestions(data.questions);
      setToolName(data.toolName);
      setLabName(data.labName);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  }, [toolId, labId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      termInstanceRef.current = new Terminal({
        theme: {
          background: "#1F2937",
          foreground: "#ffffff",
          cursor: "#ffffff",
          selection: "rgba(255, 255, 255, 0.3)",
          black: "#000000",
          red: "#e06c75",
          green: "#98c379",
          yellow: "#d19a66",
          blue: "#61afef",
          magenta: "#c678dd",
          cyan: "#56b6c2",
          white: "#ffffff",
          brightBlack: "#5c6370",
          brightRed: "#e06c75",
          brightGreen: "#98c379",
          brightYellow: "#d19a66",
          brightBlue: "#61afef",
          brightMagenta: "#c678dd",
          brightCyan: "#56b6c2",
          brightWhite: "#ffffff",
        },
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        fontSize: 14,
        lineHeight: 1.2,
        cursorBlink: true,
      });

      const fitAddon = new FitAddon();
      termInstanceRef.current.loadAddon(fitAddon);

      termInstanceRef.current.open(terminalRef.current);
      fitAddon.fit();

      termInstanceRef.current.writeln("\x1b[34m");
      termInstanceRef.current.writeln(
        " ____              ___                 __  __            _             "
      );
      termInstanceRef.current.writeln(
        "|  _ \\  _____   __/ _ \\ _ __  ___     |  \\/  | ___ _ __ | |_ ___  _ __ "
      );
      termInstanceRef.current.writeln(
        "| | | |/ _ \\ \\ / / | | | '_ \\/ __|    | |\\/| |/ _ \\ '_ \\| __/ _ \\| '__|"
      );
      termInstanceRef.current.writeln(
        "| |_| |  __/\\ V /| |_| | |_) \\__ \\    | |  | |  __/ | | | || (_) | |   "
      );
      termInstanceRef.current.writeln(
        "|____/ \\___| \\_/  \\___/| .__/|___/    |_|  |_|\\___|_| |_|\\__\\___/|_|   "
      );
      termInstanceRef.current.writeln(
        "                       |_|                                              "
      );
      termInstanceRef.current.writeln(
        "\x1b[38;2;148;226;213m          ✨ Welcome to the Enhanced DevOps Mentor Terminal ✨"
      );
      termInstanceRef.current.writeln("\x1b[0m");
      termInstanceRef.current.write("$ ");
    }

    socketRef.current = new WebSocket("ws://your-websocket-url");
    socketRef.current.onmessage = (event) => {
      termInstanceRef.current?.write(event.data);
    };

    return () => {
      if (socketRef.current) socketRef.current.close();
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

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setIsChecked(false);
    } else {
      alert("Congratulations! You've completed all questions for this lab!");
    }
  };

  const getCurrentQuestion = () => questions[currentQuestionIndex] || {};

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 0 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 40,
        damping: 10,
      },
    },
  };

  return (
    <motion.div
      className={`${isFullScreen ? "fixed inset-0 z-50 bg-gray-900" : ""}`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 my-7"
        variants={itemVariants}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between ">
            <div className="flex items-center space-x-4">
              <div className="text-white">
                <h1 className="text-2xl font-bold text-cgrad">
                  {ToolName || "Loading..."}
                </h1>
                <p className="text-sm text-gray-400">
                  {labName || "Loading..."}
                </p>
              </div>
            </div>

            <div className="flex-1 flex justify-center ml-30">
              <div className="rounded-lg p-2 shadow-xl">
                <div className="text-center">
                  <p className="text-sm text-gray-400">Progress</p>
                  <div className="flex items-center mt-2">
                    <div className="w-64 h-2 bg-gray-700 rounded-full">
                      <motion.div
                        className="h-full bg-grad rounded-full"
                        style={{ width: `${progress}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <span className="ml-2 text-white">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => setShowCollaboration(true)}
                className="px-4 py-2 rounded-lg bg-grad text-white hover:opacity-90 transition-opacity flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Users className="w-4 h-4" />
                Collaborate
              </motion.button>
              <motion.button
                onClick={() => setShowAiAssistant(true)}
                className="px-4 py-2 rounded-lg bg-grad text-white hover:opacity-90 transition-opacity flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Brain className="w-4 h-4" />
                ASK AI
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {showCollaboration && (
        <Collaboration
          isOpen={showCollaboration}
          onClose={() => setShowCollaboration(false)}
        />
      )}
      {showAiAssistant && (
        <AiAssistant
          isOpen={showAiAssistant}
          onClose={() => setShowAiAssistant(false)}
        />
      )}

      <motion.div className="container mx-auto p-4 -my-8" variants={itemVariants}>
        <div className="flex flex-row h-[calc(90vh-120px)] gap-2">
          <motion.div
            className="relative rounded-xl overflow-hidden backdrop-blur-md bg-gray-800 border border-gray-700 transition-all duration-300"
            style={{ width: `${100 - terminalWidth}%` }}
            variants={itemVariants}
          >
            <div className="p-6 h-full flex flex-col">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-cgrad">
                    Question {currentQuestionIndex + 1}
                  </h2>

                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="flex items-center mt-2 text-white">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="text-red-700 ml-2 font-mono">
                          {formatTime(time)}
                        </span>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => setShowHint(true)}
                      className="px-4 py-2 rounded-lg bg-gray-700 bg-grad hover:from-cyan-600 hover:to-blue-600 transition-colors text-white"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Hint
                    </motion.button>
                  </div>
                </div>

                <div className="prose prose-invert">
                  <p className="text-lg text-gray-200">
                    {getCurrentQuestion().text}
                  </p>
                </div>

                {containerStopped && (
                  <motion.div
                    className="mt-4 flex items-center text-green-500"
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    <span>Success!</span>
                  </motion.div>
                )}
              </div>

              <div className="space-y-4 mt-auto">
                <motion.button
                  onClick={handleCheck}
                  className={`
                    w-full py-3 rounded-lg font-medium
                    ${
                      isChecked
                        ? "bg-green-500 text-white"
                        : "bg-grad text-white"
                    }
                    transition-all duration-300 hover:opacity-90
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isChecked ? "Completed!" : "Check Answer"}
                </motion.button>

                {isChecked && (
                  <motion.button
                    onClick={handleNextQuestion}
                    className="w-full py-3 rounded-lg font-medium bg-grad hover:from-cyan-600 hover:to-blue-600 text-white hover:opacity-90 transition-all duration-300"
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Next Question
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="w-2 cursor-col-resize bg-gray-700 hover:bg-cyan-600 transition-colors duration-300 rounded-full"
            onMouseDown={(e) => {
              setIsDragging(true);
              dragStartX.current = e.clientX;
              dragStartWidth.current = terminalWidth;
            }}
            variants={itemVariants}
          />

          <motion.div
            className="relative rounded-xl overflow-hidden backdrop-blur-md bg-gray-800/50 border border-gray-700 transition-all duration-300"
            style={{ width: `${terminalWidth}%` }}
            variants={itemVariants}
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-900/50 border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  <TerminalIcon className="w-4 h-4 text-red-700" />
                  <span className="text-cgrad font-mono text-sm">Terminal</span>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button
                    onClick={toggleFullScreen}
                    className="p-1 hover:bg-gray-700 rounded"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Maximize2 className="w-4 h-4 text-gray-400" />
                  </motion.button>
                  <motion.button
                    onClick={() => setTerminalWidth(55)}
                    className="p-1 hover:bg-gray-700 rounded"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </motion.button>
                </div>
              </div>
              <div ref={terminalRef} className="flex-1" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showHint && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl border border-gray-700"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 500 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Hint</h3>
                <motion.button
                  onClick={() => setShowHint(false)}
                  className="text-gray-400 hover:text-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
              <p className="text-gray-200">{getCurrentQuestion().hint}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default TerminalComponent;