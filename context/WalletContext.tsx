import {Marketplace, NFTCollection} from "@thirdweb-dev/sdk";
import {createContext} from "react";

interface ContextProps {
  address: string | undefined;
  marketplaceContract: Marketplace | undefined;
  collectionContract: NFTCollection | undefined;
}

export const WalletContext = createContext({} as ContextProps);
