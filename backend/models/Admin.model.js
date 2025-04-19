import mongoose from 'mongoose';
import User from "../models/User.model.js"


const AdminSchema = new mongoose.Schema({
  permissions: {
    type: [String],
    enum: ['user_management', 'content_moderation', 'platform_analytics', 'full_access'],
    default: ['full_access']
  },
  adminLevel: {
    type: String,
    enum: ['junior', 'senior', 'super'],
    default: 'junior'
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

const Admin = User.discriminator('Admin', AdminSchema);
export default Admin