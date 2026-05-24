import React from 'react';
import Link from 'next/link';
import client from '@/tina/__generated__/client';
import Layout from '@/components/layout/layout';

export const revalidate = 300;

export default async function WorkPage() {
  const data = await client.queries.workItemsConnection({
    sort: 'publishedDate',
    last: 50,
  });

  const items = data.data.workItemsConnection.edges || [];

  return (
    <Layout>
      <div className="wrapper section">
        <h1>Work</h1>
        <div className="grid" style={{ '--grid-min': '300px' } as React.CSSProperties}>
          {items.map((edge) => {
            const item = edge?.node;
            if (!item) return null;
            return (
              <article key={item.id} className="card">
                {item.image && (
                  <img src={item.image} alt="" className="card__image" />
                )}
                <div className="card__body">
                  <h2 className="card__title">
                    <Link href={`/work/${item._sys.filename}`}>{item.title}</Link>
                  </h2>
                  {item.workType && <span className="card__category">{item.workType}</span>}
                  {item.description && <p className="card__excerpt">{item.description}</p>}
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="button button--small button--primary" style={{ marginBlockStart: 'var(--space-s)' }}>
                      View
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
