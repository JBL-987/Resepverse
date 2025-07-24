import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Recipe } from "@/types/recipe";

interface RecipeIngredientsProps {
  recipe: Recipe;
}

const RecipeIngredients = ({ recipe }: RecipeIngredientsProps) => {
  const ingredients = recipe.ingredients || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingredients</CardTitle>
        <CardDescription>
          The ingredients needed for this recipe.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {ingredients.map((ingredient: string, index: number) => (
            <div className="flex items-center gap-4" key={index}>
              <Checkbox id={`ingredient-${index}`} />
              <label htmlFor={`ingredient-${index}`} className="font-medium">
                {ingredient}
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeIngredients;