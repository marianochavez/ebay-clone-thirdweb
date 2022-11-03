import {useState, useEffect} from "react";
import {useMakeBid, useMakeOffer} from "@thirdweb-dev/react";
import {AuctionListing, DirectListing, ListingType, Marketplace} from "@thirdweb-dev/sdk";
import Countdown from "react-countdown";
import {ethers} from "ethers";
import {toast} from "react-hot-toast";

import useVerifyNetwork from "../hooks/useVerifyNetwork";
import network from "../utils/network";

type Props = {
  listingId: string;
  listing: AuctionListing | DirectListing;
  contract: Marketplace;
  buyNft: () => void;
};

const BidOfferNFT = ({listing, listingId, contract, buyNft}: Props) => {
  const checkNetwork = useVerifyNetwork({network});
  const {mutate: makeBid} = useMakeBid(contract);
  const {mutate: makeOffer} = useMakeOffer(contract);
  const [bidAmount, setBidAmount] = useState("");
  const [minimumNextBid, setMinimumNextBid] = useState<{
    displayValue: string;
    symbol: string;
  }>();

  useEffect(() => {
    if (!listingId || !contract || !listing) return;
    if (listing?.type === ListingType.Auction) {
      fetchMinNextBid();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing, listingId, contract]);

  const fetchMinNextBid = async () => {
    if (!listingId || !contract) return;

    const {displayValue, symbol} = await contract.auction.getMinimumNextBid(listingId);

    setMinimumNextBid({displayValue, symbol});
  };

  function formatPlaceholder() {
    if (!listing) return;
    if (listing?.type === ListingType.Direct) {
      return "Enter Offer Amount";
    }

    if (listing.type === ListingType.Auction) {
      return Number(minimumNextBid?.displayValue) === 0
        ? "Enter Bid Amount"
        : `${minimumNextBid?.displayValue} ${minimumNextBid?.symbol} or more`;
    }
  }

  const createBidOrOffer = async () => {
    try {
      checkNetwork();

      // Direct Listing
      if (listing?.type === ListingType.Direct) {
        if (listing.buyoutPrice.toString() === ethers.utils.parseEther(bidAmount).toString()) {
          // eslint-disable-next-line no-console
          toast.loading("Buyout Price met, buying NFT...");
          buyNft();

          return;
        }

        await makeOffer(
          {
            quantity: 1,
            listingId,
            pricePerToken: bidAmount,
          },
          {
            onSuccess() {
              toast.success("Offer made successfully!", {style: {fontWeight: "bold"}});
              setBidAmount("");
            },
            onError(error, variables, context) {
              alert("ERROR: Offer could not be made");
              toast.error("Offer could not be mader. Look at the console.", {
                style: {fontWeight: "bold"},
              });
              // eslint-disable-next-line no-console
              console.log("ERROR", error, variables, context);
            },
          },
        );
      }

      // Auction Listing
      if (listing?.type === ListingType.Auction) {
        await makeBid(
          {
            listingId,
            bid: bidAmount,
          },
          {
            onSuccess() {
              toast.success("Bid made successfully!", {style: {fontWeight: "bold"}});
              setBidAmount("");
            },
            onError(error, variables, context) {
              toast.error("Bid could not be mader. Look at the console.", {
                style: {fontWeight: "bold"},
              });
              // eslint-disable-next-line no-console
              console.log("ERROR", error, variables, context);
            },
          },
        );
      }
    } catch (error) {
      toast.error("Look at the console");
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  return (
    <div className="grid grid-cols-2 space-y-2 items-center justify-end">
      <hr className="col-span-2" />
      <p className="col-span-2 font-bold">
        {listing.type === ListingType.Direct ? "Make an Offer" : "Bid on this Auction"}
      </p>

      {listing.type === ListingType.Auction && (
        <>
          <p>Current Minimun Bid:</p>
          <p className="font-bold">
            {minimumNextBid?.displayValue} {minimumNextBid?.symbol}
          </p>

          <p>Time Remaining:</p>
          <Countdown date={Number(listing.endTimeInEpochSeconds.toString()) * 1000} />
        </>
      )}

      <input
        className="border p-2 rouned-lg mr-5"
        placeholder={formatPlaceholder()}
        type="text"
        value={bidAmount}
        onChange={(e) => setBidAmount(e.target.value.trim())}
      />
      <button
        className="bg-red-600 font-bold text-white rounded-full w-44 py-4 px-10"
        onClick={createBidOrOffer}
      >
        {listing.type === ListingType.Direct ? "Offer" : "Bid"}
      </button>
    </div>
  );
};

export default BidOfferNFT;
