import React from 'react';
import client from '@/tina/__generated__/client';
import Layout from '@/components/layout/layout';
import { WorkFilter } from './filter';

export const revalidate = 300;

export default async function WorkPage() {
  const [workData, categoriesData] = await Promise.all([
    client.queries.workItemsConnection({ sort: 'publishedDate', last: 50 }),
    client.queries.categoriesConnection({ last: 50 }),
  ]);

  const items = (workData.data.workItemsConnection.edges || [])
    .map((edge) => edge?.node)
    .filter(Boolean) as any[];

  const categories = (categoriesData.data.categoriesConnection.edges || [])
    .map((edge) => edge?.node)
    .filter(Boolean) as any[];

  return (
    <Layout>
      <section className="page-header section" data-padding="small">
        <div className="wrapper">
          <h1>My Work</h1>
          <p className="page-header__subtitle">Sex-positive content creation across podcasts, video, and print</p>
        </div>
      </section>

      <WorkFilter items={items} categories={categories} />
    </Layout>
  );
}
