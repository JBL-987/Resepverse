import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useRecipeStore } from "@/store/recipestore";
import RecipeAuthor from "@/pages/recipe-detail-page/components/recipe-author";
import RecipeComments from "@/pages/recipe-detail-page/components/recipe-comments";
import RecipeHeader from "@/pages/recipe-detail-page/components/recipe-header";
import RecipeInformation from "@/pages/recipe-detail-page/components/recipe-information";
import RecipeIngredients from "@/pages/recipe-detail-page/components/recipe-ingredients";
import RecipeInstructions from "@/pages/recipe-detail-page/components/recipe-instructions";
import { Skeleton } from "@/components/ui/skeleton";

const RecipeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const {
    selectedRecipe: recipe,
    getRecipe,
    isLoading,
  } = useRecipeStore();

  useEffect(() => {
    if (id) {
      getRecipe(id);
    }
  }, [id, getRecipe]);

  if (isLoading || !recipe) {
    return (
      <div className="container mx-auto py-10">
        <Skeleton className="h-48 w-full" />
        <div className="mt-10 grid grid-cols-12 gap-10">
          <div className="col-span-4">
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="col-span-8">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <RecipeHeader recipe={recipe} />
      <div className="container mx-auto">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 flex flex-col gap-10 lg:col-span-4">
            <RecipeInformation recipe={recipe} />
            <RecipeAuthor recipe={recipe} />
          </div>
          <div className="col-span-12 lg:col-span-8">
            <RecipeIngredients recipe={recipe} />
          </div>
        </div>
      </div>
      <div className="container mx-auto mt-10">
        <RecipeInstructions recipe={recipe} />
      </div>
      <div className="container mx-auto mt-10">
        <RecipeComments />
      </div>
    </div>
  );
};

export default RecipeDetailPage;