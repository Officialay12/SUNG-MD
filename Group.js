const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  phoneNumber: { type: String },
  isAdmin: { type: Boolean, default: false },
  joinDate: { type: Date, default: Date.now },
  lastActive: { type: Date }
});

const customCommandSchema = new mongoose.Schema({
  command: { type: String, required: true },
  response: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const groupSchema = new mongoose.Schema({
  // Core group information
  groupId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  inviteCode: { type: String },
  photoUrl: { type: String },

  // Member management
  members: [memberSchema],
  admins: [{ type: String }], // Cache for quick lookup
  bannedUsers: [{ type: String }],

  // Group settings
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: String, required: true },
  lastActivity: { type: Date },

  // Bot configuration
  botSettings: {
    welcomeMessage: { type: String, default: 'Welcome {name} to {group}!' },
    goodbyeMessage: { type: String, default: 'Goodbye {name}!' },
    commandsEnabled: { type: Boolean, default: true },
    nsfwFilter: { type: Boolean, default: false },
    spamProtection: { type: Boolean, default: true },
    language: { type: String, default: 'en' }
  },

  // Custom features
  customCommands: [customCommandSchema],
  scheduledMessages: [{
    message: String,
    time: Date,
    repeat: String, // 'daily', 'weekly', 'once'
    createdBy: String
  }],

  // Analytics
  messageCount: { type: Number, default: 0 },
  dailyActivity: [{
    date: Date,
    count: Number
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
groupSchema.index({ groupId: 1 });
groupSchema.index({ 'members.userId': 1 });
groupSchema.index({ admins: 1 });
groupSchema.index({ lastActivity: -1 });

// Pre-save hook to keep admins array updated
groupSchema.pre('save', function(next) {
  this.admins = this.members
    .filter(member => member.isAdmin)
    .map(member => member.userId);
  next();
});

// Static methods
groupSchema.statics = {
  async findOrCreate(groupData) {
    let group = await this.findOne({ groupId: groupData.groupId });
    if (!group) {
      group = await this.create(groupData);
    }
    return group;
  },

  async addMember(groupId, userData) {
    return this.findOneAndUpdate(
      { groupId, 'members.userId': { $ne: userData.userId } },
      { $addToSet: { members: userData } },
      { new: true, upsert: true }
    );
  },

  async removeMember(groupId, userId) {
    return this.findOneAndUpdate(
      { groupId },
      { $pull: { members: { userId } } },
      { new: true }
    );
  },

  async promoteToAdmin(groupId, userId) {
    return this.findOneAndUpdate(
      { groupId, 'members.userId': userId },
      { $set: { 'members.$.isAdmin': true } },
      { new: true }
    );
  },

  async getActiveGroups(thresholdDays = 7) {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - thresholdDays);
    return this.find({ lastActivity: { $gte: thresholdDate } });
  }
};

// Instance methods
groupSchema.methods = {
  isMember(userId) {
    return this.members.some(member => member.userId === userId);
  },

  isAdmin(userId) {
    return this.admins.includes(userId);
  },

  isBanned(userId) {
    return this.bannedUsers.includes(userId);
  },

  getMemberCount() {
    return this.members.length;
  },

  async addCustomCommand(commandData) {
    this.customCommands.push(commandData);
    return this.save();
  },

  async removeCustomCommand(command) {
    this.customCommands = this.customCommands.filter(cmd => cmd.command !== command);
    return this.save();
  },

  async logActivity() {
    this.lastActivity = new Date();
    this.messageCount += 1;
    return this.save();
  }
};

// Virtuals
groupSchema.virtual('adminCount').get(function() {
  return this.admins.length;
});

module.exports = mongoose.model('Group', groupSchema);