import User from "../models/User.model.js"
import Student from "../models/Student.model.js"
import Admin from "../models/Admin.model.js"
import Tutor from "../models/Tutor.model.js"
import crypto from "crypto"

const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() +  100* 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  // Use secure cookies in production
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};


// /api/auth/signup 

export const signup = async(req,res)=>{
    try {
        const { name, email, password, role, country, bio } = req.body;
    
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
          return res.status(400).json({
            success: false,
            error: 'Email already registered'
          });
        }
    
        let user;
    
        // Create user based on role
        if (role === 'student') {
          const { learningGoals, preferredSubjects, availability } = req.body;
          user = await Student.create({
            name,
            email,
            password,
            role,
            country,
            bio,
            learningGoals,
            preferredSubjects,
            availability
          });
        } else if (role === 'tutor') {
          const { expertise, availability, hourlyRate, education, experience } = req.body;
          user = await Tutor.create({
            name,
            email,
            password,
            role,
            country,
            bio,
            expertise,
            availability,
            hourlyRate,
            education,
            experience
          });
        } else if (role === 'admin') {
          const { permissions, adminLevel } = req.body;
          user = await Admin.create({
            name,
            email,
            password,
            role,
            country,
            bio,
            permissions,
            adminLevel
          });
        } else {
          return res.status(400).json({
            success: false,
            error: 'Invalid role specified'
          });
        }
    
        // Create token
        sendTokenResponse(user, 201, res);


      } catch (err) {
        console.error(err);
        res.status(400).json({
          success: false,
          error: err.message
        });
      }
}

// /api/auth/signin

export const signin = async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log(`Login attempt for email: ${email}`);
  
      // Validate email & password
      if (!email || !password) {
        console.log('Missing email or password');
        return res.status(400).json({
          success: false,
          error: 'Please provide an email and password'
        });
      }
  
      // Check for user
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        console.log('User not found with email:', email);
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
  
      console.log(`Found user: ${user.name}, role: ${user.role}`);
  
      // Check if password matches
      const isMatch = await user.matchPassword(password);
      console.log('Password match result:', isMatch);
      
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
  
      // Update last login for admin users
      if (user.role === 'admin') {
        await Admin.findByIdAndUpdate(user._id, { lastLogin: Date.now() });
      }
  
      // Create token
      const token = user.getSignedJwtToken();
      console.log('Token generated successfully');
  
      // Send response
      const options = {
        expires: new Date(
          Date.now() + 100 * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
      };
  
      if (process.env.NODE_ENV === 'production') {
        options.secure = true;
      }
      res
        .status(200)
        .cookie('token', token, options)
        .json({
          success: true,
          token,
          user:user
        });
    } catch (err) {
      console.error('Login error:', err);
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  };

// /api/auth/me

export const getcurrentUser = async(req,res)=>{
    try {
        let user;
        
        // Get user with role-specific data
        if (req.user.role === 'student') {
          user = await Student.findById(req.user.id);
        } else if (req.user.role === 'tutor') {
          user = await Tutor.findById(req.user.id);
        } else if (req.user.role === 'admin') {
          user = await Admin.findById(req.user.id);
        } else {
          user = await User.findById(req.user.id);
        }
    
        res.status(200).json({
          success: true,
          data: user
        });
      } catch (err) {
        res.status(400).json({
          success: false,
          error: err.message
        });
      }
}

// /api/auth/logout
export const logout = async (req, res) => {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });
  
    res.status(200).json({
      success: true,
      data: {}
    });
  };

  //todo: /api/auth/updatepassword
  export const updatePassword = async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('+password');
  
      // Check current password
      if (!(await user.matchPassword(req.body.currentPassword))) {
        return res.status(401).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }
  
      user.password = req.body.newPassword;
      await user.save();
  
      sendTokenResponse(user, 200, res);
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  };
  
  // /api/auth/updatedetails

  export const updateDetails = async (req, res) => {
    try {
      const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email,
        bio: req.body.bio,
        country: req.body.country
      };
  
      // Remove undefined fields
      Object.keys(fieldsToUpdate).forEach(key => 
        fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
      );
  
      const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
      });
  
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  };