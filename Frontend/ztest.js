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
    console.log("dockerimg", docker_image);
    const socket = io("http://localhost:8000/terminal", {
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: {
        docker_image: docker_image || "ubuntu:latest",
        // labId: labId,
      },
    });
    socketRef.current = socket;

    socket.on("connect", () => setsocketId(socket.id));
    socket.on("output", (data) => newTerm.write(data));

    newTerm.onKey(({ key }) => socket.emit("command", key));

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);

      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (newTerm) {
        newTerm.dispose();
      }
    };
  };

  if (terminalRef.current) {
    initializeTerminal();
  }
}, [docker_image]);