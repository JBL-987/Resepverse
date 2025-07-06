
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Star, Clock, User } from 'lucide-react';

interface RecipeCardProps {
  title: string;
  chef: string;
  image: string;
  rating: number;
  cookTime: string;
  difficulty: string;
  isNFT?: boolean;
  price?: string;
}

const RecipeCard = ({ 
  title, 
  chef, 
  image, 
  rating, 
  cookTime, 
  difficulty, 
  isNFT = false,
  price 
}: RecipeCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className="recipe-card overflow-hidden border-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className={`w-full h-48 object-cover transition-transform duration-300 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />
        {isNFT && (
          <Badge className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            NFT
          </Badge>
        )}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
            {difficulty}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{title}</h3>
        
        <div className="flex items-center space-x-2 mb-3">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Chef {chef}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{rating}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{cookTime}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button className="flex-1 bg-primary hover:bg-primary/90">
          View Recipe
        </Button>
        {isNFT && price && (
          <Button variant="outline" className="flex-1">
            Buy for {price}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default RecipeCard;
