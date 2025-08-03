import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Star, Clock, Gift, Sparkles, Zap, TrendingUp } from 'lucide-react';

interface NFTMintingModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeTitle: string;
}

const NFTMintingModal = ({ isOpen, onClose, recipeTitle }: NFTMintingModalProps) => {
  const [royaltyPercent, setRoyaltyPercent] = useState('5');
  const [description, setDescription] = useState('');
  const [isMinting, setIsMinting] = useState(false);

  const handleMint = async () => {
    setIsMinting(true);
    console.log('Minting FREE NFT:', { recipeTitle, royaltyPercent, description });
    
    // Simulate minting process
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Here would be the smart contract integration
      alert(`🎉 "${recipeTitle}" minted as NFT for FREE!`);
      onClose();
    } catch (error) {
      alert('❌ Minting failed. Please try again.');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            <Gift className="w-6 h-6 mr-2 text-green-400" />
            Mint Recipe as NFT - FREE
          </DialogTitle>
          <div className="text-center">
            <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              🎁 100% FREE MINTING
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recipe Preview */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-green-300">{recipeTitle}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>4.8</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>30 min</span>
              </div>
              <div className="flex items-center space-x-1">
                <Gift className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-medium">FREE MINT</span>
              </div>
            </div>
          </div>

          {/* Minting Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="royalty" className="text-white">
                Royalty Percentage (%) *
              </Label>
              <Input
                id="royalty"
                type="number"
                value={royaltyPercent}
                onChange={(e) => setRoyaltyPercent(e.target.value)}
                placeholder="5"
                max="20"
                min="0"
                className="bg-gray-800/50 border-gray-700 focus:border-green-500 focus:ring-green-500/20 text-white"
              />
              <p className="text-xs text-gray-400 mt-1">
                You'll receive <span className="text-green-400 font-medium">{royaltyPercent}%</span> of future sales (max 20%)
              </p>
            </div>

            <div>
              <Label htmlFor="description" className="text-white">
                NFT Description *
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what makes this recipe special and unique..."
                rows={3}
                className="bg-gray-800/50 border-gray-700 focus:border-green-500 focus:ring-green-500/20 text-white resize-none"
              />
            </div>
          </div>

          <Separator className="bg-gray-700" />

          {/* FREE Benefits Overview */}
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm text-green-400 flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              🎉 FREE Minting Benefits
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Minting Fee:</span>
                <span className="text-green-400 font-bold">FREE! 🎁</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Platform Fee:</span>
                <span className="text-green-400 font-bold">FREE! 🎁</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Your Royalty:</span>
                <span className="text-white font-medium">{royaltyPercent}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Gas Fee (only cost):</span>
                <span className="text-white font-medium">~0.001 LSK</span>
              </div>
              <Separator className="bg-green-500/20 my-2" />
              <div className="bg-green-500/20 rounded p-2">
                <div className="flex items-center justify-center space-x-2">
                  <Gift className="w-4 h-4 text-green-400" />
                  <span className="text-green-300 font-medium text-center">
                    Zero hidden fees • Instant ownership • Earn forever
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Benefits */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 text-center">
              <Zap className="w-4 h-4 text-green-400 mx-auto mb-1" />
              <span className="text-green-300">Instant Mint</span>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 text-center">
              <TrendingUp className="w-4 h-4 text-green-400 mx-auto mb-1" />
              <span className="text-green-300">Earn Royalties</span>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 text-center">
              <Gift className="w-4 h-4 text-green-400 mx-auto mb-1" />
              <span className="text-green-300">100% Free</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
              disabled={isMinting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleMint} 
              disabled={isMinting}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold transition-all duration-300 transform hover:scale-105 disabled:transform-none"
            >
              {isMinting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Minting...
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4 mr-2" />
                  🎁 MINT FREE
                </>
              )}
            </Button>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-gray-500">
            By minting, you agree that this recipe is your original creation
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NFTMintingModal;