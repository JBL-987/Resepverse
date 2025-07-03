const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("RecipeBookModule", (m) => {
  const recipebook = m.contract("RecipeBook");
  return { recipebook };
});