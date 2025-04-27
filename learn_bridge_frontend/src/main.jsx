import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux";

import { HMSRoomProvider } from '@100mslive/react-sdk';

import './index.css'
import App from './App.jsx'

import io from "socket.io-client"

const SOCKET_URL = "http://localhost:5000"

// Create window.io namespace to store socket related objects
window.io = {
  connect: (token) => {
    if (window.io.socket) {
      console.log("Socket already exists, disconnecting previous connection");
      window.io.socket.disconnect();
    }
    
    // Create new socket connection with auth token
    const socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'], // Explicitly set transports
    });
    
    // Store socket globally for component access
    window.io.socket = socket;
    
    // Setup global socket events
    socket.on("connect", () => {
      console.log("Socket connected globally with ID:", socket.id);
      window.io.connected = true;
    });
    
    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected globally. Reason:", reason);
      window.io.connected = false;
    });
    
    socket.on("connect_error", (error) => {
      console.error("Socket connection error globally:", error.message);
      window.io.connected = false;
    });
    
    // Add a specific handler for new messages at the global level
    socket.on("newMessage", (message) => {
      console.log("New message received globally:", message);
      // You can dispatch to Redux here if needed
      if (store && message) {
        store.dispatch({
          type: "chat/receiveMessage",
          payload: { message }
        });
      }
    });
    
    return socket;
  },
  disconnect: () => {
    if (window.io.socket) {
      window.io.socket.disconnect();
      window.io.socket = null;
      window.io.connected = false;
    }
  },
  socket: null,
  connected: false
};

// Try to connect with stored token on startup
const token = localStorage.getItem("token");
if (token) {
  console.log("Found token, attempting to connect socket on app start");
  window.io.connect(token);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HMSRoomProvider>
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
    </HMSRoomProvider>
  </StrictMode>
);