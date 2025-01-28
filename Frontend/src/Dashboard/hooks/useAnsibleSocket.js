import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export function useAnsibleSocket() {
  const [isAnsibleSocketConnected, setIsAnsibleSocketConnected] = useState(false);
  const [ansibleSocketId, setAnsibleSocketId] = useState(null);
  const ansibleSocketRef = useRef(null);

  useEffect(() => {
    const socket = io("http://localhost:8000/Ansible-terminal", {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Ansible Socket connected');
      setIsAnsibleSocketConnected(true);
      setAnsibleSocketId(socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('Ansible Socket disconnected:', reason);
      setIsAnsibleSocketConnected(false);
      setAnsibleSocketId(null);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsAnsibleSocketConnected(false);
    });

    ansibleSocketRef.current = socket;

    return () => {
      socket.disconnect();
      ansibleSocketRef.current = null;
    };
  }, []);

  const emit = (event, data) => {
    if (ansibleSocketRef.current) {
      ansibleSocketRef.current.emit(event, data);
    } else {
      console.error('Ansible Socket is not connected');
    }
  };

  return { socket: ansibleSocketRef.current, isAnsibleSocketConnected, ansibleSocketId, emit };
}
