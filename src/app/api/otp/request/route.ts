import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Otp from '@/models/Otp';
import User from '@/models/User';
import { sendOTPEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { email, type, platform = 'email' } = await request.json();

    if (!email || !type) {
      return NextResponse.json(
        { error: 'Email and type are required' },
        { status: 400 }
      );
    }
    if(type === "forgotpassword"){
    // Find user
          const user = await User.findOne({ email: email});
          if (!user) {
            return NextResponse.json(
              { error: 'User not found' },
              { status: 404 }
            );
          }
      }
    if (!['registration', 'forgotpassword'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid OTP type' },
        { status: 400 }
      );
    }

    // Check if there's a recent OTP request (within 1 minute)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentOtp = await Otp.findOne({
      mail: email.toLowerCase(),
      type,
      createdAt: { $gte: oneMinuteAgo }
    });

    if (recentOtp) {
      return NextResponse.json(
        { error: 'Please wait 1 minute before requesting another OTP' },
        { status: 429 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry to 5 minutes from now
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    // Create OTP record
    const otpRecord = new Otp({
      mail: email.toLowerCase(),
      otp,
      type,
      platform,
      expiry,
    });

    await otpRecord.save();

    // Send OTP via email
    if (platform === 'email') {
      const emailResult = await sendOTPEmail(email, otp, type);
      if (!emailResult.success) {
        // Delete the OTP record if email sending fails
        await Otp.findByIdAndDelete(otpRecord._id);
        return NextResponse.json(
          { error: 'Failed to send OTP email' },
          { status: 500 }
        );
      }
    }

    // For SMS platform, you would integrate with SMS service here
    if (platform === 'sms') {
      // TODO: Integrate with SMS service
      console.log(`SMS OTP for ${email}: ${otp}`);
    }

    return NextResponse.json(
      { 
        message: 'OTP sent successfully',
        expiresIn: '5 minutes'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('OTP request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 