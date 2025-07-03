import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { fetchAllRecipes, voteRecipe } from "../services/recipeBlockchainService";
import { useAccount } from 'wagmi';

const RecipeListPage: React.FC = () => {
  const [recipes, setRecipes] = useState<any[]>([]);
  const { address } = useAccount();
  const [lang, setLang] = useState<'id' | 'en'>('id');

  const t = (id: string, en: string) => (lang === 'id' ? id : en);

  useEffect(() => {
    async function load() {
      const data = await fetchAllRecipes();
      setRecipes([...data || []]);
    }
    load();
  }, []);

  const handleVote = async (recipeId: number) => {
    if (!address) {
      alert(t('Silakan hubungkan wallet Anda terlebih dahulu.', 'Please connect your wallet first.'));
      return;
    }
    try {
      await voteRecipe({ recipeId, account: address as `0x${string}` });
      alert(t('Vote berhasil!', 'Vote successful!'));
      // Optionally refresh recipes
    } catch (e) {
      alert(t('Vote gagal. Coba lagi.', 'Vote failed. Please try again.'));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />
      <div className="flex justify-end p-4">
        <button onClick={() => setLang('id')} className={`px-2 py-1 rounded-l ${lang==='id'?'bg-blue-700 text-white':'bg-gray-200'}`}>ID</button>
        <button onClick={() => setLang('en')} className={`px-2 py-1 rounded-r ${lang==='en'?'bg-blue-700 text-white':'bg-gray-200'}`}>EN</button>
      </div>
      <main className="max-w-5xl mx-auto py-12 px-4 md:px-0">
        <h1 className="text-3xl font-bold text-blue-400 mb-8">{t('Daftar Resep', 'Recipe List')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recipes.length === 0 ? (
            <div className="col-span-3 text-center text-gray-400">No recipes found.</div>
          ) : (
            recipes.map((recipe, idx) => (
              <div key={idx} className="bg-gradient-to-br from-gray-900 to-black rounded-lg shadow p-4 border border-gray-800">
                <h2 className="font-bold text-blue-300 text-lg mb-2">{recipe.title}</h2>
                <p className="text-gray-300 mb-2">{recipe.description}</p>
                <p className="text-xs text-gray-500">{t('Oleh', 'By')}: {recipe.creator}</p>
                <button onClick={() => handleVote(recipe.id)} className="bg-blue-600 text-white px-3 py-1 rounded mt-2">
                  {t('Vote', 'Vote')} / {t('Beri Suara', 'Give Vote')}
                </button>
                {/* Add more fields as needed */}
              </div>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RecipeListPage; 