import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/middleware/admin';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendEmail } from '@/lib/email';
import path from 'path';
import fs from 'fs';

async function handler(request: NextRequest, { params }: { params: { id: string } }) {
  if (request.method !== 'PATCH') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { isBlocked, reason } = await request.json();
    
    if (typeof isBlocked !== 'boolean') {
      return NextResponse.json(
        { error: 'isBlocked must be a boolean value' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    const user = await User.findById(params.id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Don't allow blocking admin users
    if (user.role === 'admin') {
      return NextResponse.json(
        { error: 'Cannot block admin users' },
        { status: 403 }
      );
    }

    // Update user's blocked status
    user.isBlocked = isBlocked;
    await user.save();

    // Send email notification
    try {
      const templateName = isBlocked ? 'accountBlocked.hbs' : 'accountUnblocked.hbs';
      const templatePath = path.join(process.cwd(), 'src', 'utils', 'emailTemplates', templateName);
      
      if (fs.existsSync(templatePath)) {
        const template = fs.readFileSync(templatePath, 'utf8');
        
        const emailData = {
          to: user.email,
          subject: isBlocked ? 'Account Blocked - Recipe Hub' : 'Account Unblocked - Recipe Hub',
          template,
          context: {
            name: user.name,
            reason: reason || 'Violation of community guidelines'
          }
        };

        await sendEmail(emailData);
      }
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the request if email fails
    }
    
    return NextResponse.json({ 
      message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked
      }
    });
  } catch (error) {
    console.error('Error updating user block status:', error);
    return NextResponse.json(
      { error: 'Failed to update user block status' },
      { status: 500 }
    );
  }
}

export const PATCH = withAdmin(handler);

