import React from "react";
import client from "@/tina/__generated__/client";
import Layout from "@/components/layout/layout";
import { TinaMarkdown } from "tinacms/dist/rich-text";

export const revalidate = 300;

export default async function ContactPage() {
  const data = await client.queries.pages({
    relativePath: "contact.mdx",
  });

  return (
    <Layout>
      <section className="section">
        <div className="wrapper prose">
          <TinaMarkdown content={data.data.pages._body} />
          <div className="form" style={{ marginBlockStart: 'var(--space-l)' }}>
            <form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field">
              <input type="hidden" name="form-name" value="contact" />
              <p hidden>
                <label>Don&apos;t fill this out: <input name="bot-field" /></label>
              </p>
              <div className="form__field">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="name" required />
              </div>
              <div className="form__field">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" required />
              </div>
              <div className="form__field">
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" rows={6} required></textarea>
              </div>
              <button type="submit" className="button button-primary">Send Message</button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
}
