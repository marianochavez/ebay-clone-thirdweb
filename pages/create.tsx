import {NFT, NATIVE_TOKENS, NATIVE_TOKEN_ADDRESS} from "@thirdweb-dev/sdk";
import React, {useState} from "react";
import {
  MediaRenderer,
  useAddress,
  useContract,
  useCreateAuctionListing,
  useCreateDirectListing,
  useNetwork,
  useNetworkMismatch,
  useOwnedNFTs,
} from "@thirdweb-dev/react";
import Router, {useRouter} from "next/router";

import Header from "../components/Header";
import network from "../utils/network";

type Props = {};

function CreatePage({}: Props) {
  const router = useRouter();
  const address = useAddress();
  const [selectedNft, setSelectedNft] = useState<NFT>();
  const {contract: marketplaceContract} = useContract(
    process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
    "marketplace",
  );
  const {contract: collectionContract} = useContract(
    process.env.NEXT_PUBLIC_COLLECTION_CONTRACT,
    "nft-collection",
  );

  const ownedNfts = useOwnedNFTs(collectionContract, address);
  const networkMismatch = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();

  const {
    mutate: createDirectListing,
    isLoading: isLoadingDirect,
    error: errorDirect,
  } = useCreateDirectListing(marketplaceContract);

  const {
    mutate: createAuctionListing,
    isLoading: isLoadingAuction,
    error: errorAuction,
  } = useCreateAuctionListing(marketplaceContract);

  // This function gets called when the form is submitted.
  // The user has provided:
  // - contract address
  // - token id
  // type of listing (either auction or direct)
  // price of the NFT
  async function handleCreateListing(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (networkMismatch) {
      switchNetwork && switchNetwork(network);

      return;
    }

    const target = e.target as typeof e.target & {
      elements: {
        listingType: {value: string};
        price: {value: string};
      };
    };

    if (!selectedNft) return;

    const {listingType, price} = target.elements;

    if (listingType.value === "directListing") {
      createDirectListing(
        {
          assetContractAddress: process.env.NEXT_PUBLIC_COLLECTION_CONTRACT!,
          tokenId: selectedNft.metadata.id,
          currencyContractAddress: NATIVE_TOKEN_ADDRESS,
          listingDurationInSeconds: 60 * 60 * 24 * 7, // 1 week
          quantity: 1,
          buyoutPricePerToken: price.value,
          startTimestamp: new Date(),
        },
        {
          onSettled(data, variables, context) {
            // eslint-disable-next-line no-console
            console.log("SUCCESS", data, variables, context);
            router.push("/");
          },
          onError(error, variables, context) {
            // eslint-disable-next-line no-console
            console.log("ERROR", error, variables, context);
          },
        },
      );
    }

    if (listingType.value === "auctionListing") {
      createAuctionListing(
        {
          assetContractAddress: process.env.NEXT_PUBLIC_COLLECTION_CONTRACT!,
          tokenId: selectedNft.metadata.id,
          currencyContractAddress: NATIVE_TOKEN_ADDRESS,
          listingDurationInSeconds: 60 * 60 * 24 * 7, // 1 week
          quantity: 1,
          buyoutPricePerToken: price.value,
          startTimestamp: new Date(),
          reservePricePerToken: 0,
        },
        {
          onSuccess(data, variables, context) {
            // eslint-disable-next-line no-console
            console.log("SUCCESS", data, variables, context);
            router.push("/");
          },
          onError(error, variables, context) {
            // eslint-disable-next-line no-console
            console.log("ERROR", error, variables, context);
          },
        },
      );
    }
  }

  return (
    <div>
      <Header />

      <main className="max-w-6xl mx-auto p-10 pt-2">
        <h1 className="text-4xl font-bold">List an Item</h1>
        <h2 className="text-xl font-semibold pt-5">Select an Item you would like to Sell</h2>

        <hr className="pb-5" />

        <p>Below you will find the NFT&apos;s you own in your wallet</p>

        <div className="flex overflow-x-scroll space-x-2 p-4">
          {ownedNfts?.data?.map((nft) => (
            <div
              key={nft.metadata.id}
              className={`flex flex-col space-y-2 card min-w-fit border-2 bg-gray-100 ${
                nft.metadata.id === selectedNft?.metadata.id ? "border-black" : "border-transparent"
              } `}
              onClick={() => setSelectedNft(nft)}
            >
              <MediaRenderer className="h-48 rounded-lg" src={nft.metadata.image} />
              <p className="text-lg truncate font-bold">{nft.metadata.name}</p>
              <p className="text-xs truncate">{nft.metadata.description}</p>
            </div>
          ))}
        </div>

        {selectedNft && (
          <form onSubmit={handleCreateListing}>
            <div className="flex flex-col p-10">
              <div className=" grid grid-cols-2 gap-5">
                <label className="border-r font-light">Direct Listing / Fixed Price</label>
                <input
                  className="ml-auto h-10 w-10"
                  name="listingType"
                  type="radio"
                  value="directListing"
                />

                <label className="border-r font-light">Auction</label>
                <input
                  className="ml-auto h-10 w-10"
                  name="listingType"
                  type="radio"
                  value="auctionListing"
                />

                <label className="border-r font-light">Price</label>
                <input className="bg-gray-100 p-5" name="price" placeholder="0.05" type="text" />
              </div>
              <button className="bg-blue-600 text-white rounded-lg p-4 mt-8" type="submit">
                Create Listing
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

export default CreatePage;
