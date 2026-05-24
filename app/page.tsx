import React from "react";
import client from "@/tina/__generated__/client";
import Layout from "@/components/layout/layout";
import { TinaMarkdown } from "tinacms/dist/rich-text";

export const revalidate = 300;

export default async function Home() {
  const data = await client.queries.pages({
    relativePath: `home.mdx`,
  });

  return (
    <Layout>
      <div className="wrapper section">
        <div className="prose">
          <TinaMarkdown content={data.data.pages._body} />
        </div>
      </div>
    </Layout>
  );
}
