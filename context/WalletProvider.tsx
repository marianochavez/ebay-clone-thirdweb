import {FC} from "react";
import {useAddress, useContract} from "@thirdweb-dev/react";

import {WalletContext} from "./WalletContext";

interface Props {
  children: React.ReactNode;
}

export interface WalletState {
  address: string;
}

export const WalletProvider: FC<Props> = ({children}) => {
  const address = useAddress();
  const {contract: marketplaceContract} = useContract(
    process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
    "marketplace",
  );

  const {contract: collectionContract} = useContract(
    process.env.NEXT_PUBLIC_COLLECTION_CONTRACT,
    "nft-collection",
  );

  return (
    <WalletContext.Provider
      value={{
        address,
        marketplaceContract,
        collectionContract,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
