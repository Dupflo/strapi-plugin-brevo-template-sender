/**
 * Service d'envoi d'emails HTML via Brevo (sans templateId, avec htmlContent)
 */

const brevo = require('@getbrevo/brevo');

function getByPath(obj: unknown, path: string): unknown {
  if (path === '') return obj;
  const parts = path.split('.').filter(Boolean);
  let current: unknown = obj;
  for (const p of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[p];
  }
  return current;
}

function replacePlaceholders(template: string, params: Record<string, unknown>): string {
  if (!template || typeof template !== 'string') return template;
  const regex = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;
  return template.replace(regex, (_, path: string) => {
    const value = getByPath(params, path.trim());
    if (value != null && typeof value === 'object' && !Array.isArray(value) && 'url' in value) {
      return String((value as { url?: string }).url ?? '');
    }
    if (Array.isArray(value)) return value.map((v) => (v && typeof v === 'object' && 'url' in v ? (v as { url: string }).url : String(v))).join(', ');
    return String(value ?? '');
  });
}

export default ({ strapi }: { strapi: any }) => ({
  async sendHtml({
    htmlContent,
    subject,
    sendTo,
    replyTo,
    attachment,
  }: {
    htmlContent: string;
    subject: string;
    sendTo: string;
    replyTo?: string;
    attachment?: Array<{ name?: string; content?: string; url?: string }>;
  }) {
    const settingsService = strapi.service('plugin::brevo-template-sender.settings');
    const { apiKey, senderEmail, senderName } = await settingsService.getSettingsForSend();
    if (!apiKey) {
      throw new Error('Brevo API key is not configured. Set it in the plugin settings or BREVO_API_KEY env.');
    }

    if (!senderEmail) {
      throw new Error('Brevo sender email is not configured. Set it in the plugin settings (Sender Email) or BREVO_SENDER env.');
    }

    const apiInstance = new brevo.TransactionalEmailsApi();
    const apiKeyAuth = apiInstance.authentications['apiKey'];
    apiKeyAuth.apiKey = apiKey;

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.sender = new brevo.SendSmtpEmailSender();
    sendSmtpEmail.sender.email = senderEmail;
    sendSmtpEmail.sender.name = senderName || undefined;
    const replyEmail = replyTo || senderEmail;
    sendSmtpEmail.replyTo = replyEmail ? { email: replyEmail } : undefined;
    sendSmtpEmail.to = [{ email: sendTo }];
    if (attachment && attachment.length > 0) {
      sendSmtpEmail.attachment = attachment;
    }

    strapi.log.info(`[brevo-template-sender] sendHtml from=${senderEmail} to=${sendTo} subject="${subject}"`);
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    strapi.log.info(`[brevo-template-sender] sendHtml OK → ${sendTo}`);
  },

  /**
   * Envoi via un template Brevo (templateId). Les params sont passés à Brevo pour les variables du template.
   */
  async sendWithBrevoTemplateId({
    templateId,
    sendTo,
    params = {},
  }: {
    templateId: number;
    sendTo: string;
    params?: Record<string, unknown>;
  }) {
    const settingsService = strapi.service('plugin::brevo-template-sender.settings');
    const { apiKey, senderEmail, senderName } = await settingsService.getSettingsForSend();
    if (!apiKey) {
      throw new Error('Brevo API key is not configured. Set it in the plugin settings or BREVO_API_KEY env.');
    }

    if (!senderEmail) {
      throw new Error('Brevo sender email is not configured. Set it in the plugin settings (Sender Email) or BREVO_SENDER env.');
    }

    const apiInstance = new brevo.TransactionalEmailsApi();
    const apiKeyAuth = apiInstance.authentications['apiKey'];
    apiKeyAuth.apiKey = apiKey;

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.templateId = templateId;
    const stringParams: Record<string, string> = {};
    for (const [k, v] of Object.entries(params)) {
      if (v != null && typeof v === 'object' && 'url' in (v as object)) {
        stringParams[k] = String((v as { url?: string }).url ?? '');
      } else {
        stringParams[k] = typeof v === 'string' ? v : String(v ?? '');
      }
    }
    sendSmtpEmail.params = stringParams;
    sendSmtpEmail.sender = new brevo.SendSmtpEmailSender();
    sendSmtpEmail.sender.email = senderEmail;
    sendSmtpEmail.sender.name = senderName || undefined;
    sendSmtpEmail.to = [{ email: sendTo }];

    strapi.log.info(`[brevo-template-sender] sendWithBrevoTemplateId templateId=${templateId} from=${senderEmail} to=${sendTo}`);
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    strapi.log.info(`[brevo-template-sender] sendWithBrevoTemplateId OK → ${sendTo}`);
  },

  /**
   * Charge un template par code, remplace les placeholders et envoie l'email.
   * Utilisé par les routes /contact, /brevo/inquiry et les lifecycles inquiry-request.
   */
  async sendWithTemplateCode({
    templateCode,
    to,
    params = {},
    attachment,
  }: {
    templateCode: string;
    to: string;
    params?: Record<string, unknown>;
    attachment?: Array<{ name?: string; content?: string; url?: string }>;
  }) {
    const settingsService = strapi.service('plugin::brevo-template-sender.settings');
    const { logoUrl } = await settingsService.getSettingsForSend();
    const config = strapi.config.get('plugin::brevo-template-sender') as {
      templateContentType?: string;
    };
    const contentTypeUid = config?.templateContentType || 'plugin::brevo-template-sender.email-template';

    const mergedParams = {
      ...params,
      logo_url: logoUrl || '',
    };

    const entries = await strapi.documents(contentTypeUid).findMany({
      filters: { code: templateCode },
      status: 'published',
    });
    const doc = Array.isArray(entries) ? entries[0] : entries;
    if (!doc) {
      throw new Error(`Email template not found: ${templateCode}`);
    }

    const templateMode = doc.templateMode ?? 'html';
    const brevoTemplateId = doc.brevoTemplateId != null ? Number(doc.brevoTemplateId) : undefined;

    if (templateMode === 'brevo' && brevoTemplateId != null && brevoTemplateId > 0) {
      await this.sendWithBrevoTemplateId({
        templateId: brevoTemplateId,
        sendTo: to,
        params: mergedParams as Record<string, string>,
      });
      return;
    }

    const subject = replacePlaceholders(doc.subject || '', mergedParams);
    const htmlContent = replacePlaceholders(doc.html || '', mergedParams);
    if (!htmlContent) {
      throw new Error(`Email template "${templateCode}" has no HTML content`);
    }

    const sender = strapi.service('plugin::brevo-template-sender.sender');
    const { senderEmail } = await settingsService.getSettingsForSend();
    await sender.sendHtml({
      htmlContent,
      subject,
      sendTo: to,
      replyTo: senderEmail,
      attachment,
    });
  },

  /**
   * Envoi à partir d'une config trigger : mode HTML (subject + html) ou mode template Brevo (templateId).
   */
  async sendFromTrigger({
    subject,
    html,
    params,
    sendTo,
    templateMode,
    brevoTemplateId,
  }: {
    subject: string;
    html: string;
    params: Record<string, unknown>;
    sendTo: string;
    templateMode?: 'html' | 'brevo';
    brevoTemplateId?: number;
  }) {
    if (templateMode === 'brevo' && brevoTemplateId != null && brevoTemplateId > 0) {
      const settingsService = strapi.service('plugin::brevo-template-sender.settings');
      const { logoUrl } = await settingsService.getSettingsForSend();
      const mergedParams = { ...params, logo_url: logoUrl || '' };
      await this.sendWithBrevoTemplateId({
        templateId: brevoTemplateId,
        sendTo,
        params: mergedParams as Record<string, string>,
      });
      return;
    }
    const settingsService = strapi.service('plugin::brevo-template-sender.settings');
    const { logoUrl, senderEmail } = await settingsService.getSettingsForSend();
    const mergedParams = {
      ...params,
      logo_url: logoUrl || '',
    };
    const finalSubject = replacePlaceholders(subject, mergedParams);
    const htmlContent = replacePlaceholders(html, mergedParams);
    await this.sendHtml({
      htmlContent,
      subject: finalSubject,
      sendTo,
      replyTo: senderEmail,
    });
  },
});
