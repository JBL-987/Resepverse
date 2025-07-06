
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const WorldMap = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const countriesData = {
    'Asian Delights': [
      { 
        country: 'Japan', 
        recipe: 'Ramen', 
        flag: '🇯🇵', 
        cooks: 1.8,
        image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400',
        description: 'Rich broth noodles with toppings'
      },
      { 
        country: 'Thailand', 
        recipe: 'Pad Thai', 
        flag: '🇹🇭', 
        cooks: 2.7,
        image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400',
        description: 'Stir-fried rice noodles'
      },
      { 
        country: 'India', 
        recipe: 'Butter Chicken', 
        flag: '🇮🇳', 
        cooks: 3.1,
        image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400',
        description: 'Creamy tomato-based curry'
      },
    ],
    'European Classics': [
      { 
        country: 'Italy', 
        recipe: 'Pasta Carbonara', 
        flag: '🇮🇹', 
        cooks: 2.3,
        image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400',
        description: 'Creamy Roman pasta with eggs and pancetta'
      },
      { 
        country: 'France', 
        recipe: 'Coq au Vin', 
        flag: '🇫🇷', 
        cooks: 1.2,
        image: 'https://images.unsplash.com/photo-1493962853295-0fd70327578a?w=400',
        description: 'Chicken braised in wine'
      },
      { 
        country: 'Spain', 
        recipe: 'Paella', 
        flag: '🇪🇸', 
        cooks: 1.9,
        image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=400',
        description: 'Saffron rice with seafood'
      },
    ],
    'Americas Fusion': [
      { 
        country: 'Mexico', 
        recipe: 'Tacos al Pastor', 
        flag: '🇲🇽', 
        cooks: 1.9,
        image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400',
        description: 'Marinated pork with pineapple'
      },
      { 
        country: 'USA', 
        recipe: 'BBQ Ribs', 
        flag: '🇺🇸', 
        cooks: 2.1,
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
        description: 'Smoky barbecue ribs'
      },
      { 
        country: 'Brazil', 
        recipe: 'Feijoada', 
        flag: '🇧🇷', 
        cooks: 1.4,
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
        description: 'Traditional black bean stew'
      },
    ]
  };

  // Filter function
  const filterRecipes = (recipes: any[]) => {
    if (!searchQuery) return recipes;
    return recipes.filter(recipe => 
      recipe.recipe.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto bg-gradient-to-b from-blue-50 to-green-50 rounded-2xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Discover Global Flavors</h2>
        <p className="text-muted-foreground mb-6">Explore the most popular recipes from around the world</p>
        
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {Object.entries(countriesData).map(([regionName, recipes]) => {
          const filteredRecipes = filterRecipes(recipes);
          
          if (searchQuery && filteredRecipes.length === 0) return null;
          
          return (
            <div key={regionName} className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground mb-2">{regionName}</h3>
                <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
              </div>
              
              <div className="space-y-4">
                {filteredRecipes.map((item, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="relative h-40">
                      <img 
                        src={item.image} 
                        alt={`${item.country} cuisine`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-background/80 backdrop-blur-sm text-foreground">
                          <span className="mr-1">{item.flag}</span>
                          {item.country}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                          {item.cooks}k cooks
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-base mb-2">{item.recipe}</h4>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                      
                      <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                        View Recipe
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* No results message */}
      {searchQuery && Object.values(countriesData).every(recipes => filterRecipes(recipes).length === 0) && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No recipes found for "{searchQuery}"</p>
          <p className="text-sm text-muted-foreground mt-2">Try searching for different keywords or browse our regional collections</p>
        </div>
      )}
    </div>
  );
};

export default WorldMap;
