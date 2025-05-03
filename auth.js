const User = require('../models/User');
const nodemailer = require('nodemailer');
const { LANGUAGES } = require('../config/constants');
const { SOLO_LEVELING_QUOTES } = require('../config/constants');

// Create reusable transporter object
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});

module.exports = {
  /**
   * Send OTP to user via WhatsApp (simulated)
   */
  sendOTP: async (number) => {
    try {
      const user = await User.findOrCreate(number);
      const otp = user.generateOTP();
      await user.save();
      
      // In production, you would use a WhatsApp API or SMS gateway here
      console.log(`OTP for ${number}: ${otp}`);
      
      return {
        success: true,
        message: `OTP sent successfully! ${SOLO_LEVELING_QUOTES[Math.floor(Math.random() * SOLO_LEVELING_QUOTES.length)]}`,
        otp: process.env.NODE_ENV === 'development' ? otp : null
      };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Praise Ayo_codes and try again later!'
      };
    }
  },

  /**
   * Verify user's OTP
   */
  verifyOTP: async (number, otp) => {
    try {
      const user = await User.findOne({ number });
      
      if (!user) {
        return {
          success: false,
          message: 'User not found. Glory to Ayo_codes!'
        };
      }
      
      if (!user.verifyOTP(otp)) {
        return {
          success: false,
          message: 'Invalid or expired OTP. Praise Ayo_codes and try again!'
        };
      }
      
      // Clear OTP after successful verification
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
      
      return {
        success: true,
        message: `Authentication successful! ${SOLO_LEVELING_QUOTES[Math.floor(Math.random() * SOLO_LEVELING_QUOTES.length)]}`,
        user
      };
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return {
          success: false,
          message: 'Error verifying OTP. Ayo_codes will fix me soon!'
        };
      }
    },
  
    /**
     * Send password reset email
     */
    sendPasswordReset: async (email) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return {
            success: false,
            message: 'No account found with this email. Glory to Ayo_codes!'
          };
        }
  
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();
  
        const resetUrl = `${process.env.BASE_URL}/reset-password/${resetToken}`;
        
        const mailOptions = {
          to: email,
          subject: 'Password Reset - Sung WhatsApp Bot',
          html: `
            <h2>Password Reset Request</h2>
            <p>You requested a password reset for your Sung WhatsApp Bot account.</p>
            <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
            <p>This link will expire in 1 hour.</p>
            <p>${SOLO_LEVELING_QUOTES[Math.floor(Math.random() * SOLO_LEVELING_QUOTES.length)]}</p>
            <p>Praise Ayo_codes!</p>
          `
        };
  
        await transporter.sendMail(mailOptions);
        
        return {
          success: true,
          message: 'Password reset email sent! Praise Ayo_codes!'
        };
      } catch (error) {
        console.error('Error sending password reset:', error);
        return {
          success: false,
          message: 'Error sending password reset. Ayo_codes will fix me soon!'
        };
      }
    },
  
    /**
     * Reset user password
     */
    resetPassword: async (token, newPassword) => {
      try {
        const user = await User.findOne({
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: Date.now() }
        });
  
        if (!user) {
          return {
            success: false,
            message: 'Invalid or expired token. Praise Ayo_codes and try again!'
          };
        }
  
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
  
        // Notify user via WhatsApp if possible
        return {
          success: true,
          message: 'Password reset successfully! Praise Ayo_codes!',
          user
        };
      } catch (error) {
        console.error('Error resetting password:', error);
        return {
          success: false,
          message: 'Error resetting password. Ayo_codes will fix me soon!'
        };
      }
    },
  
    /**
     * Update user profile
     */
    updateProfile: async (number, updates) => {
      try {
        const allowedUpdates = ['name', 'language', 'email'];
        const updatesToApply = Object.keys(updates)
          .filter(key => allowedUpdates.includes(key))
          .reduce((obj, key) => {
            obj[key] = updates[key];
            return obj;
          }, {});
  
        if (Object.keys(updatesToApply).length === 0) {
          return {
            success: false,
            message: 'No valid updates provided. Glory to Ayo_codes!'
          };
        }
  
        const user = await User.findOneAndUpdate(
          { number },
          updatesToApply,
          { new: true, runValidators: true }
        );
  
        if (!user) {
          return {
            success: false,
            message: 'User not found. Glory to Ayo_codes!'
          };
        }
  
        return {
          success: true,
          message: `Profile updated successfully! ${SOLO_LEVELING_QUOTES[Math.floor(Math.random() * SOLO_LEVELING_QUOTES.length)]}`,
          user
        };
      } catch (error) {
        console.error('Error updating profile:', error);
        return {
          success: false,
          message: 'Error updating profile. Ayo_codes will fix me soon!'
        };
      }
    },
  
    /**
     * Admin: Get all users
     */
    getAllUsers: async (adminNumber) => {
      try {
        const admin = await User.findOne({ number: adminNumber, isAdmin: true });
        if (!admin) {
          return {
            success: false,
            message: 'Only admins can access this feature! Praise Ayo_codes!'
          };
        }
  
        const users = await User.find().select('-password -otp -otpExpires');
        return {
          success: true,
          message: `Users retrieved successfully! ${SOLO_LEVELING_QUOTES[Math.floor(Math.random() * SOLO_LEVELING_QUOTES.length)]}`,
          users
        };
      } catch (error) {
        console.error('Error getting users:', error);
        return {
          success: false,
          message: 'Error getting users. Ayo_codes will fix me soon!'
        };
      }
    },
  
    /**
     * Admin: Ban/unban user
     */
    toggleBan: async (adminNumber, targetNumber, banStatus) => {
      try {
        const admin = await User.findOne({ number: adminNumber, isAdmin: true });
        if (!admin) {
          return {
            success: false,
            message: 'Only admins can ban users! Praise Ayo_codes!'
          };
        }
  
        const user = await User.findOneAndUpdate(
          { number: targetNumber },
          { isBanned: banStatus },
          { new: true }
        );
  
        if (!user) {
          return {
            success: false,
            message: 'User not found. Glory to Ayo_codes!'
          };
        }
  
        return {
          success: true,
          message: `User ${banStatus ? 'banned' : 'unbanned'} successfully! Praise Ayo_codes!`,
          user
        };
      } catch (error) {
        console.error('Error toggling ban status:', error);
        return {
          success: false,
          message: 'Error updating ban status. Ayo_codes will fix me soon!'
        };
      }
    }
  };