/**
 * API admin : lecture / écriture des triggers.
 */
import type { TriggerConfig } from '../services/triggers';

export default {
  async getTriggers(ctx: any) {
    const triggers = await strapi.service('plugin::brevo-template-sender.triggers').getTriggers();
    ctx.body = triggers;
  },

  async setTriggers(ctx: any) {
    const raw = ctx.request?.body ?? {};
    const body = typeof raw?.body === 'object' && raw.body !== null ? raw.body : raw;
    const triggers = Array.isArray(body?.triggers) ? (body.triggers as TriggerConfig[]) : [];
    await strapi.service('plugin::brevo-template-sender.triggers').setTriggers(triggers);
    ctx.body = { ok: true };
  },
};
