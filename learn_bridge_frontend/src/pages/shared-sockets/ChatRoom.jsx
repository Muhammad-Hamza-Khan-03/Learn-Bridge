import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import {
  setLoading,
  setError,
  setMessages,
  receiveMessage,
  setCurrentChat,
  setConnected,
  markMessageReadByReceiver,
} from "../../redux/slices/ChatSlice"
import { ArrowLeft, Send, X, CheckCheck, Check, Clock, Loader2, User, AlertCircle, Moon, Sun } from "lucide-react"

const BASE_URL = "http://localhost:5000/api"

const ChatRoom = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { messages, isLoading, error, isConnected } = useSelector((state) => state.chat)

  const [messageText, setMessageText] = useState("")
  const [otherUser, setOtherUser] = useState(null)
  const [localError, setLocalError] = useState(null)
  const [localMessages, setLocalMessages] = useState([])
  const [connectionStatus, setConnectionStatus] = useState("disconnected")
  const [darkMode, setDarkMode] = useState(false)
  const messagesEndRef = useRef(null)
  const socketRef = useRef(null)
  const messageInputRef = useRef(null)

  // Check for user's preferred color scheme
  useEffect(() => {
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    setDarkMode(prefersDark)
  }, [])

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  useEffect(() => {
    if (userId && user && userId === user._id?.toString()) {
      console.error("Cannot chat with yourself!")
      setLocalError("Cannot chat with yourself.")
    }
  }, [userId, user])

  // Set current chat in Redux
  useEffect(() => {
    if (userId) {
      dispatch(setCurrentChat(userId))
    }

    // Clean up when component unmounts
    return () => {
      dispatch(setCurrentChat(null))

      // Leave conversation when unmounting
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("leaveConversation", userId)
      }
    }
  }, [dispatch, userId])

  // Add this useEffect to reset everything when userId changes
  useEffect(() => {
    // Reset local state
    setLocalMessages([])
    setMessageText("")
    setOtherUser(null)
    setLocalError(null)
    setConnectionStatus("disconnected")

    // Clean up socket connection
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("leaveConversation", userId)
    }

    // Reset Redux chat state
    dispatch(setCurrentChat(null))

    // Re-initialize with new userId
    if (userId) {
      dispatch(setCurrentChat(userId))
      fetchMessages()

      // Initialize socket connection
      const token = localStorage.getItem("token")
      if (token && window.io) {
        if (!window.io.connected) {
          window.io.connect(token)
        }

        // Join new conversation after a brief delay
        setTimeout(() => {
          if (window.io.socket && window.io.connected) {
            socketRef.current = window.io.socket
            socketRef.current.emit("joinConversation", userId)
            setupSocketListeners()
            setConnectionStatus("connected")
          }
        }, 500)
      }
    }

    return () => {
      // Clean up on unmount
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("leaveConversation", userId)
      }
      dispatch(setCurrentChat(null))
    }
  }, [userId, dispatch])

  // Connect to socket when component mounts
  useEffect(() => {
    if (!userId) return

    // Make sure userId is not the current user's ID
    if (userId === user._id.toString()) {
      setLocalError("Cannot chat with yourself. Please select a different user.")
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      setLocalError("Authentication required. Please log in.")
      return
    }

    setConnectionStatus("connecting")
    console.log(`Connecting to chat with user ID: ${userId} (Current user ID: ${user._id})`)

    // Use the global socket if it exists
    if (window.io && window.io.socket) {
      socketRef.current = window.io.socket

      // If socket is already connected
      if (socketRef.current.connected) {
        console.log("Using existing socket connection")
        dispatch(setConnected(true))
        setConnectionStatus("connected")

        // Join conversation room - MAKE SURE THE PARTNER ID IS CORRECT
        console.log(`Emitting joinConversation with partner ID: ${userId}`)
        socketRef.current.emit("joinConversation", userId)
        setupSocketListeners()
      } else {
        console.log("Socket exists but not connected, attempting reconnect")
        window.io.connect(token)

        // Wait a bit for the connection to establish
        setTimeout(() => {
          if (window.io.connected) {
            socketRef.current = window.io.socket
            dispatch(setConnected(true))
            setConnectionStatus("connected")

            // Join conversation room with the RIGHT partner ID
            console.log(`Emitting joinConversation with partner ID: ${userId}`)
            socketRef.current.emit("joinConversation", userId)
            setupSocketListeners()
          } else {
            setConnectionStatus("error")
            setLocalError("Failed to connect to chat server. Please try again.")
          }
        }, 1000)
      }
    } else {
      console.log("No global socket, creating new connection")
      try {
        const socket = window.io.connect(token)
        socketRef.current = socket

        // Wait for the connection to establish
        setTimeout(() => {
          if (window.io.connected) {
            dispatch(setConnected(true))
            setConnectionStatus("connected")

            // Join conversation room
            socketRef.current.emit("joinConversation", userId)
            setupSocketListeners()
          } else {
            setConnectionStatus("error")
            setLocalError("Failed to connect to chat server. Please try again.")
          }
        }, 1000)
      } catch (error) {
        console.error("Socket connection error:", error)
        setLocalError("Failed to connect to chat server. Please try again later.")
        setConnectionStatus("error")
        dispatch(setError("Socket connection failed"))
      }
    }

    return () => {
      cleanupSocketListeners()
    }
  }, [dispatch, userId, user._id])

  const handleEndChat = async () => {
    try {
      if (userId) {
        const deleteResponse = await fetch(`${BASE_URL}/messages/${userId}/clear`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (deleteResponse.ok) {
          console.log(`Successfully cleared messages for conversation with ${userId}`);
        } else {
          console.error(`Failed to clear messages for conversation with ${userId}`);
        }
      }

      // Clean up socket connection
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("leaveConversation", userId);
        console.log(`Ending chat with user ${userId}`);
      }

      // Update Redux state
      dispatch(setCurrentChat(null));

      // Navigate back
      navigate(-1);
    } catch (error) {
      console.error("Error ending chat:", error);
      navigate(-1);
    }
  };

  // Setup socket listeners
  const setupSocketListeners = () => {
    if (!socketRef.current) return

    // Clean up existing listeners first
    cleanupSocketListeners()

    // Add new message handler
    socketRef.current.on("newMessage", handleNewMessage)

    // Add debugging handlers
    socketRef.current.on("connect", () => {
      console.log("Socket connected in ChatRoom")
      setConnectionStatus("connected")
    })

    socketRef.current.on("disconnect", () => {
      console.log("Socket disconnected in ChatRoom")
      setConnectionStatus("disconnected")
    })

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error in ChatRoom:", error)
      setConnectionStatus("error")
    })

    // Add handler for when joining conversation is confirmed
    socketRef.current.on("conversationJoined", (data) => {
      console.log("Joined conversation:", data)
      setConnectionStatus("connected")
    })
  }

  // Clean up socket listeners
  const cleanupSocketListeners = () => {
    if (!socketRef.current) return

    socketRef.current.off("newMessage")
    socketRef.current.off("connect")
    socketRef.current.off("disconnect")
    socketRef.current.off("connect_error")
    socketRef.current.off("conversationJoined")
  }

  // Handle new message from socket
  const handleNewMessage = (message) => {
    console.log("New message received via socket:", message)

    if (!message || !userId) return

    // Extract sender and receiver IDs properly
    const messageSenderId = typeof message.sender === "object" ? message.sender._id : message.sender
    const messageReceiverId = typeof message.receiver === "object" ? message.receiver._id : message.receiver

    // Check if this message is part of the current conversation
    const currentUserId = user._id.toString()
    const otherUserId = userId.toString()

    console.log(
      `Message participants: currentUser=${currentUserId}, otherUser=${otherUserId}, messageSender=${messageSenderId}, messageReceiver=${messageReceiverId}`,
    )

    // This conversation includes messages where:
    // 1. Current user sent to other user, OR
    // 2. Other user sent to current user
    const isForCurrentConversation =
      (messageSenderId === currentUserId && messageReceiverId === otherUserId) ||
      (messageSenderId === otherUserId && messageReceiverId === currentUserId)

    console.log(`Is this message for current conversation? ${isForCurrentConversation}`)

    if (isForCurrentConversation) {
      console.log("Adding message to current conversation")

      // Dispatch to Redux
      dispatch(receiveMessage({ message }))

      // Update local messages
      setLocalMessages((prevMessages) => {
        // Check for duplicates
        const isDuplicate = prevMessages.some(
          (msg) =>
            (msg._id && message._id && msg._id === message._id) ||
            (msg.content === message.content && Math.abs(new Date(msg.createdAt) - new Date(message.createdAt)) < 1000),
        )

        if (!isDuplicate) {
          const newMessages = [...prevMessages, message].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          console.log(`Updated localMessages, now have ${newMessages.length} messages`)
          return newMessages
        }

        console.log("Duplicate message detected, not adding")
        return prevMessages
      })

      // Mark as read if from other user
      if (messageSenderId === otherUserId) {
        handleMarkAsRead()
      }
    } else {
      console.log("Message is not for the current conversation, ignoring")
    }
  }

  const fetchMessages = async () => {
    dispatch(setLoading())
    try {
      console.log(`Fetching messages between current user ${user._id} and ${userId}`)

      const response = await fetch(`${BASE_URL}/messages/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch messages")
      }

      const data = await response.json()
      console.log("Messages API response:", data)

      if (data.data && Array.isArray(data.data)) {
        // Log each message to verify sender and receiver
        data.data.forEach((msg, index) => {
          const senderId = typeof msg.sender === "object" ? msg.sender._id : msg.sender
          const receiverId = typeof msg.receiver === "object" ? msg.receiver._id : msg.receiver

          console.log(
            `Message ${index}: sender=${senderId}, receiver=${receiverId}, content=${msg.content.substring(0, 30)}`,
          )

          // Alert if sender equals receiver (this shouldn't happen)
          if (senderId === receiverId) {
            console.error(`ERROR: Message ${index} has sender equal to receiver: ${senderId}`)
          }
        })

        // Filter messages to only include those between the current user and the other user
        const relevantMessages = data.data.filter((msg) => {
          const senderId = typeof msg.sender === "object" ? msg.sender._id : msg.sender
          const receiverId = typeof msg.receiver === "object" ? msg.receiver._id : msg.receiver

          const isRelevant =
            (senderId === user._id.toString() && receiverId === userId.toString()) ||
            (senderId === userId.toString() && receiverId === user._id.toString())

          if (!isRelevant) {
            console.log(`Filtering out irrelevant message: sender=${senderId}, receiver=${receiverId}`)
          }

          return isRelevant
        })

        console.log(
          `After filtering, ${relevantMessages.length} of ${data.data.length} messages are relevant to this conversation`,
        )

        // Update Redux store with filtered messages
        dispatch(setMessages({ userId, messages: relevantMessages }))

        // Update local state
        setLocalMessages(relevantMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)))
      }

      // Mark messages as read
      handleMarkAsRead()
    } catch (error) {
      console.error("Error fetching messages:", error)
      dispatch(setError(error.message))
      setLocalError("Failed to load messages. Please try again.")
    }
  }

  const handleMarkAsRead = async () => {
    try {
      const response = await fetch(`${BASE_URL}/messages/read/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to mark messages as read")
      }

      dispatch(markMessageReadByReceiver({ userId }))

      // Also emit via socket if connected
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("markAsRead", { sender: userId })
      }
    } catch (error) {
      console.error("Error marking messages as read:", error)
    }
  }

  // Load messages when userId changes
  useEffect(() => {
    if (userId) {
      fetchMessages()
    }
  }, [userId])

  useEffect(() => {
    if (messages && messages[userId]) {
      console.log("Updating local messages from Redux store. Count:", messages[userId].length)

      // show all conversation messages
      const sortedMessages = [...messages[userId]].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

      // Log the messages to debug
      sortedMessages.forEach((msg, i) => {
        const senderId = typeof msg.sender === "object" ? msg.sender._id : msg.sender
        console.log(`Local msg ${i}: sender=${senderId}, user=${user._id}, content=${msg.content}`)
      })

      setLocalMessages(sortedMessages)

      // Try to set other user info if not already set
      if (!otherUser && sortedMessages.length > 0) {
        for (const message of sortedMessages) {
          // Find a message where the other user is the sender or receiver
          if (
            message.sender &&
            typeof message.sender === "object" &&
            message.sender._id.toString() !== user._id.toString()
          ) {
            setOtherUser(message.sender)
            break
          } else if (
            message.receiver &&
            typeof message.receiver === "object" &&
            message.receiver._id.toString() !== user._id.toString()
          ) {
            setOtherUser(message.receiver)
            break
          }
        }
      }
    } else if (!messages[userId]) {
      setLocalMessages([])
    }
  }, [messages, userId, user._id])

  useEffect(() => {
    // Reset local state
    setLocalMessages([])
    setMessageText("")
    setOtherUser(null)
    setLocalError(null)
    setConnectionStatus("disconnected")

    // Clean up socket connection
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("leaveConversation", userId)
    }

    // Reset Redux chat state
    dispatch(setCurrentChat(null))

    // Re-initialize with new userId
    if (userId) {
      dispatch(setCurrentChat(userId))
      fetchMessages()

      // Initialize socket connection
      const token = localStorage.getItem("token")
      if (token && window.io) {
        if (!window.io.connected) {
          window.io.connect(token)
        }

        // Join new conversation after a brief delay
        setTimeout(() => {
          if (window.io.socket && window.io.connected) {
            socketRef.current = window.io.socket
            socketRef.current.emit("joinConversation", userId)
            setupSocketListeners()
            setConnectionStatus("connected")
          }
        }, 500)
      }
    }

    return () => {
      // Clean up on unmount
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("leaveConversation", userId)
      }
      dispatch(setCurrentChat(null))
    }
  }, [userId, dispatch])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [localMessages])

  useEffect(() => {
    const handleSocketMessage = (message) => {
      console.log("New socket message received, refreshing messages")
      fetchMessages() // Re-fetch all messages when a new one arrives
    }

    // Try to add the listener to the global socket
    if (window.io && window.io.socket) {
      window.io.socket.on("newMessage", handleSocketMessage)

      // Clean up
      return () => {
        window.io.socket.off("newMessage", handleSocketMessage)
      }
    }
  }, [])

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!messageText.trim() || !userId) return

    // Ensure userId is not the current user's ID
    if (userId === user._id.toString()) {
      setLocalError("Cannot send messages to yourself.")
      return
    }

    console.log(`Sending message to user ID: ${userId} from user ID: ${user._id}`)

    const messageData = {
      receiver: userId,
      content: messageText,
    }

    // Reset text input immediately for better UX
    const currentMessage = messageText
    setMessageText("")

    // Create optimistic response
    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      content: currentMessage,
      createdAt: new Date().toISOString(),
      sender: {
        _id: user._id,
        name: user.name,
        role: user.role,
      },
      receiver: {
        _id: userId,
      },
      isRead: false,
      isOptimistic: true,
    }

    // Add optimistic message to local state
    setLocalMessages((prevMessages) =>
      [...prevMessages, optimisticMessage].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    )

    try {
      // Try to send via socket first if connected
      if (socketRef.current && socketRef.current.connected) {
        console.log(`Sending message via socket to user ${userId}: "${currentMessage}"`)
        socketRef.current.emit("privateMessage", messageData)
      } else {
        // Fallback to REST API
        console.log(`Sending message via API to user ${userId}: "${currentMessage}"`)
        const response = await fetch(`${BASE_URL}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(messageData),
        })

        if (!response.ok) {
          throw new Error("Failed to send message")
        }
      }
    } catch (error) {
      console.error("Send message error:", error)
      setLocalError("Failed to send message. Please try again.")
      setMessageText(currentMessage)
    }
  }

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch (err) {
      return "Unknown time"
    }
  }

  // Focus on input when component mounts
  useEffect(() => {
    if (messageInputRef.current) {
      messageInputRef.current.focus()
    }
  }, [])

  // Check for missing userId
  if (!userId) {
    return (
      <div
        className={`h-screen flex items-center justify-center ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"} p-4`}
      >
        <div
          className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border p-6 rounded shadow-sm flex items-center gap-4 max-w-lg`}
        >
          <AlertCircle className={`w-6 h-6 ${darkMode ? "text-gray-400" : "text-gray-500"} flex-shrink-0`} />
          <div>
            <h2 className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-900"} mb-2`}>
              Invalid Conversation
            </h2>
            <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} mb-4`}>
              User ID is missing. Please select a valid conversation.
            </p>
            <button
              className={`${darkMode ? "bg-blue-500 hover:bg-blue-600" : "bg-blue-500 hover:bg-blue-600"} text-white px-4 py-2 rounded transition-colors`}
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-screen flex flex-col ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      {/* Header */}
      <header
        className={`${darkMode ? "bg-blue-800 border-blue-900" : "bg-blue-500 border-blue-600"} border-b shadow-sm`}
      >
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className={`flex items-center justify-center p-2 rounded ${darkMode ? "hover:bg-blue-700" : "hover:bg-blue-400"} transition-colors`}
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            <div className="flex items-center gap-3">
              <div
                className={`${darkMode ? "bg-blue-700" : "bg-blue-400"} rounded-full w-10 h-10 flex items-center justify-center`}
              >
                {otherUser ? (
                  otherUser.avatar ? (
                    <img
                      src={otherUser.avatar || "/placeholder.svg"}
                      alt={otherUser.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>

              <div>
                <h2 className="font-medium text-white">{otherUser ? otherUser.name : "Chat"}</h2>
                <div
                  className={`flex items-center gap-1 text-xs ${connectionStatus === "connected"
                      ? "text-green-300"
                      : connectionStatus === "connecting"
                        ? "text-amber-300"
                        : "text-red-300"
                    }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${connectionStatus === "connected"
                        ? "bg-green-400"
                        : connectionStatus === "connecting"
                          ? "bg-amber-400"
                          : "bg-red-400"
                      }`}
                  ></span>
                  {connectionStatus === "connected"
                    ? "Online"
                    : connectionStatus === "connecting"
                      ? "Connecting..."
                      : "Offline"}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className={`p-2 rounded-full ${darkMode ? "bg-blue-700 hover:bg-blue-600" : "bg-blue-400 hover:bg-blue-300"} transition-colors`}
              onClick={toggleDarkMode}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-white" />}
            </button>

            <button
              className={`${darkMode ? "bg-blue-700 text-white hover:bg-blue-600" : "bg-white text-blue-500 hover:bg-blue-50"} py-2 px-4 rounded transition-colors flex items-center gap-1.5 font-medium text-sm`}
              onClick={handleEndChat}
            >
              <X className="w-4 h-4" />
              End Chat
            </button>
          </div>
        </div>
      </header>


      {/* Messages container */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className={`w-8 h-8 ${darkMode ? "text-blue-400" : "text-blue-500"} animate-spin`} />
              <p className={`${darkMode ? "text-gray-300" : "text-gray-500"} text-sm`}>Loading messages...</p>
            </div>
          </div>
        ) : (
          <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
            <div className="max-w-screen-lg mx-auto">
              {localMessages.length > 0 ? (
                localMessages.map((message, index) => {
                  const messageSender = typeof message.sender === "object" ? message.sender._id : message.sender
                  const isSentByMe = messageSender?.toString() === user._id?.toString()

                  // Group messages by sender
                  const prevMessage = index > 0 ? localMessages[index - 1] : null
                  const prevSender = prevMessage
                    ? typeof prevMessage.sender === "object"
                      ? prevMessage.sender._id
                      : prevMessage.sender
                    : null
                  const isFirstInGroup = !prevSender || prevSender.toString() !== messageSender.toString()

                  // Format date for message groups
                  const messageDate = new Date(message.createdAt).toLocaleDateString()
                  const prevMessageDate = prevMessage ? new Date(prevMessage.createdAt).toLocaleDateString() : null
                  const showDateDivider = !prevMessageDate || messageDate !== prevMessageDate

                  return (
                    <div key={message._id || `msg-${index}`}>
                      {/* Date divider */}
                      {showDateDivider && (
                        <div className="flex justify-center my-4">
                          <div
                            className={`${darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-200 text-gray-600"} text-xs px-3 py-1 rounded-full`}
                          >
                            {messageDate === new Date().toLocaleDateString() ? "Today" : messageDate}
                          </div>
                        </div>
                      )}

                      <div
                        className={`flex ${isSentByMe ? "justify-end" : "justify-start"} ${isFirstInGroup ? "mt-4" : "mt-1"
                          }`}
                      >
                        <div className={`max-w-[70%] ${isSentByMe ? "order-1" : "order-2"}`}>
                          <div
                            className={`px-4 py-2.5 rounded-lg shadow-sm ${isSentByMe
                                ? darkMode
                                  ? "bg-blue-600 text-white"
                                  : "bg-blue-500 text-white"
                                : darkMode
                                  ? "bg-gray-800 text-gray-200 border-gray-700"
                                  : "bg-white text-gray-800 border border-gray-200"
                              }`}
                          >
                            <p className="break-words text-sm">{message.content}</p>
                          </div>

                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-xs ${isSentByMe
                                ? darkMode
                                  ? "text-gray-400"
                                  : "text-gray-500"
                                : darkMode
                                  ? "text-gray-500"
                                  : "text-gray-400"
                              }`}
                          >
                            <span>{formatTime(message.createdAt)}</span>

                            {isSentByMe && (
                              <span className="ml-1">
                                {message.isOptimistic ? (
                                  <Clock className={`w-3 h-3 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                                ) : message.isRead ? (
                                  <CheckCheck className="w-3 h-3 text-blue-500" />
                                ) : (
                                  <Check className={`w-3 h-3 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Avatar for first message in group */}
                        {isFirstInGroup && !isSentByMe && (
                          <div
                            className={`w-8 h-8 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"} flex items-center justify-center mr-2 order-1 mt-1`}
                          >
                            {otherUser && otherUser.avatar ? (
                              <img
                                src={otherUser.avatar || "/placeholder.svg"}
                                alt={otherUser.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <User className={`w-4 h-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                            )}
                          </div>
                        )}

                        {/* Spacer for alignment when no avatar */}
                        {!isFirstInGroup && !isSentByMe && <div className="w-8 mr-2 order-1"></div>}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="flex-1 flex items-center justify-center h-[calc(100vh-200px)]">
                  <div
                    className={`text-center p-8 rounded-lg ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border shadow-sm max-w-md`}
                  >
                    <div
                      className={`w-16 h-16 ${darkMode ? "bg-gray-700" : "bg-blue-100"} rounded-full flex items-center justify-center mx-auto mb-4`}
                    >
                      <Send className={`w-8 h-8 ${darkMode ? "text-blue-400" : "text-blue-500"}`} />
                    </div>
                    <h3 className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-900"} mb-2`}>
                      No messages yet
                    </h3>
                    <p className={`${darkMode ? "text-gray-400" : "text-gray-500"} text-sm`}>
                      Start the conversation by sending a message below.
                    </p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Message input - No box around it */}
      <div className={`${darkMode ? "bg-gray-900" : "bg-white"} py-4 px-4`}>
        <form onSubmit={handleSendMessage} className="max-w-screen-lg mx-auto flex gap-3">
          <input
            ref={messageInputRef}
            type="text"
            className={`flex-1 ${darkMode
                ? "bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500 border-gray-700"
                : "bg-gray-100 text-gray-900 focus:ring-blue-500 border-transparent"
              } rounded-full px-5 py-3 focus:outline-none focus:ring-2 text-sm`}
            placeholder={connectionStatus === "connected" ? "Type a message..." : "Waiting for connection..."}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            disabled={connectionStatus !== "connected"}
          />
          <button
            type="submit"
            className={`${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"
              } text-white px-6 py-3 rounded-full flex items-center gap-1.5 transition-all ${!messageText.trim() || !userId || connectionStatus !== "connected" ? "opacity-50 cursor-not-allowed" : ""
              }`}
            disabled={!messageText.trim() || !userId || connectionStatus !== "connected"}
          >
            <Send className="w-4 h-4" />
            <span className="font-medium">Send</span>
          </button>
        </form>

        {connectionStatus !== "connected" && (
          <p
            className={`text-xs ${darkMode ? "text-amber-400" : "text-amber-600"} mt-2 max-w-screen-lg mx-auto flex items-center gap-1.5`}
          >
            <Loader2 className="w-3 h-3 animate-spin" />
            {connectionStatus === "connecting"
              ? "Connecting to chat server..."
              : "Not connected to chat server. Messages will be sent when reconnected."}
          </p>
        )}
      </div>
    </div>
  )
}

export default ChatRoom
