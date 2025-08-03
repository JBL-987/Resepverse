import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import RecipeCard from '@/components/RecipeCard';
import NFTMintingModal from '@/components/NFTMintingModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, ChefHat, Globe, Utensils, ArrowRight, ShoppingBag } from 'lucide-react';
import { useRecipeStore } from '@/store/recipestore';
import axios from 'axios';

interface Category {
  strCategory: string;
}

interface Area {
  strArea: string;
}

interface Ingredient {
  strIngredient: string;
}

interface MealResult {
  meals: {
    strMeal: string;
    strMealThumb: string;
    idMeal: string;
  }[];
}

const Index = () => {
  const [showMintModal, setShowMintModal] = useState(false);
  const { recipes, fetchRecipes, isLoading } = useRecipeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [searchResults, setSearchResults] = useState<MealResult['meals']>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecipes();
    fetchCategories();
    fetchAreas();
    fetchIngredients();
  }, [fetchRecipes]);
  
  const fetchCategories = async () => {
    try {
      const response = await axios.get('https://www.themealdb.com/api/json/v1/1/list.php?c=list');
      setCategories(response.data.meals);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  
  const fetchAreas = async () => {
    try {
      const response = await axios.get('https://www.themealdb.com/api/json/v1/1/list.php?a=list');
      setAreas(response.data.meals);
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };
  
  const fetchIngredients = async () => {
    try {
      const response = await axios.get('https://www.themealdb.com/api/json/v1/1/list.php?i=list');
      setIngredients(response.data.meals);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    }
  };
  
  const handleSearch = async () => {
    if (!selectedIngredient) return;
    
    setIsSearching(true);
    try {
      const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${selectedIngredient}`);
      setSearchResults(response.data.meals || []);
    } catch (error) {
      console.error('Error searching recipes:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };


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
            
            {/* Recipe Search */}
            <div className="max-w-4xl mx-auto bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 mb-12">
              <h3 className="text-2xl font-bold text-orange-400 mb-4 flex items-center justify-center">
                <Search className="w-6 h-6 mr-2" />
                Find Recipes
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 flex items-center">
                    <ChefHat className="w-4 h-4 mr-1" /> Category
                  </label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-gray-800/50 border-gray-700 focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-300 text-white">
                      <SelectValue placeholder="Select category" className="text-white" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="all" className="text-white">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.strCategory} value={category.strCategory} className="text-white">
                          {category.strCategory}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 flex items-center">
                    <Globe className="w-4 h-4 mr-1" /> Area
                  </label>
                  <Select value={selectedArea} onValueChange={setSelectedArea}>
                    <SelectTrigger className="bg-gray-800/50 border-gray-700 focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-300 text-white">
                      <SelectValue placeholder="Select area" className="text-white" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="all" className="text-white">All Areas</SelectItem>
                      {areas.map((area) => (
                        <SelectItem key={area.strArea} value={area.strArea} className="text-white">
                          {area.strArea}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 flex items-center">
                    <Utensils className="w-4 h-4 mr-1" /> Main Ingredient
                  </label>
                  <Select value={selectedIngredient} onValueChange={setSelectedIngredient}>
                    <SelectTrigger className="bg-gray-800/50 border-gray-700 focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-300 text-white">
                      <SelectValue placeholder="Select ingredient" className="text-white" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="all" className="text-white">All Ingredients</SelectItem>
                      {ingredients.map((ingredient) => (
                        <SelectItem key={ingredient.strIngredient} value={ingredient.strIngredient} className="text-white">
                          {ingredient.strIngredient}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                onClick={handleSearch} 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                disabled={isSearching || !selectedIngredient}
              >
                {isSearching ? 'Searching...' : 'Search Recipes'}
              </Button>
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-xl font-semibold text-orange-400 mb-4">Search Results</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {searchResults.map((meal) => (
                      <div key={meal.idMeal} className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700 hover:border-orange-500/50 transition-all duration-300 hover:scale-105">
                        <img src={meal.strMealThumb} alt={meal.strMeal} className="w-full h-32 object-cover" />
                        <div className="p-3">
                          <h5 className="text-sm font-medium text-white truncate">{meal.strMeal}</h5>
                          <p className="text-xs text-gray-400 mt-1">ID: {meal.idMeal}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
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

          {/* Enhanced Marketplace Section */}
          <div className="backdrop-blur-sm bg-gradient-to-br from-gray-900/60 via-gray-800/50 to-gray-900/60 rounded-3xl p-12 border border-gray-700/50 hover:border-orange-500/30 transition-all duration-500 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-6 shadow-lg shadow-orange-500/20">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Explore the 
                <span className="text-orange-400 ml-2">Marketplace</span>
              </h2>
              
              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Discover exclusive recipes, mint your culinary creations as NFTs, and trade with chefs worldwide
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <div className="flex items-center text-sm text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  1,247 Active Listings
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  24.7K $LSK Volume
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  892 Verified Chefs
                </div>
              </div>
              
              <Button
                className="group relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                onClick={() => navigate('/marketplace')}
              >
                <span className="flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                  Explore Marketplace
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                
                {/* Button glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/50 to-orange-600/50 blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </Button>
            </div>
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