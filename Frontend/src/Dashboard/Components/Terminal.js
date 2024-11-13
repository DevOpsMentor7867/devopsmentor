import React, { useState, useEffect, useRef } from "react";

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

export default function TerminalQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [terminalContent, setTerminalContent] = useState([
    "~ → docker run redis",
    "1:C 26 Mar 2024 05:31:57.208 * ooo000ooo000o Redis is starting ooo000ooo000o",
    "1:C 26 Mar 2024 05:31:57.208 * Redis version=7.2.3, bits=64, commit=00000000",
    "1:M 26 Mar 2024 05:31:57.209 * Running mode=standalone, port=6379",
    "1:M 26 Mar 2024 05:31:57.210 * Server initialized",
    "~ → ",
  ]);
  const [isChecked, setIsChecked] = useState(false);
  const [containerStopped, setContainerStopped] = useState(false);
  const [time, setTime] = useState(3600); // 1 hour in seconds
  const [isDragging, setIsDragging] = useState(false);
  const [terminalPosition, setTerminalPosition] = useState("right");
  const [terminalWidth, setTerminalWidth] = useState(50); // 50% by default
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);

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
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const containerRect = document
        .querySelector(".container")
        ?.getBoundingClientRect();
      if (!containerRect) return;
      const deltaX = e.clientX - dragStartX.current;
      const containerWidth = containerRect.width;
      const newWidth =
        terminalPosition === "left"
          ? Math.min(
              Math.max(
                ((dragStartWidth.current + deltaX) / containerWidth) * 100,
                30
              ),
              70
            )
          : Math.min(
              Math.max(
                ((containerWidth - (dragStartWidth.current + deltaX)) /
                  containerWidth) *
                  100,
                30
              ),
              70
            );
      setTerminalWidth(newWidth);
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
  }, [isDragging, terminalPosition]);

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
    setTerminalContent((prev) => [
      ...prev,
      "Container stopped successfully",
      "~ → ",
    ]);
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

  const toggleTerminalPosition = () => {
    setTerminalPosition((prev) => (prev === "left" ? "right" : "left"));
  };

  return (
    <div className="mt-20">
      <div className="container mx-auto p-4">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ color: "white", fontFamily: "monospace" }}>sk</span>
            <button
              style={{
                color: "#9ca3af",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Hint
            </button>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "white",
            }}
          >
            <Clock style={{ width: "1rem", height: "1rem" }} />
            <span style={{ fontFamily: "monospace" }}>{formatTime(time)}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1.5rem", position: "relative" }}>
          {/* Question Section */}
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              backdropFilter: "blur(8px)",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              border: "none",
              transition: "all 0.3s",
              order: terminalPosition === "left" ? 2 : 1,
              width: `${100 - terminalWidth}%`,
            }}
          >
            <div
              style={{ padding: "1.5rem", position: "relative", zIndex: 10 }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  {Array.from({ length: 17 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        height: "0.25rem",
                        width: "1.5rem",
                        borderRadius: "9999px",
                        backgroundColor:
                          i <= currentQuestion ? "#3b82f6" : "#374151",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div
                style={{
                  minHeight: "120px",
                  color: "white",
                  marginTop: "1.5rem",
                }}
              >
                <p
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    marginBottom: "1rem",
                  }}
                >
                  {questions[currentQuestion].text}
                </p>
                {containerStopped && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "#10b981",
                    }}
                  >
                    <CheckCircle2
                      style={{ width: "1.25rem", height: "1.25rem" }}
                    />
                    <span>Container Stopped</span>
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <button
                  onClick={handleCheck}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    fontSize: "1rem",
                    fontWeight: 500,
                    borderRadius: "9999px",
                    color: isChecked ? "#10b981" : "white",
                    overflow: "hidden",
                    position: "relative",
                    background: "transparent",
                    border: "2px solid transparent",
                    backgroundImage:
                      "linear-gradient(rgba(26, 31, 54, 0.8), rgba(26, 31, 54, 0.8)), linear-gradient(45deg, #00D2FF, #3A7BD5)",
                    backgroundOrigin: "border-box",
                    backgroundClip: "padding-box, border-box",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      zIndex: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isChecked ? (
                      <>
                        <CheckCircle2
                          style={{
                            width: "1.25rem",
                            height: "1.25rem",
                            marginRight: "0.5rem",
                          }}
                        />
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
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      fontSize: "1rem",
                      fontWeight: 500,
                      color: "white",
                      borderRadius: "9999px",
                      background: "linear-gradient(45deg, #00D2FF, #3A7BD5)",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Next
                  </button>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#9ca3af",
                  fontSize: "0.875rem",
                  marginTop: "1rem",
                }}
              >
                <span>{currentQuestion + 1} / 17</span>
              </div>
            </div>
          </div>

          {/* Terminal Section */}
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              backdropFilter: "blur(8px)",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              border: "none",
              transition: "all 0.3s",
              order: terminalPosition === "left" ? 1 : 2,
              width: `${terminalWidth}%`,
            }}
          >
            <div style={{ position: "relative", zIndex: 10 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                  padding: "0.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <TerminalIcon
                    style={{ width: "1rem", height: "1rem", color: "#9ca3af" }}
                  />
                  <span
                    style={{
                      color: "white",
                      fontFamily: "monospace",
                      fontSize: "0.875rem",
                    }}
                  >
                    Terminal 1
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <button
                    onClick={toggleTerminalPosition}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#9ca3af",
                      cursor: "pointer",
                    }}
                  >
                    <Maximize2 style={{ width: "1rem", height: "1rem" }} />
                  </button>
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      color: "#9ca3af",
                      cursor: "pointer",
                    }}
                  >
                    <Plus style={{ width: "1rem", height: "1rem" }} />
                  </button>
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      color: "#9ca3af",
                      cursor: "pointer",
                    }}
                  >
                    <X style={{ width: "1rem", height: "1rem" }} />
                  </button>
                </div>
              </div>
              <div
                style={{
                  padding: "1rem",
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                  height: "400px",
                  overflow: "auto",
                }}
              >
                {terminalContent.map((line, index) => (
                  <div
                    key={index}
                    style={{ color: "#d1d5db", marginBottom: "0.25rem" }}
                  >
                    {line}
                  </div>
                ))}
                <div
                  style={{
                    color: "#60a5fa",
                    animation: "blink 1s step-end infinite",
                  }}
                >
                  _
                </div>
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                [terminalPosition === "left" ? "right" : "left"]: 0,
                top: 0,
                bottom: 0,
                width: "4px",
                backgroundColor: "#4b5563",
                cursor: "ew-resize",
              }}
              onMouseDown={handleDragStart}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
