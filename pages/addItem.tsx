import React, {useState} from "react";
import {useAddress, useContract} from "@thirdweb-dev/react";
import Image from "next/image";
import {useRouter} from "next/router";

import Header from "../components/Header";

type Props = {};

function AddItemPage({}: Props) {
  const router = useRouter();
  const address = useAddress();
  const [preview, setPreview] = useState<string>();
  const [image, setImage] = useState<File>();

  const {contract} = useContract(process.env.NEXT_PUBLIC_COLLECTION_CONTRACT, "nft-collection");

  async function mintNft(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!contract || !address) {
      alert("Make sure you are connected to your wallet");

      return;
    }

    if (!image) {
      alert("Please select an image");

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

    try {
      // transaction
      const tx = await contract.mintTo(address, metadata);

      const receipt = tx.receipt; // the transaction receipt
      const tokenId = tx.id; // the id of the NFT minted
      const nft = await tx.data(); // (optional) fetch details of minted NFT

      // eslint-disable-next-line no-console
      console.log(receipt, tokenId, nft);
      router.push("/");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  return (
    <div>
      <Header />

      <main className="max-w-6xl mx-auto p-10 border">
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
            src={preview || "https://links.papareact.com/ucj"}
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
                  setPreview(URL.createObjectURL(e.target.files[0]));
                  setImage(e.target.files[0]);
                }
              }}
            />

            <button
              className="bg-blue-600 font-bold text-white rounded-full py-4 px-10 w-56 md:mt-auto mx-auto md:ml-auto"
              type="submit"
            >
              Add/Mint Item
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AddItemPage;