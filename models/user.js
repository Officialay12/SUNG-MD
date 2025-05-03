const mongoose = require('mongoose');
const otpGenerator = require('otp-generator');

const userSchema = new mongoose.Schema({
  number: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v) {
        return /^\+?[1-9]\d{1,14}$/.test(v); // Valid E.164 phone number format
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  name: { 
    type: String,
    trim: true
  },
  language: { 
    type: String, 
    enum: ['en', 'es', 'fr', 'de', 'ja'], 
    default: 'en' 
  },
  isAdmin: { 
    type: Boolean, 
    default: false 
  },
  isBanned: { 
    type: Boolean, 
    default: false 
  },
  otp: {
    type: String,
    default: null
  },
  otpExpires: {
    type: Date,
    default: null
  },
  lastActive: { 
    type: Date, 
    default: Date.now 
  },
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  }],
  viewOnceMessages: [{
    sender: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    mediaType: String,
    caption: String,
    metadata: {
      size: Number,
      dimensions: String
    }
  }],
  groupBackups: [{
    name: String,
    description: String,
    participants: [{
      number: String,
      isAdmin: Boolean,
      joinedAt: Date
    }],
    settings: {
      announceOnly: Boolean,
      locked: Boolean
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  activityStats: {
    messagesSent: {
      type: Number,
      default: 0
    },
    commandsUsed: {
      type: Number,
      default: 0
    },
    lastCommand: String
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.otp;
      delete ret.otpExpires;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Generate OTP method
userSchema.methods.generateOTP = function() {
  this.otp = otpGenerator.generate(6, {
    digits: true,
    alphabets: false,
    upperCase: false,
    specialChars: false
  });
  this.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
  return this.otp;
};

// Verify OTP method
userSchema.methods.verifyOTP = function(otp) {
  return this.otp === otp && this.otpExpires > Date.now();
};

// Static method to find or create user
userSchema.statics.findOrCreate = async function(number, defaults = {}) {
  let user = await this.findOne({ number });
  if (!user) {
    user = await this.create({ number, ...defaults });
  }
  return user;
};

// Update last active timestamp
userSchema.methods.updateLastActive = function() {
  this.lastActive = Date.now();
  return this.save();
};

// Record view once message
userSchema.methods.recordViewOnce = async function(messageData) {
  this.viewOnceMessages.push({
    sender: messageData.from,
    mediaType: messageData.type,
    caption: messageData.caption || '',
    metadata: {
      size: messageData.size,
      dimensions: messageData.dimensions
    }
  });
  return this.save();
};

// Create group backup
userSchema.methods.backupGroup = async function(groupData) {
  this.groupBackups.push({
    name: groupData.name,
    description: groupData.description,
    participants: groupData.participants.map(p => ({
      number: p.id.user,
      isAdmin: p.isAdmin,
      joinedAt: p.joinedAt
    })),
    settings: {
      announceOnly: groupData.announceOnly,
      locked: groupData.locked
    }
  });
  return this.save();
};

// Virtual for formatted number
userSchema.virtual('formattedNumber').get(function() {
  return this.number.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})$/, '+$1 $2-$3-$4');
});

// Pre-save hooks
userSchema.pre('save', function(next) {
  // Validate admin status
  if (this.isAdmin && this.number !== process.env.ADMIN_NUMBER) {
    throw new Error('Only the configured admin number can have admin privileges');
  }
  
  // Trim name if exists
  if (this.name) {
    this.name = this.name.trim();
  }
  
  next();
});

// Query helpers
userSchema.query.active = function() {
  return this.where({ isBanned: false });
};

userSchema.query.admins = function() {
  return this.where({ isAdmin: true });
};

// Indexes
userSchema.index({ number: 1 }, { unique: true });
userSchema.index({ lastActive: -1 });
userSchema.index({ isAdmin: 1, isBanned: 1 });
userSchema.index({ 'viewOnceMessages.timestamp': -1 });
userSchema.index({ 'groupBackups.createdAt': -1 });

const User = mongoose.model('User', userSchema);

module.exports = User;