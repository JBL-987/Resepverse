export interface Recipe {
  id: string;
  creator: string;
  title: string;
  ingredients: string;
  instructions: string;
  imageURL: string;
  votes: number;
  timestamp: string;
  hasVoted?: boolean; // client-side only
}

export interface RecipeInput {
  title: string;
  ingredients: string[];
  instructions: string[];
  imageURL: string;
}