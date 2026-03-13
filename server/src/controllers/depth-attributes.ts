/**
 * Returns depth attributes for a given relation/media/component attribute
 * (e.g. thumbnail -> id, url, name, ...).
 */
export default {
  async get(ctx: any) {
    const contentTypeUid = ctx.request?.query?.contentTypeUid;
    const attributeName = ctx.request?.query?.attributeName;
    if (!contentTypeUid || !attributeName) {
      ctx.status = 400;
      ctx.body = { error: 'contentTypeUid and attributeName are required' };
      return;
    }
    const paramsService = strapi.service('plugin::brevo-template-sender.params');
    const attributes = paramsService.getDepthAttributes(contentTypeUid, attributeName);
    ctx.body = { attributes };
  },
};
