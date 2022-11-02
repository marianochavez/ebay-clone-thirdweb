/* eslint-disable no-console */
import {useRouter} from "next/router";
import {
  MediaRenderer,
  useAcceptDirectListingOffer,
  useAddress,
  useBuyNow,
  useContract,
  useListing,
  useMakeBid,
  useMakeOffer,
  useNetwork,
  useNetworkMismatch,
  useOffers,
} from "@thirdweb-dev/react";
import {ListingType, NATIVE_TOKENS} from "@thirdweb-dev/sdk";
import {UserCircleIcon} from "@heroicons/react/24/solid";
import {useEffect, useState} from "react";
import Countdown from "react-countdown";
import {ethers} from "ethers";

import Loading from "../../components/Loading";
import network from "../../utils/network";

function ListingPage() {
  const router = useRouter();
  const address = useAddress();
  const {listingId} = router.query as {listingId: string};
  const [bidAmount, setBidAmount] = useState("");
  const [, switchNetwork] = useNetwork();
  const networkMismatch = useNetworkMismatch();

  const [minimumNextBid, setMinimumNextBid] = useState<{
    displayValue: string;
    symbol: string;
  }>();

  const {contract: marketplaceContract} = useContract(
    process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
    "marketplace",
  );

  const {mutate: makeBid} = useMakeBid(marketplaceContract);

  const {data: offers} = useOffers(marketplaceContract, listingId);

  const {mutate: makeOffer} = useMakeOffer(marketplaceContract);

  const {mutate: buyNow} = useBuyNow(marketplaceContract);

  const {data: listing, isLoading, error} = useListing(marketplaceContract, listingId);

  const {mutate: acceptOffer} = useAcceptDirectListingOffer(marketplaceContract);

  useEffect(() => {
    if (!listingId || !marketplaceContract || !listing) return;
    if (listing?.type === ListingType.Auction) {
      fetchMinNextBid();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing, listingId, marketplaceContract]);

  // const acceptOffer = async (offer: Record<string, any>) => {};

  const fetchMinNextBid = async () => {
    if (!listingId || !marketplaceContract) return;

    const {displayValue, symbol} = await marketplaceContract.auction.getMinimumNextBid(listingId);

    setMinimumNextBid({displayValue, symbol});
  };

  const formatPlaceholder = () => {
    if (!listing) return;
    if (listing?.type === ListingType.Direct) {
      return "Enter Offer Amount";
    }

    if (listing.type === ListingType.Auction) {
      return Number(minimumNextBid?.displayValue) === 0
        ? "Enter Bid Amount"
        : `${minimumNextBid?.displayValue} ${minimumNextBid?.symbol} or more`;
    }
  };

  const createBidOrOffer = async () => {
    try {
      if (networkMismatch) {
        // TODO create export fn
        switchNetwork && switchNetwork(network);

        return;
      }

      // Direct Listing
      if (listing?.type === ListingType.Direct) {
        if (listing.buyoutPrice.toString() === ethers.utils.parseEther(bidAmount).toString()) {
          console.log("Buyout Price met, buying NFT...");
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
            onSuccess(data, variables, context) {
              alert("Offer made successfully!");
              console.log("SUCCESS", data, variables, context);
              setBidAmount("");
            },
            onError(error, variables, context) {
              alert("ERROR: Offer could not be made");
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
            onSuccess(data, variables, context) {
              alert("Bid made successfully!");
              console.log("SUCCESS", data, variables, context);
              setBidAmount("");
            },
            onError(error, variables, context) {
              alert("ERROR: Bid could not be made");
              console.log("ERROR", error, variables, context);
            },
          },
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const buyNft = async () => {
    if (networkMismatch) {
      // TODO create export fn
      switchNetwork && switchNetwork(network);

      return;
    }

    if (!listing || !marketplaceContract) return;

    await buyNow(
      {
        id: listing.id,
        buyAmount: 1,
        type: listing.type,
      },
      {
        onSuccess(data, variables, context) {
          alert("NFT bought successfully!");
          console.log("SUCCESS", data, variables, context);
          router.replace("/");
        },
        onError(error, variables, context) {
          alert("ERROR: NFT could not be bought");
          console.log("ERROR", error, variables, context);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-2">
        <Loading />
      </div>
    );
  }

  if (!listing || error) {
    return <div className="flex justify-center py-2">Listing not found</div>;
  }

  return (
    <div className="p-2 flex flex-col lg:flex-row space-y-10 space-x-5 pr-10">
      <div className="p-10 border mx-auto lg:mx-0 max-w-md lg:max-w-xl">
        <MediaRenderer className="" src={listing?.asset.image} />
      </div>

      <section className="flex-1 space-y-5 pb-20 lg:pb-0">
        <div>
          <h1 className="text-xl font-bold">{listing.asset.name}</h1>
          <p className="text-gray-600">{listing.asset.description}</p>
          <p className="flex items-center text-xs sm:text-base">
            <UserCircleIcon className="h-5" />
            <span className="font-bold pr-1">Seller:</span>
            {listing.sellerAddress}
          </p>
        </div>

        <div className="grid grid-cols-2 items-center py-2">
          <p className="font-bold">Listing Type:</p>
          <p>{listing.type === ListingType.Direct ? "Direct Listing" : "Auction Listing"}</p>

          <p className="font-bold ">Buy it Now Price</p>
          <p className="text-4xl font-bold">
            {listing.buyoutCurrencyValuePerToken.displayValue}{" "}
            {listing.buyoutCurrencyValuePerToken.symbol}
          </p>

          <button
            className="col-start-2 mt-2 bg-blue-600 font-bold text-white rounded-full w-44 py-4 px-10"
            onClick={buyNft}
          >
            Buy Now
          </button>
        </div>

        {/* If DIRECT, show offers here... */}
        {listing.type === ListingType.Direct && offers && (
          <div className="grid grid-cols-2 gap-y-2">
            <p className="font-bold">Offers:</p>
            <p className="font-bold">{offers.length > 0 ? offers.length : 0}</p>

            {offers.map((offer) => (
              <>
                <p className="flex items-center ml-5 text-sm italic">
                  <UserCircleIcon className="h-3 mr-2" />
                  {offer.offeror.slice(0, 5) + "..." + offer.offeror.slice(-5)}
                </p>
                <div>
                  <p
                    key={offer.listingId + offer.offeror + offer.totalOfferAmount.toString()}
                    className="text-sm italic"
                  >
                    {ethers.utils.formatEther(offer.totalOfferAmount)}{" "}
                    {NATIVE_TOKENS[network].symbol}
                  </p>

                  {listing.sellerAddress === address && (
                    <button
                      className="p-2 w-32 bg-red-500/50 rounded-lg font-bold text-xs cursor-pointer"
                      onClick={() => {
                        acceptOffer(
                          {listingId, addressOfOfferor: offer.offeror},
                          {
                            onSuccess(data, variables, context) {
                              alert("Offer accepted successfully!");
                              console.log("SUCCESS", data, variables, context);
                              router.replace("/");
                            },
                            onError(error, variables, context) {
                              alert("ERROR: Offer could not be accepted");
                              console.log("ERROR", error, variables, context);
                            },
                          },
                        );
                      }}
                    >
                      Accept Offer
                    </button>
                  )}
                </div>
              </>
            ))}
          </div>
        )}

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
      </section>
    </div>
  );
}

export default ListingPage;
