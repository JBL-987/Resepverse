import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import { useReadContract, useWriteContract, useAccount } from "wagmi";
import { formatEther } from "viem";
import RecipeBook from "./../../smartcontract/artifacts/contracts/RecipeBook.sol/RecipeBook.json";
import { RECIPE_BOOK_ADDRESS } from "@/constants";

const Marketplace = () => {
  const { toast } = useToast();
  const { address: account, chain } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const { data: nfts, refetch } = useReadContract({
    abi: RecipeBook.abi,
    address: RECIPE_BOOK_ADDRESS,
    functionName: 'getNFTsForSale',
  });

  const handleBuyNft = async (nft: any) => {
    if (!account) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await writeContractAsync({
        abi: RecipeBook.abi,
        address: RECIPE_BOOK_ADDRESS,
        functionName: 'buyNFT',
        args: [nft.tokenId],
        value: nft.salePrice,
        account,
        chain,
      });
      toast({
        title: "Success",
        description: "You have successfully purchased this NFT!",
      });
      refetch();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "There was an error purchasing this NFT.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Recipe NFT Marketplace</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(nfts as any[])?.map((nft) => (
            <Card key={nft.tokenId.toString()}>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">
                  Recipe ID: {nft.recipeId.toString()}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Token ID: {nft.tokenId.toString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Price: {formatEther(nft.salePrice)} $LSK
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button className="w-full" onClick={() => handleBuyNft(nft)}>
                  Buy NFT
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;