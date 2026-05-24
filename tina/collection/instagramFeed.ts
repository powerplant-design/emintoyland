import type { Collection } from 'tinacms';

const InstagramFeed: Collection = {
  label: 'Instagram Feed',
  name: 'instagramFeed',
  path: 'content/instagram-feed',
  format: 'md',
  fields: [
    {
      type: 'image',
      label: 'Image',
      name: 'image',
      required: true,
    },
    {
      type: 'string',
      label: 'Instagram URL',
      name: 'instagramUrl',
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

export default InstagramFeed;
