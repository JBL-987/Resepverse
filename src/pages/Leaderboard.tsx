import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Swal from 'sweetalert2';
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown, 
  Star, 
  Heart, 
  ChefHat, 
  TrendingUp, 
  Users, 
  Calendar,
  Vote,
  Gem,
  Target,
  Flame,
  Zap,
  ThumbsUp,
  Eye,
  DollarSign,
  Clock,
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import Header from '@/components/Header';
import { RECIPE_BOOK_ADDRESS } from '@/constants';
import { resepverseABI } from '@/utils/abi';
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { formatEther } from 'viem';

const Leaderboard = () => {
  const [timeFilter, setTimeFilter] = useState('all'); // all, week, month
  const [categoryFilter, setCategoryFilter] = useState('all'); // all, votes, sales, reputation
  const [isVoting, setIsVoting] = useState({});

  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  // Get all NFTs from contract
  const { data: allNFTsData, isLoading: isLoadingNFTs, refetch: refetchNFTs } = useReadContract({
    address: RECIPE_BOOK_ADDRESS,
    abi: resepverseABI,
    functionName: 'getAllNFTs',
  });

  // Get total NFTs count
  const { data: totalNFTs } = useReadContract({
    address: RECIPE_BOOK_ADDRESS,
    abi: resepverseABI,
    functionName: 'getTotalNFTs',
  });

  // Process NFT data
  const processNFTData = () => {
    if (!allNFTsData || !allNFTsData[0] || !allNFTsData[1]) {
      return [];
    }

    const [tokenIds, metadata] = allNFTsData;

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
  const isLoading = isLoadingNFTs;

  // Process Chef data from NFTs
  const processChefData = () => {
    const chefMap = new Map();
    
    allNFTs.forEach(nft => {
      if (!chefMap.has(nft.creator)) {
        chefMap.set(nft.creator, {
          address: nft.creator,
          name: `Chef ${nft.creator.slice(0, 6)}...${nft.creator.slice(-4)}`,
          totalNFTs: 0,
          totalVotes: 0,
          totalForSale: 0,
          totalSalesValue: 0,
          reputation: 0,
          firstMinted: nft.mintedAt,
          latestMinted: nft.mintedAt,
          nfts: []
        });
      }
      
      const chef = chefMap.get(nft.creator);
      chef.totalNFTs += 1;
      chef.totalVotes += nft.votes;
      chef.reputation += nft.votes * 10; // Calculate reputation based on votes
      chef.nfts.push(nft);
      
      if (nft.isForSale) {
        chef.totalForSale += 1;
        chef.totalSalesValue += parseFloat(nft.salePrice);
      }
      
      if (nft.mintedAt < chef.firstMinted) chef.firstMinted = nft.mintedAt;
      if (nft.mintedAt > chef.latestMinted) chef.latestMinted = nft.mintedAt;
    });

    return Array.from(chefMap.values());
  };

  const chefData = processChefData();

  // Get top NFTs based on votes
  const getTopNFTs = () => {
    let filteredNFTs = [...allNFTs];
    
    // Apply time filter
    if (timeFilter !== 'all') {
      const now = Date.now();
      const timeThreshold = timeFilter === 'week' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
      filteredNFTs = filteredNFTs.filter(nft => (now - nft.mintedAt) <= timeThreshold);
    }

    // Sort by votes (descending)
    return filteredNFTs.sort((a, b) => b.votes - a.votes);
  };

  // Get top chefs based on various metrics
  const getTopChefs = () => {
    let sortedChefs = [...chefData];
    
    switch (categoryFilter) {
      case 'votes':
        sortedChefs.sort((a, b) => b.totalVotes - a.totalVotes);
        break;
      case 'sales':
        sortedChefs.sort((a, b) => b.totalSalesValue - a.totalSalesValue);
        break;
      case 'reputation':
        sortedChefs.sort((a, b) => b.reputation - a.reputation);
        break;
      default:
        sortedChefs.sort((a, b) => b.totalNFTs - a.totalNFTs);
    }

    return sortedChefs;
  };

  // Vote for NFT
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
        address: RECIPE_BOOK_ADDRESS as `0x${string}`,
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

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-8 h-8 text-yellow-400" />;
      case 2:
        return <Medal className="w-8 h-8 text-gray-400" />;
      case 3:
        return <Award className="w-8 h-8 text-amber-600" />;
      default:
        return <Trophy className="w-6 h-6 text-orange-400" />;
    }
  };

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 3:
        return 'bg-gradient-to-r from-amber-500 to-amber-700';
      default:
        return 'bg-gradient-to-r from-orange-400 to-orange-600';
    }
  };

  const topNFTs = getTopNFTs();
  const topChefs = getTopChefs();

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
              NFT Leaderboard
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Discover the most popular NFTs and top-performing chefs in the ResepVerse
            </p>
          </div>

          {/* Wallet Connection Alert */}
          {!isConnected && (
            <div className="mb-8 bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-4 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-400 mr-3" />
              <span className="text-yellow-200">Connect your wallet to vote for NFTs</span>
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-gray-800/30 rounded-2xl p-6 text-center border border-gray-700">
              <Gem className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{allNFTs.length}</div>
              <div className="text-gray-400">Total NFTs</div>
            </div>
            <div className="bg-gray-800/30 rounded-2xl p-6 text-center border border-gray-700">
              <ChefHat className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{chefData.length}</div>
              <div className="text-gray-400">Active Chefs</div>
            </div>
            <div className="bg-gray-800/30 rounded-2xl p-6 text-center border border-gray-700">
              <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{allNFTs.reduce((sum, nft) => sum + nft.votes, 0)}</div>
              <div className="text-gray-400">Total Votes</div>
            </div>
            <div className="bg-gray-800/30 rounded-2xl p-6 text-center border border-gray-700">
              <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{allNFTs.filter(nft => nft.isForSale).length}</div>
              <div className="text-gray-400">For Sale</div>
            </div>
          </div>

          {/* NFT Leaderboard Section */}
          <div className="mb-20">
            {/* NFT Filters */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6 mb-8">
              <div className="flex flex-wrap items-center justify-center gap-4">
                <h2 className="text-2xl font-bold text-orange-400 mr-6">🏆 Top NFTs</h2>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-orange-400" />
                  <span className="text-gray-300">Time Period:</span>
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-orange-500"
                  >
                    <option value="all">All Time</option>
                    <option value="month">Last 30 Days</option>
                    <option value="week">Last 7 Days</option>
                  </select>
                </div>
                
                <Button
                  onClick={() => refetchNFTs()}
                  className="bg-orange-500 hover:bg-orange-600 text-black"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Top 3 NFTs - Podium Style */}
            {!isLoading && topNFTs.length >= 3 && (
              <div className="mb-12">
                <h3 className="text-3xl font-bold text-center mb-8 text-orange-400">🏆 Top 3 NFTs 🏆</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* 2nd Place */}
                  <div className="order-1 md:order-1">
                    <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-600 hover:border-gray-400 transition-all duration-300">
                      <div className="relative">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                          <div className="bg-gradient-to-r from-gray-300 to-gray-500 text-black px-4 py-2 rounded-full font-bold text-sm">
                            2nd Place
                          </div>
                        </div>
                        <div className="h-48 overflow-hidden rounded-t-lg">
                          <img
                            src={topNFTs[1]?.imageURL || 'https://via.placeholder.com/400x200?text=Recipe+NFT'}
                            alt={topNFTs[1]?.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Recipe+NFT';
                            }}
                          />
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-center mb-4">
                          <Medal className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-center mb-2">{topNFTs[1]?.title}</h3>
                        <div className="flex items-center justify-center mb-4">
                          <Heart className="w-5 h-5 text-red-400 mr-2" />
                          <span className="text-xl font-bold text-red-400">{topNFTs[1]?.votes} votes</span>
                        </div>
                        <Button
                          onClick={() => handleVoteNFT(topNFTs[1]?.tokenId)}
                          disabled={!isConnected || isVoting[topNFTs[1]?.tokenId]}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-black"
                        >
                          {isVoting[topNFTs[1]?.tokenId] ? (
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                          ) : (
                            <Vote className="w-4 h-4 mr-2" />
                          )}
                          {isVoting[topNFTs[1]?.tokenId] ? 'Voting...' : 'Vote'}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 1st Place */}
                  <div className="order-2 md:order-2 md:-mt-8">
                    <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-400 hover:border-yellow-300 transition-all duration-300 scale-105">
                      <div className="relative">
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
                          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-6 py-3 rounded-full font-bold">
                            🏆 CHAMPION 🏆
                          </div>
                        </div>
                        <div className="h-56 overflow-hidden rounded-t-lg">
                          <img
                            src={topNFTs[0]?.imageURL || 'https://via.placeholder.com/400x200?text=Recipe+NFT'}
                            alt={topNFTs[0]?.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Recipe+NFT';
                            }}
                          />
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-center mb-4">
                          <Crown className="w-10 h-10 text-yellow-400" />
                        </div>
                        <h3 className="text-xl font-bold text-center mb-2 text-yellow-400">{topNFTs[0]?.title}</h3>
                        <div className="flex items-center justify-center mb-4">
                          <Heart className="w-6 h-6 text-red-400 mr-2" />
                          <span className="text-2xl font-bold text-red-400">{topNFTs[0]?.votes} votes</span>
                        </div>
                        <Button
                          onClick={() => handleVoteNFT(topNFTs[0]?.tokenId)}
                          disabled={!isConnected || isVoting[topNFTs[0]?.tokenId]}
                          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold"
                        >
                          {isVoting[topNFTs[0]?.tokenId] ? (
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                          ) : (
                            <Crown className="w-4 h-4 mr-2" />
                          )}
                          {isVoting[topNFTs[0]?.tokenId] ? 'Voting...' : 'Vote for Champion'}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 3rd Place */}
                  <div className="order-3 md:order-3">
                    <Card className="bg-gradient-to-br from-amber-600/20 to-amber-700/20 border-amber-600 hover:border-amber-500 transition-all duration-300">
                      <div className="relative">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                          <div className="bg-gradient-to-r from-amber-500 to-amber-700 text-black px-4 py-2 rounded-full font-bold text-sm">
                            3rd Place
                          </div>
                        </div>
                        <div className="h-48 overflow-hidden rounded-t-lg">
                          <img
                            src={topNFTs[2]?.imageURL || 'https://via.placeholder.com/400x200?text=Recipe+NFT'}
                            alt={topNFTs[2]?.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Recipe+NFT';
                            }}
                          />
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-center mb-4">
                          <Award className="w-8 h-8 text-amber-600" />
                        </div>
                        <h3 className="text-lg font-bold text-center mb-2">{topNFTs[2]?.title}</h3>
                        <div className="flex items-center justify-center mb-4">
                          <Heart className="w-5 h-5 text-red-400 mr-2" />
                          <span className="text-xl font-bold text-red-400">{topNFTs[2]?.votes} votes</span>
                        </div>
                        <Button
                          onClick={() => handleVoteNFT(topNFTs[2]?.tokenId)}
                          disabled={!isConnected || isVoting[topNFTs[2]?.tokenId]}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-black"
                        >
                          {isVoting[topNFTs[2]?.tokenId] ? (
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                          ) : (
                            <Vote className="w-4 h-4 mr-2" />
                          )}
                          {isVoting[topNFTs[2]?.tokenId] ? 'Voting...' : 'Vote'}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Complete NFT Leaderboard */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-center text-orange-400">Complete NFT Leaderboard</h3>
              
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-800/30 rounded-xl animate-pulse">
                      <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                      </div>
                      <div className="w-20 h-8 bg-gray-700 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {topNFTs.slice(0, 20).map((nft, index) => (
                    <div
                      key={nft.id}
                      className="flex items-center space-x-4 p-4 bg-gray-800/30 border border-gray-700 rounded-xl hover:border-orange-500/50 hover:bg-gray-800/50 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${getRankBadgeColor(index + 1)}`}>
                          {index + 1}
                        </div>
                        {getRankIcon(index + 1)}
                      </div>
                      
                      <div className="w-16 h-16 rounded-lg overflow-hidden">
                        <img
                          src={nft.imageURL || 'https://via.placeholder.com/64x64?text=NFT'}
                          alt={nft.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Recipe+NFT';
                        }}
                        />
                      </div>

                      <div className="flex-1">
                        <h4 className="font-bold text-white hover:text-orange-400 transition-colors">
                          {nft.title}
                        </h4>
                        <p className="text-sm text-gray-400">
                          by {formatAddress(nft.creator)} • {formatTimeAgo(nft.mintedAt)}
                        </p>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="flex items-center text-red-400 font-bold">
                            <Heart className="w-4 h-4 mr-1" />
                            {nft.votes}
                          </div>
                          <div className="text-xs text-gray-400">votes</div>
                        </div>

                        {nft.isForSale && parseFloat(nft.salePrice) > 0 && (
                          <div className="text-center">
                            <div className="flex items-center text-green-400 font-bold">
                              <DollarSign className="w-4 h-4 mr-1" />
                              {parseFloat(nft.salePrice).toFixed(4)}
                            </div>
                            <div className="text-xs text-gray-400">ETH</div>
                          </div>
                        )}

                        <Button
                          onClick={() => handleVoteNFT(nft.tokenId)}
                          disabled={!isConnected || isVoting[nft.tokenId]}
                          size="sm"
                          className="bg-orange-500 hover:bg-orange-600 text-black font-bold"
                        >
                          {isVoting[nft.tokenId] ? (
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <ThumbsUp className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chef Leaderboard Section */}
          <div className="mb-20">
            {/* Chef Filters */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6 mb-8">
              <div className="flex flex-wrap items-center justify-center gap-4">
                <h2 className="text-2xl font-bold text-blue-400 mr-6">👨‍🍳 Top Chefs</h2>
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">Sort by:</span>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-blue-500"
                  >
                    <option value="all">Total NFTs</option>
                    <option value="votes">Total Votes</option>
                    <option value="sales">Sales Value</option>
                    <option value="reputation">Reputation</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Top 3 Chefs - Podium Style */}
            {!isLoading && topChefs.length >= 3 && (
              <div className="mb-12">
                <h3 className="text-3xl font-bold text-center mb-8 text-blue-400">👨‍🍳 Top 3 Chefs 👨‍🍳</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* 2nd Place Chef */}
                  <div className="order-1 md:order-1">
                    <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-600 hover:border-gray-400 transition-all duration-300">
                      <div className="relative">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                          <div className="bg-gradient-to-r from-gray-300 to-gray-500 text-black px-4 py-2 rounded-full font-bold text-sm">
                            2nd Place
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-6 pt-8">
                        <div className="flex items-center justify-center mb-4">
                          <Medal className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="text-center mb-4">
                          <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <ChefHat className="w-8 h-8 text-white" />
                          </div>
                          <h4 className="text-lg font-bold mb-1">{topChefs[1]?.name}</h4>
                          <p className="text-sm text-gray-400">{formatAddress(topChefs[1]?.address)}</p>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">NFTs Created:</span>
                            <span className="text-white font-bold">{topChefs[1]?.totalNFTs}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Total Votes:</span>
                            <span className="text-red-400 font-bold">{topChefs[1]?.totalVotes}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Reputation:</span>
                            <span className="text-orange-400 font-bold">{topChefs[1]?.reputation}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 1st Place Chef */}
                  <div className="order-2 md:order-2 md:-mt-8">
                    <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-400 hover:border-yellow-300 transition-all duration-300 scale-105">
                      <div className="relative">
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
                          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-6 py-3 rounded-full font-bold">
                            🏆 TOP CHEF 🏆
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-6 pt-10">
                        <div className="flex items-center justify-center mb-4">
                          <Crown className="w-10 h-10 text-yellow-400" />
                        </div>
                        <div className="text-center mb-6">
                          <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ChefHat className="w-10 h-10 text-black" />
                          </div>
                          <h4 className="text-xl font-bold mb-2 text-yellow-400">{topChefs[0]?.name}</h4>
                          <p className="text-sm text-gray-400">{formatAddress(topChefs[0]?.address)}</p>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-400">NFTs Created:</span>
                            <span className="text-white font-bold text-lg">{topChefs[0]?.totalNFTs}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Total Votes:</span>
                            <span className="text-red-400 font-bold text-lg">{topChefs[0]?.totalVotes}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Reputation:</span>
                            <span className="text-yellow-400 font-bold text-lg">{topChefs[0]?.reputation}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 3rd Place Chef */}
                  <div className="order-3 md:order-3">
                    <Card className="bg-gradient-to-br from-amber-600/20 to-amber-700/20 border-amber-600 hover:border-amber-500 transition-all duration-300">
                      <div className="relative">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                          <div className="bg-gradient-to-r from-amber-500 to-amber-700 text-black px-4 py-2 rounded-full font-bold text-sm">
                            3rd Place
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-6 pt-8">
                        <div className="flex items-center justify-center mb-4">
                          <Award className="w-8 h-8 text-amber-600" />
                        </div>
                        <div className="text-center mb-4">
                          <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-700 rounded-full flex items-center justify-center mx-auto mb-3">
                            <ChefHat className="w-8 h-8 text-white" />
                          </div>
                          <h4 className="text-lg font-bold mb-1">{topChefs[2]?.name}</h4>
                          <p className="text-sm text-gray-400">{formatAddress(topChefs[2]?.address)}</p>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">NFTs Created:</span>
                            <span className="text-white font-bold">{topChefs[2]?.totalNFTs}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Total Votes:</span>
                            <span className="text-red-400 font-bold">{topChefs[2]?.totalVotes}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Reputation:</span>
                            <span className="text-orange-400 font-bold">{topChefs[2]?.reputation}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Complete Chef Leaderboard */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-center text-blue-400">Complete Chef Rankings</h3>
              
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-800/30 rounded-xl animate-pulse">
                      <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                      <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                      </div>
                      <div className="w-20 h-8 bg-gray-700 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {topChefs.slice(0, 20).map((chef, index) => (
                    <div
                      key={chef.address}
                      className="flex items-center space-x-4 p-4 bg-gray-800/30 border border-gray-700 rounded-xl hover:border-blue-500/50 hover:bg-gray-800/50 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${getRankBadgeColor(index + 1)}`}>
                          {index + 1}
                        </div>
                        {getRankIcon(index + 1)}
                      </div>
                      
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <ChefHat className="w-8 h-8 text-white" />
                      </div>

                      <div className="flex-1">
                        <h4 className="font-bold text-white hover:text-blue-400 transition-colors">
                          {chef.name}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {formatAddress(chef.address)} • Active since {formatTimeAgo(chef.firstMinted)}
                        </p>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="flex items-center justify-center text-blue-400 font-bold">
                            <Gem className="w-4 h-4 mr-1" />
                            {chef.totalNFTs}
                          </div>
                          <div className="text-xs text-gray-400">NFTs</div>
                        </div>

                        <div>
                          <div className="flex items-center justify-center text-red-400 font-bold">
                            <Heart className="w-4 h-4 mr-1" />
                            {chef.totalVotes}
                          </div>
                          <div className="text-xs text-gray-400">Votes</div>
                        </div>

                        <div>
                          <div className="flex items-center justify-center text-green-400 font-bold">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {chef.totalSalesValue.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-400">ETH</div>
                        </div>

                        <div>
                          <div className="flex items-center justify-center text-orange-400 font-bold">
                            <Star className="w-4 h-4 mr-1" />
                            {chef.reputation}
                          </div>
                          <div className="text-xs text-gray-400">Rep</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Voting Actions Section */}
          <div className="mt-16 bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/30 rounded-3xl p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-orange-400 mb-4">Support Your Favorite NFTs!</h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Vote for the NFTs you love to help them climb the leaderboard. Every vote counts and helps creators gain recognition in the ResepVerse community.
              </p>
              
              {!isConnected ? (
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-6 max-w-md mx-auto">
                  <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <p className="text-yellow-200 mb-4">Connect your wallet to start voting</p>
                  <p className="text-sm text-yellow-300">Your votes help determine the most popular recipes and top chefs in the community!</p>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Vote className="w-8 h-8 text-black" />
                    </div>
                    <p className="text-sm text-gray-300">Vote for NFTs</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-sm text-gray-300">Climb Rankings</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Trophy className="w-8 h-8 text-black" />
                    </div>
                    <p className="text-sm text-gray-300">Win Rewards</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;