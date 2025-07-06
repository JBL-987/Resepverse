
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Star, Clock, MapPin } from 'lucide-react';

interface ChefProfileProps {
  name: string;
  avatar: string;
  rating: number;
  specialties: string[];
  location: string;
  isLive?: boolean;
  topDishes: string[];
}

const ChefProfile = ({ 
  name, 
  avatar, 
  rating, 
  specialties, 
  location, 
  isLive = false,
  topDishes 
}: ChefProfileProps) => {
  return (
    <Card className="chef-profile border-0 food-shadow">
      <CardHeader className="text-center pb-4">
        <div className="relative mx-auto mb-4">
          <img 
            src={avatar} 
            alt={name}
            className="w-20 h-20 rounded-full object-cover border-4 border-primary/20"
          />
          {isLive && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
        
        <h3 className="font-bold text-xl mb-1">Chef {name}</h3>
        
        <div className="flex items-center justify-center space-x-1 mb-2">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold">{rating}</span>
          <span className="text-muted-foreground text-sm">/5.0</span>
        </div>
        
        <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{location}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Specialties */}
        <div>
          <h4 className="font-medium mb-2 text-sm text-muted-foreground">SPECIALTIES</h4>
          <div className="flex flex-wrap gap-2">
            {specialties.map((specialty, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {specialty}
              </Badge>
            ))}
          </div>
        </div>

        {/* Top Dishes */}
        <div>
          <h4 className="font-medium mb-2 text-sm text-muted-foreground">TOP DISHES</h4>
          <div className="space-y-1">
            {topDishes.slice(0, 3).map((dish, index) => (
              <div key={index} className="text-sm text-foreground">
                • {dish}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button className="w-full bg-primary hover:bg-primary/90">
            Request this Dish
          </Button>
          {isLive && (
            <Button variant="outline" className="w-full">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Join Live Cooking</span>
              </div>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChefProfile;
