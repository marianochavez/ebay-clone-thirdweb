import {ReactNode} from "react";

import Header from "./Header";

type Props = {
  children: ReactNode;
};

const Layout = ({children}: Props) => {
  return (
    <div className="max-w-6xl mx-auto">
      <Header />
      <main>{children}</main>
    </div>
  );
};

export default Layout;
