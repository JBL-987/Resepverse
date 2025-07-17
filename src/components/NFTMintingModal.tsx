import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Star, Clock } from 'lucide-react';

interface NFTMintingModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeTitle: string;
}

const NFTMintingModal = ({ isOpen, onClose, recipeTitle }: NFTMintingModalProps) => {
  const [mintPrice, setMintPrice] = useState('0.1');
  const [royaltyPercent, setRoyaltyPercent] = useState('5');
  const [description, setDescription] = useState('');

  const handleMint = () => {
    console.log('Minting NFT:', { recipeTitle, mintPrice, royaltyPercent, description });
    // Here would be the smart contract integration
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Mint Recipe as NFT</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recipe Preview */}
          <div className="bg-accent/50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">{recipeTitle}</h3>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>4.8</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>30 min</span>
              </div>
            </div>
          </div>

          {/* Minting Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="price">Mint Price ($LSK)</Label>
              <Input
                id="price"
                type="number"
                value={mintPrice}
                onChange={(e) => setMintPrice(e.target.value)}
                placeholder="0.1"
                step="0.01"
              />
            </div>

            <div>
              <Label htmlFor="royalty">Royalty Percentage (%)</Label>
              <Input
                id="royalty"
                type="number"
                value={royaltyPercent}
                onChange={(e) => setRoyaltyPercent(e.target.value)}
                placeholder="5"
                max="20"
              />
              <p className="text-xs text-muted-foreground mt-1">
                You'll receive {royaltyPercent}% of future sales
              </p>
            </div>

            <div>
              <Label htmlFor="description">NFT Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what makes this recipe special..."
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Token Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">Tokenomics Overview</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Minting Fee:</span>
                <span>{mintPrice} $LSK</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee:</span>
                <span>2.5%</span>
              </div>
              <div className="flex justify-between">
                <span>Your Royalty:</span>
                <span>{royaltyPercent}%</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleMint} className="flex-1 bg-primary hover:bg-primary/90">
              Mint NFT
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NFTMintingModal;
