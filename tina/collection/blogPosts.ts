import type { Collection } from 'tinacms';

const BlogPosts: Collection = {
  label: 'Blog Posts',
  name: 'blogPosts',
  path: 'content/blog-posts',
  format: 'mdx',
  ui: {
    router: ({ document }) => {
      return `/blog/${document._sys.filename}`;
    },
  },
  fields: [
    {
      type: 'string',
      label: 'Title',
      name: 'title',
      isTitle: true,
      required: true,
    },
    {
      type: 'reference',
      label: 'Category',
      name: 'category',
      collections: ['categories'],
    },
    {
      type: 'string',
      label: 'Excerpt',
      name: 'excerpt',
      ui: {
        component: 'textarea',
      },
    },
    {
      type: 'image',
      label: 'Featured Image',
      name: 'featuredImage',
    },
    {
      type: 'datetime',
      label: 'Published Date',
      name: 'publishedDate',
      ui: {
        dateFormat: 'MMMM DD YYYY',
      },
    },
    {
      type: 'boolean',
      label: 'Featured',
      name: 'featured',
    },
    {
      type: 'rich-text',
      label: 'Body',
      name: '_body',
      isBody: true,
    },
  ],
};

export default BlogPosts;
