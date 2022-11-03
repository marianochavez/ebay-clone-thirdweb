import Router from "next/router";
import {toast} from "react-hot-toast";

type Props = {
  path: string;
};

export const redirect = ({path}: Props) => {
  setTimeout(() => {
    toast.loading("Redirecting...");
    setTimeout(() => {
      Router.push(path);
    }, 2000);
  }, 4000);
};
