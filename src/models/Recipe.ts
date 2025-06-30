import mongoose from 'mongoose';

export interface IRecipe extends mongoose.Document {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cuisine: string;
  tags: string[];
  image: string;
  author: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const recipeSchema = new mongoose.Schema<IRecipe>({
  title: {
    type: String,
    required: [true, 'Please provide a recipe title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  ingredients: [{
    type: String,
    required: [true, 'Please provide ingredients'],
  }],
  instructions: [{
    type: String,
    required: [true, 'Please provide cooking instructions'],
  }],
  cookingTime: {
    type: Number,
    required: [true, 'Please provide cooking time in minutes'],
    min: [1, 'Cooking time must be at least 1 minute'],
  },
  servings: {
    type: Number,
    required: [true, 'Please provide number of servings'],
    min: [1, 'Servings must be at least 1'],
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  cuisine: {
    type: String,
    required: [true, 'Please provide cuisine type'],
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  image: {
    type: String,
    default: '',
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

// Create index for search functionality
recipeSchema.index({ title: 'text', description: 'text', tags: 'text' });

export default mongoose.models.Recipe || mongoose.model<IRecipe>('Recipe', recipeSchema); 