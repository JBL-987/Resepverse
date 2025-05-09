const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TelepathiaModule", (m) => {
  const telepathia = m.contract("Telepathia", []);
  return { telepathia };
});
