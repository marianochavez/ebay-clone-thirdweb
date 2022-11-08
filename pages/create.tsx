import React, {useContext, useState} from "react";
import {NFT, NATIVE_TOKEN_ADDRESS} from "@thirdweb-dev/sdk";
import {
  MediaRenderer,
  useCreateAuctionListing,
  useCreateDirectListing,
  useOwnedNFTs,
} from "@thirdweb-dev/react";
import Head from "next/head";
import Link from "next/link";
import {toast, Toaster} from "react-hot-toast";

import network from "../utils/network";
import Loading from "../components/ui/Loading";
import useVerifyNetwork from "../hooks/useVerifyNetwork";
import {redirect} from "../utils/redirect";
import {WalletContext} from "../context/WalletContext";

type Props = {};

function CreatePage({}: Props) {
  const {address, collectionContract, marketplaceContract} = useContext(WalletContext);
  const [selectedNft, setSelectedNft] = useState<NFT>();

  const ownedNfts = useOwnedNFTs(collectionContract, address);
  const checkNetwork = useVerifyNetwork({network});

  const {
    mutate: createDirectListing,
    isLoading: isLoadingDirect,
    error: errorDirect,
    isSuccess: successDirect,
  } = useCreateDirectListing(marketplaceContract);

  const {
    mutate: createAuctionListing,
    isLoading: isLoadingAuction,
    error: errorAuction,
    isSuccess: successAuction,
  } = useCreateAuctionListing(marketplaceContract);

  /**
   * This function gets called when the form is submitted.
   * The user has provided:
   * - contract address
   * - token id
   * type of listing (either auction or direct)
   * price of the NFT
   * </code>
   * @param e - React.FormEvent<HTMLFormElement>
   * @returns a promise.
   */
  async function handleCreateListing(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    checkNetwork();

    if (!selectedNft) return;

    const target = e.target as typeof e.target & {
      elements: {
        listingType: {value: string};
        price: {value: string};
      };
    };

    const {listingType, price} = target.elements;

    switch (listingType.value) {
      case "directListing":
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
            onSuccess() {
              toast.success("Created Listing successfully!", {style: {fontWeight: "bold"}});
              redirect({path: "/"});
            },
            onError(error, variables, context) {
              toast.error("Error, look at the console!", {style: {fontWeight: "bold"}});
              // eslint-disable-next-line no-console
              console.log({ERROR: {error, variables, context}});
            },
          },
        );
        break;

      case "auctionListing":
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
            onSuccess() {
              toast.success("Created Auction successfully!");
              redirect({path: "/"});
            },
            onError(error, variables, context) {
              toast.error("Error, look at the console!");
              // eslint-disable-next-line no-console
              console.log({ERROR: {error, variables, context}});
            },
          },
        );

      default:
        break;
    }
  }

  return (
    <div className="p-10 pt-2">
      <Head>
        <title>List Item</title>
      </Head>
      {!address || ownedNfts.isLoading ? (
        <div className="flex items-center justify-center">
          <Loading />
        </div>
      ) : ownedNfts.data?.length === 0 ? (
        <div className="flex flex-col items-center ">
          <p className="font-bold text-2xl">You do not own any nft :(</p>
          <Link className="text-blue-500 cursor-pointer" href="/">
            Go to the marketplace
          </Link>
        </div>
      ) : (
        <div className="">
          <h1 className="text-4xl font-bold">List an Item</h1>
          <h2 className="text-xl font-semibold pt-5">Select an Item you would like to Sell</h2>

          <hr className="pb-5" />

          <p>Below you will find the NFT&apos;s you own in your wallet</p>

          <div className="flex overflow-x-scroll space-x-2 p-4">
            {ownedNfts?.data?.map((nft) => (
              <div
                key={nft.metadata.id}
                className={`flex flex-col space-y-2 card min-w-fit border-2 bg-gray-100 ${
                  nft.metadata.id === selectedNft?.metadata.id
                    ? "border-black"
                    : "border-transparent"
                } `}
                onClick={() => setSelectedNft(nft)}
              >
                <MediaRenderer className="h-48 rounded-lg" src={nft.metadata.image} />
                <p className="text-lg truncate font-bold">{nft.metadata.name}</p>
                <p className="text-xs line-clamp-2 w-48">{nft.metadata.description}</p>
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
                <button
                  className={`flex justify-center  text-white rounded-lg p-4 mt-8 ${
                    successAuction || successDirect ? "bg-green-600" : "bg-blue-600"
                  }`}
                  disabled={isLoadingAuction || isLoadingDirect || successAuction || successDirect}
                  type="submit"
                >
                  {isLoadingAuction || isLoadingDirect ? (
                    <Loading text="Processing..." textColor="text-white" />
                  ) : errorAuction || errorDirect ? (
                    "Error, try again!"
                  ) : successAuction || successDirect ? (
                    "Success!"
                  ) : (
                    "Create Listing"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
      <Toaster />
    </div>
  );
}

export default CreatePage;
