export default {
  type: 'admin' as const,
  routes: [
    {
      method: 'GET',
      path: '/settings',
      handler: 'settings.getSettings',
      config: { policies: [] },
    },
    {
      method: 'PUT',
      path: '/settings',
      handler: 'settings.setSettings',
      config: { policies: [] },
    },
    {
      method: 'GET',
      path: '/triggers',
      handler: 'triggers.getTriggers',
      config: { policies: [] },
    },
    {
      method: 'PUT',
      path: '/triggers',
      handler: 'triggers.setTriggers',
      config: { policies: [] },
    },
    {
      method: 'GET',
      path: '/content-types',
      handler: 'content-types.list',
      config: { policies: [] },
    },
    {
      method: 'GET',
      path: '/depth-attributes',
      handler: 'depth-attributes.get',
      config: { policies: [] },
    },
    {
      method: 'POST',
      path: '/generate-html',
      handler: 'generate-html.generate',
      config: { policies: [] },
    },
    {
      method: 'GET',
      path: '/default-template',
      handler: 'default-template.get',
      config: { policies: [] },
    },
    {
      method: 'PUT',
      path: '/default-template',
      handler: 'default-template.update',
      config: { policies: [] },
    },
  ],
};
