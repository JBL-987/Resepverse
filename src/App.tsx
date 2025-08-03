import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Index from "./pages/Index";
import BecomeChef from "./pages/BecomeChef";
import NFTMinting from "./pages/NFTMinting";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import MyNfts from "./pages/MyNfts";
import Marketplace from "./pages/Marketplace";
import ChefProfile from "./pages/ChefProfile";
import Leaderboard from "./pages/Leaderboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
            <Route element={<ProtectedRoute />}>
            <Route path="/main" element={<Index />} />
            <Route path="/become-chef" element={<BecomeChef />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/nft-minting" element={<NFTMinting />} />
            <Route path="/my-nfts" element={<MyNfts />} />
            <Route path="/chef/:id" element={<ChefProfile />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;