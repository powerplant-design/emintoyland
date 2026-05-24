import React, { PropsWithChildren } from "react";
import client from "../../tina/__generated__/client";
import { Header } from "./nav/header";
import { Footer } from "./nav/footer";

type LayoutProps = PropsWithChildren & {
  rawPageData?: any;
};

export default async function Layout({ children, rawPageData }: LayoutProps) {
  const { data: settings } = await client.queries.settings({
    relativePath: "index.json",
  }, {
    fetchOptions: {
      next: {
        revalidate: 60,
      },
    },
  });

  return (
    <>
      <Header settings={settings.settings} />
      <main className="main-content">
        {children}
      </main>
      <Footer settings={settings.settings} />
    </>
  );
}
