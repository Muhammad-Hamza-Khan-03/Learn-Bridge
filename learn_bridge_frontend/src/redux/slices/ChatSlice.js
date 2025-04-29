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
      
      // Store under the conversation partner's ID (not the current user's)
      let conversationPartnerId;
      
      if (state.currentChat) {
        // We're in a conversation - the partner is whoever we're chatting with
        conversationPartnerId = state.currentChat;
      } else {
        // We're not in a conversation - the partner is whoever sent the message
        // (assuming it's not from the current user)
        conversationPartnerId = senderId;
      }
      
      // Initialize the messages array for this conversation if it doesn't exist
      if (!state.messages[conversationPartnerId]) {
        state.messages[conversationPartnerId] = [];
      }
      
      // Check for duplicates
      const isDuplicate = state.messages[conversationPartnerId].some(msg => 
        (msg._id && message._id && msg._id === message._id) ||
        (msg.content === message.content && 
          Math.abs(new Date(msg.createdAt) - new Date(message.createdAt)) < 1000)
      );
      
      // Only add if not a duplicate
      if (!isDuplicate) {
        state.messages[conversationPartnerId].push(message);
        
        // Sort messages by timestamp
        state.messages[conversationPartnerId].sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );
      }
      
      // Update unread count if appropriate
      if (receiverId !== state.currentChat) {
        state.unreadCount++;
        
        // Update conversation list if exists
        const conversationIndex = state.conversations.findIndex(
          conv => (conv.user._id === conversationPartnerId)
        );
        
        if (conversationIndex !== -1) {
          state.conversations[conversationIndex].unreadCount = 
            (state.conversations[conversationIndex].unreadCount || 0) + 1;
          state.conversations[conversationIndex].lastMessage = message;
        }
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