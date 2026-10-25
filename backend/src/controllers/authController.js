import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { FreelancerProfile } from '../models/FreelancerProfile.js';
import { ENV } from '../config/env.js';

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN,
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'client',
      phone: phone || '',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=4f46e5`,
      walletBalance: role === 'client' ? 500 : 0, // Welcome demo balance for clients to simulate hiring
    });

    // If registered as freelancer, create starter profile
    let profile = null;
    if (user.role === 'freelancer') {
      profile = await FreelancerProfile.create({
        user: user._id,
        headline: 'Professional Freelance Specialist',
        bio: 'Welcome to my profile. I provide high-quality freelance solutions.',
        skills: ['Web Development', 'Problem Solving'],
        hourlyRate: 35,
        availability: 'available',
        experienceLevel: 'intermediate',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account successfully registered.',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          walletBalance: user.walletBalance,
        },
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password combination.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password combination.',
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by an administrator.',
      });
    }

    const token = generateToken(user._id, user.role);

    let profile = null;
    if (user.role === 'freelancer') {
      profile = await FreelancerProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          bio: user.bio,
          walletBalance: user.walletBalance,
          status: user.status,
        },
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;
    if (user.role === 'freelancer') {
      profile = await FreelancerProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      bio,
      avatar,
      headline,
      skills,
      hourlyRate,
      availability,
      languages,
      experienceLevel,
      socialLinks,
      portfolio,
    } = req.body;

    const userUpdates = {};
    if (name) userUpdates.name = name;
    if (phone !== undefined) userUpdates.phone = phone;
    if (bio !== undefined) userUpdates.bio = bio;
    if (avatar) userUpdates.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(req.user._id, userUpdates, {
      new: true,
      runValidators: true,
    });

    let updatedProfile = null;
    if (req.user.role === 'freelancer') {
      const profileUpdates = {};
      if (headline !== undefined) profileUpdates.headline = headline;
      if (skills) profileUpdates.skills = skills;
      if (hourlyRate !== undefined) profileUpdates.hourlyRate = hourlyRate;
      if (availability) profileUpdates.availability = availability;
      if (languages) profileUpdates.languages = languages;
      if (experienceLevel) profileUpdates.experienceLevel = experienceLevel;
      if (socialLinks) profileUpdates.socialLinks = socialLinks;
      if (portfolio) profileUpdates.portfolio = portfolio;

      updatedProfile = await FreelancerProfile.findOneAndUpdate(
        { user: req.user._id },
        { $set: profileUpdates },
        { new: true, upsert: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: updatedUser,
        profile: updatedProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res) => {
  // Demonstration simulated password reset workflow
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If the email exists in our records, password reset instructions have been generated.',
    });
  }

  const dummyToken = `RESET-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  user.resetPasswordToken = dummyToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Password reset code generated.',
    demoToken: dummyToken, // returned for simple testing and demonstration
  });
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired.',
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};
