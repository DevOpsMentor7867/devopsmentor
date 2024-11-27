import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import { Terminal } from "xterm";
// import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import Collaboration from "./Collaboration/Collaboration";
import AiAssistant from "./AiAssistant";
import {
  Users,
  Brain,
  Ban,
  CheckCircle2,
  XCircle,
  Clock,
  Maximize2,
  X,
} from "lucide-react";

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

function TerminalComponent({ isOpen }) {
  const [labQuestions, setLabQuestions] = useState([]);
  const [currentLabIndex, setCurrentLabIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isChecked, setIsChecked] = useState(false);
  const [ShowSucsess, setShowSucsess] = useState(false);
  const [ShowQuestionFailure, setShowQuestionFailure] = useState(false);
  const [time, setTime] = useState(3600);
  const [isDragging, setIsDragging] = useState(false);
  const [terminalWidth, setTerminalWidth] = useState(55);
  const [showHint, setShowHint] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [scripts, setScripts] = useState([]);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [socketId, setsocketId] = useState(null);
  const location = useLocation();
  const { toolName, labName } = location.state || {};
  // eslint-disable-next-line
  const [term, setTerm] = useState(null);

  const { labId } = useParams();
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);
  const terminalRef = useRef(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue =
        "Are you sure you want to leave? Your current progress will be lost.";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const handlePopState = (event) => {
      event.preventDefault();
      if (
        window.confirm(
          "Are you sure you want to leave? Your current progress will be lost."
        )
      ) {
        navigate(-1);
      } else {
        window.history.pushState(null, "", window.location.pathname);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  const handleEndLab = useCallback(() => {
    const confirmEnd = window.confirm(
      "Are you sure you want to end the lab? Your current progress will be lost."
    );
    if (confirmEnd) {
      fetch("http://your-backend-url/end-lab", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ labId }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Lab ended successfully", data);
          // navigate(`/dashboard/${toolId}/labs`);
        })
        .catch((error) => {
          console.error("Error ending lab:", error);
        });
    }
    // navigate(`/dashboard/${toolId}/labs`);
  }, [labId]);

  const fetchQuestions = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/user/labs/${labId}/questions`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setLabQuestions(data.labQuestions);
      const allScripts = data.labQuestions.flatMap((lab) =>
        lab.questions_data.map((question) => question.script)
      );
      setScripts(allScripts);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  }, [labId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const newTerm = new Terminal({
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
      lineHeight: 1,
      rows: 35,
      cols: 90,
      cursorBlink: true,
    });

    if (terminalRef.current) {
      newTerm.open(terminalRef.current);

      const style = document.createElement("style");
      style.textContent = `
        .xterm-viewport::-webkit-scrollbar {
          width: 10px;
        }
        .xterm-viewport::-webkit-scrollbar-track {
          background: #1F2937;
        }
        .xterm-viewport::-webkit-scrollbar-thumb {
          background-color: #4B5563;
          border-radius: 6px;
          border: 3px solid #1F2937;
        }
      `;
      document.head.appendChild(style);
      newTerm.writeln("\x1b[34m");
      newTerm.writeln(
        " ____              ___                 __  __            _             "
      );
      newTerm.writeln(
        "|  _ \\  _____   __/ _ \\ _ __  ___     |  \\/  | ___ _ __ | |_ ___  _ __ "
      );
      newTerm.writeln(
        "| | | |/ _ \\ \\ / / | | | '_ \\/ __|    | |\\/| |/ _ \\ '_ \\| __/ _ \\| '__|"
      );
      newTerm.writeln(
        "| |_| |  __/\\ V /| |_| | |_) \\__ \\    | |  | |  __/ | | | || (_) | |   "
      );
      newTerm.writeln(
        "|____/ \\___| \\_/  \\___/| .__/|___/    |_|  |_|\\___|_| |_|\\__\\___/|_|   "
      );
      newTerm.writeln(
        "                       |_|                                              "
      );
      newTerm.writeln(
        "\x1b[38;2;148;226;213m          ✨ Welcome to the Enhanced DevOps Mentor Terminal ✨"
      );
      newTerm.writeln("\x1b[0m");
      newTerm.write("$ ");
    }

    setTerm(newTerm);

    socketRef.current = io("http://localhost:8000/terminal", {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("connect", () => {
      setsocketId(socketRef.current.id);
    });

    const init = () => {
      if (newTerm._initialized) {
        return;
      }

      newTerm._initialized = true;

      newTerm.prompt = () => {
        runCommand("\n");
      };

      setTimeout(() => {
        newTerm.prompt();
      }, 300);

      newTerm.onKey((keyObj) => {
        runCommand(keyObj.key);
      });

      socketRef.current.on("output", (data) => {
        newTerm.write(data);
      });
    };

    const runCommand = (command) => {
      socketRef.current.emit("command", command);
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (newTerm) {
        newTerm.dispose();
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

  const handleNextQuestion = () => {
    setShowSucsess(false);
    const currentLab = labQuestions[currentLabIndex];
    if (currentQuestionIndex + 1 < currentLab.questions_data.length) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setIsChecked(false);
    } else if (currentLabIndex + 1 < labQuestions.length) {
      setCurrentLabIndex((prevIndex) => prevIndex + 1);
      setCurrentQuestionIndex(0);
      setIsChecked(false);
    } else {
      handleDoneLab();
      alert("Congratulations! You've completed all questions for this lab!");
    }
  };

  const getCurrentQuestion = () => {
    const currentLab = labQuestions[currentLabIndex];
    return currentLab ? currentLab.questions_data[currentQuestionIndex] : {};
  };

  const getTotalQuestions = () => {
    return labQuestions.reduce(
      (total, lab) => total + lab.questions_data.length,
      0
    );
  };

  const getCurrentQuestionNumber = () => {
    let questionNumber = 1;
    for (let i = 0; i < currentLabIndex; i++) {
      questionNumber += labQuestions[i].questions_data.length;
    }
    return questionNumber + currentQuestionIndex;
  };

  const progress = (getCurrentQuestionNumber() / getTotalQuestions()) * 100;

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleCheck = useCallback(
    async (script) => {
      console.log("script from check", script);
      try {
        const response = await fetch(
          "http://localhost:8000/api/user/checkanswer",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ socketId, script }),
          }
        );
        if (response.ok) {
          response.json().then((data) => {
            const { result } = data;
            console.log("Result:", result);
            // eslint-disable-next-line
            if (result == 0) {
              setShowQuestionFailure(true);
              setIsChecked(false);
            } else {
              setShowQuestionFailure(false);
              setIsChecked(true);
              setShowSucsess(true);
            }
          });
        } else {
          console.error(response.message);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    },
    [socketId]
  );

  const handleDoneLab = () => {
    fetch("http://localhost:3000/done_lab", { method: "GET" })
      .then((response) => response.text())
      .then((data) => console.log("Lab status:", data))
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
    // ${
    //   isOpen ? "" : "ml-16 -mr-8"
    // }
    <motion.div
      className={` ${isFullScreen ? "fixed inset-0 z-50 bg-gray-900" : ""}`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className=" bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 my-7"
        variants={itemVariants}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between ">
            <div className="flex items-center space-x-4">
              <div className="text-white">
                <h1 className="text-2xl font-bold text-btg">{toolName}</h1>
                <p className="text-sm text-white">{labName}</p>
              </div>
            </div>

            <div className="flex-1 flex justify-center ml-20">
              <div className="rounded-lg p-2 shadow-xl">
                <div className="text-center">
                  <p className="text-xl text-btg">Progress</p>
                  <div className="flex items-center mt-2">
                    <div className="w-64 h-2 bg-gray-700 rounded-full">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#80EE98] to-[#09D1C7] text-[#1A202C] hover:from-[#09D1C7] hover:to-[#80EE98] rounded-full"
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

            <div className="flex items-center space-x-4 ">
              <motion.button
                onClick={() => setShowCollaboration(true)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#80EE98] to-[#09D1C7]  hover:from-[#09D1C7] hover:to-[#80EE98] text-black hover:opacity-90 transition-opacity flex items-center gap-2 "
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Users className="w-4 h-4 " />
                Collaborate
              </motion.button>
              <motion.button
                onClick={() => setShowAiAssistant(true)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#80EE98] to-[#09D1C7] hover:from-[#09D1C7] hover:to-[#80EE98] hover:opacity-90 transition-opacity flex items-center gap-2 text-black"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Brain className="w-4 h-4" />
                ASK AI
              </motion.button>
              <motion.button
                onClick={handleEndLab}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:opacity-90 transition-opacity flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Ban size={18} strokeWidth={3.25} />
                End Lab
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

      <motion.div
        className="container mx-auto p-4 -my-8"
        variants={itemVariants}
      >
        <div className="flex flex-row h-[calc(90vh-120px)] gap-2">
          <motion.div
            className="relative rounded-xl overflow-hidden backdrop-blur-md bg-gray-800 border border-gray-700 transition-all duration-300"
            style={{ width: `${100 - terminalWidth}%` }}
            variants={itemVariants}
          >
            <div className="p-6 h-full flex flex-col">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-btg">
                    Question {getCurrentQuestionNumber()} of{" "}
                    {getTotalQuestions()}
                  </h2>

                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="flex items-center mt-2 text-white">
                        <Clock className="w-6 h-6 mr-2 " />
                        <span className="text-red-700 ml-2 font-mono text-lg">
                          {formatTime(time)}
                        </span>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => setShowHint(true)}
                      className="px-4 py-2 rounded-lg bg-gray-700 bg-gradient-to-r from-[#80EE98] to-[#09D1C7]  hover:from-[#09D1C7] hover:to-[#80EE98] transition-colors text-black"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Hint
                    </motion.button>
                  </div>
                </div>

                <div className="prose prose-invert">
                  <p className="text-lg text-white">
                    {getCurrentQuestion().question}
                  </p>
                </div>

                {ShowSucsess && (
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
                {ShowQuestionFailure && (
                  <motion.div
                    className="mt-4 flex items-center text-red-500"
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    <span>
                      You did not reach the desired output <br /> Please give it
                      a retry!
                    </span>
                  </motion.div>
                )}
              </div>

              <div className="space-y-4 mt-auto">
                <motion.button
                  onClick={() =>
                    handleCheck(scripts[getCurrentQuestionNumber() - 1])
                  }
                  className={`
                    w-full py-3 rounded-lg font-medium
                    ${
                      isChecked
                        ? ""
                        : "bg-gradient-to-r from-[#80EE98] to-[#09D1C7] text-[#1A202C] hover:from-[#09D1C7] hover:to-[#80EE98] text-black"
                    }
                    transition-all duration-300 hover:opacity-90
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isChecked ? "" : "Check Answer"}
                </motion.button>
                {isChecked && (
                  <motion.button
                    onClick={handleNextQuestion}
                    className="w-full py-3 rounded-lg font-medium bg-gradient-to-r from-[#80EE98] to-[#09D1C7] text-[#1A202C] hover:from-[#09D1C7] hover:to-[#80EE98] hover:from-cyan-600 transition-all duration-300"
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
                <div className="flex items-center space-x-2 ">
                  <motion.button
                    onClick={toggleFullScreen}
                    className="p-1 hover:bg-gray-700 rounded"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Maximize2 className="w-4 h-4 text-[#80EE98] hover:text-white transition-all duration-300" />
                  </motion.button>
                  <motion.button
                    onClick={() => setTerminalWidth(55)}
                    className="p-1 hover:bg-gray-700 rounded"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-4 h-4  text-[#80EE98] hover:text-white transition-all duration-300" />
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
                <h3 className="text-xl font-bold text-btg">Hint</h3>
                <motion.button
                  onClick={() => {
                    setShowHint(false);
                    setCurrentHintIndex(0);
                  }}
                  className="text-white hover:text-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
              <p className="text-white">
                {getCurrentQuestion().hints &&
                  getCurrentQuestion().hints[currentHintIndex]}
              </p>
              {getCurrentQuestion().hints &&
                currentHintIndex < getCurrentQuestion().hints.length - 1 && (
                  <motion.button
                    onClick={() =>
                      setCurrentHintIndex((prevIndex) => prevIndex + 1)
                    }
                    className="mt-4 px-4 py-2 rounded bg-gradient-to-r from-[#80EE98] to-[#09D1C7]  hover:from-[#09D1C7] hover:to-[#80EE98] text-black hover:opacity-90 transition-opacity"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Next Hint
                  </motion.button>
                )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default TerminalComponent;
