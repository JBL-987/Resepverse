import { useAccount, useReadContract } from "wagmi";
import Header from "@/components/Header";
import NftCard from "@/components/NftCard";
import RecipeBook from "./../../smartcontract/artifacts/contracts/RecipeBook.sol/RecipeBook.json";
import { RECIPE_BOOK_ADDRESS } from "@/constants";
import { Gem, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <Header />
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <div className="relative group">
            <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl transform transition-all duration-500 group-hover:scale-110">
              <Gem className="w-12 h-12 text-white drop-shadow-lg" />
              <div className="absolute inset-0 bg-orange-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
            </div>
            <Sparkles className="absolute top-0 right-1/3 w-6 h-6 text-orange-400 animate-bounce delay-300" />
            <Sparkles className="absolute bottom-0 left-1/3 w-4 h-4 text-orange-400 animate-bounce delay-700" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-orange-400">
            My Recipe NFTs
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Your collection of <span className="text-orange-400 font-semibold">unique culinary treasures</span> on the blockchain
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(nfts as bigint[])?.length > 0 ? (
            (nfts as bigint[]).map((nft) => (
              <NftCard key={nft.toString()} tokenId={nft} refetchNfts={refetch} />
            ))
          ) : (
            <div className="col-span-1 md:col-span-3 text-center py-16 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl">
              <Gem className="w-16 h-16 mx-auto mb-4 text-orange-400 opacity-50" />
              <h3 className="text-2xl font-bold text-orange-400 mb-2">No NFTs Found</h3>
              <p className="text-gray-400 mb-6">You don't have any recipe NFTs yet.</p>
              <a href="/nft-minting" className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                Mint Your First Recipe NFT
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyNfts;