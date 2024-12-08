const User = require('../../models/userModel');

const setUserInformation = async (req, res) => {
  try {
    const { userId } = req.user;
    const { name, gender } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found', 
        code: 'USER_NOT_FOUND' 
      });
    }

    if (name) user.name = name;
    if (gender) user.gender = gender;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User information updated successfully',
      code: 'USER_UPDATED'
    });
  } catch (error) {
    console.error('Set user information error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user information',
      error: error.message,
      code: 'UPDATE_USER_ERROR'
    });
  }
};

module.exports = { setUserInformation };

