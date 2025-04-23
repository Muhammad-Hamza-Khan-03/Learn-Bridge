// Refactored ChatSlice without thunks
import { createSlice } from "@reduxjs/toolkit"

export const SOCKET_URL = "http://localhost:5000"

const initialState = {
  isConnected: false,
  conversations: [],
  messages: {},
  sessionMessages: {},
  currentChat: null,
  unreadCount: 0,
  isLoading: false,
  error: null,
}

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setError: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    reset: (state) => {
      state.isLoading = false;
      state.error = null;
    },
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    setConnected: (state, action) => {
      state.isLoading = false;
      state.isConnected = action.payload;
      state.error = null;
    },
    setConversations: (state, action) => {
      state.conversations = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setMessages: (state, action) => {
      state.isLoading = false;
      state.messages = {
        ...state.messages,
        [action.payload.userId]: action.payload.messages,
      };
    },
    // Add this to your chat slice reducer for receiveMessage
receiveMessage: (state, action) => {
  const { message } = action.payload;
  
  if (!message) return;
  
  // Extract sender and receiver IDs, handling both object and string formats
  const receiverId = typeof message.receiver === 'object' ? message.receiver._id : message.receiver;
  const senderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
  
  // Determine the conversation ID - messages between the same two users should go in the same bucket
  // regardless of who sent them
  let conversationId;
  
  // Find which ID is not the current user's ID
  if (senderId !== state.currentChat && receiverId !== state.currentChat) {
    // If neither ID matches currentChat, put in the logical bucket (whichever ID comes first alphabetically)
    const ids = [senderId, receiverId].sort();
    conversationId = ids[0];
  } else {
    // Otherwise, use the ID that's not the current user
    conversationId = senderId === state.currentChat ? receiverId : senderId;
  }
  
  // Initialize the messages array for this conversation if it doesn't exist
  if (!state.messages[conversationId]) {
    state.messages[conversationId] = [];
  }
  
  // Check for duplicates
  const isDuplicate = state.messages[conversationId].some(msg => 
    (msg._id && message._id && msg._id === message._id) ||
    (msg.content === message.content && 
     Math.abs(new Date(msg.createdAt) - new Date(message.createdAt)) < 1000)
  );
  
  // Only add if not a duplicate
  if (!isDuplicate) {
    state.messages[conversationId].push(message);
  }
},
    updateTypingStatus: (state, action) => {
      const { user, isTyping } = action.payload;

      // Find conversation and update typing status
      const conversationIndex = state.conversations.findIndex(
        (conv) => conv.user._id === user._id || conv.user === user._id
      );

      if (conversationIndex !== -1) {
        // Create a new array with the updated conversation
        state.conversations = [
          ...state.conversations.slice(0, conversationIndex),
          {
            ...state.conversations[conversationIndex],
            isTyping,
          },
          ...state.conversations.slice(conversationIndex + 1),
        ];
      }
    },
    markMessageReadByReceiver: (state, action) => {
      const { userId } = action.payload;
      
      if (state.messages[userId]) {
        state.messages[userId] = state.messages[userId].map(msg => ({
          ...msg,
          isRead: true
        }));
      }
      
      // Also update conversations list
      state.conversations = state.conversations.map(conv => {
        if (conv.user._id === userId || conv.user === userId) {
          return {
            ...conv,
            unreadCount: 0,
            lastMessage: conv.lastMessage ? { ...conv.lastMessage, isRead: true } : null
          };
        }
        return conv;
      });
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
      state.isLoading = false;
    }
  }
});

export const {
  setLoading,
  setError,
  reset,
  setCurrentChat,
  setConnected,
  setConversations,
  setMessages,
  receiveMessage,
  updateTypingStatus,
  markMessageReadByReceiver,
  setUnreadCount
} = chatSlice.actions;

export default chatSlice.reducer;