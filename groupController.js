const Group = require('../models/Group');

class GroupController {
  // Create a new group
  static async createGroup(groupData) {
    try {
      const group = await Group.create(groupData);
      return { success: true, group };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get group by ID
  static async getGroup(groupId) {
    try {
      const group = await Group.findOne({ groupId });
      if (!group) return { success: false, error: 'Group not found' };
      return { success: true, group };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Add member to group
  static async addMember(groupId, userData) {
    try {
      const group = await Group.addMember(groupId, userData);
      return { success: true, group };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Remove member from group
  static async removeMember(groupId, userId) {
    try {
      const group = await Group.removeMember(groupId, userId);
      return { success: true, group };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Promote member to admin
  static async promoteToAdmin(groupId, userId) {
    try {
      const group = await Group.promoteToAdmin(groupId, userId);
      return { success: true, group };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Add custom command
  static async addCustomCommand(groupId, commandData) {
    try {
      const group = await Group.findOne({ groupId });
      if (!group) return { success: false, error: 'Group not found' };
      
      await group.addCustomCommand(commandData);
      return { success: true, group };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get all active groups
  static async getActiveGroups(thresholdDays = 7) {
    try {
      const groups = await Group.getActiveGroups(thresholdDays);
      return { success: true, groups };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Update group settings
  static async updateSettings(groupId, settings) {
    try {
      const group = await Group.findOneAndUpdate(
        { groupId },
        { $set: { botSettings: settings } },
        { new: true }
      );
      return { success: true, group };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = GroupController;