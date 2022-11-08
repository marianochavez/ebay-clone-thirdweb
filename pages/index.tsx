import {useActiveListings} from "@thirdweb-dev/react";
import Head from "next/head";
import {useContext} from "react";

import ListingCard from "../components/ListingCard";
import Loading from "../components/ui/Loading";
import {WalletContext} from "../context/WalletContext";

export default function HomePage() {
  const {marketplaceContract} = useContext(WalletContext);
  const {data: listings, isLoading: loadingListings} = useActiveListings(marketplaceContract);

  return (
    <div>
      <Head>
        <title>Ebay Thirdweb</title>
      </Head>
      <div className="py-2 px-6">
        {loadingListings ? (
          <div className="flex items-center justify-center">
            <Loading text="Loading Listing..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mx-auto">
            {listings?.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
