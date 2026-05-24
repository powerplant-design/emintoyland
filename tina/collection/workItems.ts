import type { Collection } from 'tinacms';

const WorkItems: Collection = {
  label: 'Work Items',
  name: 'workItems',
  path: 'content/work-items',
  format: 'mdx',
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
      label: 'Description',
      name: 'description',
      ui: {
        component: 'textarea',
      },
    },
    {
      type: 'string',
      label: 'Link',
      name: 'link',
    },
    {
      type: 'image',
      label: 'Image',
      name: 'image',
    },
    {
      type: 'string',
      label: 'Work Type',
      name: 'workType',
      options: ['Podcast', 'Video', 'Writing', 'Featured In', 'Other'],
    },
    {
      type: 'datetime',
      label: 'Published Date',
      name: 'publishedDate',
      ui: {
        dateFormat: 'MMMM DD YYYY',
      },
    },
  ],
};

export default WorkItems;
