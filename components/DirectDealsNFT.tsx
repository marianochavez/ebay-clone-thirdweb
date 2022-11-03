import {UserCircleIcon} from "@heroicons/react/24/solid";
import {useAcceptDirectListingOffer, useAddress} from "@thirdweb-dev/react";
import {AuctionListing, DirectListing, Marketplace, NATIVE_TOKENS} from "@thirdweb-dev/sdk";
import {ethers} from "ethers";
import {toast} from "react-hot-toast";

import network from "../utils/network";
import {redirect} from "../utils/redirect";
type Props = {
  contract: Marketplace;
  listingId: string;
  listing: AuctionListing | DirectListing;
  offers: Record<string, any>[];
};

const DirectDealsNFT = ({contract, listingId, listing, offers}: Props) => {
  const address = useAddress();
  const {mutate: acceptOffer} = useAcceptDirectListingOffer(contract);

  return (
    <div className="grid grid-cols-2 gap-y-2">
      <p className="font-bold">Offers:</p>
      <p className="font-bold">{offers!.length > 0 ? offers!.length : 0}</p>

      {offers!.map((offer) => (
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
              {ethers.utils.formatEther(offer.totalOfferAmount)} {NATIVE_TOKENS[network].symbol}
            </p>

            {listing!.sellerAddress === address && (
              <button
                className="p-2 w-32 bg-red-500/50 rounded-lg font-bold text-xs cursor-pointer"
                onClick={() => {
                  acceptOffer(
                    {listingId, addressOfOfferor: offer.offeror},
                    {
                      onSuccess() {
                        toast.success("Offer accepted successfully!", {
                          style: {fontWeight: "bold"},
                        });

                        redirect({path: "/"});
                      },
                      onError(error, variables, context) {
                        toast.error("Offer could not be accepted. Look at the console!", {
                          style: {fontWeight: "bold"},
                        });
                        // eslint-disable-next-line no-console
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
  );
};

export default DirectDealsNFT;
