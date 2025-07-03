const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("RecipeBook", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployRecipeBookFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const RecipeBook = await ethers.getContractFactory("RecipeBook");
    const recipeBook = await RecipeBook.deploy(owner.address);

    return { recipeBook, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { recipeBook, owner } = await loadFixture(deployRecipeBookFixture);

      expect(await recipeBook.owner()).to.equal(owner.address);
    });

    it("Should start with zero recipes", async function () {
      const { recipeBook } = await loadFixture(deployRecipeBookFixture);

      expect(await recipeBook.getTotalRecipes()).to.equal(0);
    });

    it("Should return empty array when no recipes", async function () {
      const { recipeBook } = await loadFixture(deployRecipeBookFixture);

      const recipes = await recipeBook.getAllRecipes();
      expect(recipes.length).to.equal(0);
    });
  });

  describe("Adding Recipes", function () {
    describe("Validations", function () {
      it("Should add a recipe successfully", async function () {
        const { recipeBook, owner } = await loadFixture(deployRecipeBookFixture);

        const title = "Nasi Goreng";
        const description = "Nasi goreng sederhana dengan telur";
        const imageUrl = "https://example.com/nasigoreng.jpg";

        await recipeBook.addRecipe(title, description, imageUrl);

        expect(await recipeBook.getTotalRecipes()).to.equal(1);
      });

      it("Should emit RecipeAdded event", async function () {
        const { recipeBook, owner } = await loadFixture(deployRecipeBookFixture);

        const title = "Rendang";
        const description = "Rendang daging sapi";
        const imageUrl = "https://example.com/rendang.jpg";

        await expect(recipeBook.addRecipe(title, description, imageUrl))
          .to.emit(recipeBook, "RecipeAdded")
          .withArgs(1, title, owner.address);
      });

      it("Should store recipe data correctly", async function () {
        const { recipeBook, owner } = await loadFixture(deployRecipeBookFixture);

        const title = "Gado-gado";
        const description = "Salad sayuran Indonesia";
        const imageUrl = "https://example.com/gadogado.jpg";

        await recipeBook.addRecipe(title, description, imageUrl);

        const recipe = await recipeBook.getRecipe(1);
        expect(recipe.id).to.equal(1);
        expect(recipe.title).to.equal(title);
        expect(recipe.description).to.equal(description);
        expect(recipe.imageUrl).to.equal(imageUrl);
        expect(recipe.creator).to.equal(owner.address);
      });

      it("Should allow different users to add recipes", async function () {
        const { recipeBook, owner, otherAccount } = await loadFixture(deployRecipeBookFixture);

        await recipeBook.connect(owner).addRecipe("Recipe 1", "Description 1", "url1");
        await recipeBook.connect(otherAccount).addRecipe("Recipe 2", "Description 2", "url2");

        expect(await recipeBook.getTotalRecipes()).to.equal(2);

        const recipe1 = await recipeBook.getRecipe(1);
        const recipe2 = await recipeBook.getRecipe(2);

        expect(recipe1.creator).to.equal(owner.address);
        expect(recipe2.creator).to.equal(otherAccount.address);
      });
    });

    describe("Multiple Recipes", function () {
      it("Should handle multiple recipes correctly", async function () {
        const { recipeBook, owner } = await loadFixture(deployRecipeBookFixture);

        await recipeBook.addRecipe("Recipe 1", "Description 1", "url1");
        await recipeBook.addRecipe("Recipe 2", "Description 2", "url2");
        await recipeBook.addRecipe("Recipe 3", "Description 3", "url3");

        expect(await recipeBook.getTotalRecipes()).to.equal(3);

        const allRecipes = await recipeBook.getAllRecipes();
        expect(allRecipes.length).to.equal(3);
        expect(allRecipes[0].title).to.equal("Recipe 1");
        expect(allRecipes[1].title).to.equal("Recipe 2");
        expect(allRecipes[2].title).to.equal("Recipe 3");
      });
    });
  });

  describe("Retrieving Recipes", function () {
    describe("Validations", function () {
      it("Should revert when getting invalid recipe ID", async function () {
        const { recipeBook } = await loadFixture(deployRecipeBookFixture);

        await expect(recipeBook.getRecipe(1)).to.be.revertedWith(
          "Invalid recipe id"
        );
      });

      it("Should revert when getting recipe ID 0", async function () {
        const { recipeBook } = await loadFixture(deployRecipeBookFixture);

        await recipeBook.addRecipe("Test Recipe", "Test Description", "test.jpg");

        await expect(recipeBook.getRecipe(0)).to.be.revertedWith(
          "Invalid recipe id"
        );
      });

      it("Should revert when getting recipe ID beyond total", async function () {
        const { recipeBook } = await loadFixture(deployRecipeBookFixture);

        await recipeBook.addRecipe("Test Recipe", "Test Description", "test.jpg");

        await expect(recipeBook.getRecipe(2)).to.be.revertedWith(
          "Invalid recipe id"
        );
      });
    });

    describe("Success Cases", function () {
      it("Should retrieve correct recipe by ID", async function () {
        const { recipeBook, owner } = await loadFixture(deployRecipeBookFixture);

        const title = "Sate Ayam";
        const description = "Sate ayam dengan bumbu kacang";
        const imageUrl = "https://example.com/sate.jpg";

        await recipeBook.addRecipe(title, description, imageUrl);

        const recipe = await recipeBook.getRecipe(1);
        expect(recipe.id).to.equal(1);
        expect(recipe.title).to.equal(title);
        expect(recipe.description).to.equal(description);
        expect(recipe.imageUrl).to.equal(imageUrl);
        expect(recipe.creator).to.equal(owner.address);
      });
    });
  });
});