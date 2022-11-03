import {useActiveListings, useContract} from "@thirdweb-dev/react";
import Head from "next/head";

import ListingCard from "../components/ListingCard";
import Loading from "../components/ui/Loading";

export default function HomePage() {
  const {contract} = useContract(process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT, "marketplace");
  const {data: listings, isLoading: loadingListings} = useActiveListings(contract);

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
