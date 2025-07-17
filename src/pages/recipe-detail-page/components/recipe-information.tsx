import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Recipe } from "@/types/recipe";
import { FlameIcon, SoupIcon, TimerIcon, UsersIcon } from "lucide-react";

interface RecipeInformationProps {
  recipe: Recipe;
}

const RecipeInformation = ({ recipe }: RecipeInformationProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recipe Information</CardTitle>
        <CardDescription>{recipe.title}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center gap-2 rounded-lg border p-4">
            <TimerIcon className="h-8 w-8 text-primary" />
            <span className="font-medium">Prep Time</span>
            <span className="text-muted-foreground">15 mins</span>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-lg border p-4">
            <SoupIcon className="h-8 w-8 text-primary" />
            <span className="font-medium">Cook Time</span>
            <span className="text-muted-foreground">20 mins</span>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-lg border p-4">
            <UsersIcon className="h-8 w-8 text-primary" />
            <span className="font-medium">Servings</span>
            <span className="text-muted-foreground">2 people</span>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-lg border p-4">
            <FlameIcon className="h-8 w-8 text-primary" />
            <span className="font-medium">Calories</span>
            <span className="text-muted-foreground">350 kcal</span>
          </div>
        </div>
        <Separator className="my-4" />
        <div>
          <h3 className="text-lg font-semibold">Description</h3>
          <p className="mt-2 text-muted-foreground">
            {recipe.instructions}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeInformation;