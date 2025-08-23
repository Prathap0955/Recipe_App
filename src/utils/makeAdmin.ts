import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function makeUserAdmin(email: string) {
  try {
    await dbConnect();
    
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: 'admin' },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      throw new Error('User not found');
    }
    
    console.log(`User ${user.name} (${user.email}) is now an admin`);
    return user;
  } catch (error) {
    console.error('Error making user admin:', error);
    throw error;
  }
}

// Example usage:
// makeUserAdmin('admin@example.com').then(console.log).catch(console.error);

