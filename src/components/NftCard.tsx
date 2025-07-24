import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useReadContract, useWriteContract, useAccount } from "wagmi";
import { parseEther, formatEther } from "viem";
import RecipeBook from "./../../smartcontract/artifacts/contracts/RecipeBook.sol/RecipeBook.json";
import { RECIPE_BOOK_ADDRESS } from "@/constants";

interface NftCardProps {
  tokenId: bigint;
  refetchNfts: () => void;
}

const NftCard = ({ tokenId, refetchNfts }: NftCardProps) => {
  const { toast } = useToast();
  const { address: account, chain } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [salePrice, setSalePrice] = useState("");

  const { data: tokenURI } = useReadContract({
    abi: RecipeBook.abi,
    address: RECIPE_BOOK_ADDRESS,
    functionName: 'tokenURI',
    args: [tokenId],
  });

  const { data: recipeId } = useReadContract({
    abi: RecipeBook.abi,
    address: RECIPE_BOOK_ADDRESS,
    functionName: 'getRecipeIdByTokenId',
    args: [tokenId],
  });

  const { data: recipe } = useReadContract({
    abi: RecipeBook.abi,
    address: RECIPE_BOOK_ADDRESS,
    functionName: 'getRecipe',
    args: [recipeId],
    query: {
        enabled: !!recipeId,
    }
  });

  const handleListForSale = async () => {
    if (!account) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const price = parseEther(salePrice);
      await writeContractAsync({
        abi: RecipeBook.abi,
        address: RECIPE_BOOK_ADDRESS,
        functionName: 'listNFTForSale',
        args: [tokenId, price],
        account,
        chain,
      });
      toast({
        title: "Success",
        description: "Your NFT has been listed for sale!",
      });
      refetchNfts();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "There was an error listing your NFT for sale.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
        {recipe && (
            <img src={(recipe as any).imageURL} alt={(recipe as any).title} className="w-full h-48 object-cover" />
        )}
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2">
          {recipe ? (recipe as any).title : `Token ID: ${tokenId.toString()}`}
        </h3>
        <p className="text-sm text-muted-foreground">
            Token ID: {tokenId.toString()}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col gap-2">
        <div className="w-full">
          <Label htmlFor={`price-${tokenId.toString()}`}>Sale Price ($LSK)</Label>
          <Input
            id={`price-${tokenId.toString()}`}
            type="number"
            placeholder="0.1"
            step="0.01"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
          />
        </div>
        <Button
          className="w-full"
          onClick={handleListForSale}
        >
          List for Sale
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NftCard;