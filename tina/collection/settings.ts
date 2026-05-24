import type { Collection } from 'tinacms';

const Settings: Collection = {
  label: 'Settings',
  name: 'settings',
  path: 'content/settings',
  format: 'json',
  ui: {
    global: true,
  },
  fields: [
    {
      type: 'string',
      label: 'Site Title',
      name: 'siteTitle',
    },
    {
      type: 'string',
      label: 'Site Description',
      name: 'siteDescription',
      ui: {
        component: 'textarea',
      },
    },
    {
      type: 'image',
      label: 'Logo',
      name: 'logo',
    },
    {
      type: 'object',
      label: 'Nav Links',
      name: 'nav',
      list: true,
      ui: {
        itemProps: (item) => ({ label: item?.label }),
        defaultItem: { href: '/', label: 'Home' },
      },
      fields: [
        { type: 'string', label: 'Label', name: 'label' },
        { type: 'string', label: 'Link', name: 'href' },
      ],
    },
    {
      type: 'object',
      label: 'Social Links',
      name: 'social',
      list: true,
      ui: {
        itemProps: (item) => ({ label: item?.label || item?.url }),
      },
      fields: [
        { type: 'string', label: 'Label', name: 'label' },
        { type: 'string', label: 'URL', name: 'url' },
        {
          type: 'string',
          label: 'Icon',
          name: 'icon',
          options: ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'youtube', 'email'],
        },
      ],
    },
    {
      type: 'string',
      label: 'Footer Text',
      name: 'footerText',
      ui: {
        component: 'textarea',
      },
    },
    {
      type: 'string',
      label: 'Google Analytics ID',
      name: 'googleAnalyticsId',
    },
  ],
};

export default Settings;
