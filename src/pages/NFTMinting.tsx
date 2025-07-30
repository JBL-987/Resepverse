import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Upload, Star, Clock, Coins, Award, Image, FileText, Sparkles, Zap, TrendingUp, Gem } from 'lucide-react';
import Header from '@/components/Header';
import { useWriteContract, useAccount, usePublicClient } from 'wagmi';
import { parseEther, parseEventLogs } from 'viem';
import { useToast } from '@/components/ui/use-toast';
import RecipeBook from "./../../smartcontract/artifacts/contracts/RecipeBook.sol/RecipeBook.json";
import { RECIPE_BOOK_ADDRESS } from '@/constants';
import { useRecipeStore } from '@/store/recipestore';
import Swal from 'sweetalert2';

const NFTMinting = () => {
  const [mintData, setMintData] = useState({
    title: '',
    description: '',
    category: '',
    cookTime: '',
    difficulty: '',
    price: '0.1',
    royalty: '5',
    ingredients: '',
    instructions: ''
  });
  const [isMinting, setIsMinting] = useState(false);
  const { toast } = useToast();
  const { writeContractAsync } = useWriteContract();
  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient();
  const { fetchRecipes } = useRecipeStore(); // Only use fetchRecipes to refresh the list

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setMintData({
      ...mintData,
      [e.target.name]: e.target.value
    });
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMinting(true);
    
    try {
        if (!account) {
          await Swal.fire({
            title: '🔗 Wallet Not Connected',
            text: 'Please connect your wallet to mint NFTs.',
            icon: 'warning',
            background: '#1f2937',
            color: '#ffffff',
            confirmButtonColor: '#f97316',
            confirmButtonText: 'OK'
          });
          setIsMinting(false);
          return;
        }

        // Step 1: Submit Recipe to Blockchain
        const submitTxHash = await writeContractAsync({
            abi: RecipeBook.abi,
            address: RECIPE_BOOK_ADDRESS,
            functionName: 'submitRecipe',
            args: [
                mintData.title,
                JSON.stringify(mintData.ingredients.split('\n').filter(item => item.trim() !== '')),
                JSON.stringify(mintData.instructions.split('\n').filter(item => item.trim() !== '')),
                "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400" // Recipe image
            ],
            account,
            chain,
        });

        // Wait for transaction confirmation
        const transactionReceipt = await publicClient.waitForTransactionReceipt({ hash: submitTxHash });
        
        // Parse the RecipeSubmitted event to get the recipe ID
        const logs = parseEventLogs({
            abi: RecipeBook.abi,
            logs: transactionReceipt.logs,
            eventName: 'RecipeSubmitted'
        });
        const recipeId = (logs[0] as any).args.recipeId;

        // Step 2: Mint the Recipe as NFT
        const mintPrice = parseEther(mintData.price);
        const mintTxHash = await writeContractAsync({
            abi: RecipeBook.abi,
            address: RECIPE_BOOK_ADDRESS,
            functionName: 'mintRecipeNFT',
            args: [
                recipeId,
                mintPrice,
                parseInt(mintData.royalty),
                mintData.description,
                `https://resepverse.com/nft/${recipeId}`, // Token URI
            ],
            value: mintPrice, // This is the actual payment - user pays the mint price
            account,
            chain,
        });

        // Wait for minting transaction confirmation
        const mintReceipt = await publicClient.waitForTransactionReceipt({ hash: mintTxHash });
        
        // Parse the NFTMinted event to get the token ID
        const mintLogs = parseEventLogs({
            abi: RecipeBook.abi,
            logs: mintReceipt.logs,
            eventName: 'NFTMinted'
        });
        const tokenId = (mintLogs[0] as any).args.tokenId;

        // Refresh the recipes list to include the new NFT recipe
        await fetchRecipes();

        // Show success alert with transaction details
        await Swal.fire({
          title: '🎉 NFT Minted Successfully!',
          html: `
            <div class="text-center">
              <div class="text-6xl mb-4">💎</div>
              <p class="text-lg mb-2">Your recipe "<strong>${mintData.title}</strong>" has been minted as NFT #${tokenId}!</p>
              <p class="text-sm text-gray-400 mb-2">Recipe ID: ${recipeId}</p>
              <p class="text-sm text-gray-400 mb-2">Transaction Hash: ${mintTxHash.slice(0, 10)}...${mintTxHash.slice(-8)}</p>
              <p class="text-sm text-gray-400">It's now available for trading and can be found in search results.</p>
            </div>
          `,
          icon: 'success',
          background: '#1f2937',
          color: '#ffffff',
          confirmButtonColor: '#f97316',
          confirmButtonText: '🚀 View in Marketplace',
          showClass: {
            popup: 'animate__animated animate__zoomIn'
          },
          hideClass: {
            popup: 'animate__animated animate__zoomOut'
          }
        });

        // Reset form
        setMintData({
          title: '',
          description: '',
          category: '',
          cookTime: '',
          difficulty: '',
          price: '0.1',
          royalty: '5',
          ingredients: '',
          instructions: ''
        });

    } catch (error: any) {
      console.error('Minting error:', error);
      
      let errorMessage = 'There was an error minting your recipe NFT. Please try again.';
      
      // Handle specific error types
      if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction was cancelled by user.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds to complete the transaction.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message?.includes('Recipe already minted as NFT')) {
        errorMessage = 'This recipe has already been minted as an NFT.';
      } else if (error.message?.includes('Not recipe creator')) {
        errorMessage = 'Only the recipe creator can mint it as an NFT.';
      } else if (error.message?.includes('Royalty too high')) {
        errorMessage = 'Royalty percentage must be 20% or less.';
      }
      
      // Show error alert
      await Swal.fire({
        title: '❌ Minting Failed',
        text: errorMessage,
        icon: 'error',
        background: '#1f2937',
        color: '#ffffff',
        confirmButtonColor: '#f97316',
        confirmButtonText: 'Try Again'
      });
    } finally {
      setIsMinting(false);
    }
  };

  const categories = [
    'Italian', 'Asian', 'Mexican', 'French', 'Indian', 'Mediterranean',
    'American', 'Japanese', 'Thai', 'Chinese', 'Korean', 'Other'
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Simple animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <Header />
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="relative group">
            <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl transform transition-all duration-500 group-hover:scale-110">
              <Gem className="w-12 h-12 text-white drop-shadow-lg" />
              <div className="absolute inset-0 bg-orange-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
            </div>
            <Sparkles className="absolute top-0 right-1/3 w-6 h-6 text-orange-400 animate-bounce delay-300" />
            <Sparkles className="absolute bottom-0 left-1/3 w-4 h-4 text-orange-400 animate-bounce delay-700" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-orange-400">
            Mint Your Recipe as NFT
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your culinary creations into
            <span className="text-orange-400 font-semibold"> unique digital assets </span>
            and earn royalties forever
          </p>
          <div className="flex justify-center space-x-2 mb-8">
            <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm flex items-center space-x-1">
              <Gem className="w-4 h-4" />
              <span>💎 Premium NFTs</span>
            </div>
            <div className="bg-orange-600 text-white px-4 py-2 rounded-full text-sm flex items-center space-x-1">
              <TrendingUp className="w-4 h-4" />
              <span>📈 Earn Royalties</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Minting Form */}
          <div className="lg:col-span-2 animate-slide-in-left">
            <Card className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-orange-500/30 transition-all duration-500">
              <CardHeader className="pb-6">
                <CardTitle className="text-3xl flex items-center text-orange-400">
                  <Gem className="w-8 h-8 mr-3 text-orange-400" />
                  Create Recipe NFT
                </CardTitle>
                <p className="text-gray-400 text-lg">Fill in the details to mint your recipe as an NFT</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMint} className="space-y-8">
                  {/* Basic Info */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-orange-400">
                      Recipe Information
                    </h3>
                    
                    <div className="group">
                      <Label htmlFor="title" className="text-white group-focus-within:text-orange-400 transition-colors duration-300">
                        Recipe Title *
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        value={mintData.title}
                        onChange={handleInputChange}
                        placeholder="Enter your recipe title"
                        className="bg-gray-800/50 border-gray-700 focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-300"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="group">
                        <Label htmlFor="category" className="text-white group-focus-within:text-orange-400 transition-colors duration-300">
                          Category *
                        </Label>
                        <select
                          id="category"
                          name="category"
                          value={mintData.category}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800/50 text-white focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-300"
                          required
                        >
                          <option value="">Select category</option>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div className="group">
                        <Label htmlFor="cookTime" className="text-white group-focus-within:text-orange-400 transition-colors duration-300">
                          Cook Time (minutes) *
                        </Label>
                        <Input
                          id="cookTime"
                          name="cookTime"
                          type="number"
                          value={mintData.cookTime}
                          onChange={handleInputChange}
                          placeholder="30"
                          className="bg-gray-800/50 border-gray-700 focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-300"
                          required
                        />
                      </div>
                      <div className="group">
                        <Label htmlFor="difficulty" className="text-white group-focus-within:text-orange-400 transition-colors duration-300">
                          Difficulty *
                        </Label>
                        <select
                          id="difficulty"
                          name="difficulty"
                          value={mintData.difficulty}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800/50 text-white focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-300"
                          required
                        >
                          <option value="">Select difficulty</option>
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                    </div>

                    <div className="group">
                      <Label htmlFor="description" className="text-white group-focus-within:text-orange-400 transition-colors duration-300">
                        Recipe Description *
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={mintData.description}
                        onChange={handleInputChange}
                        placeholder="Describe your recipe, its origins, and what makes it special..."
                        rows={3}
                        className="bg-gray-800/50 border-gray-700 focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-300 resize-none"
                        required
                      />
                    </div>
                  </div>

                  <Separator className="bg-gray-700" />

                  {/* Recipe Content */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-orange-400">
                      Recipe Content
                    </h3>
                    
                    <div className="group">
                      <Label htmlFor="ingredients" className="text-white group-focus-within:text-orange-400 transition-colors duration-300">
                        Ingredients *
                      </Label>
                      <Textarea
                        id="ingredients"
                        name="ingredients"
                        value={mintData.ingredients}
                        onChange={handleInputChange}
                        placeholder="List all ingredients with quantities (one per line)..."
                        rows={5}
                        className="bg-gray-800/50 border-gray-700 focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-300 resize-none"
                        required
                      />
                    </div>

                    <div className="group">
                      <Label htmlFor="instructions" className="text-white group-focus-within:text-orange-400 transition-colors duration-300">
                        Cooking Instructions *
                      </Label>
                      <Textarea
                        id="instructions"
                        name="instructions"
                        value={mintData.instructions}
                        onChange={handleInputChange}
                        placeholder="Step-by-step cooking instructions..."
                        rows={6}
                        className="bg-gray-800/50 border-gray-700 focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-300 resize-none"
                        required
                      />
                    </div>

                    <div className="border-2 border-dashed border-orange-500/30 rounded-lg p-8 text-center bg-orange-500/5 hover:bg-orange-500/10 transition-all duration-300 group">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-orange-400 group-hover:scale-110 transition-transform duration-300" />
                      <p className="text-orange-300 mb-2 font-medium">Upload Recipe Images</p>
                      <p className="text-sm text-gray-400">Drag and drop or click to upload high-quality images of your dish</p>
                      <Button variant="outline" className="mt-4 border-orange-500/50 text-orange-400 hover:bg-orange-500/10">
                        <Image className="w-4 h-4 mr-2" />
                        Choose Files
                      </Button>
                    </div>
                  </div>

                  <Separator className="bg-gray-700" />

                  {/* NFT Settings */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-orange-400">
                      NFT Settings
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="group">
                        <Label htmlFor="price" className="text-white group-focus-within:text-orange-400 transition-colors duration-300">
                          Mint Price ($LSK) *
                        </Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          step="0.01"
                          value={mintData.price}
                          onChange={handleInputChange}
                          placeholder="0.1"
                          className="bg-gray-800/50 border-gray-700 focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-300"
                          required
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          This is the amount you'll pay to mint the NFT
                        </p>
                      </div>
                      <div className="group">
                        <Label htmlFor="royalty" className="text-white group-focus-within:text-orange-400 transition-colors duration-300">
                          Royalty Percentage (%) *
                        </Label>
                        <Input
                          id="royalty"
                          name="royalty"
                          type="number"
                          min="0"
                          max="20"
                          value={mintData.royalty}
                          onChange={handleInputChange}
                          placeholder="5"
                          className="bg-gray-800/50 border-gray-700 focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-300"
                          required
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          You'll earn <span className="text-orange-400 font-medium">{mintData.royalty}%</span> from future sales
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-gray-700" />

                  {/* Cost Breakdown */}
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-6">
                    <h4 className="font-bold text-lg mb-4 text-orange-400">
                      Minting Cost Breakdown
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Mint Price:</span>
                        <span className="text-white font-medium">{mintData.price} $LSK</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Platform Fee (included):</span>
                        <span className="text-white font-medium">{(parseFloat(mintData.price || '0') * 0.025).toFixed(4)} $LSK</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Gas Fee (estimated):</span>
                        <span className="text-white font-medium">~0.001 $LSK</span>
                      </div>
                      <Separator className="bg-orange-500/20" />
                      <div className="flex justify-between items-center text-lg">
                        <span className="text-orange-400 font-bold">You Pay:</span>
                        <span className="text-orange-400 font-bold">
                          {mintData.price} $LSK + gas
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isMinting}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none"
                    size="lg"
                  >
                    {isMinting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Minting NFT...
                      </>
                    ) : (
                      <>
                        <Gem className="w-5 h-5 mr-2" />
                        Mint Recipe NFT
                        <Sparkles className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 animate-slide-in-right">
            {/* Top Selling NFTs */}
            <Card className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-orange-500/30 transition-all duration-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center text-orange-400">
                  <TrendingUp className="w-5 h-5 mr-2 text-orange-400" />
                  🔥 Top Selling Recipe NFTs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center text-gray-400 py-8">
                  <Gem className="w-12 h-12 mx-auto mb-3 text-orange-400 opacity-50" />
                  <p>Top NFTs will appear here</p>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-orange-500/30 transition-all duration-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center text-orange-400">
                  <Zap className="w-5 h-5 mr-2 text-orange-400" />
                  💡 Minting Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <Star className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">High-quality photos increase NFT value by up to 300%</p>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <FileText className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">Detailed instructions make your recipe more valuable</p>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <Clock className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">Unique family recipes sell better than common ones</p>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <Coins className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">Set competitive prices - check similar recipes first</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTMinting;