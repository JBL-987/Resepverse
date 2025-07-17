import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Recipe } from "@/types/recipe";

interface RecipeAuthorProps {
  recipe: Recipe;
}

const RecipeAuthor = ({ recipe }: RecipeAuthorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About the Author</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{recipe.creator}</h3>
            <p className="text-sm text-muted-foreground">
              Passionate chef with over 10 years of experience in Indonesian
              cuisine.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <Button>Follow</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeAuthor;