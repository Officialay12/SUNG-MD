const GroupController = require('../controllers/groupController');

class GroupUtils {
  static async handleJoinEvent(groupId, user) {
    const group = await GroupController.getGroup(groupId);
    if (!group.success) return false;

    // Add member to group
    const memberData = {
      userId: user.id,
      phoneNumber: user.phone,
      isAdmin: false
    };

    const result = await GroupController.addMember(groupId, memberData);
    if (!result.success) return false;

    // Send welcome message
    const welcomeMessage = this.formatWelcomeMessage(
      result.group.botSettings.welcomeMessage,
      user,
      result.group.name
    );

    return welcomeMessage;
  }

  static formatWelcomeMessage(template, user, groupName) {
    return template
      .replace('{name}', user.name || 'User')
      .replace('{group}', groupName)
      .replace('{phone}', user.phone || '');
  }

  static async checkAdminPermission(groupId, userId) {
    const group = await GroupController.getGroup(groupId);
    if (!group.success) return false;
    return group.group.isAdmin(userId);
  }

  static async logGroupActivity(groupId) {
    await Group.findOneAndUpdate(
      { groupId },
      { 
        $set: { lastActivity: new Date() },
        $inc: { messageCount: 1 }
      }
    );
  }

  static async getGroupCommands(groupId) {
    const group = await GroupController.getGroup(groupId);
    if (!group.success) return [];
    return group.group.customCommands;
  }

  static async banUser(groupId, userId) {
    return Group.findOneAndUpdate(
      { groupId },
      { $addToSet: { bannedUsers: userId } },
      { new: true }
    );
  }
}

module.exports = GroupUtils;