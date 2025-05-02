// routes/auth.js
const express = require('express');
const router = express.Router();
const StaffProfile = require('../models/StaffProfileSchema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Verify LASU staff profile
router.post('/verify-lasu-profile', async (req, res) => {
  try {
    const {profileNumber}  = req.body;

    // Check if profile exists in LASU records
    const staffProfile = await StaffProfile.findOne({ profileNumber });
    if (!staffProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found. You are not a LASU staff member.'
      });
    }

    // Check if already registered
    // const existingUser = await User.findOne({ profileNumber });
    // if (existingUser) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'This profile is already registered'
    //   });
    // }

    // Create verification token (valid for 15 minutes)
    const token = jwt.sign(
      { 
        profileNumber,
        firstName: staffProfile.firstName,
        lastName: staffProfile.lastName
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.status(200).json({
      success: true,
      message: 'LASU staff verified',
      profile: {
        fullName: `${staffProfile.firstName} ${staffProfile.lastName}`,
        staffType: staffProfile.staffType
      },
      token
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during verification'
    });
  }
});
// For bulk insertion of staff profiles for testing purposes
// This route is not intended for production use and should be secured properly
router.post('/bulk-insert', async (req, res) => {
  try {
    const staffProfiles = req.body;

    // Validate input is an array and not empty
    if (!Array.isArray(staffProfiles) || staffProfiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input: Expected a non-empty array of staff profiles'
      });
    }

    // Sanitize and validate each profile
    const sanitizedProfiles = [];
    for (let profile of staffProfiles) {
      const {
        profileNumber,
        firstName,
        lastName,
        staffType,
        department = '',
        faculty = ''
      } = profile;

      // Required fields validation
      if (!profileNumber || !firstName || !lastName || !staffType) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields in one or more profiles',
          missingFieldsIn: profile
        });
      }

      // Type & format enforcement
      const cleanProfileNumber = profileNumber.toString().trim();
      const cleanFirstName = firstName.toString().trim();
      const cleanLastName = lastName.toString().trim();

      // StaffType must be either academic or non-academic
      const lowerStaffType = staffType.toLowerCase();
      if (!['academic', 'non-academic'].includes(lowerStaffType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid staffType value: ${staffType}`,
        });
      }

      // Push sanitized object
      sanitizedProfiles.push({
        profileNumber: cleanProfileNumber,
        firstName: cleanFirstName,
        lastName: cleanLastName,
        staffType: lowerStaffType,
        department: department ? department.toString().trim() : undefined,
        faculty: faculty ? faculty.toString().trim() : undefined
      });
    }

    // Insert into DB
    const result = await StaffProfile.insertMany(sanitizedProfiles, { ordered: false });

    console.log(`✅ Successfully inserted ${result.length} staff profiles`);

    res.status(201).json({
      success: true,
      message: `Successfully inserted ${result.length} staff profiles`,
      insertedCount: result.length
    });

  } catch (error) {
    console.error('❌ Error inserting staff profiles:', error.message);

    // Handle duplicate key error (code 11000)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate profileNumber found. All inserts were rolled back.',
        error: error.message
      });
    }

    // General server error
    res.status(500).json({
      success: false,
      message: 'Server error during bulk insertion',
      error: error.message
    });
  }
});
// Complete registration
router.post('/register-lasu-staff', async (req, res) => {
  try {
    const { email, password, token } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { profileNumber, firstName, lastName } = decoded;

    // Check if email exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user account
    const newUser = new User({
      email,
      password: hashedPassword,
      profileNumber,
      firstName,
      lastName,
      isVerified: true
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        email: newUser.email,
        fullName: `${newUser.firstName} ${newUser.lastName}`
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

module.exports = router;