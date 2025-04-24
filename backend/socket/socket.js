import {Server as socketIo} from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import Message from '../models/Message.model.js';

// Initialize Socket.io
const initializeSocket = (server) => {
  console.log("Initializing Socket.io server...");
  
  const io = new socketIo(server, {
    cors: {
      origin: "http://localhost:5173", 
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"]
    },
    transports: ['websocket', 'polling'], // Ensure both transports are enabled
    pingTimeout: 60000, // Increase ping timeout
    pingInterval: 25000, // Adjust ping interval
  });

  // Store active sockets
  const activeSockets = new Map();
  
  // Make IO instance available globally
  global.activeSockets = activeSockets;

  // Socket.io middleware for authentication
  io.use(async (socket, next) => {
    try {
      // Get token from handshake auth
      const token = socket.handshake.auth.token;

      if (!token) {
        console.log("Socket authentication error: Token not provided");
        return next(new Error('Authentication error: Token not provided'));
      }

      try {
        // Verify token - make sure this matches your JWT secret in auth controller
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecretkey');

        // Find user
        const user = await User.findById(decoded.id);

        if (!user) {
          console.log("Socket authentication error: User not found");
          return next(new Error('Authentication error: User not found'));
        }

        // Attach user to socket
        socket.user = user;
        console.log(`Socket authenticated: ${user.name} (${user._id}), socket ID: ${socket.id}`);
        next();
      } catch (jwtError) {
        console.log("JWT verification error:", jwtError.message);
        return next(new Error(`Token verification failed: ${jwtError.message}`));
      }
    } catch (err) {
      console.log("Socket authentication error:", err.message);
      return next(new Error('Authentication error: ' + err.message));
    }
  });

  // Connection event
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user?.name} (${socket.user?._id}), socket ID: ${socket.id}`);

    // Store socket in active sockets map
    const userId = socket.user._id.toString();
    activeSockets.set(userId, socket);
    
    // Join personal room based on user ID
    socket.join(userId);
    console.log(`User ${socket.user.name} joined personal room: ${userId}`);

    // Let everyone know this user is online
    socket.broadcast.emit('userOnline', { userId });

    // Helper function to get conversation room ID
    const getConversationRoomId = (user1Id, user2Id) => {
      // Sort IDs to ensure the same room regardless of who initiates
      const ids = [user1Id.toString(), user2Id.toString()].sort();
      return `conversation:${ids[0]}_${ids[1]}`;
    };

    // Handle join conversation
socket.on('joinConversation', (userId) => {
    if (!userId) {
      console.log(`Invalid userId for joinConversation from ${socket.user.name}`);
      return;
    }
  
    const senderId = socket.user._id.toString();
    const receiverId = userId.toString();
    
    // Validate that sender and receiver are different
    if (senderId === receiverId) {
      console.error(`Error: Cannot join conversation with yourself. User ${senderId} attempted to chat with themselves.`);
      socket.emit('conversationError', { error: 'Cannot chat with yourself' });
      return;
    }
    
    console.log(`Join conversation request: sender=${senderId}, receiver=${receiverId}`);
  
    const conversationRoom = getConversationRoomId(senderId, receiverId);
    socket.join(conversationRoom);
    console.log(`${socket.user.name} joined conversation room: ${conversationRoom}`);
    
    // Emit an event to both users that they're connected
    io.to(conversationRoom).emit('conversationJoined', {
      room: conversationRoom,
      users: [senderId, receiverId]
    });
    
    // Also emit directly to both users
    io.to(senderId).emit('conversationJoined', {
      room: conversationRoom,
      users: [senderId, receiverId]
    });
    
    io.to(receiverId).emit('conversationJoined', {
      room: conversationRoom,
      users: [senderId, receiverId]
    });
    
    console.log(`Conversation join event emitted to room and users`);
});

    // Handle leave conversation
    socket.on('leaveConversation', (userId) => {
      if (!userId) {
        console.log(`Invalid userId for leaveConversation from ${socket.user.name}`);
        return;
      }

      const conversationRoom = getConversationRoomId(socket.user._id, userId);
      socket.leave(conversationRoom);
      console.log(`${socket.user.name} left conversation room: ${conversationRoom}`);
    });

    // Handle private message
socket.on('privateMessage', async (data) => {
    try {
      const { receiver, content, session } = data;
  
      if (!receiver || !content) {
        console.log("Invalid message data:", data);
        socket.emit('messageError', { error: 'Receiver and content are required' });
        return;
      }
  
      // Ensure we have proper string IDs
      const senderId = socket.user._id.toString();
      const receiverId = receiver.toString();
      
      // Verify these are different users
      if (senderId === receiverId) {
        console.error(`Error: Sender and receiver are the same: ${senderId}`);
        socket.emit('messageError', { error: 'Cannot send message to yourself' });
        return;
      }
  
      console.log(`Processing private message: sender=${senderId}, receiver=${receiverId}, content=${content.substring(0, 30)}...`);
  
      // Create message in database
      const message = await Message.create({
        sender: senderId,
        receiver: receiverId,
        content,
        session
      });
  
      // Populate sender and receiver info
      const populatedMessage = await Message.findById(message._id)
        .populate({
          path: 'sender',
          select: 'name role'
        })
        .populate({
          path: 'receiver',
          select: 'name role'
        });
  
      // Get conversation room ID
      const conversationRoom = getConversationRoomId(senderId, receiverId);
      
      console.log(`Emitting message to conversation room: ${conversationRoom}`);
  
      // Emit to the conversation room
      io.to(conversationRoom).emit('newMessage', populatedMessage);
      
      // Also emit directly to both users' personal rooms
      io.to(senderId).emit('newMessage', populatedMessage);
      io.to(receiverId).emit('newMessage', populatedMessage);
  
      // Emit confirmation to sender
      socket.emit('messageSent', populatedMessage);
      
      console.log(`Message successfully sent and delivered to room and personal channels`);
    } catch (err) {
      console.error('Error sending message:', err);
      socket.emit('messageError', { error: err.message });
    }
});

    // Handle read receipts
    socket.on('markAsRead', async (data) => {
      try {
        const { sender } = data;

        if (!sender) {
          console.log("Invalid markAsRead data:", data);
          return;
        }

        // Update messages in database
        await Message.updateMany(
          {
            sender,
            receiver: socket.user._id,
            isRead: false
          },
          {
            isRead: true
          }
        );

        // Notify sender that messages were read
        const conversationRoom = getConversationRoomId(socket.user._id.toString(), sender.toString());
        io.to(conversationRoom).emit('messagesRead', {
          by: socket.user._id,
          for: sender
        });

        // Also emit directly to the sender
        io.to(sender).emit('messagesRead', {
          by: socket.user._id,
          for: sender
        });

        console.log(`Messages from ${sender} marked as read by ${socket.user._id}`);
      } catch (err) {
        console.error('Error marking messages as read:', err);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user?.name} (${socket.user?._id})`);
      
      // Remove from active sockets
      if (socket.user && socket.user._id) {
        activeSockets.delete(socket.user._id.toString());
      }

      // Let everyone know this user is offline
      socket.broadcast.emit('userOffline', {
        userId: socket.user?._id.toString()
      });
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.user?._id}: ${error.message}`);
    });
  });

  return io;
};

export default initializeSocket;