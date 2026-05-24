import React from 'react';
import { notFound } from 'next/navigation';
import client from '@/tina/__generated__/client';
import Layout from '@/components/layout/layout';
import ClientPage from './client-page';

export const revalidate = 300;

export default async function Page({
  params,
}: {
  params: Promise<{ urlSegments: string[] }>;
}) {
  const resolvedParams = await params;
  const filepath = resolvedParams.urlSegments.join('/');

  let data;
  try {
    data = await client.queries.pages({
      relativePath: `${filepath}.mdx`,
    });
  } catch (error) {
    notFound();
  }

  return (
    <Layout>
      <div className="wrapper section prose">
        <ClientPage data={data.data.pages} />
      </div>
    </Layout>
  );
}

export async function generateStaticParams() {
  let pages = await client.queries.pagesConnection();
  const allPages = pages;

  if (!allPages.data.pagesConnection.edges) {
    return [];
  }

  while (pages.data.pagesConnection.pageInfo.hasNextPage) {
    pages = await client.queries.pagesConnection({
      after: pages.data.pagesConnection.pageInfo.endCursor,
    });

    if (!pages.data.pagesConnection.edges) {
      break;
    }

    allPages.data.pagesConnection.edges.push(...pages.data.pagesConnection.edges);
  }

  const explicitPages = ['home', 'about', 'contact', 'privacy-policy'];

  const params = allPages.data?.pagesConnection.edges
    .map((edge) => ({
      urlSegments: edge?.node?._sys.breadcrumbs || [],
    }))
    .filter((x) => x.urlSegments.length >= 1)
    .filter((x) => !x.urlSegments.every((x) => explicitPages.includes(x)));

  return params;
}
