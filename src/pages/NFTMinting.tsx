import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Clock, Award, FileText, Sparkles, Zap, TrendingUp, Gem, ChefHat, Upload, Image } from 'lucide-react';
import Header from '@/components/Header';
import { useWriteContract, useAccount, usePublicClient } from 'wagmi';
import { parseEther, parseEventLogs } from 'viem';
import { useToast } from '@/components/ui/use-toast';
import { resepverseABI } from '@/utils/abi';
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
    royalty: '5',
    ingredients: '',
    instructions: ''
  });
  const [isMinting, setIsMinting] = useState(false);
  const { toast } = useToast();
  const { writeContractAsync } = useWriteContract();
  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient();
  const { fetchRecipes } = useRecipeStore();

  const handleInputChange = (e) => {
    setMintData({
      ...mintData,
      [e.target.name]: e.target.value
    });
  };

  const handleMint = async () => {
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

        // Validate required fields
        if (!mintData.title || !mintData.description || !mintData.ingredients || !mintData.instructions) {
          await Swal.fire({
            title: '❌ Missing Information',
            text: 'Please fill in all required fields.',
            icon: 'error',
            background: '#1f2937',
            color: '#ffffff',
            confirmButtonColor: '#f97316',
            confirmButtonText: 'OK'
          });
          setIsMinting(false);
          return;
        }

        // Prepare ingredients and instructions as JSON strings
        const ingredientsArray = mintData.ingredients.split('\n').filter(item => item.trim() !== '');
        const instructionsArray = mintData.instructions.split('\n').filter(item => item.trim() !== '');
        
        // Default image URL
        const imageURL = "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400";
        
        // Create token URI
        const tokenURI = `https://resepverse.com/nft/metadata/${Date.now()}`;

        // Mint the Recipe NFT (free minting)
        const mintTxHash = await writeContractAsync({
            abi: resepverseABI,
            address: RECIPE_BOOK_ADDRESS,
            functionName: 'mintRecipeNFT',
            args: [
                mintData.title,
                JSON.stringify(ingredientsArray),
                JSON.stringify(instructionsArray),
                imageURL,
                mintData.description,
                tokenURI,
                BigInt(parseInt(mintData.royalty))
            ],
            account,
            chain,
        });

        // Wait for confirmation
        const mintReceipt = await publicClient.waitForTransactionReceipt({ hash: mintTxHash });
        
        // Parse the event to get token ID
        const mintLogs = parseEventLogs({
            abi: resepverseABI,
            logs: mintReceipt.logs,
            eventName: 'RecipeNFTMinted'
        });
        const tokenId = mintLogs[0]?.args.tokenId;

        // Refresh recipes
        await fetchRecipes();

        // Success message
        const result = await Swal.fire({
          title: '🎉 NFT Minted Successfully!',
          html: `
            <div class="text-center">
              <div class="text-6xl mb-4">💎</div>
              <p class="text-lg mb-2">Your recipe "<strong>${mintData.title}</strong>" has been minted as NFT #${tokenId}!</p>
              <p class="text-sm text-gray-400 mb-2">Transaction Hash: ${mintTxHash.slice(0, 10)}...${mintTxHash.slice(-8)}</p>
              <p class="text-sm text-gray-400">It's now available for trading and can be found in search results.</p>
            </div>
          `,
          icon: 'success',
          background: '#1f2937',
          color: '#ffffff',
          confirmButtonColor: '#f97316',
          confirmButtonText: '🚀 View My NFTs',
          showDenyButton: true,
          denyButtonText: 'Stay Here',
          denyButtonColor: '#374151'
        });
        
        if (result.isConfirmed) {
          window.location.href = '/my-nfts';
        }

        // Reset form
        setMintData({
          title: '',
          description: '',
          category: '',
          cookTime: '',
          difficulty: '',
          royalty: '5',
          ingredients: '',
          instructions: ''
        });

    } catch (error) {
      console.error('Minting error:', error);
      
      let errorMessage = 'There was an error minting your recipe NFT. Please try again.';
      
      if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction was cancelled by user.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas fees.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
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
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <Header />
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="relative group mb-6">
            <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto shadow-2xl transform transition-all duration-500 group-hover:scale-110">
              <ChefHat className="w-10 h-10 text-white" />
              <div className="absolute inset-0 bg-orange-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-orange-400">
            Mint Your Recipe as NFT
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
            Transform your culinary creations into 
            <span className="text-orange-400 font-semibold"> unique digital assets </span>
            - completely free!
          </p>
          <div className="inline-flex bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4 mr-2" />
            ✨ Free Minting - No Cost!
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-orange-500/30 transition-all duration-500">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl flex items-center text-orange-400">
                <Gem className="w-6 h-6 mr-3" />
                Create Recipe NFT
              </CardTitle>
              <p className="text-gray-400">Fill in the details to mint your recipe as an NFT</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-white">
                      Recipe Title *
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={mintData.title}
                      onChange={handleInputChange}
                      placeholder="Enter your recipe title"
                      className="bg-gray-800/50 border-gray-700 focus:border-orange-500 focus:ring-orange-500/20"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="category" className="text-white">
                        Category
                      </Label>
                      <Select 
                        value={mintData.category} 
                        onValueChange={(value) => {
                          setMintData({
                            ...mintData,
                            category: value
                          });
                        }}
                      >
                        <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white focus:border-orange-500">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-gray-700">
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="cookTime" className="text-white">
                        Cook Time (minutes)
                      </Label>
                      <Input
                        id="cookTime"
                        name="cookTime"
                        type="number"
                        value={mintData.cookTime}
                        onChange={handleInputChange}
                        placeholder="30"
                        className="bg-gray-800/50 border-gray-700 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="difficulty" className="text-white">
                        Difficulty
                      </Label>
                      <Select 
                        value={mintData.difficulty} 
                        onValueChange={(value) => {
                          setMintData({
                            ...mintData,
                            difficulty: value
                          });
                        }}
                      >
                        <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white focus:border-orange-500">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-gray-700">
                          <SelectItem value="Easy">Easy</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-white">
                      Recipe Description *
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={mintData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your recipe, its origins, and what makes it special..."
                      rows={3}
                      className="bg-gray-800/50 border-gray-700 focus:border-orange-500 resize-none"
                      required
                    />
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Recipe Content */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-orange-400">
                    Recipe Content
                  </h3>
                  
                  <div>
                    <Label htmlFor="ingredients" className="text-white">
                      Ingredients *
                    </Label>
                    <Textarea
                      id="ingredients"
                      name="ingredients"
                      value={mintData.ingredients}
                      onChange={handleInputChange}
                      placeholder="List ingredients (one per line)&#10;Example:&#10;2 cups flour&#10;1 tsp salt&#10;3 eggs"
                      rows={4}
                      className="bg-gray-800/50 border-gray-700 focus:border-orange-500 resize-none"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="instructions" className="text-white">
                      Cooking Instructions *
                    </Label>
                    <Textarea
                      id="instructions"
                      name="instructions"
                      value={mintData.instructions}
                      onChange={handleInputChange}
                      placeholder="Step-by-step cooking instructions&#10;Example:&#10;1. Mix flour and salt in a bowl&#10;2. Add eggs and mix well&#10;3. Cook for 20 minutes"
                      rows={5}
                      className="bg-gray-800/50 border-gray-700 focus:border-orange-500 resize-none"
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

                {/* Royalty Setting */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-orange-400">
                    Royalty Settings
                  </h3>
                  
                  <div className="max-w-xs">
                    <Label htmlFor="royalty" className="text-white">
                      Royalty Percentage (%)
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
                      className="bg-gray-800/50 border-gray-700 focus:border-orange-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      You'll earn <span className="text-orange-400 font-medium">{mintData.royalty}%</span> from future sales (max 20%)
                    </p>
                  </div>
                </div>

                {/* Free Minting Info */}
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-400 mb-2 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Free Minting!
                  </h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>✅ No minting fees</p>
                    <p>✅ Only small gas fee required (~$0.001)</p>
                    <p>✅ Keep 100% ownership of your NFT</p>
                    <p>✅ Earn royalties from future sales</p>
                  </div>
                </div>

                <Button
                  onClick={handleMint}
                  disabled={isMinting}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white font-semibold py-3 text-lg transition-all duration-300 disabled:transform-none border border-orange-500 hover:border-orange-600"
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
                      Mint Recipe NFT (Free!)
                      <Sparkles className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tips Section */}
          <Card className="mt-8 bg-gray-900/50 backdrop-blur-sm border border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-orange-400">
                <Zap className="w-5 h-5 mr-2" />
                💡 Tips for Better NFTs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
                  <Star className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">Write clear, detailed instructions</p>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
                  <FileText className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">Include precise ingredient measurements</p>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
                  <Clock className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">Add cooking tips and tricks</p>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
                  <Award className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">Share the story behind your recipe</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NFTMinting;