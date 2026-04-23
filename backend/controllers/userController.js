import User from '../models/User.js';

export const getOnlineProfessionals = async (req, res) => {
  try {
    const pros = await User.find({
      role: 'plumber',
      isOnline: true,
      kycStatus: 'approved'
    }).select('name rating location isOnline numRatings');
    res.json(pros);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleOnline = async (req, res) => {
  const { isOnline } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isOnline = isOnline;
    await user.save();
    res.json({ message: `You are now ${isOnline ? 'Online' : 'Offline'}`, isOnline: user.isOnline });
  } catch (error) {
    console.error('ToggleOnline Error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateLocation = async (req, res) => {
  const { coordinates } = req.body; // [lng, lat]
  try {
    const user = await User.findById(req.user._id);
    user.location = {
      type: 'Point',
      coordinates
    };
    await user.save();
    res.json({ message: 'Location updated', location: user.location });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  const { name, phone, avatar } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    
    await user.save();
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }
    
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('UpdatePassword Error:', error);
    res.status(500).json({ message: error.message });
  }
};
