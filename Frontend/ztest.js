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

    termInstanceRef.current.onData(data => {
      if (socketRef.current) {
        socketRef.current.emit('user-input', data);
      } else {
        console.error('Socket connection not established');
      }
    });
    window.addEventListener('resize', () => fitAddon.fit());
  }

  socketRef.current = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:8000/terminal", {
    path: "/socket.io",
    transports: ["websocket", "polling"],
  });

  socketRef.current.on("connect", () => {
    console.log("Connected to socket server");
  });

  socketRef.current.on("terminal-output", (data) => {
    termInstanceRef.current?.write(data);
  });
  socketRef.current.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
  });

  socketRef.current.on("disconnect", () => {
    console.log("Disconnected from socket server");
  });

  return () => {
    // if (socketRef.current) {
    //   socketRef.current.disconnect();
    // }
  };
}, []);