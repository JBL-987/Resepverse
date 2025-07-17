import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User, Star } from 'lucide-react';
import { ConnectButton } from "@xellar/kit";
import { truncateAddress } from "../utils/strings";
import { useReadContract } from "wagmi";
import { Address, erc20Abi, formatUnits } from "viem";
import { IDRX_SEPOLIA } from "../constants";

const ConnectedButton: React.FC<{ address: Address; onClick: () => void }> = ({ address, onClick }) => {
  const { data } = useReadContract({
    address: IDRX_SEPOLIA,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address as Address],
    query: {
      enabled: !!address,
    },
  });
  const formatted = formatUnits(data ?? BigInt(0), 2);
  return (
    <button 
      className="bg-gradient-to-r from-indigo-700 to-red-700 text-white px-4 py-2 rounded-lg cursor-pointer hover:from-indigo-800 hover:to-red-800 transition-all shadow-md flex items-center gap-2" 
      onClick={onClick}
    >
      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
      <span>{truncateAddress(address ?? "")}</span>
      <span className="px-2 py-0.5 bg-black/30 rounded text-sm">
        {Number(formatted).toLocaleString()} IDRX
      </span>
    </button>
  );
};

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-400 rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">R</span>
            </div>
            <span className="text-2xl font-bold text-foreground">ResepVerse</span>
          </Link>

          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search recipes, chefs, or cuisines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50 border-0 focus:bg-background transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="outline" className="hidden md:flex" asChild>
              <Link to="/become-chef">
                Become a Chef
              </Link>
            </Button>
            <Button variant="outline" className="hidden md:flex" asChild>
              <Link to="/nft-minting">
                Mint NFT
              </Link>
            </Button>
            <ConnectButton.Custom>
              {({ openConnectModal, isConnected, openProfileModal, account }) => {
                if (!isConnected) {
                  return (
                    <button className="bg-white text-black px-4 py-2 rounded-lg cursor-pointer" onClick={openConnectModal}>
                      Connect Wallet
                    </button>
                  );
                }
                return <ConnectedButton address={account?.address as Address} onClick={openProfileModal} />;
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
