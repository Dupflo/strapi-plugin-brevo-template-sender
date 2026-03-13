/**
 * API admin : liste des content types avec métadonnées des attributs (type, kind, target).
 * Permet de distinguer champs scalaires (texte) vs champs à profondeur (relation, media).
 */
export default {
  async list(ctx: any) {
    const paramsService = strapi.service('plugin::brevo-template-sender.params');
    const contentTypes = strapi.contentTypes as Record<string, { uid: string; info?: { displayName?: string }; attributes?: Record<string, unknown> }>;
    const list = Object.entries(contentTypes)
      .filter(([uid]) => uid.startsWith('api::') && !uid.includes('email-template'))
      .map(([uid, ct]) => ({
        uid,
        displayName: ct?.info?.displayName ?? uid,
        attributes: paramsService.getAttributesMeta(uid),
      }))
      .sort((a, b) => (a.displayName || a.uid).localeCompare(b.displayName || b.uid));
    ctx.body = list;
  },
};
