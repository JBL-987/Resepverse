const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("RecipeBookModule", (m) => {
  const feeRecipient = m.getParameter("feeRecipient",
    "0x0000000000000000000000000000000000000000");  1
  const initialPlatformFeeBps = m.getParameter("initialPlatformFeeBps", 250); 
  const recipebook = m.contract("RecipeBook", [feeRecipient, initialPlatformFeeBps]);
  return { recipebook };
});