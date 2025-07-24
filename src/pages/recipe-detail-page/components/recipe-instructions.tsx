import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Recipe } from "@/types/recipe";

interface RecipeInstructionsProps {
  recipe: Recipe;
}

const RecipeInstructions = ({ recipe }: RecipeInstructionsProps) => {
  const instructions = recipe.instructions || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Instructions</CardTitle>
        <CardDescription>
          Follow these steps to make the perfect {recipe.title}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal space-y-4 pl-6">
          {instructions.map((instruction: string, index: number) => (
            <li key={index}>{instruction}</li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
};

export default RecipeInstructions;