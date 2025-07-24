import { useAccount, useReadContract } from "wagmi";
import Header from "@/components/Header";
import NftCard from "@/components/NftCard";
import RecipeBook from "./../../smartcontract/artifacts/contracts/RecipeBook.sol/RecipeBook.json";
import { RECIPE_BOOK_ADDRESS } from "@/constants";

const MyNfts = () => {
  const { address: account } = useAccount();

  const { data: nfts, refetch } = useReadContract({
    abi: RecipeBook.abi,
    address: RECIPE_BOOK_ADDRESS,
    functionName: 'getUserNFTs',
    args: [account],
    query: {
      enabled: !!account,
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">My Recipe NFTs</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(nfts as bigint[])?.map((nft) => (
            <NftCard key={nft.toString()} tokenId={nft} refetchNfts={refetch} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyNfts;