'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface Recipe {
  _id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: number;
  servings: number;
  difficulty: string;
  cuisine: string;
  tags: string[];
  image: string;
  likes: string[];
  author: {
    _id: string;
    name: string;
    avatar?: string;
    bio?: string;
  };
  createdAt: string;
}

export default function RecipeDetail() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const { user, token } = useAuth();
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await fetch(`/api/recipes/${params.id}`);
        const data = await response.json();

        if (response.ok) {
          setRecipe(data.recipe);
          if (user) {
            setLiked(data.recipe.likes.includes(user._id));
          }
        } else {
          setError(data.error || 'Recipe not found');
        }
      } catch (error) {
        setError('Failed to fetch recipe');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchRecipe();
    }
  }, [params.id, user]);

  const handleLike = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`/api/recipes/${params.id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setLiked(!liked);
        if (recipe) {
          setRecipe(prev => prev ? {
            ...prev,
            likes: liked 
              ? prev.likes.filter(id => id !== user._id)
              : [...prev.likes, user._id]
          } : null);
        }
      }
    } catch (error) {
      console.error('Error liking recipe:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this recipe?')) {
      return;
    }

    try {
      const response = await fetch(`/api/recipes/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        router.push('/recipes');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete recipe');
      }
    } catch (error) {
      setError('Failed to delete recipe');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
        <div className="text-6xl mb-4">🍳</div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Recipe Not Found</h2>
        <p className="text-gray-600 mb-6">{error || 'The recipe you are looking for does not exist.'}</p>
        <Link
          href="/recipes"
          className="bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 transition-colors"
        >
          Browse Recipes
        </Link>
      </div>
    );
  }

  const isAuthor = user && recipe.author._id === user._id;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{recipe.title}</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                liked
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>❤️</span>
              <span>{recipe.likes.length}</span>
            </button>
            
            {isAuthor && (
              <div className="flex space-x-2">
                <Link
                  href={`/recipes/${recipe._id}/edit`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recipe Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
          <span>⏱️ {recipe.cookingTime} minutes</span>
          <span>👥 {recipe.servings} servings</span>
          <span className={`px-2 py-1 rounded-full text-xs ${
            recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
            recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {recipe.difficulty}
          </span>
          <span>🍽️ {recipe.cuisine}</span>
        </div>

        {/* Author Info */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-lg">👨‍🍳</span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{recipe.author.name}</div>
            <div className="text-sm text-gray-500">
              {new Date(recipe.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Recipe Image */}
      {recipe.image && (
        <div className="mb-8">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Description */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
        <p className="text-gray-700 leading-relaxed">{recipe.description}</p>
      </div>

      {/* Tags */}
      {recipe.tags.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {recipe.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ingredients */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ingredients</h2>
        <div className="bg-gray-50 rounded-lg p-6">
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start">
                <span className="text-orange-600 mr-3 mt-1">•</span>
                <span className="text-gray-700">{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
        <div className="space-y-4">
          {recipe.instructions.map((instruction, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4">
                  {index + 1}
                </div>
                <p className="text-gray-700 leading-relaxed">{instruction}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Back to Recipes */}
      <div className="border-t pt-6">
        <Link
          href="/recipes"
          className="text-orange-600 hover:text-orange-700 font-medium"
        >
          ← Back to Recipes
        </Link>
      </div>
    </div>
  );
} 