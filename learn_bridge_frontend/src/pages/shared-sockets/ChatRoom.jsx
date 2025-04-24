import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  setLoading,
  setError,
  setMessages,
  receiveMessage,
  setCurrentChat,
  setConnected,
  markMessageReadByReceiver
} from "../../redux/slices/ChatSlice";

const BASE_URL = "http://localhost:5000/api";

const ChatRoom = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { messages, isLoading, error, isConnected } = useSelector((state) => state.chat);

  const [messageText, setMessageText] = useState("");
  const [otherUser, setOtherUser] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [localMessages, setLocalMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const messagesEndRef = useRef(null);
  const socketInitialized = useRef(false);
  const socketRef = useRef(null);

  // Set current chat in Redux
  useEffect(() => {
    if (userId) {
      dispatch(setCurrentChat(userId));
    }
    
    // Clean up when component unmounts
    return () => {
      dispatch(setCurrentChat(null));
      
      // Leave conversation when unmounting
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("leaveConversation", userId);
      }
    };
  }, [dispatch, userId]);

  // Connect to socket when component mounts
  useEffect(() => {
    if (!userId) return;
    
    const token = localStorage.getItem("token");
    if (!token) {
      setLocalError("Authentication required. Please log in.");
      return;
    }
    
    setConnectionStatus("connecting");
    
    // Use the global socket if it exists
    if (window.io && window.io.socket) {
      socketRef.current = window.io.socket;
      
      // If socket is already connected
      if (socketRef.current.connected) {
        console.log("Using existing socket connection");
        dispatch(setConnected(true));
        setConnectionStatus("connected");
        
        // Join conversation room
        socketRef.current.emit("joinConversation", userId);
        setupSocketListeners();
      } else {
        console.log("Socket exists but not connected, attempting reconnect");
        window.io.connect(token);
        
        // Wait a bit for the connection to establish
        setTimeout(() => {
          if (window.io.connected) {
            socketRef.current = window.io.socket;
            dispatch(setConnected(true));
            setConnectionStatus("connected");
            
            // Join conversation room
            socketRef.current.emit("joinConversation", userId);
            setupSocketListeners();
          } else {
            setConnectionStatus("error");
            setLocalError("Failed to connect to chat server. Please try again.");
          }
        }, 1000);
      }
    } else {
      console.log("No global socket, creating new connection");
      try {
        const socket = window.io.connect(token);
        socketRef.current = socket;
        
        // Wait for the connection to establish
        setTimeout(() => {
          if (window.io.connected) {
            dispatch(setConnected(true));
            setConnectionStatus("connected");
            
            // Join conversation room
            socketRef.current.emit("joinConversation", userId);
            setupSocketListeners();
          } else {
            setConnectionStatus("error");
            setLocalError("Failed to connect to chat server. Please try again.");
          }
        }, 1000);
      } catch (error) {
        console.error("Socket connection error:", error);
        setLocalError("Failed to connect to chat server. Please try again later.");
        setConnectionStatus("error");
        dispatch(setError("Socket connection failed"));
      }
    }
    
    return () => {
      cleanupSocketListeners();
    };
  }, [dispatch, userId]);

  // Setup socket listeners
  const setupSocketListeners = () => {
    if (!socketRef.current) return;
    
    // Clean up existing listeners first
    cleanupSocketListeners();
    
    // Add new message handler
    socketRef.current.on("newMessage", handleNewMessage);
    
    // Add debugging handlers
    socketRef.current.on("connect", () => {
      console.log("Socket connected in ChatRoom");
      setConnectionStatus("connected");
    });
    
    socketRef.current.on("disconnect", () => {
      console.log("Socket disconnected in ChatRoom");
      setConnectionStatus("disconnected");
    });
    
    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error in ChatRoom:", error);
      setConnectionStatus("error");
    });
    
    // Add handler for when joining conversation is confirmed
    socketRef.current.on("conversationJoined", (data) => {
      console.log("Joined conversation:", data);
      setConnectionStatus("connected");
    });
  };
  
  // Clean up socket listeners
  const cleanupSocketListeners = () => {
    if (!socketRef.current) return;
    
    socketRef.current.off("newMessage");
    socketRef.current.off("connect");
    socketRef.current.off("disconnect");
    socketRef.current.off("connect_error");
    socketRef.current.off("conversationJoined");
  };
  
  
  // Handle new message from socket
  const handleNewMessage = (message) => {
    console.log("New message received via socket:", message);
    
    if (!message || !userId) return;
    
    // More robust ID extraction
    const messageSenderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
    const messageReceiverId = typeof message.receiver === 'object' ? message.receiver._id : message.receiver;
    
    // Check if this message is part of the current conversation
    const currentUserId = user._id.toString();
    const otherUserId = userId.toString();
    
    // Simplified conversation check: is this message between me and the other user?
    const isForCurrentConversation = 
      (messageSenderId === currentUserId && messageReceiverId === otherUserId) ||
      (messageSenderId === otherUserId && messageReceiverId === currentUserId);
    
    console.log(`Message check: sender=${messageSenderId}, receiver=${messageReceiverId}, isForConversation=${isForCurrentConversation}`);
    
    if (isForCurrentConversation) {
      // Dispatch to Redux store
      dispatch(receiveMessage({ message }));
      
      // Update local messages without filtering
      setLocalMessages(prevMessages => {
        // Check for duplicates
        const isDuplicate = prevMessages.some(msg => 
          msg._id === message._id || 
          (msg.content === message.content && Math.abs(new Date(msg.createdAt) - new Date(message.createdAt)) < 1000)
        );
        
        if (!isDuplicate) {
          return [...prevMessages, message].sort((a, b) => 
            new Date(a.createdAt) - new Date(b.createdAt)
          );
        }
        return prevMessages;
      });
      
      // Mark as read if from other user
      if (messageSenderId === otherUserId) {
        handleMarkAsRead();
      }
    }
  };
  

  const fetchMessages = async () => {
    dispatch(setLoading());
    try {
      console.log(`Fetching messages for conversation with user ${userId}`);
      const response = await fetch(`${BASE_URL}/messages/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      
      const data = await response.json();
      console.log("Messages API response:", data);
      
      if (data.data && Array.isArray(data.data)) {
        // Log each message to see what's going on
        data.data.forEach((msg, i) => {
          const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
          const receiverId = typeof msg.receiver === 'object' ? msg.receiver._id : msg.receiver;
          console.log(`Message ${i}: sender=${senderId}, receiver=${receiverId}, content=${msg.content}`);
        });
        
        // Update Redux with ALL messages regardless of sender/receiver
        dispatch(setMessages({ userId, messages: data.data }));
        
        // Update local state directly as well to force a re-render
        setLocalMessages(data.data.sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        ));
      }
      
      // Mark messages as read
      handleMarkAsRead();
    } catch (error) {
      console.error("Error fetching messages:", error);
      dispatch(setError(error.message));
      setLocalError("Failed to load messages. Please try again.");
    }
  };

  const handleMarkAsRead = async () => {
    try {
      const response = await fetch(`${BASE_URL}/messages/read/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to mark messages as read");
      }
      
      dispatch(markMessageReadByReceiver({ userId }));
      
      // Also emit via socket if connected
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("markAsRead", { sender: userId });
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
      // Not setting error state as this is a non-critical operation
    }
  };

  // Load messages when userId changes
  useEffect(() => {
    if (userId) {
      fetchMessages();
    }
  }, [userId]);


  
useEffect(() => {
  if (messages && messages[userId]) {
    console.log("Updating local messages from Redux store. Count:", messages[userId].length);
    
    // Don't filter messages, show all conversation messages
    const sortedMessages = [...messages[userId]].sort((a, b) => 
      new Date(a.createdAt) - new Date(b.createdAt)
    );
    
    // Log the messages to debug
    sortedMessages.forEach((msg, i) => {
      const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
      console.log(`Local msg ${i}: sender=${senderId}, user=${user._id}, content=${msg.content}`);
    });
    
    setLocalMessages(sortedMessages);
    
    // Try to set other user info if not already set
    if (!otherUser && sortedMessages.length > 0) {
      for (const message of sortedMessages) {
        // Find a message where the other user is the sender or receiver
        if (message.sender && typeof message.sender === 'object' && 
            message.sender._id.toString() !== user._id.toString()) {
          setOtherUser(message.sender);
          break;
        } else if (message.receiver && typeof message.receiver === 'object' && 
                   message.receiver._id.toString() !== user._id.toString()) {
          setOtherUser(message.receiver);
          break;
        }
      }
    }
  } else if (!messages[userId]) {
    setLocalMessages([]);
  }
}, [messages, userId, user._id]);
useEffect(() => {
  // Reset local state
  setLocalMessages([]);
  setMessageText("");
  setOtherUser(null);
  setLocalError(null);
  setConnectionStatus("disconnected");
  
  // Clean up socket connection
  if (socketRef.current && socketRef.current.connected) {
    socketRef.current.emit("leaveConversation", userId);
  }
  
  // Reset Redux chat state
  dispatch(setCurrentChat(null));
  
  // Re-initialize with new userId
  if (userId) {
    dispatch(setCurrentChat(userId));
    fetchMessages();
    
    // Initialize socket connection
    const token = localStorage.getItem("token");
    if (token && window.io) {
      if (!window.io.connected) {
        window.io.connect(token);
      }
      
      // Join new conversation after a brief delay
      setTimeout(() => {
        if (window.io.socket && window.io.connected) {
          socketRef.current = window.io.socket;
          socketRef.current.emit("joinConversation", userId);
          setupSocketListeners();
          setConnectionStatus("connected");
        }
      }, 500);
    }
  }
  
  return () => {
    // Clean up on unmount
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("leaveConversation", userId);
    }
    dispatch(setCurrentChat(null));
  };
}, [userId, dispatch]);
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  useEffect(() => {
    const handleSocketMessage = (message) => {
      console.log("New socket message received, refreshing messages");
      fetchMessages(); // Re-fetch all messages when a new one arrives
    };
    
    // Try to add the listener to the global socket
    if (window.io && window.io.socket) {
      window.io.socket.on("newMessage", handleSocketMessage);
      
      // Clean up
      return () => {
        window.io.socket.off("newMessage", handleSocketMessage);
      };
    }
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim() || !userId) return;
    
    const messageData = {
      receiver: userId,
      content: messageText,
    };
    
    // Reset text input immediately for better UX
    const currentMessage = messageText;
    setMessageText("");
    
    // Create optimistic response
    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      content: currentMessage,
      createdAt: new Date().toISOString(),
      sender: {
        _id: user._id,
        name: user.name,
        role: user.role
      },
      receiver: userId,
      isRead: false,
      isOptimistic: true
    };
    
    // Add optimistic message to Redux
    dispatch(receiveMessage({ message: optimisticMessage }));
    
    try {
      // Try to send via socket first if connected
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("privateMessage", messageData);
      } else {
        // Fallback to REST API
        const response = await fetch(`${BASE_URL}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify(messageData)
        });
        
        if (!response.ok) {
          throw new Error("Failed to send message");
        }
      }
    } catch (error) {
      console.error("Send message error:", error);
      setLocalError("Failed to send message. Please try again.");
      setMessageText(currentMessage);
    }
  };

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (err) {
      return "Unknown time";
    }
  };

  // Check for missing userId
  if (!userId) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          Invalid conversation. User ID is missing.
          <button 
            className="btn btn-primary ms-3" 
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row mb-4">
        <div className="col-md-12">
          <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left me-2"></i>
            Back
          </button>

          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="mb-0">{otherUser ? otherUser.name : "Chat"}</h4>
              <span className={`badge ${connectionStatus === 'connected' ? 'bg-success' : connectionStatus === 'connecting' ? 'bg-warning' : 'bg-danger'}`}>
                {connectionStatus === 'connected' ? 'Online' : 
                 connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
              </span>
            </div>

            <div className="card-body chat-container" style={{ height: "400px", overflowY: "auto" }}>
              {(error || localError) && (
                <div className="alert alert-danger" role="alert">
                  {error || localError}
                  <button 
                    className="btn-close" 
                    onClick={() => setLocalError(null)} 
                    aria-label="Close"
                  ></button>
                </div>
              )}

// Replace the message rendering section
<div className="chat-messages">
  {localMessages.length > 0 ? (
    localMessages.map((message, index) => {
      // Simplified determination of whether message is from current user
      const messageSender = typeof message.sender === 'object' ? message.sender._id : message.sender;
      const isSentByMe = messageSender?.toString() === user._id?.toString();
      
      console.log(`Rendering message ${index}: sender=${messageSender}, isSentByMe=${isSentByMe}, content=${message.content}`);
      
      return (
        <div 
          key={message._id || `msg-${index}`} 
          className="message-row"
          style={{ 
            textAlign: isSentByMe ? 'right' : 'left',
            margin: '10px 0'
          }}
        >
          <div 
            style={{
              display: 'inline-block',
              maxWidth: '70%',
              padding: '10px 15px',
              borderRadius: '18px',
              backgroundColor: isSentByMe ? '#0d6efd' : '#f8f9fa',
              color: isSentByMe ? 'white' : 'black',
            }}
          >
            <div>{message.content}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8, textAlign: 'right' }}>
              {formatTime(message.createdAt)}
              {isSentByMe && (
                <span style={{ marginLeft: '4px' }}>
                  {message.isOptimistic ? "●" : message.isRead ? "✓✓" : "✓"}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    })
  ) : (
    <div className="text-center py-5">
      <p>No messages yet. Start the conversation!</p>
    </div>
  )}
  <div ref={messagesEndRef} />
</div>
</div>

            <div className="card-footer">
              <form onSubmit={handleSendMessage}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    disabled={connectionStatus !== 'connected'}
                  />
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={!messageText.trim() || !userId || connectionStatus !== 'connected'}
                  >
                    {connectionStatus !== 'connected' ? 'Connecting...' : 'Send'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;