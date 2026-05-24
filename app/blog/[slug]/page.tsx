import React from 'react';
import { notFound } from 'next/navigation';
import client from '@/tina/__generated__/client';
import Layout from '@/components/layout/layout';
import { TinaMarkdown } from 'tinacms/dist/rich-text';

export const revalidate = 300;

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let data;
  try {
    data = await client.queries.blogPosts({
      relativePath: `${slug}.mdx`,
    });
  } catch (error) {
    notFound();
  }

  const post = data.data.blogPosts;

  return (
    <Layout>
      <article className="wrapper section">
        {post.featuredImage && (
          <img src={post.featuredImage} alt="" style={{ maxWidth: '100%', borderRadius: 'var(--radius-md)', marginBlockEnd: 'var(--space-m)' }} />
        )}
        <h1>{post.title}</h1>
        {post.publishedDate && (
          <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--step--1)', marginBlockEnd: 'var(--space-m)' }}>
            {new Date(post.publishedDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}
        <div className="prose">
          <TinaMarkdown content={post._body} />
        </div>
      </article>
    </Layout>
  );
}

export async function generateStaticParams() {
  let posts = await client.queries.blogPostsConnection();
  const allPosts = posts;

  if (!allPosts.data.blogPostsConnection.edges) {
    return [];
  }

  while (posts.data.blogPostsConnection.pageInfo.hasNextPage) {
    posts = await client.queries.blogPostsConnection({
      after: posts.data.blogPostsConnection.pageInfo.endCursor,
    });

    if (!posts.data.blogPostsConnection.edges) {
      break;
    }

    allPosts.data.blogPostsConnection.edges.push(...posts.data.blogPostsConnection.edges);
  }

  return allPosts.data.blogPostsConnection.edges
    .filter((edge) => edge?.node?._sys.filename)
    .map((edge) => ({
      slug: edge!.node!._sys.filename,
    }));
}
