/**
 * Paramètres Brevo stockés dans le plugin store (éditables depuis la page de configuration).
 * Fallback sur les variables d'environnement si non renseignés.
 */

export interface BrevoSettings {
  apiKey?: string;
  senderEmail?: string;
  senderName?: string;
  logoUrl?: string;
  /** Code du template utilisé par défaut pour l’API sendEmail (ex: contact). */
  sendEmailTemplateCode?: string;
  /** Clé API OpenAI pour la génération de templates HTML par l'IA. */
  openaiApiKey?: string;
}

const STORE_KEY = 'brevo-settings';

export default ({ strapi }: { strapi: any }) => {
  const store = strapi.store({ type: 'plugin', name: 'brevo-template-sender' });

  return {
    /** Pour l’admin : retourne les paramètres avec la clé API masquée (présente ou non). */
    async getSettings(): Promise<{
      apiKeySet: boolean;
      senderEmail: string;
      senderName: string;
      logoUrl: string;
      sendEmailTemplateCode: string;
      openaiApiKeySet: boolean;
      isDevelopment: boolean;
      supportRepoUrl: string;
      supportBmcUrl: string;
    }> {
      const saved = (await store.get({ key: STORE_KEY })) as BrevoSettings | null;
      const config = strapi.config.get('plugin::brevo-template-sender') as { logoUrl?: string } | undefined;
      return {
        apiKeySet: Boolean(saved?.apiKey || process.env.BREVO_API_KEY),
        senderEmail: saved?.senderEmail ?? process.env.BREVO_SENDER ?? '',
        senderName: saved?.senderName ?? process.env.BREVO_SENDER_NAME ?? '',
        logoUrl: saved?.logoUrl ?? config?.logoUrl ?? process.env.STRAPI_LOGO_URL ?? '',
        sendEmailTemplateCode: saved?.sendEmailTemplateCode ?? 'contact',
        openaiApiKeySet: Boolean(saved?.openaiApiKey),
        isDevelopment: process.env.NODE_ENV === 'development',
        supportRepoUrl: process.env.BREVO_TEMPLATE_SENDER_REPO_URL || 'https://github.com/calistock/strapi-plugin-brevo-template-sender',
        supportBmcUrl: process.env.BREVO_TEMPLATE_SENDER_BMC_URL || 'https://buymeacoffee.com/dupflo',
      };
    },

    /** Enregistre les paramètres (seules les clés fournies sont mises à jour). */
    async setSettings(partial: Partial<BrevoSettings>): Promise<void> {
      const current = (await store.get({ key: STORE_KEY })) as BrevoSettings | null;
      const next = { ...current, ...partial };
      if (partial.apiKey === '') delete next.apiKey;
      else if (partial.apiKey != null) next.apiKey = partial.apiKey;
      if (partial.openaiApiKey === '') delete next.openaiApiKey;
      else if (partial.openaiApiKey != null) next.openaiApiKey = partial.openaiApiKey;
      await store.set({ key: STORE_KEY, value: next });
    },

    /** Pour l’envoi côté serveur uniquement : retourne la clé API et l’expéditeur (store puis env). */
    async getOpenAiApiKey(): Promise<string> {
      const saved = (await store.get({ key: STORE_KEY })) as BrevoSettings | null;
      return saved?.openaiApiKey ?? process.env.OPENAI_API_KEY ?? '';
    },

    async getSettingsForSend(): Promise<{
      apiKey: string;
      senderEmail: string;
      senderName: string;
      logoUrl: string;
    }> {
      const saved = (await store.get({ key: STORE_KEY })) as BrevoSettings | null;
      const config = strapi.config.get('plugin::brevo-template-sender') as { logoUrl?: string } | undefined;
      return {
        apiKey: saved?.apiKey ?? process.env.BREVO_API_KEY ?? '',
        senderEmail: saved?.senderEmail ?? process.env.BREVO_SENDER ?? '',
        senderName: saved?.senderName ?? process.env.BREVO_SENDER_NAME ?? '',
        logoUrl: saved?.logoUrl ?? config?.logoUrl ?? process.env.STRAPI_LOGO_URL ?? '',
      };
    },
  };
};
