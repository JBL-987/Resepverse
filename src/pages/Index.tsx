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
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <Header />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
            Cook. Share. Earn.
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the world's first blockchain-powered cooking platform. Share your recipes, learn from master chefs, and earn $LSK tokens.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
              <Link to="/become-chef">Start Cooking</Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              asChild
            >
              <Link to="/nft-minting">Mint Your Recipe</Link>
            </Button>
          </div>
        </div>

        {/* World Map Section */}
        <WorldMap />
      </section>

      {/* Featured Recipes */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Featured Recipes</h2>
          <Badge className="chef-badge">🔥 Trending</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-48 rounded-lg bg-gray-200"></div>
                  <div className="mt-4 h-6 rounded bg-gray-200"></div>
                  <div className="mt-2 h-4 rounded bg-gray-200 w-1/2"></div>
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
      <section className="container mx-auto px-4 py-12">
        <div className="bg-card rounded-2xl p-8 food-shadow">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">$LSK Tokenomics</h2>
            <p className="text-muted-foreground">Earn while you cook, learn, and share</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-accent/30 rounded-xl">
              <div className="text-2xl font-bold text-primary mb-2">Cook-to-Earn</div>
              <p className="text-sm text-muted-foreground">Share recipes and earn tokens</p>
            </div>
            <div className="text-center p-6 bg-accent/30 rounded-xl">
              <div className="text-2xl font-bold text-primary mb-2">NFT Minting</div>
              <p className="text-sm text-muted-foreground">Turn recipes into collectibles</p>
            </div>
            <div className="text-center p-6 bg-accent/30 rounded-xl">
              <div className="text-2xl font-bold text-primary mb-2">Governance</div>
              <p className="text-sm text-muted-foreground">Vote on platform decisions</p>
            </div>
            <div className="text-center p-6 bg-accent/30 rounded-xl">
              <div className="text-2xl font-bold text-primary mb-2">Royalties</div>
              <p className="text-sm text-muted-foreground">Earn from recipe sales</p>
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
