import React, {useContext, useState} from "react";
import {useIsAddressRole} from "@thirdweb-dev/react";
import Image from "next/image";
import Head from "next/head";
import toast, {Toaster} from "react-hot-toast";

import {redirect} from "../utils/redirect";
import {WalletContext} from "../context/WalletContext";

type Props = {};

function AddItemPage({}: Props) {
  const {address, collectionContract} = useContext(WalletContext);
  const [previewImage, setPreviewImage] = useState<string>();
  const [image, setImage] = useState<File>();
  const [isLoading, setisLoading] = useState(false);
  const isMember = useIsAddressRole(collectionContract, "minter", address);

  async function mintNft(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!collectionContract || !address) {
      toast.error("Make sure you are connected with your wallet");

      return;
    }

    if (!image) {
      toast.error("Please select an image");

      return;
    }

    const target = e.target as typeof e.target & {
      name: {value: string};
      description: {value: string};
    };

    const metadata = {
      name: target.name.value,
      description: target.description.value,
      image: image,
    };

    setisLoading(true);
    toast
      .promise(
        collectionContract.mintTo(address, metadata),
        {
          loading: "Processing...",
          success: "Item minted!",
          error: "Item could not be minted!\nLook at the console",
        },
        {duration: 5000, style: {fontWeight: "bold", padding: "16px"}},
      )
      .then(() => redirect({path: "/"}))
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.log(error);

        setisLoading(false);
      });
  }

  if (!isMember) {
    return (
      <div className="p-10 flex flex-col items-center">
        <Head>
          <title>Unauthorized</title>
        </Head>
        <p className="font-bold text-3xl">
          You do not have permission to add an item to the collection.
        </p>
        <p className="font-bold text-2xl">Is under construction...</p>
      </div>
    );
  }

  return (
    <div>
      <Head>
        <title>Add Item</title>
      </Head>
      <div className="p-10 border">
        <h1 className="text-4xl font-bold">Add an Item to the Marketplace</h1>
        <h2 className="text-xl font-semibold pt-5">Item Details</h2>
        <p className="pb-5">
          By adding an item to the marketplace, you&apos;re essentially Minting an NFT of the item
          into your wallet which we can then list for sale!
        </p>

        <div className="flex flex-col justify-center items-center md:flex-row md:space-x-5 pt-5">
          <Image
            alt="Item image"
            className="border object-contain"
            height={300}
            priority={false}
            src={previewImage || "https://links.papareact.com/ucj"}
            width={300}
          />

          <form className="flex flex-col flex-1 p-2 space-y-2 " onSubmit={mintNft}>
            <label className="font-light">Name of Item</label>
            <input
              className="formField"
              id="name"
              name="name"
              placeholder="Name of item..."
              type="text"
            />

            <label className="font-light">Description</label>
            <input
              className="formField"
              id="description"
              name="description"
              placeholder="Enter Description..."
              type="text"
            />

            <label className="font-light">Image of the Item</label>
            <input
              accept="image/*"
              className="pb-10"
              type="file"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setPreviewImage(URL.createObjectURL(e.target.files[0]));
                  setImage(e.target.files[0]);
                }
              }}
            />

            <button
              className="bg-blue-600 font-bold text-white rounded-full py-4 px-10 w-56 md:mt-auto mx-auto md:ml-auto disabled:bg-gray-400"
              disabled={isLoading}
              type="submit"
            >
              Add/Mint Item
            </button>
          </form>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default AddItemPage;
