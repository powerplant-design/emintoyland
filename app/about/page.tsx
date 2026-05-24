import React from "react";
import client from "@/tina/__generated__/client";
import Layout from "@/components/layout/layout";
import { TinaMarkdown } from "tinacms/dist/rich-text";

export const revalidate = 300;

export default async function AboutPage() {
  const data = await client.queries.pages({
    relativePath: "about.mdx",
  });

  return (
    <Layout>
      {/* Hero image */}
      <section className="about-hero">
        <img src="/images/eit-about-hero.png" alt="Emma Hewitt-Johnson" className="about-hero__image" />
      </section>

      <div className="separator-hearts">
        <img src="/images/eit-heart-layerz.png" alt="" />
      </div>

      {/* Intro section with image */}
      <section className="section">
        <div className="wrapper">
          <div className="about-intro">
            <div className="about-intro__image">
              <img src="/images/eit-about-02.png" alt="Emma Hewitt-Johnson" />
            </div>
            <div className="about-intro__content prose">
              <TinaMarkdown content={data.data.pages._body} />
            </div>
          </div>
        </div>
      </section>

      <div className="separator-hearts">
        <img src="/images/eit-heart-layerz.png" alt="" />
      </div>
    </Layout>
  );
}
