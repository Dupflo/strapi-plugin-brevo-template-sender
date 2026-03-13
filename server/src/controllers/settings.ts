/**
 * Paramètres du plugin : lecture (admin + prévisualisation) et enregistrement (admin).
 */
export default {
  /** Retourne les paramètres pour l’admin (clé API masquée) et pour la prévisualisation (logoUrl). */
  async getSettings(ctx: any) {
    try {
      const service = strapi.service('plugin::brevo-template-sender.settings');
      ctx.body = await service.getSettings();
    } catch (e: any) {
      ctx.status = 500;
      ctx.body = { error: e?.message ?? 'Failed to load settings' };
    }
  },

  /** Enregistre les paramètres depuis la page de configuration (admin). */
  async setSettings(ctx: any) {
    try {
      const raw = ctx.request?.body ?? {};
      const body =
        typeof raw?.body === 'object' && raw.body !== null ? raw.body : raw;
      const service = strapi.service('plugin::brevo-template-sender.settings');
      const partial: Record<string, unknown> = {};
      if (typeof body.apiKey === 'string') partial.apiKey = body.apiKey.length > 0 ? body.apiKey : undefined;
      if (body.senderEmail !== undefined) partial.senderEmail = body.senderEmail;
      if (body.senderName !== undefined) partial.senderName = body.senderName;
      if (body.logoUrl !== undefined) partial.logoUrl = body.logoUrl;
      if (body.sendEmailTemplateCode !== undefined) partial.sendEmailTemplateCode = body.sendEmailTemplateCode;
      if (body.openaiApiKey !== undefined) partial.openaiApiKey = typeof body.openaiApiKey === 'string' ? body.openaiApiKey : undefined;
      await service.setSettings(partial);
      ctx.body = { ok: true };
    } catch (e: any) {
      ctx.status = 500;
      ctx.body = { error: e?.message ?? 'Failed to save settings' };
    }
  },
};
