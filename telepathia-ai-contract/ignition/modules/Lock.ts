import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TelepathiaModule = buildModule("TelepathiaModule", (m) => {
  const telepathia = m.contract("Telepathia", []);
  return { telepathia };
});

export default TelepathiaModule;
