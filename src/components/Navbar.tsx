import React, { useState } from "react";
import { ConnectButton } from "@xellar/kit";
import { truncateAddress } from "../utils/string";
import { useReadContract } from "wagmi";
import { Address, erc20Abi, formatUnits } from "viem";
import { IDRX_SEPOLIA } from "../constants";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="flex justify-between items-center p-4 border-b z-20 border-gray-600 bg-black">
      <div className="flex items-center">
        <div className="text-xl font-bold px-6 text-white">
          Telepathia-AI
        </div>
        <div className="hidden md:flex space-x-6 ml-8">
        </div>
      </div>
      <div className="md:hidden">
        <button onClick={toggleMenu} className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            )}
          </svg>
        </button>
      </div>

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

      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-black border-b border-gray-700 md:hidden z-30">
          <div className="flex flex-col px-4 py-2 space-y-2">
          </div>
        </div>
      )}
    </nav>
  );
};

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

export default Navbar;
