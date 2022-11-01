import "../styles/globals.css";
import type {AppProps} from "next/app";

import {ThirdwebProvider} from "@thirdweb-dev/react";

import network from "../utils/network";
import Layout from "../components/Layout";

export default function App({Component, pageProps}: AppProps) {
  return (
    <ThirdwebProvider desiredChainId={network}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ThirdwebProvider>
  );
}
