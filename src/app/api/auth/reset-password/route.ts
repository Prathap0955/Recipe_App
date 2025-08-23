import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Otp from '@/models/Otp';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { email, otp, newPassword } = await request.json();
    
    // Validate input
    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Please provide email, OTP, and new password' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify OTP
    const otpRecord = await Otp.findOne({
      email: email.toLowerCase(),
      otp,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
   console.log("new hased password",hashedPassword)
    // Update user's password
    user.password = hashedPassword;
    await user.save();

    // Delete the used OTP
    await Otp.findByIdAndDelete(otpRecord._id);
    
    return NextResponse.json({
      message: 'Password reset successfully'
    });
    
  } catch (error: any) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: error.message || 'Password reset failed' },
      { status: 500 }
    );
  }
}

