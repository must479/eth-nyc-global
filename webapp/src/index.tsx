import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Mainnet, DAppProvider } from "@usedapp/core";
import { getDefaultProvider } from "ethers";

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider
      config={{
        readOnlyChainId: Mainnet.chainId,
        readOnlyUrls: {
          [Mainnet.chainId]: getDefaultProvider("mainnet"),
        },
      }}
    >
      <App />
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
