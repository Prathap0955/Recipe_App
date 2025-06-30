# Recipe Hub - Culinary Community Platform

A modern, full-stack recipe sharing application built with Next.js, TypeScript, Tailwind CSS, and MongoDB.

## 🚀 Features

### Authentication & Authorization
- **User Registration & Login**: Secure JWT-based authentication
- **Password Hashing**: Bcrypt encryption for password security
- **Protected Routes**: Middleware-based route protection
- **User Profiles**: Complete user profile management

### Recipe Management
- **CRUD Operations**: Create, Read, Update, Delete recipes
- **Rich Recipe Data**: Ingredients, instructions, cooking time, servings, difficulty, cuisine
- **Image Support**: Recipe image URLs
- **Search & Filtering**: Search by title, filter by cuisine and difficulty
- **Pagination**: Efficient recipe browsing

### Social Features
- **Like System**: Like/unlike recipes
- **User Profiles**: View user's recipes and liked recipes
- **Recipe Discovery**: Browse and discover new recipes

### Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Beautiful Landing Page**: Engaging hero section and features
- **Intuitive Navigation**: Clean and accessible navigation
- **Loading States**: Smooth user experience with loading indicators

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Styling**: Tailwind CSS for responsive design

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd recipe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/recipe-app
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

4. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Update the `MONGODB_URI` in your `.env.local` file

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
recipe/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── recipes/       # Recipe CRUD endpoints
│   │   │   └── users/         # User profile endpoints
│   │   ├── create/            # Recipe creation page
│   │   ├── login/             # Login page
│   │   ├── profile/           # User profile page
│   │   ├── recipes/           # Recipe listing and detail pages
│   │   ├── register/          # Registration page
│   │   └── page.tsx           # Landing page
│   ├── components/            # Reusable components
│   │   └── Navbar.tsx         # Navigation component
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx    # Authentication context
│   ├── lib/                   # Utility libraries
│   │   ├── db.ts             # Database connection
│   │   └── jwt.ts            # JWT utilities
│   ├── middleware/            # Custom middleware
│   │   └── auth.ts           # Authentication middleware
│   └── models/               # Database models
│       ├── Recipe.ts         # Recipe schema
│       └── User.ts           # User schema
├── public/                   # Static assets
└── package.json             # Dependencies and scripts
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Recipes
- `GET /api/recipes` - List recipes with filtering and pagination
- `POST /api/recipes` - Create new recipe (authenticated)
- `GET /api/recipes/[id]` - Get single recipe
- `PUT /api/recipes/[id]` - Update recipe (authenticated, owner only)
- `DELETE /api/recipes/[id]` - Delete recipe (authenticated, owner only)
- `POST /api/recipes/[id]/like` - Like/unlike recipe (authenticated)

### User Profile
- `GET /api/users/profile` - Get user profile with recipes (authenticated)
- `PUT /api/users/profile` - Update user profile (authenticated)

## 🎨 Key Features Explained

### Authentication Flow
1. User registers/logs in via `/api/auth/register` or `/api/auth/login`
2. JWT token is generated and stored in localStorage
3. Token is sent with subsequent requests in Authorization header
4. Protected routes check token validity via middleware

### Recipe CRUD
- **Create**: Users can create recipes with detailed information
- **Read**: Public access to view recipes, with search and filtering
- **Update**: Recipe authors can edit their recipes
- **Delete**: Recipe authors can delete their recipes

### Search & Filtering
- Text search across recipe titles and descriptions
- Filter by cuisine type and difficulty level
- Pagination for efficient browsing

### Like System
- Authenticated users can like/unlike recipes
- Like count is displayed on recipe cards
- Users can view their liked recipes in their profile

## 🔒 Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Route Protection**: Middleware-based authorization
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Built-in Next.js CORS handling

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
- **Netlify**: Similar to Vercel deployment
- **Railway**: Good for full-stack applications
- **Heroku**: Traditional deployment option

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- MongoDB for the flexible database solution
- The open-source community for inspiration and tools

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the maintainers.

---

**Happy Cooking! 🍳**
