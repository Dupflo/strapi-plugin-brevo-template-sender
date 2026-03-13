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

function resolveRecipient(value: string, params: Record<string, unknown>): string {
  const match = value.trim().match(/^\{\{\s*([^}]+)\s*\}\}$/);
  if (!match) return value;
  const path = match[1].trim();
  const v = getByPath(params, path);
  if (v == null) return '';
  if (typeof v === 'object' && !Array.isArray(v) && v !== null && 'url' in v) {
    return String((v as { url?: string }).url ?? '');
  }
  if (Array.isArray(v)) {
    return v.map((x) => (x && typeof x === 'object' && 'url' in x ? (x as { url: string }).url : String(x))).join(', ');
  }
  return String(v);
}

export default ({ strapi }: { strapi: any }) => {
  // Envoi d'email sur événements document (create, update, delete, publish) selon la config triggers
  strapi.documents.use(async (context: any, next: () => Promise<unknown>) => {
    const result = await next();
    const { uid, action } = context;
    const event =
      action === 'create' ? 'create'
      : action === 'update' ? 'update'
      : action === 'delete' ? 'delete'
      : action === 'publish' ? 'publish'
      : action === 'unpublish' ? 'unpublish'
      : null;
    if (!event) return result;
    const triggerService = strapi.service('plugin::brevo-template-sender.triggers');
    const trigger = await triggerService.getTrigger(uid, event);
    if (!trigger) {
      strapi.log.debug(`[brevo-template-sender] Pas de trigger configuré pour ${uid} / ${event}`);
      return result;
    }
    strapi.log.info(`[brevo-template-sender] Trigger trouvé pour ${uid} / ${event} (mode=${trigger.templateMode})`);
    const canSendBrevo = trigger.templateMode === 'brevo' && trigger.brevoTemplateId != null && trigger.brevoTemplateId > 0;
    const canSendHtml = trigger.subject && trigger.html;
    if (!canSendBrevo && !canSendHtml) {
      strapi.log.warn(`[brevo-template-sender] Trigger sans template valide pour ${uid} / ${event} — mode=${trigger.templateMode}, subject=${!!trigger.subject}, html=${!!trigger.html}, brevoTemplateId=${trigger.brevoTemplateId}`);
      return result;
    }
    // Le document créé/modifié est dans result (Strapi ne met pas context.result)
    const doc = (result && typeof result === 'object' ? result : null) ?? context.params?.data ?? null;
    let params: Record<string, unknown> = doc && typeof doc === 'object' ? { ...doc } : {};
    const documentId = doc?.documentId ?? doc?.id;
    if (documentId && typeof documentId === 'string') {
      const paramsService = strapi.service('plugin::brevo-template-sender.params');
      const withDepth = await paramsService.getDocumentWithDepth(uid, documentId, 2);
      if (withDepth && typeof withDepth === 'object') params = withDepth;
    }
    const fromDoc = trigger.sendToField && doc?.[trigger.sendToField]
      ? String(doc[trigger.sendToField]).trim()
      : '';
    const rawRecipients = (trigger.recipients || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const resolved = rawRecipients.flatMap((addr) => {
      const v = resolveRecipient(addr, params);
      return v ? v.split(',').map((e) => e.trim()).filter(Boolean) : [];
    });
    const sendToList = [fromDoc, ...resolved].filter(Boolean);
    const sendTo = sendToList.length ? sendToList : (process.env.BREVO_SENDER ? [process.env.BREVO_SENDER] : []);
    if (!sendTo.length) {
      strapi.log.warn(`[brevo-template-sender] Aucun destinataire pour ${uid} / ${event} — configurez « Recipients » dans le trigger ou la variable d'env BREVO_SENDER`);
      return result;
    }
    try {
      strapi.log.info(`[brevo-template-sender] Envoi email pour ${uid} événement ${event} vers ${sendTo.join(', ')}`);
      const sender = strapi.service('plugin::brevo-template-sender.sender');
      for (const to of sendTo) {
        await sender.sendFromTrigger({
          subject: trigger.subject,
          html: trigger.html,
          params,
          sendTo: to,
          templateMode: trigger.templateMode,
          brevoTemplateId: trigger.brevoTemplateId,
        });
      }
    } catch (e) {
      strapi.log?.error?.('brevo-template-sender trigger', e);
    }
    return result;
  });
};
