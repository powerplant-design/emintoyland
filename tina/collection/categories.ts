import type { Collection } from 'tinacms';

const Categories: Collection = {
  label: 'Categories',
  name: 'categories',
  path: 'content/categories',
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

export default Categories;
