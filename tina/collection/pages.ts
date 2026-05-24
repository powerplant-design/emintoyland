import type { Collection } from 'tinacms';

const Pages: Collection = {
  label: 'Pages',
  name: 'pages',
  path: 'content/pages',
  format: 'mdx',
  ui: {
    router: ({ document }) => {
      const filepath = document._sys.breadcrumbs.join('/');
      if (filepath === 'home') {
        return '/';
      }
      return `/${filepath}`;
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
      type: 'string',
      label: 'Meta Description',
      name: 'metaDescription',
      ui: {
        component: 'textarea',
      },
    },
    {
      type: 'image',
      label: 'OG Image',
      name: 'ogImage',
    },
    {
      type: 'rich-text',
      label: 'Body',
      name: '_body',
      isBody: true,
    },
  ],
};

export default Pages;
