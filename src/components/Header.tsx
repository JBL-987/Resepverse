import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ConnectButton } from "@xellar/kit";
import { useAuth } from "../contexts/AuthContext";
import { truncateAddress } from "../utils/strings";
import { useReadContract } from "wagmi";
import { Address, erc20Abi, formatUnits } from "viem";
import { IDRX_SEPOLIA } from "../constants";
import logo from '/images/logo.png';

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
  const location = useLocation();
  const showSearch = false; // Marketplace page tidak ada

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="Logo" className="h-14 w-14" />
          </Link>

          {showSearch && (
            <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search recipes, chefs, or cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900/50 border border-gray-800 focus:bg-gray-900 focus:border-orange-500 transition-colors text-white placeholder:text-gray-400"
                />
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <AuthenticatedButtons />
            <AuthButtons />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

const AuthenticatedButtons = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Button variant="outline" className="hidden md:flex border-gray-700 bg-gray-900 text-white hover:bg-orange-500 hover:border-orange-500 hover:text-white" asChild>
        <Link to="/become-chef">
          Become a Chef
        </Link>
      </Button>
      <Button variant="outline" className="hidden md:flex border-gray-700 bg-gray-900 text-white hover:bg-orange-500 hover:border-orange-500 hover:text-white" asChild>
        <Link to="/leaderboard">
          Leaderboard
        </Link>
      </Button>
      <Button variant="outline" className="hidden md:flex border-gray-700 bg-gray-900 text-white hover:bg-orange-500 hover:border-orange-500 hover:text-white" asChild>
        <Link to="/nft-minting">
          Mint NFT
        </Link>
      </Button>
      <Button variant="outline" className="hidden md:flex border-gray-700 bg-gray-900 text-white hover:bg-orange-500 hover:border-orange-500 hover:text-white" asChild>
        <Link to="/my-nfts">
          My NFTs
        </Link>
      </Button>
    </>
  );
};

const AuthButtons = () => {
  const { isAuthenticated, address, disconnect } = useAuth();

  return (
    <ConnectButton.Custom>
      {({ openConnectModal, isConnected }) => {
        if (!isConnected || !isAuthenticated) {
          return (
            <button className="bg-orange-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-orange-600 transition-colors" onClick={openConnectModal}>
              Connect Wallet
            </button>
          );
        }
        return <ConnectedButton address={address as Address} onClick={disconnect} />;
      }}
    </ConnectButton.Custom>
  );
};