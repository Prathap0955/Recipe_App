# Environment Setup

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
MONGODB_URI=mongodb://localhost:27017/recipe-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## MongoDB Setup

### Option 1: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Use the default connection string: `mongodb://localhost:27017/recipe-app`

### Option 2: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Replace the MONGODB_URI with your Atlas connection string

## JWT Secret
- Generate a strong random string for JWT_SECRET
- In production, use a more secure secret
- Example: `JWT_SECRET=my-super-secret-jwt-key-2024`

## Security Notes
- Never commit `.env.local` to version control
- Use different secrets for development and production
- Regularly rotate your JWT secret in production 