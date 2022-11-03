import {ChainId, useNetwork, useNetworkMismatch} from "@thirdweb-dev/react";

type Props = {
  network: ChainId;
};

const useVerifyNetwork = ({network}: Props) => {
  const networkMismatch = useNetworkMismatch();
  const [, switchNetWork] = useNetwork();

  const checkNetwork = () => {
    if (networkMismatch) {
      switchNetWork && switchNetWork(network);

      return;
    }
  };

  return checkNetwork;
};

export default useVerifyNetwork;
