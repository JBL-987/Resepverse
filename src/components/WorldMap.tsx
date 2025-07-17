import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useRecipeStore } from '@/store/recipestore';
import { Link } from 'react-router-dom';

const WorldMap = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { recipes, fetchRecipes, isLoading } = useRecipeStore();

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.creator.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto bg-gradient-to-b from-blue-50 to-green-50 rounded-2xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Discover Global Flavors
        </h2>
        <p className="text-muted-foreground mb-6">
          Explore the most popular recipes from around the world
        </p>

        {/* Search Bar */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search recipes, countries, or cuisines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/80 backdrop-blur-sm border-0 focus:bg-background transition-colors"
          />
        </div>
      </div>

      {/* Country Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="h-40 bg-gray-200 animate-pulse" />
                <CardContent className="p-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-full mb-3 animate-pulse" />
                  <div className="h-8 bg-gray-200 rounded w-full animate-pulse" />
                </CardContent>
              </Card>
            ))
          : filteredRecipes.map((recipe) => (
              <Card
                key={recipe.id}
                className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-40">
                  <img
                    src={recipe.imageURL}
                    alt={`${recipe.title} cuisine`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-background/80 backdrop-blur-sm text-foreground">
                      <span className="mr-1">🇮🇩</span>
                      Indonesia
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant="secondary"
                      className="bg-background/80 backdrop-blur-sm"
                    >
                      {recipe.votes} votes
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h4 className="font-semibold text-base mb-2">
                    {recipe.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    By {recipe.creator}
                  </p>

                  <Link to={`/recipe/${recipe.id}`}>
                    <Button
                      size="sm"
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      View Recipe
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* No results message */}
      {!isLoading && filteredRecipes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No recipes found for "{searchQuery}"
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Try searching for different keywords or browse our regional
            collections
          </p>
        </div>
      )}
    </div>
  );
};

export default WorldMap;
