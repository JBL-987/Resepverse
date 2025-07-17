import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Recipe } from "@/types/recipe";
import { Share2Icon, StarIcon } from "lucide-react";

interface RecipeHeaderProps {
  recipe: Recipe;
}

const RecipeHeader = ({ recipe }: RecipeHeaderProps) => {
  return (
    <div
      className="bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${recipe.imageURL})` }}
    >
      <div className="container mx-auto py-24 text-white">
        <div className="flex flex-col gap-4">
          <Badge className="w-fit">Indonesian</Badge>
          <h1 className="text-6xl font-bold">{recipe.title}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <StarIcon className="h-5 w-5 text-yellow-400" />
              <span className="font-medium">{recipe.votes}</span>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <span className="font-medium">By {recipe.creator}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <Button>Save Recipe</Button>
            <Button variant="outline">
              <Share2Icon className="mr-2 h-5 w-5" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeHeader;