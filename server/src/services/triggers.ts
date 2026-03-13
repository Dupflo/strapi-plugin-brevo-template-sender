/**
 * Gestion des triggers (content type + événement → template) stockés dans le plugin store.
 */

export interface TriggerConfig {
  id: string;
  contentTypeUid: string;
  event: 'create' | 'update' | 'delete' | 'publish' | 'unpublish';
  subject: string;
  html: string;
  sendToField?: string;
  /** Emails supplémentaires (séparés par des virgules). */
  recipients?: string;
  /** Mode template : HTML (Strapi) ou template Brevo (ID). */
  templateMode?: 'html' | 'brevo';
  /** ID du template Brevo (campagne / transactional) quand templateMode === 'brevo'. */
  brevoTemplateId?: number;
}

const STORE_KEY = 'triggers';

export default ({ strapi }: { strapi: any }) => ({
  async getTriggers(): Promise<TriggerConfig[]> {
    const store = strapi.store({ type: 'plugin', name: 'brevo-template-sender' });
    const value = await store.get({ key: STORE_KEY });
    return Array.isArray(value) ? value : [];
  },

  async setTriggers(triggers: TriggerConfig[]): Promise<void> {
    const store = strapi.store({ type: 'plugin', name: 'brevo-template-sender' });
    await store.set({ key: STORE_KEY, value: triggers });
  },

  async getTrigger(contentTypeUid: string, event: string): Promise<TriggerConfig | null> {
    const triggers = await this.getTriggers();
    return triggers.find((t) => t.contentTypeUid === contentTypeUid && t.event === event) ?? null;
  },
});
