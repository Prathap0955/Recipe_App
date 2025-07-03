'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  recipes: Recipe[];
  likedRecipes: Recipe[];
  recipeCount: number;
  likedCount: number;
}

interface Recipe {
  _id: string;
  title: string;
  description: string;
  cookingTime: number;
  servings: number;
  difficulty: string;
  cuisine: string;
  image: string;
  likes: string[];
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'recipes' | 'liked'>('recipes');
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    avatar: '',
  });
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(data.user);
        setEditForm({
          name: data.user.name,
          bio: data.user.bio || '',
          avatar: data.user.avatar || '',
        });
      } else {
        setError(data.error || 'Failed to fetch profile');
      }
    } catch (error) {
      setError('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(prev => prev ? { ...prev, ...data.user } : null);
        setEditMode(false);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (error) {
      setError('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
        <div className="text-6xl mb-4">👤</div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Profile Error</h2>
        <p className="text-gray-600 mb-6">{error || 'Failed to load profile'}</p>
        <button
          onClick={fetchProfile}
          className="bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const daysSinceCreation = Math.max(
  1,
  (Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24)
);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-3xl">👨‍🍳</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              <p className="text-gray-600">{profile.email}</p>
              <p className="text-sm text-gray-500">
                Member since {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setEditMode(!editMode)}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Edit Form */}
        {editMode && (
          <div className="border-t pt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-black"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500  text-black"
                placeholder="Tell us about yourself..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avatar URL
              </label>
              <input
                type="url"
                value={editForm.avatar}
                onChange={(e) => setEditForm(prev => ({ ...prev, avatar: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500  text-black"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleUpdateProfile}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Bio */}
        {!editMode && profile.bio && (
          <div className="border-t pt-6">
            <p className="text-gray-700">{profile.bio}</p>
          </div>
        )}

        {/* Stats */}
        <div className="border-t pt-6 mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-orange-600">{profile.recipeCount}</div>
              <div className="text-sm text-gray-600">Recipes Created</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{profile.likedCount}</div>
              <div className="text-sm text-gray-600">Recipes Liked</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {profile.recipes.reduce((total, recipe) => total + recipe.likes.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Likes Received</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {Math.round((profile.recipeCount / daysSinceCreation) * 100) / 100}
              </div>
              <div className="text-sm text-gray-600">Recipes per Day</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('recipes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'recipes'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Recipes ({profile.recipeCount})
            </button>
            <button
              onClick={() => setActiveTab('liked')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'liked'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Liked Recipes ({profile.likedCount})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'recipes' ? (
            profile.recipes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🍳</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No recipes yet</h3>
                <p className="text-gray-600 mb-6">Start creating your first recipe!</p>
                <Link
                  href="/create"
                  className="bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 transition-colors"
                >
                  Create Recipe
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile.recipes.map((recipe) => (
                  <RecipeCard key={recipe._id} recipe={recipe} />
                ))}
              </div>
            )
          ) : (
            profile.likedRecipes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">❤️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No liked recipes</h3>
                <p className="text-gray-600 mb-6">Start exploring and liking recipes!</p>
                <Link
                  href="/recipes"
                  className="bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 transition-colors"
                >
                  Browse Recipes
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile.likedRecipes.map((recipe) => (
                  <RecipeCard key={recipe._id} recipe={recipe} />
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// Recipe Card Component
function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/recipes/${recipe._id}`}>
        <div className="h-48 bg-gray-200 flex items-center justify-center">
          {recipe.image ? (
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl">🍽️</span>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <Link href={`/recipes/${recipe._id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-orange-600 transition-colors">
            {recipe.title}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {recipe.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>⏱️ {recipe.cookingTime} min</span>
          <span>👥 {recipe.servings} servings</span>
          <span className={`px-2 py-1 rounded-full text-xs ${
            recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
            recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {recipe.difficulty}
          </span>
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-xs">👨‍🍳</span>
            </div>
            <span className="text-sm text-gray-600">{recipe.author.name}</span>
          </div>
          
          <div className="flex items-center space-x-1 text-sm text-gray-400">
            <span>❤️</span>
            <span>{recipe.likes.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 