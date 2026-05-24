import React from 'react';
import Link from 'next/link';
import client from '@/tina/__generated__/client';
import Layout from '@/components/layout/layout';

export const revalidate = 300;

export default async function BlogPage() {
  const data = await client.queries.blogPostsConnection({
    sort: 'publishedDate',
    last: 50,
  });

  const posts = data.data.blogPostsConnection.edges || [];

  return (
    <Layout>
      <div className="wrapper section">
        <h1>Blog</h1>
        <div className="grid" style={{ '--grid-min': '300px' } as React.CSSProperties}>
          {posts.map((edge) => {
            const post = edge?.node;
            if (!post) return null;
            return (
              <article key={post.id} className="card">
                {post.featuredImage && (
                  <img src={post.featuredImage} alt="" className="card__image" />
                )}
                <div className="card__body">
                  <h2 className="card__title">
                    <Link href={`/blog/${post._sys.filename}`}>{post.title}</Link>
                  </h2>
                  {post.publishedDate && (
                    <p className="card__meta">
                      {new Date(post.publishedDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                  {post.excerpt && <p className="card__excerpt">{post.excerpt}</p>}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
