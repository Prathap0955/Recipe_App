'use client';

import { useAuth } from '@/contexts/AuthContext';
import Hero from '@/components/Hero';
import RecipeShowcase from '@/components/RecipeShowcase';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
    {user?(
      <RecipeShowcase />
    ):(   
      <Hero />
    )}
    </div>
  );
}
