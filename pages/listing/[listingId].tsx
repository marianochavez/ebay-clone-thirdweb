/* eslint-disable no-console */
import {useRouter} from "next/router";
import {MediaRenderer, useListing} from "@thirdweb-dev/react";
import {UserCircleIcon} from "@heroicons/react/24/solid";
import {Toaster} from "react-hot-toast";
import Head from "next/head";
import {useContext} from "react";

import Loading from "../../components/ui/Loading";
import BuyNFT from "../../components/BuyNFT";
import {WalletContext} from "../../context/WalletContext";

function ListingPage() {
  const router = useRouter();
  const {listingId} = router.query as {listingId: string};
  const {marketplaceContract} = useContext(WalletContext);
  const {data: listing, isLoading, error} = useListing(marketplaceContract, listingId);

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
      <Head>
        <title>{listing.asset.name}</title>
      </Head>
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

        <BuyNFT contract={marketplaceContract!} listing={listing} listingId={listingId} />

        <Toaster />
      </section>
    </div>
  );
}

export default ListingPage;
