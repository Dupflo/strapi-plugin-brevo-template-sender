export interface BrevoSenderHtmlTemplateConfig {
  /** UID du content type qui stocke les templates (défaut: content-type du plugin) */
  templateContentType?: string;
  /** URL publique du logo (ex. logo du dashboard Strapi). Utilisée pour la variable {{logo_url}} dans les templates. */
  logoUrl?: string;
}

export default {
  default: (): BrevoSenderHtmlTemplateConfig => ({
    templateContentType: 'plugin::brevo-template-sender.email-template',
    logoUrl: process.env?.STRAPI_LOGO_URL ?? '',
  }),
  validator(config: unknown) {
    if (config && typeof config === 'object' && 'templateContentType' in config) {
      const uid = (config as BrevoSenderHtmlTemplateConfig).templateContentType;
      if (uid !== undefined && (typeof uid !== 'string' || !uid)) {
        throw new Error('brevo-template-sender.templateContentType must be a non-empty string when provided');
      }
    }
  },
};
