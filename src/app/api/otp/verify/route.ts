import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Otp from '@/models/Otp';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { email, otp, type, password, name } = await request.json();

    if (!email || !otp || !type) {
      return NextResponse.json(
        { error: 'Email, OTP, and type are required' },
        { status: 400 }
      );
    }

    if (!['registration', 'forgotpassword'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid OTP type' },
        { status: 400 }
      );
    }

    // Find the OTP record
    const otpRecord = await Otp.findOne({
      mail: email.toLowerCase(),
      otp,
      type,
      expiry: { $gt: new Date() } // Check if not expired
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Delete the OTP after successful verification
    await Otp.findByIdAndDelete(otpRecord._id);

    // Handle different OTP types
    if (type === 'registration') {
      if (!name || !password) {
        return NextResponse.json(
          { error: 'Name and password are required for registration' },
          { status: 400 }
        );
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return NextResponse.json(
          { error: 'User already exists with this email' },
          { status: 400 }
        );
      }

      // Create new user
      const user = new User({
        name,
        email: email.toLowerCase(),
        password,
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        message: 'Registration successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        }
      });

    } else if (type === 'forgotpassword') {
      if (!password) {
        return NextResponse.json(
          { error: 'New password is required' },
          { status: 400 }
        );
      }

      // Find user
      const user = await User.findOne({ email: email});
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Update password
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        message: 'Password reset successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        }
      });
    }

  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 