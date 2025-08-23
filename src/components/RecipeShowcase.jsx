'use client';

import { useEffect, useState } from "react";
import Link from "next/link";

export default function RecipeShowcase() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecentRecipes();
  }, []);

  const fetchRecentRecipes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recipes?limit=6");
      const data = await res.json();
      setRecipes(data.recipes || []);
    } catch (err) {
      console.error("Error fetching recipes:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Recent Recipes
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the latest culinary creations from our community
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {recipes.map((r) => (
                <div key={r._id} className="bg-white shadow-lg rounded-lg overflow-hidden">
                  <img src={r.image} alt={r.title} className="h-48 w-full object-cover" />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{r.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{r.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-orange-600">{r.cuisine}</span>
                      <Link href={`/recipes/${r._id}`} className="text-orange-600 font-medium">
                        View →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/recipes"
                className="bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700"
              >
                Click More →
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
