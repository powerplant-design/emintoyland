import React from "react";
import Link from "next/link";
import client from "@/tina/__generated__/client";
import Layout from "@/components/layout/layout";
import { TinaMarkdown } from "tinacms/dist/rich-text";

export const revalidate = 300;

export default async function Home() {
  const data = await client.queries.pages({
    relativePath: `home.mdx`,
  });

  const bodySections = data.data.pages._body?.children || [];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-section">
        <img src="/images/eit-toys-left.png" alt="" className="hero-section__toy hero-section__toy--left" />
        <img src="/images/eit-toys-right.png" alt="" className="hero-section__toy hero-section__toy--right" />
        <div className="hero-section__content wrapper">
          <h1 className="hero-section__title">
            Certified <span className="text-span">Sexologist</span>
          </h1>
          <p className="hero-section__subtitle">
            Sexologist, Certified Sex Educator, writer, podcaster,<br />
            video host &amp; sex toy expert
          </p>
          <div className="hero-section__actions">
            <Link href="/about" className="button button-primary">More on me</Link>
            <Link href="/work" className="button button-secondary">View my work</Link>
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="separator-hearts">
        <img src="/images/eit-heart-layerz.png" alt="" />
      </div>

      {/* Main content sections */}
      <div className="wrapper section flow">
        <TinaMarkdown content={data.data.pages._body} />
      </div>

      {/* Sparkle decoration */}
      <div className="sparkle-section">
        <img src="/images/eit-sparklez.gif" alt="" className="sparkle-section__gif" />
      </div>

      {/* CTA Section */}
      <section className="cta-section section" data-padding="large">
        <img src="/images/cta-bg.webp" alt="" className="cta-section__bg" />
        <div className="cta-section__content wrapper center" data-align="text">
          <h2>Ready to work together?</h2>
          <p>I&apos;m always open to new projects and collaborations.</p>
          <Link href="/contact" className="button button-primary" style={{ marginBlockStart: 'var(--space-m)' }}>
            Get in touch
          </Link>
        </div>
      </section>

      {/* Separator */}
      <div className="separator-hearts">
        <img src="/images/eit-heart-layerz.png" alt="" />
      </div>
    </Layout>
  );
}
