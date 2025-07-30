import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import WorldMap from '@/components/WorldMap';
import RecipeCard from '@/components/RecipeCard';
import ChefProfile from '@/components/ChefProfile';
import NFTMintingModal from '@/components/NFTMintingModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRecipeStore } from '@/store/recipestore';

const Index = () => {
  const [showMintModal, setShowMintModal] = useState(false);
  const { recipes, fetchRecipes, isLoading } = useRecipeStore();

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);


  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className="relative z-10">
        <Header />
        
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-orange-500/20 border border-orange-500/30 px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
              <span className="text-orange-300 font-medium">🔥 Welcome to ResepVerse</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 text-orange-400 animate-fade-in">
              Cook. Share. Earn.
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join the world's first blockchain-powered cooking platform. Share your recipes, learn from master chefs, and earn
              <span className="text-orange-400 font-semibold"> $LSK tokens</span>.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
              <div className="text-center backdrop-blur-sm bg-gray-900/50 rounded-2xl p-6 border border-gray-800 hover:border-orange-500/30 transition-all duration-300">
                <div className="text-2xl md:text-3xl font-bold text-orange-400 mb-2">12K+</div>
                <div className="text-gray-400 text-sm">Recipes</div>
              </div>
              <div className="text-center backdrop-blur-sm bg-gray-900/50 rounded-2xl p-6 border border-gray-800 hover:border-orange-500/30 transition-all duration-300">
                <div className="text-2xl md:text-3xl font-bold text-orange-400 mb-2">3.4K+</div>
                <div className="text-gray-400 text-sm">Chefs</div>
              </div>
              <div className="text-center backdrop-blur-sm bg-gray-900/50 rounded-2xl p-6 border border-gray-800 hover:border-orange-500/30 transition-all duration-300">
                <div className="text-2xl md:text-3xl font-bold text-orange-400 mb-2">$84K</div>
                <div className="text-gray-400 text-sm">Earned</div>
              </div>
              <div className="text-center backdrop-blur-sm bg-gray-900/50 rounded-2xl p-6 border border-gray-800 hover:border-orange-500/30 transition-all duration-300">
                <div className="text-2xl md:text-3xl font-bold text-orange-400 mb-2">67+</div>
                <div className="text-gray-400 text-sm">Countries</div>
              </div>
            </div>
          </div>

          {/* World Map Section */}
          <div className="backdrop-blur-sm bg-gray-900/30 rounded-3xl p-8 border border-gray-800">
            <WorldMap />
          </div>
        </section>
      </div>

      {/* Featured Recipes */}
      <section className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-orange-400 mb-4">Featured Recipes</h2>
          <p className="text-lg text-gray-400 mb-8">Discover amazing dishes from our community</p>
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 px-6 py-2 text-lg">🔥 Trending Now</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-64 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700"></div>
                  <div className="mt-6 h-6 rounded bg-gray-800/50 backdrop-blur-sm"></div>
                  <div className="mt-3 h-4 rounded bg-gray-800/50 backdrop-blur-sm w-2/3"></div>
                </div>
              ))
            : recipes
                .slice(0, 3)
                .map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
        </div>
      </section>


      {/* Tokenomics Section */}
      <section className="container mx-auto px-4 py-16 relative z-10">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-12 hover:border-orange-500/20 transition-all duration-500">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-6">
              <span className="text-2xl">💰</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-orange-400">$LSK Tokenomics</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Earn while you cook, learn, and share your culinary passion with the world</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group text-center p-8 bg-gray-800/50 border border-gray-700 rounded-2xl hover:border-orange-500/50 hover:bg-gray-800/70 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl">👨‍🍳</span>
              </div>
              <div className="text-2xl font-bold text-orange-400 mb-3">Cook-to-Earn</div>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Share recipes and earn tokens for every interaction</p>
            </div>
            <div className="group text-center p-8 bg-gray-800/50 border border-gray-700 rounded-2xl hover:border-orange-500/50 hover:bg-gray-800/70 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl">🎨</span>
              </div>
              <div className="text-2xl font-bold text-orange-400 mb-3">NFT Minting</div>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Turn your best recipes into valuable collectibles</p>
            </div>
            <div className="group text-center p-8 bg-gray-800/50 border border-gray-700 rounded-2xl hover:border-orange-500/50 hover:bg-gray-800/70 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl">🗳️</span>
              </div>
              <div className="text-2xl font-bold text-orange-400 mb-3">Governance</div>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Vote on platform decisions and shape the future</p>
            </div>
            <div className="group text-center p-8 bg-gray-800/50 border border-gray-700 rounded-2xl hover:border-orange-500/50 hover:bg-gray-800/70 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl">💎</span>
              </div>
              <div className="text-2xl font-bold text-orange-400 mb-3">Royalties</div>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Earn passive income from your recipe sales</p>
            </div>
          </div>
        </div>
      </section>

      {/* NFT Minting Modal */}
      <NFTMintingModal 
        isOpen={showMintModal}
        onClose={() => setShowMintModal(false)}
        recipeTitle="My Special Recipe"
      />
    </div>
  );
};

export default Index;
