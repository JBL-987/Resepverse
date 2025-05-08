import React from "react";
import { Config, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { XellarKitProvider, darkTheme, defaultConfig } from "@xellar/kit";
import { liskSepolia } from "viem/chains";

const walletConnectProjectId = "0164f6aefa91d65fe12adcfeebadf92b";

export const config = defaultConfig({
  appName: "Telepathia-AI",
  walletConnectProjectId,
  xellarAppId: "785a2320-01af-436f-8a38-eead24d35b47",
  xellarEnv: "sandbox",
  chains: [liskSepolia],
}) as Config;

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <XellarKitProvider theme={darkTheme}>{children}
        </XellarKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
