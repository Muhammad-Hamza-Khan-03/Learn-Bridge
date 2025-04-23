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
    receiveMessage: (state, action) => {
      const { message } = action.payload;
      
      if (!message) return;
      
      // Extract sender and receiver IDs, handling both object and string formats
      const receiverId = typeof message.receiver === 'object' ? message.receiver._id : message.receiver;
      const senderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
      
      // Get current user ID from state (not from store)
      // If we're in a conversation, currentChat will be the other user's ID
      const currentUserId = state.currentChat;
      
      // If we can't determine the current user, try to infer from the message
      // This is a fallback mechanism only
      let conversationId;
      
      if (state.currentChat) {
        // We know which conversation we're in
        if (senderId === state.currentChat || receiverId === state.currentChat) {
          conversationId = state.currentChat;
        }
      } else {
        // Determine conversation ID based on message participants
        if (receiverId) {
          conversationId = receiverId;
        } else if (senderId) {
          conversationId = senderId;
        } else {
          // Can't determine where to store the message
          return;
        }
      }
      
      // Initialize the messages array for this conversation if it doesn't exist
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      
      // Check if this message is a duplicate to avoid adding it twice
      const isDuplicate = state.messages[conversationId].some(msg => 
        // Check by ID if available (for server messages)
        (msg._id && message._id && msg._id === message._id) ||
        // Or by content and timestamp (for optimistic updates)
        (msg.content === message.content && 
         Math.abs(new Date(msg.createdAt) - new Date(message.createdAt)) < 1000)
      );
      
      // Only add if not a duplicate
      if (!isDuplicate) {
        // If this is a server message replacing an optimistic one, remove the optimistic one
        if (message._id && !String(message._id).startsWith('temp-')) {
          state.messages[conversationId] = state.messages[conversationId].filter(msg => 
            !msg.isOptimistic || msg.content !== message.content
          );
        }
        
        // Add the new message
        state.messages[conversationId].push(message);
      }
    
      // Update unread count if receiving a new message not from current user
      if (state.currentChat !== senderId && senderId !== receiverId) {
        state.unreadCount += 1;
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