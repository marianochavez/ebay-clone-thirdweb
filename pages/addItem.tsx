import React, {useState} from "react";
import {useAddress, useContract} from "@thirdweb-dev/react";
import Image from "next/image";
import {useRouter} from "next/router";
import Head from "next/head";

import Loading from "../components/Loading";

type Props = {};

function AddItemPage({}: Props) {
  const router = useRouter();
  const address = useAddress();
  const [previewImage, setPreviewImage] = useState<string>();
  const [image, setImage] = useState<File>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [addButton, setAddButton] = useState<{success: boolean; msg: string; bgColor: string}>({
    success: false,
    msg: "Add/Mint Item",
    bgColor: "bg-blue-600",
  });

  const {contract} = useContract(process.env.NEXT_PUBLIC_COLLECTION_CONTRACT, "nft-collection");

  async function mintNft(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // todo refactor this

    if (!contract || !address) {
      alert("Make sure you are connected with your wallet");

      return;
    }

    if (!image) {
      alert("Please select an image");

      return;
    }

    setIsLoading(true);

    const target = e.target as typeof e.target & {
      name: {value: string};
      description: {value: string};
    };

    const metadata = {
      name: target.name.value,
      description: target.description.value,
      image: image,
    };

    try {
      // transaction
      const tx = await contract.mintTo(address, metadata);

      const receipt = tx.receipt; // the transaction receipt
      const tokenId = tx.id; // the id of the NFT minted
      const nft = await tx.data(); // (optional) fetch details of minted NFT

      setIsLoading(false);
      setAddButton({success: true, msg: "Item minted!", bgColor: "bg-green-500"});
      // eslint-disable-next-line no-console
      console.log(receipt, tokenId, nft);
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      setAddButton({success: false, msg: "Error, try again!", bgColor: "bg-red-500"});
      setTimeout(() => {
        setAddButton({success: false, msg: "Add/Mint Item", bgColor: "bg-blue-600"});
      }, 4000);
      setIsLoading(false);
    }
  }

  if (address !== process.env.NEXT_PUBLIC_COLLECTION_OWNER) {
    return (
      <div className="p-10 flex flex-col items-center">
        <Head>
          <title>Unauthorized</title>
        </Head>
        <p className="font-bold text-3xl">
          You do not have permission to add an item to the collection :&#40;
        </p>
        <p className="font-bold text-2xl">Ask the owner for permission</p>
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
              className="pb-10"
              type="file"
              onChange={(e) => {
                // todo: refactor
                if (e.target.files?.[0]) {
                  setPreviewImage(URL.createObjectURL(e.target.files[0]));
                  setImage(e.target.files[0]);
                }
              }}
            />

            <button
              className={`${addButton.bgColor} font-bold text-white rounded-full py-4 px-10 w-56 md:mt-auto mx-auto md:ml-auto`}
              disabled={isLoading || addButton.success}
              type="submit"
            >
              {isLoading ? <Loading text="Processing..." textColor="text-white" /> : addButton.msg}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddItemPage;
