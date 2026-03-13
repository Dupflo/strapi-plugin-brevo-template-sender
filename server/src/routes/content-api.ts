/**
 * Content-API routes: public endpoints for sending emails (external callers).
 * Settings, depth-attributes, etc. are only exposed via admin routes (admin.ts).
 */
export default {
  type: 'content-api' as const,
  routes: [
    {
      method: 'POST',
      path: '/send',
      handler: 'send.send',
      config: {
        auth: false,
      },
    },
  ],
};
