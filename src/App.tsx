import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./views/Home";
import RecipeListPage from "./pages/RecipeListPage";
import SubmitRecipePage from "./pages/SubmitRecipePage";
import NotFound from "./views/NotFound";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipes" element={<RecipeListPage />} />
          <Route path="/submit" element={<SubmitRecipePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
