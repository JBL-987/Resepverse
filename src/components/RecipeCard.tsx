
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Star, Clock, User } from 'lucide-react';
import { Recipe } from '@/types/recipe';
import { Link } from 'react-router-dom';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className="recipe-card overflow-hidden border-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden">
        <img
          src={recipe.imageURL}
          alt={recipe.title}
          className={`w-full h-48 object-cover transition-transform duration-300 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
            Medium
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {recipe.title}
        </h3>

        <div className="flex items-center space-x-2 mb-3">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Chef {recipe.creator}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{recipe.votes}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>25 min</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Link to={`/recipe/${recipe.id}`} className="flex-1">
          <Button className="w-full bg-primary hover:bg-primary/90">
            View Recipe
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default RecipeCard;
