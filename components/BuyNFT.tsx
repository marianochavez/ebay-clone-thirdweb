import {useBuyNow, useOffers} from "@thirdweb-dev/react";
import {AuctionListing, DirectListing, ListingType, Marketplace} from "@thirdweb-dev/sdk";
import {toast} from "react-hot-toast";

import useVerifyNetwork from "../hooks/useVerifyNetwork";
import network from "../utils/network";
import {redirect} from "../utils/redirect";

import BidOfferNFT from "./BidOfferNFT";
import DirectDealsNFT from "./DirectDealsNFT";
import Loading from "./ui/Loading";

type BuyNFTProps = {
  listingId: string;
  listing: AuctionListing | DirectListing;
  contract: Marketplace;
};

const BuyNFT = ({listingId, listing, contract}: BuyNFTProps) => {
  const checkNetwork = useVerifyNetwork({network});
  const {mutate: buyNow, isLoading: isBuyNowLoading} = useBuyNow(contract);
  const {data: offers} = useOffers(contract, listingId);

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
    <div>
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
      {listing.type === ListingType.Direct && offers && (
        <DirectDealsNFT
          contract={contract}
          listing={listing}
          listingId={listingId}
          offers={offers}
        />
      )}

      <BidOfferNFT buyNft={buyNft} contract={contract} listing={listing} listingId={listingId} />
    </div>
  );
};

export default BuyNFT;
