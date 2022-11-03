import {useBuyNow} from "@thirdweb-dev/react";
import {AuctionListing, DirectListing, ListingType, Marketplace} from "@thirdweb-dev/sdk";
import {toast} from "react-hot-toast";

import useVerifyNetwork from "../hooks/useVerifyNetwork";
import network from "../utils/network";
import {redirect} from "../utils/redirect";

import Loading from "./Loading";

type BuyNFTProps = {
  listing: AuctionListing | DirectListing | undefined;
  contract: Marketplace | undefined;
};

const BuyNFT = ({listing, contract}: BuyNFTProps) => {
  const checkNetwork = useVerifyNetwork({network});
  const {mutate: buyNow, isLoading: isBuyNowLoading} = useBuyNow(contract);

  async function buyNft() {
    checkNetwork();

    if (!listing || !contract) return;

    await buyNow(
      {id: listing.id, buyAmount: 1, type: listing.type},
      {
        onSuccess() {
          toast.success("NFT bought successfully!", {style: {fontWeight: "bold"}});
          redirect({path: "/"});
        },
        onError(error, variables, context) {
          toast.error("NFT could not be bought. Look at the console.", {
            style: {fontWeight: "bold"},
          });
          // eslint-disable-next-line no-console
          console.log({ERROR: {error, variables, context}});
        },
      },
    );
  }

  return (
    <div className="grid grid-cols-2 items-center py-2">
      <p className="font-bold">Listing Type:</p>
      <p>{listing!.type === ListingType.Direct ? "Direct Listing" : "Auction Listing"}</p>

      <p className="font-bold ">Buy it Now Price</p>
      <p className="text-4xl font-bold">
        {listing!.buyoutCurrencyValuePerToken.displayValue}{" "}
        {listing!.buyoutCurrencyValuePerToken.symbol}
      </p>

      <button
        className="col-start-2 mt-2 bg-blue-600 font-bold text-white rounded-full w-44 py-4 px-10 flex justify-center"
        disabled={isBuyNowLoading}
        onClick={buyNft}
      >
        {isBuyNowLoading ? <Loading text="Processing..." textColor="text-white" /> : "Buy Now"}
      </button>
    </div>
  );
};

export default BuyNFT;
