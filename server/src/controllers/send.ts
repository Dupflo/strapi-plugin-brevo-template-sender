/**
 * Controller pour l'envoi d'emails via template HTML stocké dans Strapi.
 * POST /send : body = { params: { ... } }. Template et destinataires = config Strapi (template par défaut).
 */

export default {
  /**
   * POST /api/brevo-template-sender/send
   * Body: { params: { ... } } uniquement. Template et destinataires viennent de la config Strapi (template par défaut).
   */
  async send(ctx: any) {
    try {
      const body = ctx.request.body || {};
      const params = typeof body.params === 'object' && body.params !== null ? body.params : {};

      const settingsService = strapi.service('plugin::brevo-template-sender.settings');
      const settings = await settingsService.getSettings();
      const templateCode = settings.sendEmailTemplateCode || 'contact';

      const config = strapi.config.get('plugin::brevo-template-sender') as { templateContentType?: string };
      const contentTypeUid = config?.templateContentType || 'plugin::brevo-template-sender.email-template';
      const entries = await strapi.documents(contentTypeUid).findMany({
        filters: { code: templateCode },
        status: 'published',
      });
      const doc = Array.isArray(entries) ? entries[0] : entries;
      const templateRecipients: string = doc?.recipients ?? '';
      const recipients = templateRecipients.split(',').map((r: string) => r.trim()).filter(Boolean);

      if (!recipients.length) {
        ctx.throw(
          400,
          'No recipient configured. Set recipients in the plugin default template (Brevo Template Sender → Configure template).'
        );
      }

      const senderService = strapi.service('plugin::brevo-template-sender.sender');
      for (const recipient of recipients) {
        await senderService.sendWithTemplateCode({ templateCode, to: recipient, params });
      }
      ctx.body = { success: true, message: 'Email sent' };
    } catch (error: any) {
      ctx.throw(error.status || 500, error.message || 'Failed to send email');
    }
  },
};
