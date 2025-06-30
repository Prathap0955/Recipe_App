'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

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

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { user, token } = useAuth();

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(search && { search }),
        ...(cuisine && { cuisine }),
        ...(difficulty && { difficulty }),
      });

      const response = await fetch(`/api/recipes?${params}`);
      const data = await response.json();

      if (response.ok) {
        setRecipes(data.recipes);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [currentPage, search, cuisine, difficulty]);

  const handleLike = async (recipeId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/recipes/${recipeId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update the recipe in the list
        setRecipes(prev => prev.map(recipe => {
          if (recipe._id === recipeId) {
            const isLiked = recipe.likes.includes(user._id);
            return {
              ...recipe,
              likes: isLiked 
                ? recipe.likes.filter(id => id !== user._id)
                : [...recipe.likes, user._id]
            };
          }
          return recipe;
        }));
      }
    } catch (error) {
      console.error('Error liking recipe:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch('');
    setCuisine('');
    setDifficulty('');
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Discover Recipes</h1>
        
        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <select
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  aria-label="Select cuisine type"
                >
                  <option value="">All Cuisines</option>
                  <option value="Italian">Italian</option>
                  <option value="Mexican">Mexican</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Indian">Indian</option>
                  <option value="Japanese">Japanese</option>
                  <option value="French">French</option>
                  <option value="Thai">Thai</option>
                  <option value="American">American</option>
                  <option value="Mediterranean">Mediterranean</option>
                </select>
              </div>
              
              <div>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  aria-label="Select difficulty level"
                >
                  <option value="">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Recipes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍳</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No recipes found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search criteria or create a new recipe!</p>
          {user && (
            <Link
              href="/create"
              className="bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 transition-colors"
            >
              Create Recipe
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
              <div key={recipe._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
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
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
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
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-xs">👨‍🍳</span>
                      </div>
                      <span className="text-sm text-gray-600">{recipe.author.name}</span>
                    </div>
                    
                    <button
                      onClick={() => handleLike(recipe._id)}
                      className={`flex items-center space-x-1 text-sm ${
                        user && recipe.likes.includes(user._id)
                          ? 'text-red-500'
                          : 'text-gray-400 hover:text-red-500'
                      } transition-colors`}
                      disabled={!user}
                    >
                      <span>❤️</span>
                      <span>{recipe.likes.length}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-2 border rounded-md ${
                      currentPage === i + 1
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 