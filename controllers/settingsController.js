const Settings = require('../models/Settings');
const logger = require('../utils/logger');

// Get system settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.findAll();

    // Convert settings to key-value object
    const settingsObject = {};
    settings.forEach(setting => {
      settingsObject[setting.settingKey] = setting.settingValue;
    });

    res.render('admin/settings', {
      title: 'System Settings',
      settings: settingsObject,
      messages: req.flash()
    });
  } catch (error) {
    logger.error('Error fetching settings', { error: error.message });
    req.flash('error', 'Failed to load settings');
    res.redirect('/admin/dashboard');
  }
};

// Update system settings
exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body;

    // Update each setting
    for (const [key, value] of Object.entries(updates)) {
      if (key !== '_csrf') { // Skip CSRF token
        await Settings.upsert({
          settingKey: key,
          settingValue: value
        });
      }
    }

    logger.info('System settings updated', { userId: req.user.id });
    
    req.flash('success', 'Settings updated successfully');
    res.redirect('/admin/settings');
  } catch (error) {
    logger.error('Settings update error', { error: error.message });
    req.flash('error', 'Failed to update settings');
    res.redirect('/admin/settings');
  }
};