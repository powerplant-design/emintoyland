import React from "react";
import client from "@/tina/__generated__/client";
import Layout from "@/components/layout/layout";
import { TinaMarkdown } from "tinacms/dist/rich-text";

export const revalidate = 300;

export default async function PrivacyPage() {
  const data = await client.queries.pages({
    relativePath: "privacy-policy.mdx",
  });

  return (
    <Layout>
      <section className="section">
        <div className="wrapper prose">
          <TinaMarkdown content={data.data.pages._body} />
        </div>
      </section>
    </Layout>
  );
}
