import mongoose from 'mongoose';
import User from "../models/User.model.js"


const AdminSchema = new mongoose.Schema({
  permissions: {
    type: [String],
    enum: ['full_access'],
    default: ['full_access']
  },
  adminLevel: {
    type: String,
    enum: ['super'],
    default: 'super'
  }
});

const Admin = User.discriminator('Admin', AdminSchema);
export default Admin