const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TelepathiaModuleV2", (m) => {
  const telepathia = m.contract("Telepathia", []);
  return { telepathia };
});
