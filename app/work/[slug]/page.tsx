import React from 'react';
import { notFound } from 'next/navigation';
import client from '@/tina/__generated__/client';
import Layout from '@/components/layout/layout';

export const revalidate = 300;

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let data;
  try {
    data = await client.queries.workItems({
      relativePath: `${slug}.mdx`,
    });
  } catch (error) {
    notFound();
  }

  const item = data.data.workItems;

  return (
    <Layout>
      <article className="wrapper section">
        {item.image && (
          <img src={item.image} alt="" style={{ maxWidth: '100%', borderRadius: 'var(--radius-md)', marginBlockEnd: 'var(--space-m)' }} />
        )}
        <h1>{item.title}</h1>
        {item.workType && (
          <span style={{ color: 'var(--color-pink)', fontSize: 'var(--step--1)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            {item.workType}
          </span>
        )}
        {item.description && (
          <p style={{ marginBlockStart: 'var(--space-m)', lineHeight: 'var(--leading-relaxed)' }}>
            {item.description}
          </p>
        )}
        {item.link && (
          <a href={item.link} target="_blank" rel="noopener noreferrer" className="button button--primary" style={{ marginBlockStart: 'var(--space-m)' }}>
            View Project
          </a>
        )}
      </article>
    </Layout>
  );
}

export async function generateStaticParams() {
  let items = await client.queries.workItemsConnection();
  const allItems = items;

  if (!allItems.data.workItemsConnection.edges) {
    return [];
  }

  while (items.data.workItemsConnection.pageInfo.hasNextPage) {
    items = await client.queries.workItemsConnection({
      after: items.data.workItemsConnection.pageInfo.endCursor,
    });

    if (!items.data.workItemsConnection.edges) {
      break;
    }

    allItems.data.workItemsConnection.edges.push(...items.data.workItemsConnection.edges);
  }

  return allItems.data.workItemsConnection.edges
    .filter((edge) => edge?.node?._sys.filename)
    .map((edge) => ({
      slug: edge!.node!._sys.filename,
    }));
}
