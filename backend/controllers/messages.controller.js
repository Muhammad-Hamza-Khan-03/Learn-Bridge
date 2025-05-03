import Message from '../models/Message.model.js';
import User from '../models/User.model.js';
import Student from '../models/Student.model.js';
import Tutor from '../models/Tutor.model.js';
import Session from '../models/Session.model.js';

// @desc    Get messages between users
// @route   GET /api/messages/:userId
export const getMessagesBetweenUsers = async (req, res) => {
  try {
    // Validate userId parameter
    if (!req.params.userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    // Log request details
    console.log(`Getting messages between ${req.user.id} and ${req.params.userId}`);
    
    // Ensure the other user exists before trying to fetch messages
    const otherUser = await User.findById(req.params.userId).select('name role');
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Get messages between users
    let messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    })
      .sort({ createdAt: 1 })
      .populate({
        path: 'sender',
        select: 'name role'
      })
      .populate({
        path: 'receiver',
        select: 'name role'
      })
      .lean(); 

    console.log(`Found ${messages.length} messages between users ${req.user.id} and ${req.params.userId}`);

   
    for (const message of messages) {
      // If sender population failed
      if (!message.sender || typeof message.sender === 'string' || !message.sender.name) {
        const senderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
        console.log(`Sender population failed for message ${message._id}, sender: ${senderId}`);
        
        try {
          const senderUser = await User.findById(senderId).select('name role').lean();
          if (senderUser) {
            message.sender = senderUser;
          }
        } catch (err) {
          console.error(`Error fetching sender info for message ${message._id}:`, err);
        }
      }
      
      // If receiver population failed
      if (!message.receiver || typeof message.receiver === 'string' || !message.receiver.name) {
        const receiverId = typeof message.receiver === 'object' ? message.receiver._id : message.receiver;
        console.log(`Receiver population failed for message ${message._id}, receiver: ${receiverId}`);
        
        try {
          const receiverUser = await User.findById(receiverId).select('name role').lean();
          if (receiverUser) {
            message.receiver = receiverUser;
          }
        } catch (err) {
          console.error(`Error fetching receiver info for message ${message._id}:`, err);
        }
      }
    }

    if (messages.length === 0) {
      // Create a welcome message object
      const welcomeMessage = {
        _id: "welcome-message-" + Date.now(),
        content: "Welcome to the chat! This is the beginning of your conversation.",
        createdAt: new Date(),
        sender: {
          _id: req.user.id,
          name: req.user.name,
          role: req.user.role
        },
        receiver: {
          _id: req.params.userId,
          name: otherUser.name,
          role: otherUser.role
        },
        isRead: true
      };
      
      messages = [welcomeMessage];
      
      console.log("Created welcome message:", welcomeMessage);
    }

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (err) {
    console.error("Error in getMessagesBetweenUsers:", err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get session messages
// @route   GET /api/messages/session/:sessionId

export const getSessionMessages = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Check if user is part of the session
    if (
      session.student.toString() !== req.user.id &&
      session.tutor.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access these messages'
      });
    }

    const messages = await Message.find({
      session: req.params.sessionId
    })
      .sort({ createdAt: 1 })
      .populate({
        path: 'sender',
        select: 'name role'
      })
      .populate({
        path: 'receiver',
        select: 'name role'
      })
      .lean();

    // Check if population worked correctly 
    for (const message of messages) {
      // If sender population failed
      if (!message.sender || typeof message.sender === 'string' || !message.sender.name) {
        const senderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
        console.log(`Sender population failed for session message ${message._id}, sender: ${senderId}`);
        
        try {
          const senderUser = await User.findById(senderId).select('name role').lean();
          if (senderUser) {
            message.sender = senderUser;
          }
        } catch (err) {
          console.error(`Error fetching sender info for session message ${message._id}:`, err);
        }
      }
      
      // If receiver population failed
      if (!message.receiver || typeof message.receiver === 'string' || !message.receiver.name) {
        const receiverId = typeof message.receiver === 'object' ? message.receiver._id : message.receiver;
        console.log(`Receiver population failed for session message ${message._id}, receiver: ${receiverId}`);
        
        try {
          const receiverUser = await User.findById(receiverId).select('name role').lean();
          if (receiverUser) {
            message.receiver = receiverUser;
          }
        } catch (err) {
          console.error(`Error fetching receiver info for session message ${message._id}:`, err);
        }
      }
    }

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (err) {
    console.error("Error in getSessionMessages:", err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Send message
// @route   POST /api/messages
export const sendMessage = async (req, res) => {
    try {
      const { receiver, content, session } = req.body;
  
      // Validate required fields
      if (!receiver) {
        return res.status(400).json({
          success: false,
          error: 'Receiver ID is required'
        });
      }
  
      if (!content) {
        return res.status(400).json({
          success: false,
          error: 'Message content is required'
        });
      }
      
      // Get sender ID from authenticated user
      const senderId = req.user.id;
      
      // Make sure sender and receiver are different
      if (senderId === receiver) {
        return res.status(400).json({
          success: false,
          error: 'Cannot send message to yourself'
        });
      }
  
      // Check if receiver exists
      const receiverUser = await User.findById(receiver);
      if (!receiverUser) {
        return res.status(404).json({
          success: false,
          error: 'Receiver not found'
        });
      }
  
      // Create message with correct sender and receiver
      const message = await Message.create({
        sender: senderId,
        receiver: receiver,
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
  
      console.log(`Message created: sender=${senderId}, receiver=${receiver}, content=${content.substring(0, 30)}`);
  
      res.status(201).json({
        success: true,
        data: populatedMessage
      });
    } catch (err) {
      console.error("Error sending message:", err);
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  };

// @desc    Delete all messages for a session
// @route   DELETE /api/messages/session/:sessionId
export const deleteSessionMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Validate sessionId
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }
    
    // Find session to verify authorization
    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    // Check if user is authorized (tutor of the session or admin)
    if (session.tutor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete these messages'
      });
    }
    
    // Delete all messages for this session
    const result = await Message.deleteMany({ session: sessionId });
    
    console.log(`Deleted ${result.deletedCount} messages for session ${sessionId}`);
    
    return res.status(200).json({
      success: true,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (err) {
    console.error("Error deleting session messages:", err);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/read/:userId
export const markMessagesAsRead = async (req, res) => {
  try {
    // Validate userId parameter
    if (!req.params.userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    const result = await Message.updateMany(
      {
        sender: req.params.userId,
        receiver: req.user.id,
        isRead: false
      },
      {
        isRead: true
      }
    );

    console.log(`Marked ${result.nModified || result.modifiedCount || 0} messages as read from ${req.params.userId} to ${req.user.id}`);

    // Notify the sender through socket if available
    if (global.io && global.sockets) {
      // Get the sorted IDs to find conversation room
      const ids = [req.user.id.toString(), req.params.userId.toString()].sort();
      const conversationRoom = `conversation:${ids[0]}_${ids[1]}`;
      
      // Send to the room and directly to the sender
      if (global.io.to) {
        global.io.to(conversationRoom).emit('messagesRead', {
          by: req.user.id,
          for: req.params.userId
        });
        
        // Also send directly to the sender
        global.io.to(req.params.userId.toString()).emit('messagesRead', {
          by: req.user.id,
          for: req.params.userId
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        updated: result.nModified || result.modifiedCount || 0
      }
    });
  } catch (err) {
    console.error("Error in markMessagesAsRead:", err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread
export const getUnreadMessageCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user.id,
      isRead: false
    });

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (err) {
    console.error("Error in getUnreadMessageCount:", err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get user conversations
// @route   GET /api/messages/conversations
export const getUserConversations = async (req, res) => {
  try {
    // Find all users the current user has exchanged messages with
    const messages = await Message.find({
      $or: [
        { sender: req.user.id },
        { receiver: req.user.id }
      ]
    }).select('sender receiver createdAt');

    // Extract unique user IDs
    const userIds = new Set();
    messages.forEach(message => {
      if (message.sender.toString() !== req.user.id) {
        userIds.add(message.sender.toString());
      }
      if (message.receiver.toString() !== req.user.id) {
        userIds.add(message.receiver.toString());
      }
    });

    // Get user details for each conversation partner
    const conversations = await Promise.all(
      Array.from(userIds).map(async userId => {
        const user = await User.findById(userId).select('name role');
        
        // Get last message
        const lastMessage = await Message.findOne({
          $or: [
            { sender: req.user.id, receiver: userId },
            { sender: userId, receiver: req.user.id }
          ]
        })
          .sort({ createdAt: -1 })
          .select('content createdAt isRead sender')
          .lean();

        // Get unread count
        const unreadCount = await Message.countDocuments({
          sender: userId,
          receiver: req.user.id,
          isRead: false
        });

        return {
          user,
          lastMessage,
          unreadCount
        };
      })
    );

    // Sort conversations by last message date
    conversations.sort((a, b) => 
      new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0)
    );

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (err) {
    console.error("Error in getUserConversations:", err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Clear all messages between two users
// @route   DELETE /api/messages/:userId/clear
export const clearConversation = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;
    
    // Validate userId
    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    // Delete all messages between these users
    const result = await Message.deleteMany({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    });
    
    console.log(`Deleted ${result.deletedCount} messages between users ${currentUserId} and ${otherUserId}`);
    
    return res.status(200).json({
      success: true,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (err) {
    console.error("Error clearing conversation:", err);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};