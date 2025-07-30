import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Globe, TrendingUp, Clock, Users, Gem, Star, Filter } from 'lucide-react';
import { useRecipeStore } from '@/store/recipestore';
import { Link } from 'react-router-dom';

const WorldMap = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFilter, setSearchFilter] = useState('all'); // 'all', 'recipes', 'nfts', 'creators'
  const { recipes, fetchRecipes, isLoading } = useRecipeStore();

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // Enhanced search functionality for recipes and NFTs
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate search processing
    await new Promise(resolve => setTimeout(resolve, 200));
    
    let filtered = recipes.filter((recipe) => {
      const matchesQuery =
        recipe.title.toLowerCase().includes(query.toLowerCase()) ||
        recipe.creator.toLowerCase().includes(query.toLowerCase()) ||
        query.toLowerCase().includes('nft') ||
        query.toLowerCase().includes('mint') ||
        query.toLowerCase().includes('token') ||
        query.toLowerCase().includes('blockchain');

      // Filter by type if specified
      if (searchFilter === 'nfts') {
        // Simulate NFT recipes (recipes with higher votes could be considered as minted NFTs)
        return matchesQuery && recipe.votes > 50;
      } else if (searchFilter === 'creators') {
        return recipe.creator.toLowerCase().includes(query.toLowerCase());
      } else if (searchFilter === 'recipes') {
        return recipe.title.toLowerCase().includes(query.toLowerCase());
      }
      
      return matchesQuery;
    });

    // Sort by relevance (NFTs first if searching for NFT-related terms)
    if (query.toLowerCase().includes('nft') || query.toLowerCase().includes('mint')) {
      filtered = filtered.sort((a, b) => b.votes - a.votes);
    }
    
    setSearchResults(filtered);
    setIsSearching(false);
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, recipes, searchFilter]);

  const displayRecipes = searchQuery ? searchResults : recipes.slice(0, 6);

  // Check if recipe could be an NFT (high votes = likely minted)
  const isLikelyNFT = (recipe: any) => recipe.votes > 50;

  return (
    <div className="w-full max-w-7xl mx-auto bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-orange-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-orange-500 rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-6">
            <Search className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-orange-400 mb-4">
            Recipe & NFT Search Engine
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Find recipes, NFT collections, and creators in our decentralized cooking community
          </p>

          {/* Search Filters */}
          <div className="flex justify-center mb-6">
            <div className="flex bg-gray-800/50 rounded-2xl p-1 border border-gray-700">
              {[
                { key: 'all', label: 'All', icon: Globe },
                { key: 'recipes', label: 'Recipes', icon: Users },
                { key: 'nfts', label: 'NFTs', icon: Gem },
                { key: 'creators', label: 'Creators', icon: Star }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setSearchFilter(key)}
                  className={`flex items-center px-4 py-2 rounded-xl transition-all duration-300 ${
                    searchFilter === key
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-400 hover:text-orange-400'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400 w-5 h-5" />
            <Input
              type="text"
              placeholder={
                searchFilter === 'nfts'
                  ? "Search NFT recipes, minted collections..."
                  : searchFilter === 'creators'
                  ? "Search chef names, creators..."
                  : "Search recipes, NFTs, creators, cuisines..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-4 bg-gray-800/50 border-gray-700 focus:border-orange-500 focus:ring-orange-500/20 text-white placeholder-gray-400 rounded-2xl text-lg transition-all duration-300"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          {/* Search Stats */}
          {searchQuery && (
            <div className="mt-4 flex justify-center items-center space-x-4 text-sm">
              <span className="text-gray-400">
                Found {displayRecipes.length} result{displayRecipes.length !== 1 ? 's' : ''} for "{searchQuery}"
              </span>
              {searchFilter !== 'all' && (
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                  {searchFilter.toUpperCase()} only
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading || isSearching
            ? Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="overflow-hidden bg-gray-800/30 border-gray-700 animate-pulse">
                  <div className="h-48 bg-gray-700/50" />
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-700/50 rounded w-3/4 mb-3" />
                    <div className="h-4 bg-gray-700/50 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-700/50 rounded w-2/3 mb-4" />
                    <div className="h-10 bg-gray-700/50 rounded w-full" />
                  </CardContent>
                </Card>
              ))
            : displayRecipes.map((recipe) => (
                <Card
                  key={recipe.id}
                  className="group overflow-hidden bg-gray-800/30 border-gray-700 hover:border-orange-500/50 hover:bg-gray-800/50 transition-all duration-300 hover:scale-105"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={recipe.imageURL}
                      alt={`${recipe.title} cuisine`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    <div className="absolute top-4 left-4 flex space-x-2">
                      <Badge className="bg-orange-500/90 text-white border-0 backdrop-blur-sm">
                        <span className="mr-1">🌍</span>
                        Recipe
                      </Badge>
                      {isLikelyNFT(recipe) && (
                        <Badge className="bg-purple-500/90 text-white border-0 backdrop-blur-sm">
                          <Gem className="w-3 h-3 mr-1" />
                          NFT
                        </Badge>
                      )}
                    </div>
                    
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gray-900/80 text-orange-400 border-orange-500/30 backdrop-blur-sm">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {recipe.votes}
                      </Badge>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center justify-between text-white/80 text-sm">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            30min
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            4 servings
                          </div>
                        </div>
                        {isLikelyNFT(recipe) && (
                          <div className="flex items-center text-purple-300">
                            <Gem className="w-4 h-4 mr-1" />
                            Minted
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-lg text-white group-hover:text-orange-400 transition-colors duration-300 flex-1">
                        {recipe.title}
                      </h4>
                      {isLikelyNFT(recipe) && (
                        <div className="ml-2 text-purple-400">
                          <Gem className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <p className="text-gray-400 mb-4 line-clamp-2">
                      By <span className="text-orange-400 font-medium">{recipe.creator}</span>
                      {isLikelyNFT(recipe) && (
                        <span className="ml-2 text-purple-400 text-sm">• NFT Creator</span>
                      )}
                    </p>

                    <Link to={`/recipe/${recipe.id}`}>
                      <Button className={`w-full font-bold py-3 rounded-xl transition-all duration-300 transform group-hover:scale-105 ${
                        isLikelyNFT(recipe)
                          ? 'bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600 text-white'
                          : 'bg-orange-500 hover:bg-orange-600 text-black'
                      }`}>
                        {isLikelyNFT(recipe) ? '💎 View NFT Recipe' : 'View Recipe'}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
        </div>

        {/* No results message */}
        {!isLoading && !isSearching && displayRecipes.length === 0 && searchQuery && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">
              No recipes found
            </h3>
            <p className="text-gray-500 text-lg mb-2">
              No recipes found for "{searchQuery}"
            </p>
            <p className="text-sm text-gray-600">
              Try searching for different keywords, ingredients, or cuisine types
            </p>
          </div>
        )}

        {/* Popular Search Suggestions */}
        {!searchQuery && (
          <div className="mt-12 text-center">
            <h3 className="text-xl font-bold text-gray-400 mb-6">Popular Searches</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {['Italian Pasta', 'Asian Stir Fry', 'Mexican Tacos', 'Indian Curry', 'French Desserts', 'Japanese Sushi'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setSearchQuery(suggestion)}
                  className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-full text-gray-400 hover:text-orange-400 hover:border-orange-500/50 transition-all duration-300"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorldMap;
