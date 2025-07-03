import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { submitRecipe } from "../services/recipeBlockchainService";
import { useAccount } from "wagmi";

const SubmitRecipePage: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { address } = useAccount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await submitRecipe({ title, description, imageUrl, account: address as `0x${string}` });
      setSuccess(true);
      setTitle("");
      setDescription("");
      setImageUrl("");
    } catch (err: any) {
      setError(err.message || "Failed to submit recipe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />
      <main className="max-w-xl mx-auto py-12 px-4 md:px-0">
        <h1 className="text-3xl font-bold text-blue-400 mb-8">Submit a New Recipe</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 bg-gray-900 rounded border border-gray-700 text-white" />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} required className="w-full p-2 bg-gray-900 rounded border border-gray-700 text-white h-24" />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">Image URL</label>
            <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full p-2 bg-gray-900 rounded border border-gray-700 text-white" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded bg-blue-700 text-white font-semibold hover:bg-blue-800 transition">
            {loading ? "Submitting..." : "Submit Recipe"}
          </button>
          {success && <div className="text-green-400 mt-2">Recipe submitted successfully!</div>}
          {error && <div className="text-red-400 mt-2">{error}</div>}
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default SubmitRecipePage; 