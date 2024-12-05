import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import { Terminal } from "xterm";
// import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import Collaboration from "./Collaboration/Collaboration";
import AiAssistant from "./AiAssistant";
import CompletionPopup from "./CompletionPopup";
import ConfirmationPopup from "./ConfirmationPopup";
import confetti from "canvas-confetti";
import RenderQuestion from "./RenderQuestion";
import { FitAddon } from "@xterm/addon-fit";
import "xterm/css/xterm.css";

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
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
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
  const fitAddonRef = useRef(null);
  const terminalInitialized = useRef(false); // Prevent re-initialization

  const navigate = useNavigate();

  useEffect(() => {
    if (ShowSucsess) {
      confetti({
        particleCount: 100,
        spread: 170,
        origin: { y: 0.6 },
      });
    }
  }, [ShowSucsess]);

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
    if (terminalInitialized.current) return; // Skip if already initialized
    terminalInitialized.current = true;
    const initializeTerminal = () => {
      if (!terminalRef.current) return;

      const newTerm = new Terminal({
        theme: {
          background: "#1F2937",
          foreground: "#ffffff",
          cursor: "#ffffff",
          selection: "rgba(255, 255, 255, 0.3)",
        },
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        fontSize: 14,
        // rows: 135,
        // cols: 290,
        cursorBlink: true,
      });

      const fitAddon = new FitAddon();
      fitAddonRef.current = fitAddon; // Store the FitAddon instance
      newTerm.loadAddon(fitAddon);

      // Open terminal in the container
      newTerm.open(terminalRef.current);

      // Delay fitAddon fitting to ensure container has dimensions
      setTimeout(() => {
        fitAddon.fit();
      }, 100);

      // Handle window resize
      const handleResize = () => {
        fitAddon.fit();
      };
      window.addEventListener("resize", handleResize);

      // Add the gradient and ASCII art (as per original logic)
      const gradientColors = [
        "\x1b[38;2;9;209;199m", // #09D1C7
        "\x1b[38;2;33;217;185m",
        "\x1b[38;2;57;225;171m",
        "\x1b[38;2;81;233;157m",
        "\x1b[38;2;105;238;144m", // #80EE98 at 80% opacity
      ];

      const asciiArt = [
        " ____              ___                 __  __            _             ",
        "|  _ \\  _____   __/ _ \\ _ __  ___     |  \\/  | ___ _ __ | |_ ___  _ __ ",
        "| | | |/ _ \\ \\ / / | | | '_ \\/ __|    | |\\/| |/ _ \\ '_ \\| __/ _ \\| '__|",
        "| |_| |  __/\\ V /| |_| | |_) \\__ \\    | |  | |  __/ | | | || (_) | |   ",
        "|____/ \\___| \\_/  \\___/| .__/|___/    |_|  |_|\\___|_| |_|\\__\\___/|_|   ",
        "                       |_|                                              ",
      ];

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
        } `;
      document.head.appendChild(style);
      asciiArt.forEach((line) => {
        let gradientLine = "";
        const segmentLength = Math.ceil(line.length / gradientColors.length);

        for (let i = 0; i < line.length; i++) {
          const colorIndex = Math.floor(i / segmentLength);
          gradientLine += gradientColors[colorIndex] + line[i];
        }

        newTerm.writeln(gradientLine);
      });

      newTerm.writeln(
        "\x1b[38;2;148;226;213m          ✨ Welcome to the Enhanced DevOps Mentor Terminal ✨"
      );
      newTerm.writeln("\x1b[0m");
      newTerm.write("$ ");

      setTerm(newTerm);

      // Initialize socket
      const socket = io("http://localhost:8000/terminal", {
        withCredentials: true,
        transports: ["websocket", "polling"],
      });
      socketRef.current = socket;

      socket.on("connect", () => setsocketId(socket.id));
      socket.on("output", (data) => newTerm.write(data));

      newTerm.onKey(({ key }) => socket.emit("command", key));

      // Cleanup
      return () => {
        window.removeEventListener("resize", handleResize);
        newTerm.dispose();
        socket.disconnect();
      };
    };

    if (terminalRef.current) {
      initializeTerminal();
    }
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
    }
  };

  const getCurrentQuestion = () => {
    const currentLab = labQuestions[currentLabIndex];
    return currentLab ? currentLab.questions_data[currentQuestionIndex] : {};
  };
  // eslint-disable-next-line
  const getTotalQuestions = () => {
    return labQuestions.reduce(
      (total, lab) => total + lab.questions_data.length,
      0
    );
  };
  // eslint-disable-next-line
  const getCurrentQuestionNumber = () => {
    let questionNumber = 1;
    for (let i = 0; i < currentLabIndex; i++) {
      questionNumber += labQuestions[i].questions_data.length;
    }
    return questionNumber + currentQuestionIndex;
  };

  let progress = (getCurrentQuestionNumber() / getTotalQuestions()) * 100;

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

  const handleEndLab = () => {
    setShowConfirmationPopup(true);
  };

  const confirmEndLab = () => {
    setShowConfirmationPopup(false);
    navigate(-1);
  };

  const cancelEndLab = () => {
    setShowConfirmationPopup(false);
  };

  const handleLabCompletion = useCallback(() => {
    setShowCompletionPopup(true);
  }, [setShowCompletionPopup]);

  useEffect(() => {
    if (isChecked && getCurrentQuestionNumber() === getTotalQuestions()) {
      handleLabCompletion();
    }
  }, [
    isChecked,
    getCurrentQuestionNumber,
    getTotalQuestions,
    handleLabCompletion,
  ]);

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
        className=" h-[calc(107vh-120px)] bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 "
        variants={itemVariants}
      >
        <div className="container mx-auto px-4 ">
          <div className="flex items-center justify-between ">
            <div className="flex items-center space-x-4">
              <div className="text-white mt-1">
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
                      {(getCurrentQuestionNumber() / getTotalQuestions()) *
                        100 ===
                      100
                        ? `${Math.round(progress)}%`
                        : `${Math.round(progress)}%`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-4">
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
          className="container mx-auto p-4 my-3"
          variants={itemVariants}
        >
          <div className="flex flex-row h-[calc(90vh-120px)] gap-2">
            <motion.div
              className="relative rounded-xl overflow-hidden backdrop-blur-md bg-gray-800 border border-gray-700 transition-all duration-300"
              style={{ width: `${100 - terminalWidth}%` }}
              variants={itemVariants}
            >
              <div className="p-3 h-full flex flex-col">
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
                      className="mt-4 flex items-center text-red-500 mb-2"
                      initial={{ opacity: 0, y: 0 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      <span>
                        You did not reach the desired output <br /> Please give
                        it a retry!
                      </span>
                    </motion.div>
                  )}

                  <div className="prose prose-invert overflow-auto h-96 custom-scrollbar pr-2">
                    <p className="text-lg text-white">
                      {/* {getCurrentQuestion().question} */}
                      <RenderQuestion
                        questionString={getCurrentQuestion().question}
                      />
                    </p>
                  </div>
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
                        : "bg-gradient-to-r from-[#80EE98] to-[#09D1C7] text-[#1A202C] hover:from-[#09D1C7] hover:to-[#80EE98] "
                    }
                    transition-all duration-300 hover:opacity-90
                  `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isChecked ? "" : "Check Answer"}
                  </motion.button>
                  {isChecked &&
                    getCurrentQuestionNumber() !== getTotalQuestions() && (
                      <motion.button
                        onClick={handleNextQuestion}
                        className="w-full py-3 rounded-lg font-medium bg-gradient-to-r from-[#80EE98] to-[#09D1C7] text-[#1A202C]  hover:to-[#80EE98] hover:from-cyan-600 transition-all duration-300"
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
              className="relative rounded-xl overflow-hidden backdrop-blur-md bg-gray-800/50 border border-gray-700 transition-all duration-300 "
              style={{ width: `${terminalWidth}%` }}
              variants={itemVariants}
            >
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-900/50 border-b border-gray-700">
                  <div className="flex items-center space-x-2">
                    <TerminalIcon className="w-4 h-4 text-red-700" />
                    <span className="text-btg font-mono text-sm">Terminal</span>
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
                <div
                  ref={terminalRef}
                  className="flex-1 overflow-auto custom-scrollbar"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
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
                    className="mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-[#80EE98] to-[#09D1C7]  hover:from-[#09D1C7] hover:to-[#80EE98] text-black hover:opacity-90 transition-opacity"
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
      <AnimatePresence>
        {showCompletionPopup && (
          <CompletionPopup
            onEndLab={() => {
              setShowCompletionPopup(false);
              navigate(-1);
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showConfirmationPopup && (
          <ConfirmationPopup
            onConfirm={confirmEndLab}
            onCancel={cancelEndLab}
          />
        )}
        {showCompletionPopup && (
          <CompletionPopup
            onEndLab={() => {
              setShowCompletionPopup(false);
              navigate(-1);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default TerminalComponent;
