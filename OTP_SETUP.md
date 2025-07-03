# OTP Setup Guide

This guide will help you set up the OTP functionality for the Recipe App.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/recipe-app

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Gmail Setup for Email OTP

To use Gmail for sending OTP emails:

1. **Enable 2-Factor Authentication**:
   - Go to your Google Account settings
   - Navigate to Security
   - Enable 2-Step Verification

2. **Generate App Password**:
   - Go to Security settings
   - Under "2-Step Verification", click on "App passwords"
   - Select "Mail" and "Other (Custom name)"
   - Enter "Recipe App" as the name
   - Copy the generated 16-character password

3. **Update Environment Variables**:
   - Set `EMAIL_USER` to your Gmail address
   - Set `EMAIL_PASS` to the generated app password

## Features Implemented

### 1. OTP Model (`src/models/Otp.ts`)
- Stores OTP data with expiry time
- Auto-deletes expired OTPs using TTL index
- Supports both registration and forgot password flows

### 2. Email Service (`src/lib/email.ts`)
- Uses Nodemailer for sending emails
- Beautiful HTML email templates
- Supports both registration and forgot password emails

### 3. API Endpoints
- `/api/otp/request` - Request OTP
- `/api/otp/verify` - Verify OTP and complete action

### 4. Frontend Pages
- Updated registration page with OTP flow
- New forgot password page with OTP flow
- Added "Forgot Password" link to login page

## OTP Flow

### Registration Flow:
1. User enters details (name, email, password)
2. System sends OTP to email
3. User enters OTP
4. Account is created and user is logged in

### Forgot Password Flow:
1. User enters email
2. System sends OTP to email
3. User enters OTP
4. User enters new password
5. Password is updated and user is redirected to login

## Security Features

- **1-minute cooldown**: Users must wait 1 minute between OTP requests
- **5-minute expiry**: OTPs expire after 5 minutes
- **Auto-deletion**: OTPs are deleted after successful verification
- **TTL index**: Expired OTPs are automatically removed from database

## Testing

1. Start the development server: `npm run dev`
2. Navigate to `/register` to test registration with OTP
3. Navigate to `/forgot-password` to test password reset with OTP
4. Check your email for OTP codes

## Troubleshooting

### Email not sending:
- Verify your Gmail credentials
- Ensure 2FA is enabled and app password is correct
- Check if your Gmail account allows "less secure app access"

### OTP not working:
- Check if MongoDB is running
- Verify environment variables are set correctly
- Check browser console for any errors

### Database issues:
- Ensure MongoDB is running on the specified URI
- Check if the database and collections are created properly 