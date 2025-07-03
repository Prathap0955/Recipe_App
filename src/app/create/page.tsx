'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function CreateRecipe() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    cookingTime: '',
    servings: '',
    difficulty: 'Medium',
    cuisine: '',
    tags: '',
    image: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  if (!user) {
    router.push('/login');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArrayInputChange = (index: number, field: 'ingredients' | 'instructions', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item),
    }));
  };

  const addArrayItem = (field: 'ingredients' | 'instructions') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayItem = (index: number, field: 'ingredients' | 'instructions') => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title || !formData.description || !formData.cookingTime || !formData.servings || !formData.cuisine) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.ingredients.some(ingredient => !ingredient.trim())) {
      setError('Please fill in all ingredient fields');
      return;
    }

    if (formData.instructions.some(instruction => !instruction.trim())) {
      setError('Please fill in all instruction fields');
      return;
    }

    setLoading(true);

    try {
      const recipeData = {
        ...formData,
        cookingTime: parseInt(formData.cookingTime),
        servings: parseInt(formData.servings),
        ingredients: formData.ingredients.filter(ingredient => ingredient.trim()),
        instructions: formData.instructions.filter(instruction => instruction.trim()),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };

      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipeData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/recipes/${data.recipe._id}`);
      } else {
        setError(data.error || 'Failed to create recipe');
      }
    } catch (error) {
      setError('Failed to create recipe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Recipe</h1>
        <p className="text-gray-600">Share your culinary creation with the community</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Recipe Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500  text-black"
              placeholder="Enter recipe title"
              required
            />
          </div>

          <div>
            <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-2">
              Cuisine Type *
            </label>
            <select
              id="cuisine"
              name="cuisine"
              value={formData.cuisine}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500  text-black"
              required
            >
              <option value="">Select cuisine</option>
              <option value="Italian">Italian</option>
              <option value="Mexican">Mexican</option>
              <option value="Chinese">Chinese</option>
              <option value="Indian">Indian</option>
              <option value="Japanese">Japanese</option>
              <option value="French">French</option>
              <option value="Thai">Thai</option>
              <option value="American">American</option>
              <option value="Mediterranean">Mediterranean</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500  text-black"
            placeholder="Describe your recipe..."
            required
          />
        </div>

        {/* Recipe Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="cookingTime" className="block text-sm font-medium text-gray-700 mb-2">
              Cooking Time (minutes) *
            </label>
            <input
              type="number"
              id="cookingTime"
              name="cookingTime"
              value={formData.cookingTime}
              onChange={handleInputChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500  text-black"
              required
            />
          </div>

          <div>
            <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-2">
              Servings *
            </label>
            <input
              type="number"
              id="servings"
              name="servings"
              value={formData.servings}
              onChange={handleInputChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500  text-black"
              required
            />
          </div>

          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty Level
            </label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500  text-black"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ingredients *
          </label>
          <div className="space-y-2">
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => handleArrayInputChange(index, 'ingredients', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500  text-black"
                  placeholder={`Ingredient ${index + 1}`}
                  required
                />
                {formData.ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem(index, 'ingredients')}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors "
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('ingredients')}
              className="text-orange-600 hover:text-orange-700 text-sm font-medium "
            >
              + Add Ingredient
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instructions *
          </label>
          <div className="space-y-2">
            {formData.instructions.map((instruction, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1">Step {index + 1}</div>
                  <textarea
                    value={instruction}
                    onChange={(e) => handleArrayInputChange(index, 'instructions', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500  text-black"
                    placeholder={`Step ${index + 1} instructions...`}
                    required
                  />
                </div>
                {formData.instructions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem(index, 'instructions')}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors self-end"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('instructions')}
              className="text-orange-600 hover:text-orange-700 text-sm font-medium"
            >
              + Add Step
            </button>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500  text-black"
              placeholder="e.g., vegetarian, quick, dessert"
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
              Image URL (optional)
            </label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500  text-black"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Recipe'}
          </button>
        </div>
      </form>
    </div>
  );
} 