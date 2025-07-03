import mongoose from 'mongoose';

export interface IOtp extends mongoose.Document {
  userId?: string;
  phoneNumber?: string;
  otp: string;
  type: 'registration' | 'forgotpassword';
  mail: string;
  platform: 'sms' | 'email';
  expiry: Date;
  createdAt: Date;
}

const otpSchema = new mongoose.Schema<IOtp>({
  userId: {
    type: String,
    required: false,
  },
  phoneNumber: {
    type: String,
    required: false,
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
    length: [6, 'OTP must be 6 digits'],
  },
  type: {
    type: String,
    required: [true, 'OTP type is required'],
    enum: ['registration', 'forgotpassword'],
  },
  mail: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  platform: {
    type: String,
    required: [true, 'Platform is required'],
    enum: ['sms', 'email'],
  },
  expiry: {
    type: Date,
    required: [true, 'Expiry date is required'],
  },
}, {
  timestamps: true,
});

// Index for faster queries
otpSchema.index({ mail: 1, type: 1, createdAt: -1 });
otpSchema.index({ expiry: 1 }, { expireAfterSeconds: 0 }); // TTL index to auto-delete expired OTPs

export default mongoose.models.Otp || mongoose.model<IOtp>('Otp', otpSchema); 