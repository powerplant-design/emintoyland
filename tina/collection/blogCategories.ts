import type { Collection } from 'tinacms';

const BlogCategories: Collection = {
  label: 'Blog Categories',
  name: 'blogCategories',
  path: 'content/blog-categories',
  format: 'md',
  fields: [
    {
      type: 'string',
      label: 'Name',
      name: 'name',
      isTitle: true,
      required: true,
    },
    {
      type: 'string',
      label: 'Description',
      name: 'description',
      ui: {
        component: 'textarea',
      },
    },
  ],
};

export default BlogCategories;
