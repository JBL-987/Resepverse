
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import BecomeChef from "./pages/BecomeChef";
import NFTMinting from "./pages/NFTMinting";
import NotFound from "./pages/NotFound";
import RecipeDetailPage from "./pages/recipe-detail-page";
import MyNfts from "./pages/MyNfts";
import Marketplace from "./pages/Marketplace";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/become-chef" element={<BecomeChef />} />
          <Route path="/nft-minting" element={<NFTMinting />} />
          <Route path="/my-nfts" element={<MyNfts />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/recipe/:id" element={<RecipeDetailPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
