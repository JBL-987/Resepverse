import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Swal from 'sweetalert2';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Globe, 
  TrendingUp, 
  Clock, 
  Users, 
  Gem, 
  Star, 
  Filter,
  ShoppingCart,
  Heart,
  Eye,
  Wallet,
  Tag,
  ChefHat,
  Award,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import Header from '@/components/Header';
import { RECIPE_BOOK_ADDRESS } from '@/constants';
import { resepverseABI } from '@/utils/abi';
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { formatEther, parseEther } from 'viem';

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFilter, setSearchFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showOnlyForSale, setShowOnlyForSale] = useState(false);
  const [isVoting, setIsVoting] = useState({});
  const [isPurchasing, setIsPurchasing] = useState({});

  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  // Get all NFTs from contract
  const { data: allNFTsData, isLoading: isLoadingNFTs, refetch: refetchNFTs } = useReadContract({
    address: RECIPE_BOOK_ADDRESS,
    abi: resepverseABI,
    functionName: 'getAllNFTs',
  });

  // Get NFTs for sale
  const { data: nftsForSaleData, isLoading: isLoadingForSale } = useReadContract({
    address: RECIPE_BOOK_ADDRESS as `0x${string}`,
    abi: resepverseABI,
    functionName: 'getNFTsForSale',
  });

  // Get total NFTs count
  const { data: totalNFTs } = useReadContract({
    address: RECIPE_BOOK_ADDRESS as `0x${string}`,
    abi: resepverseABI,
    functionName: 'getTotalNFTs',
  });

  // Process NFT data
  const processNFTData = () => {
    if (!allNFTsData || !allNFTsData[0] || !allNFTsData[1]) {
      return [];
    }

    const [tokenIds, metadata] = allNFTsData;
    const forSaleIds = nftsForSaleData || [];

    return tokenIds.map((tokenId, index) => ({
      id: Number(tokenId),
      tokenId: Number(tokenId),
      creator: metadata[index].creator,
      title: metadata[index].title,
      ingredients: metadata[index].ingredients,
      instructions: metadata[index].instructions,
      imageURL: metadata[index].imageURL,
      description: metadata[index].description,
      votes: Number(metadata[index].votes),
      royaltyPercent: Number(metadata[index].royaltyPercent),
      mintedAt: Number(metadata[index].mintedAt) * 1000, // Convert to milliseconds
      isForSale: metadata[index].isForSale,
      salePrice: formatEther(metadata[index].salePrice || BigInt(0))
    }));
  };

  const allNFTs = processNFTData();
  const isLoading = isLoadingNFTs || isLoadingForSale;

  // Enhanced search functionality
  const performSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    setTimeout(() => {
      let filtered = allNFTs.filter((nft) => {
        const matchesQuery =
          nft.title?.toLowerCase().includes(query.toLowerCase()) ||
          nft.description?.toLowerCase().includes(query.toLowerCase()) ||
          nft.ingredients?.toLowerCase().includes(query.toLowerCase()) ||
          nft.creator?.toLowerCase().includes(query.toLowerCase());

        // Apply filters
        if (searchFilter === 'for_sale' && !nft.isForSale) return false;
        if (searchFilter === 'nfts' && nft.votes < 50) return false; // High-voted NFTs
        if (showOnlyForSale && !nft.isForSale) return false;

        // Price range filter
        if (priceRange.min && parseFloat(nft.salePrice) < parseFloat(priceRange.min)) return false;
        if (priceRange.max && parseFloat(nft.salePrice) > parseFloat(priceRange.max)) return false;

        return matchesQuery;
      });

      // Apply sorting
      filtered = applySorting(filtered);
      
      setSearchResults(filtered);
      setIsSearching(false);
    }, 300);
  };

  const applySorting = (nfts) => {
    return [...nfts].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.mintedAt - a.mintedAt;
        case 'oldest':
          return a.mintedAt - b.mintedAt;
        case 'votes':
          return b.votes - a.votes;
        case 'price_low':
          return parseFloat(a.salePrice || '999') - parseFloat(b.salePrice || '999');
        case 'price_high':
          return parseFloat(b.salePrice || '0') - parseFloat(a.salePrice || '0');
        default:
          return 0;
      }
    });
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchFilter, sortBy, priceRange, showOnlyForSale, allNFTs]);

  const displayNFTs = searchQuery ? searchResults : applySorting(showOnlyForSale ? allNFTs.filter(nft => nft.isForSale) : allNFTs);

  // Vote for NFT using contract function
  const handleVoteNFT = async (tokenId) => {
    if (!isConnected) {
      await Swal.fire({
        icon: 'warning',
        title: 'Wallet Not Connected',
        text: 'Please connect your wallet first to vote for NFTs!',
        background: '#1f2937',
        color: '#ffffff',
        confirmButtonColor: '#f97316',
        confirmButtonText: 'Understood'
      });
      return;
    }

    setIsVoting(prev => ({ ...prev, [tokenId]: true }));
    
    try {
      await writeContractAsync({
        address: RECIPE_BOOK_ADDRESS,
        abi: resepverseABI,
        functionName: 'voteRecipeNFT',
        args: [BigInt(tokenId)],
        account: address,
      } as any);

      await Swal.fire({
        icon: 'success',
        title: 'Vote Successful!',
        text: `Successfully voted for NFT #${tokenId}!`,
        background: '#1f2937',
        color: '#ffffff',
        confirmButtonColor: '#f97316',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
      
      refetchNFTs(); // Refresh data
    } catch (error) {
      console.error('Vote failed:', error);
      
      await Swal.fire({
        icon: 'error',
        title: 'Vote Failed',
        text: 'Vote failed. You may have already voted for this NFT or there was a network issue.',
        background: '#1f2937',
        color: '#ffffff',
        confirmButtonColor: '#f97316',
        confirmButtonText: 'Try Again'
      });
    } finally {
      setIsVoting(prev => ({ ...prev, [tokenId]: false }));
    }
  };

  // Buy NFT using contract function
  const handleBuyNFT = async (tokenId, price) => {
    if (!isConnected) {
      await Swal.fire({
        icon: 'warning',
        title: 'Wallet Not Connected',
        text: 'Please connect your wallet first to purchase NFTs!',
        background: '#1f2937',
        color: '#ffffff',
        confirmButtonColor: '#f97316',
        confirmButtonText: 'Understood'
      });
      return;
    }

    // Show confirmation dialog before purchase
    const result = await Swal.fire({
      icon: 'question',
      title: 'Confirm Purchase',
      html: `
        <div class="text-center">
          <p class="mb-4">Are you sure you want to purchase this NFT?</p>
          <div class="bg-gray-800 rounded-lg p-4 inline-block">
            <p class="text-orange-400 font-bold text-lg">NFT #${tokenId}</p>
            <p class="text-green-400 font-bold text-xl">${parseFloat(price).toFixed(4)} ETH</p>
          </div>
        </div>
      `,
      background: '#1f2937',
      color: '#ffffff',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Buy Now!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    setIsPurchasing(prev => ({ ...prev, [tokenId]: true }));
    
    try {
      const priceInWei = parseEther(price);
      
      await writeContractAsync({
        address: RECIPE_BOOK_ADDRESS,
        abi: resepverseABI,
        functionName: 'buyNFT',
        args: [BigInt(tokenId)],
        value: priceInWei,
        account: address,
      } as any);

      await Swal.fire({
        icon: 'success',
        title: 'Purchase Successful!',
        html: `
          <div class="text-center">
            <p class="mb-4">Congratulations! You successfully purchased:</p>
            <div class="bg-gray-800 rounded-lg p-4 inline-block">
              <p class="text-orange-400 font-bold text-lg">NFT #${tokenId}</p>
              <p class="text-green-400 font-bold text-xl">${parseFloat(price).toFixed(4)} ETH</p>
            </div>
            <p class="mt-4 text-sm text-gray-400">The NFT is now in your wallet!</p>
          </div>
        `,
        background: '#1f2937',
        color: '#ffffff',
        confirmButtonColor: '#f97316',
        confirmButtonText: 'Awesome!',
        showConfirmButton: true,
        timer: 5000,
        timerProgressBar: true
      });
      
      refetchNFTs(); // Refresh data
    } catch (error) {
      console.error('Purchase failed:', error);
      
      await Swal.fire({
        icon: 'error',
        title: 'Purchase Failed',
        text: 'Purchase failed. Please check your balance and try again.',
        background: '#1f2937',
        color: '#ffffff',
        confirmButtonColor: '#f97316',
        confirmButtonText: 'Try Again'
      });
    } finally {
      setIsPurchasing(prev => ({ ...prev, [tokenId]: false }));
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimeAgo = (timestamp) => {
    const diff = Date.now() - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <Header />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-7xl font-bold text-orange-400 mb-6">
              Recipe NFT Marketplace
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Discover, trade, and collect exclusive recipe NFTs from master chefs worldwide
            </p>
          </div>

          {/* Wallet Connection Alert */}
          {!isConnected && (
            <div className="mb-8 bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-4 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-400 mr-3" />
              <span className="text-yellow-200">Connect your wallet to vote and purchase NFTs</span>
            </div>
          )}

          {/* Enhanced Search & Filter Section */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8 mb-8">
            {/* Search Filters */}
            <div className="flex flex-wrap justify-center mb-6 gap-2">
              <div className="flex bg-gray-800/50 rounded-2xl p-1 border border-gray-700">
                {[
                  { key: 'all', label: 'All NFTs', icon: Globe },
                  { key: 'for_sale', label: 'For Sale', icon: ShoppingCart },
                  { key: 'nfts', label: 'Popular', icon: Gem },
                  { key: 'creators', label: 'Creators', icon: ChefHat }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setSearchFilter(key)}
                    className={`flex items-center px-4 py-2 rounded-xl transition-all duration-300 ${
                      searchFilter === key
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-400 hover:text-orange-400'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search recipes, ingredients, chefs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 bg-gray-800/50 border-gray-700 focus:border-orange-500 focus:ring-orange-500/20 text-white placeholder-gray-400 rounded-2xl text-lg"
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Advanced Filters */}
            <div className="flex flex-wrap justify-center items-center gap-4 mb-4">
              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-orange-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="votes">Most Votes</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>

              {/* Price Range */}
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  placeholder="Min ETH"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="w-24 px-3 py-2 bg-gray-800 border-gray-700 text-white rounded-xl"
                />
                <span className="text-gray-400">-</span>
                <Input
                  type="number"
                  placeholder="Max ETH"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="w-24 px-3 py-2 bg-gray-800 border-gray-700 text-white rounded-xl"
                />
              </div>

              {/* Only For Sale Toggle */}
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyForSale}
                  onChange={(e) => setShowOnlyForSale(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-12 h-6 rounded-full transition-all duration-300 ${showOnlyForSale ? 'bg-orange-500' : 'bg-gray-600'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 transform ${showOnlyForSale ? 'translate-x-6' : 'translate-x-0.5'} translate-y-0.5`}></div>
                </div>
                <span className="text-gray-300">For Sale Only</span>
              </label>
            </div>

            {/* Search Stats */}
            {searchQuery && (
              <div className="text-center">
                <span className="text-gray-400">
                  Found {displayNFTs.length} result{displayNFTs.length !== 1 ? 's' : ''} for "{searchQuery}"
                </span>
              </div>
            )}
          </div>

          {/* NFT Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden bg-gray-800/30 border-gray-700 animate-pulse">
                    <div className="h-48 bg-gray-700/50" />
                    <CardContent className="p-6">
                      <div className="h-6 bg-gray-700/50 rounded w-3/4 mb-3" />
                      <div className="h-4 bg-gray-700/50 rounded w-full mb-2" />
                      <div className="h-4 bg-gray-700/50 rounded w-2/3 mb-4" />
                      <div className="h-10 bg-gray-700/50 rounded w-full" />
                    </CardContent>
                  </Card>
                ))
              : displayNFTs.map((nft) => (
                  <Card
                    key={nft.id}
                    className="group overflow-hidden bg-gray-800/30 border-gray-700 hover:border-orange-500/50 hover:bg-gray-800/50 transition-all duration-300 hover:scale-105"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={nft.imageURL || 'https://via.placeholder.com/400x200?text=Recipe+NFT'}
                        alt={nft.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Recipe+NFT';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      <div className="absolute top-4 left-4 flex space-x-2">
                        <Badge className="bg-orange-500/90 text-white border-0 backdrop-blur-sm">
                          <Gem className="w-3 h-3 mr-1" />
                          NFT #{nft.id}
                        </Badge>
                        {nft.isForSale && (
                          <Badge className="bg-green-500/90 text-white border-0 backdrop-blur-sm">
                            <Tag className="w-3 h-3 mr-1" />
                            For Sale
                          </Badge>
                        )}
                      </div>
                      
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-gray-900/80 text-orange-400 border-orange-500/30 backdrop-blur-sm">
                          <Heart className="w-3 h-3 mr-1" />
                          {nft.votes}
                        </Badge>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center justify-between text-white/80 text-sm">
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-purple-500/80 text-white text-xs">
                              {nft.royaltyPercent}% Royalty
                            </Badge>
                          </div>
                          {nft.isForSale && parseFloat(nft.salePrice) > 0 && (
                            <div className="flex items-center text-green-300 font-bold">
                              <DollarSign className="w-4 h-4 mr-1" />
                              {parseFloat(nft.salePrice).toFixed(4)} ETH
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-lg text-white group-hover:text-orange-400 transition-colors duration-300 flex-1">
                          {nft.title}
                        </h4>
                      </div>
                      
                      <p className="text-gray-400 mb-2 text-sm">
                        By <span className="text-orange-400 font-medium">{formatAddress(nft.creator)}</span>
                      </p>
                      
                      <p className="text-gray-500 mb-4 text-sm line-clamp-2">
                        {nft.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTimeAgo(nft.mintedAt)}
                        </span>
                        <span className="flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          {nft.votes} votes
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        {nft.isForSale && parseFloat(nft.salePrice) > 0 ? (
                          <Button
                            onClick={() => handleBuyNFT(nft.tokenId, nft.salePrice)}
                            disabled={!isConnected || isPurchasing[nft.tokenId]}
                            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 rounded-xl transition-all duration-300 disabled:opacity-50"
                          >
                            {isPurchasing[nft.tokenId] ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            ) : (
                              <ShoppingCart className="w-4 h-4 mr-2" />
                            )}
                            {isPurchasing[nft.tokenId] ? 'Buying...' : `Buy ${parseFloat(nft.salePrice).toFixed(4)} ETH`}
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleVoteNFT(nft.tokenId)}
                            disabled={!isConnected || isVoting[nft.tokenId]}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-black font-bold py-2 rounded-xl transition-all duration-300 disabled:opacity-50"
                          >
                            {isVoting[nft.tokenId] ? (
                              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                            ) : (
                              <Heart className="w-4 h-4 mr-2" />
                            )}
                            {isVoting[nft.tokenId] ? 'Voting...' : 'Vote'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>

          {/* No results message */}
          {!isLoading && displayNFTs.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-400 mb-2">
                No NFTs found
              </h3>
              <p className="text-gray-500 text-lg mb-2">
                {searchQuery ? `No NFTs found for "${searchQuery}"` : 'No NFTs match your filters'}
              </p>
              <p className="text-sm text-gray-600">
                Try adjusting your search terms or filters
              </p>
            </div>
          )}

          {/* Market Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-800/30 rounded-2xl p-6 text-center border border-gray-700">
              <Gem className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{allNFTs.length}</div>
              <div className="text-gray-400">Total NFTs</div>
            </div>
            <div className="bg-gray-800/30 rounded-2xl p-6 text-center border border-gray-700">
              <ShoppingCart className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{allNFTs.filter(nft => nft.isForSale).length}</div>
              <div className="text-gray-400">For Sale</div>
            </div>
            <div className="bg-gray-800/30 rounded-2xl p-6 text-center border border-gray-700">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{new Set(allNFTs.map(nft => nft.creator)).size}</div>
              <div className="text-gray-400">Creators</div>
            </div>
            <div className="bg-gray-800/30 rounded-2xl p-6 text-center border border-gray-700">
              <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{allNFTs.reduce((sum, nft) => sum + nft.votes, 0)}</div>
              <div className="text-gray-400">Total Votes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;