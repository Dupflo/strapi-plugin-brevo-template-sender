"use strict";
const config = {
  default: () => ({
    templateContentType: "plugin::brevo-template-sender.email-template",
    logoUrl: process.env?.STRAPI_LOGO_URL ?? ""
  }),
  validator(config2) {
    if (config2 && typeof config2 === "object" && "templateContentType" in config2) {
      const uid = config2.templateContentType;
      if (uid !== void 0 && (typeof uid !== "string" || !uid)) {
        throw new Error("brevo-template-sender.templateContentType must be a non-empty string when provided");
      }
    }
  }
};
const kind = "collectionType";
const collectionName = "brevo_email_templates";
const info = {
  singularName: "email-template",
  pluralName: "email-templates",
  displayName: "Email Template (Brevo)",
  description: "Templates HTML pour envoi d'emails via Brevo. Utilisez {{variable}} dans le sujet et le HTML."
};
const options = {
  draftAndPublish: true
};
const pluginOptions = {
  "content-manager": {
    visible: false
  },
  "content-type-builder": {
    visible: true
  }
};
const attributes = {
  name: {
    type: "string",
    required: true
  },
  code: {
    type: "string",
    required: true,
    unique: true
  },
  subject: {
    type: "string",
    required: true
  },
  html: {
    type: "text",
    required: true
  },
  templateMode: {
    type: "enumeration",
    "enum": [
      "html",
      "brevo"
    ],
    "default": "html"
  },
  brevoTemplateId: {
    type: "integer"
  },
  recipients: {
    type: "text"
  }
};
const schema = {
  kind,
  collectionName,
  info,
  options,
  pluginOptions,
  attributes
};
const emailTemplate = { schema };
const contentTypes$1 = {
  "email-template": emailTemplate
};
const send = {
  /**
   * POST /api/brevo-template-sender/send
   * Body: { params: { ... } } uniquement. Template et destinataires viennent de la config Strapi (template par défaut).
   */
  async send(ctx) {
    try {
      const body = ctx.request.body || {};
      const params2 = typeof body.params === "object" && body.params !== null ? body.params : {};
      const settingsService = strapi.service("plugin::brevo-template-sender.settings");
      const settings2 = await settingsService.getSettings();
      const templateCode = settings2.sendEmailTemplateCode || "contact";
      const config2 = strapi.config.get("plugin::brevo-template-sender");
      const contentTypeUid = config2?.templateContentType || "plugin::brevo-template-sender.email-template";
      const entries = await strapi.documents(contentTypeUid).findMany({
        filters: { code: templateCode },
        status: "published"
      });
      const doc = Array.isArray(entries) ? entries[0] : entries;
      const templateRecipients = doc?.recipients ?? "";
      const recipients = templateRecipients.split(",").map((r) => r.trim()).filter(Boolean);
      if (!recipients.length) {
        ctx.throw(
          400,
          "No recipient configured. Set recipients in the plugin default template (Brevo Template Sender → Configure template)."
        );
      }
      const senderService = strapi.service("plugin::brevo-template-sender.sender");
      for (const recipient of recipients) {
        await senderService.sendWithTemplateCode({ templateCode, to: recipient, params: params2 });
      }
      ctx.body = { success: true, message: "Email sent" };
    } catch (error) {
      ctx.throw(error.status || 500, error.message || "Failed to send email");
    }
  }
};
const settings$1 = {
  /** Retourne les paramètres pour l’admin (clé API masquée) et pour la prévisualisation (logoUrl). */
  async getSettings(ctx) {
    try {
      const service = strapi.service("plugin::brevo-template-sender.settings");
      ctx.body = await service.getSettings();
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: e?.message ?? "Failed to load settings" };
    }
  },
  /** Enregistre les paramètres depuis la page de configuration (admin). */
  async setSettings(ctx) {
    try {
      const raw = ctx.request?.body ?? {};
      const body = typeof raw?.body === "object" && raw.body !== null ? raw.body : raw;
      const service = strapi.service("plugin::brevo-template-sender.settings");
      const partial = {};
      if (typeof body.apiKey === "string") partial.apiKey = body.apiKey.length > 0 ? body.apiKey : void 0;
      if (body.senderEmail !== void 0) partial.senderEmail = body.senderEmail;
      if (body.senderName !== void 0) partial.senderName = body.senderName;
      if (body.logoUrl !== void 0) partial.logoUrl = body.logoUrl;
      if (body.sendEmailTemplateCode !== void 0) partial.sendEmailTemplateCode = body.sendEmailTemplateCode;
      if (body.openaiApiKey !== void 0) partial.openaiApiKey = typeof body.openaiApiKey === "string" ? body.openaiApiKey : void 0;
      await service.setSettings(partial);
      ctx.body = { ok: true };
    } catch (e) {
      ctx.status = 500;
      ctx.body = { error: e?.message ?? "Failed to save settings" };
    }
  }
};
const triggers$1 = {
  async getTriggers(ctx) {
    const triggers2 = await strapi.service("plugin::brevo-template-sender.triggers").getTriggers();
    ctx.body = triggers2;
  },
  async setTriggers(ctx) {
    const raw = ctx.request?.body ?? {};
    const body = typeof raw?.body === "object" && raw.body !== null ? raw.body : raw;
    const triggers2 = Array.isArray(body?.triggers) ? body.triggers : [];
    await strapi.service("plugin::brevo-template-sender.triggers").setTriggers(triggers2);
    ctx.body = { ok: true };
  }
};
const contentTypes = {
  async list(ctx) {
    const paramsService = strapi.service("plugin::brevo-template-sender.params");
    const contentTypes2 = strapi.contentTypes;
    const list = Object.entries(contentTypes2).filter(([uid]) => uid.startsWith("api::") && !uid.includes("email-template")).map(([uid, ct]) => ({
      uid,
      displayName: ct?.info?.displayName ?? uid,
      attributes: paramsService.getAttributesMeta(uid)
    })).sort((a, b) => (a.displayName || a.uid).localeCompare(b.displayName || b.uid));
    ctx.body = list;
  }
};
const depthAttributes = {
  async get(ctx) {
    const contentTypeUid = ctx.request?.query?.contentTypeUid;
    const attributeName = ctx.request?.query?.attributeName;
    if (!contentTypeUid || !attributeName) {
      ctx.status = 400;
      ctx.body = { error: "contentTypeUid and attributeName are required" };
      return;
    }
    const paramsService = strapi.service("plugin::brevo-template-sender.params");
    const attributes2 = paramsService.getDepthAttributes(contentTypeUid, attributeName);
    ctx.body = { attributes: attributes2 };
  }
};
const SYSTEM_PROMPT = `Tu es un expert en emails HTML transactionnels. Tu génères uniquement du HTML valide pour le corps d'un email (sans <!DOCTYPE> ni <html>), compatible avec les clients email.
Règles :
- Utilise des tables pour la mise en page si besoin (compatibilité email).
- Utilise des styles inline.
- Pour les variables dynamiques, utilise la syntaxe {{nom_variable}} (ex: {{firstname}}, {{email}}, {{logo_url}}).
- Ne renvoie que le HTML, sans markdown ni explication.`;
const generateHtml = {
  async generate(ctx) {
    try {
      const { prompt, currentHtml } = ctx.request?.body ?? {};
      if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
        ctx.throw(400, "prompt is required");
      }
      const settingsService = strapi.service("plugin::brevo-template-sender.settings");
      const openaiKey = await settingsService.getOpenAiApiKey();
      if (!openaiKey || typeof openaiKey !== "string" || !openaiKey.trim()) {
        ctx.throw(400, "OpenAI API key is not configured. Add it in the plugin settings (Config) or set OPENAI_API_KEY.");
      }
      const userContent = currentHtml && currentHtml.trim() ? `Contexte : le template actuel est :

${currentHtml.trim()}

Instruction : ${prompt.trim()}

Génère le HTML mis à jour (uniquement le HTML).` : `Instruction : ${prompt.trim()}

Génère un template HTML d'email (uniquement le HTML).`;
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey.trim()}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userContent }
          ],
          temperature: 0.3,
          max_tokens: 4096
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errMsg = data?.error?.message ?? data?.message ?? `OpenAI API error ${res.status}`;
        ctx.throw(res.status >= 400 && res.status < 500 ? res.status : 502, errMsg);
      }
      const content = data?.choices?.[0]?.message?.content;
      if (!content || typeof content !== "string") {
        ctx.throw(502, "Invalid response from OpenAI");
      }
      let html = content.trim();
      const codeBlock = /^```(?:html)?\s*([\s\S]*?)```\s*$/i;
      const match = html.match(codeBlock);
      if (match) html = match[1].trim();
      ctx.body = { html };
    } catch (error) {
      const err = error;
      ctx.throw(err?.status || 500, err?.message || "Failed to generate HTML");
    }
  }
};
function getContentTypeUid() {
  const config2 = strapi.config.get("plugin::brevo-template-sender");
  return config2?.templateContentType || "plugin::brevo-template-sender.email-template";
}
const defaultTemplate = {
  async get(ctx) {
    const code = ctx.request?.query?.code ?? ctx.request?.query;
    const codeStr = typeof code === "string" ? code.trim() : "";
    if (!codeStr) {
      ctx.status = 400;
      ctx.body = { error: "code is required" };
      return;
    }
    const uid = getContentTypeUid();
    const raw = await strapi.documents(uid).findMany({
      filters: { code: codeStr },
      status: "published"
    });
    const list = Array.isArray(raw) ? raw : raw && typeof raw === "object" && Array.isArray(raw.results) ? raw.results : [];
    const doc = list[0];
    if (!doc) {
      ctx.body = { template: null };
      return;
    }
    const documentId = doc.documentId ?? (doc.id != null ? String(doc.id) : void 0);
    ctx.body = {
      template: {
        documentId,
        code: doc.code,
        name: doc.name ?? "",
        subject: doc.subject ?? "",
        html: doc.html ?? "",
        templateMode: doc.templateMode ?? "html",
        brevoTemplateId: doc.brevoTemplateId ?? void 0,
        recipients: doc.recipients ?? ""
      }
    };
  },
  async update(ctx) {
    const body = ctx.request?.body ?? {};
    const rawBody = typeof body?.body === "object" && body.body !== null ? body.body : body;
    const { code, name, subject, html, templateMode, brevoTemplateId, recipients } = rawBody;
    const codeStr = typeof code === "string" ? code.trim() : "";
    if (!codeStr) {
      ctx.status = 400;
      ctx.body = { error: "code is required" };
      return;
    }
    const uid = getContentTypeUid();
    const toList = (r) => Array.isArray(r) ? r : r && typeof r === "object" && Array.isArray(r.results) ? r.results : [];
    let raw = await strapi.documents(uid).findMany({
      filters: { code: codeStr },
      status: "published"
    });
    let existing = toList(raw)[0];
    if (!existing) {
      raw = await strapi.documents(uid).findMany({
        filters: { code: codeStr },
        status: "draft"
      });
      existing = toList(raw)[0];
    }
    const documentId = existing ? existing.documentId ?? (existing.id != null ? String(existing.id) : void 0) : void 0;
    if (existing && documentId) {
      await strapi.documents(uid).update({
        documentId,
        status: "draft",
        data: {
          ...typeof name === "string" && {
            name: name.trim() || existing.name
          },
          ...typeof subject === "string" && { subject: subject.trim() },
          ...typeof html === "string" && { html: html.trim() },
          ...(templateMode === "html" || templateMode === "brevo") && {
            templateMode
          },
          ...typeof brevoTemplateId === "number" ? { brevoTemplateId } : typeof brevoTemplateId === "string" ? { brevoTemplateId: parseInt(brevoTemplateId, 10) } : {},
          ...typeof recipients === "string" && { recipients: recipients.trim() }
        }
      });
      await strapi.documents(uid).publish({ documentId });
    } else {
      const created = await strapi.documents(uid).create({
        data: {
          code: codeStr,
          name: typeof name === "string" && name.trim() ? name.trim() : "Send Email Default",
          subject: typeof subject === "string" ? subject.trim() : "Message",
          html: typeof html === "string" ? html.trim() : "<p>Hello {{firstname}}</p>",
          templateMode: templateMode === "brevo" ? "brevo" : "html",
          brevoTemplateId: typeof brevoTemplateId === "number" ? brevoTemplateId : typeof brevoTemplateId === "string" ? parseInt(brevoTemplateId, 10) : void 0,
          recipients: typeof recipients === "string" ? recipients.trim() : void 0
        }
      });
      const createdId = created?.documentId ?? (created?.id != null ? String(created.id) : void 0);
      if (createdId) {
        await strapi.documents(uid).publish({ documentId: createdId });
      }
    }
    ctx.body = { ok: true };
  }
};
const controllers = {
  send,
  settings: settings$1,
  triggers: triggers$1,
  "content-types": contentTypes,
  "depth-attributes": depthAttributes,
  "generate-html": generateHtml,
  "default-template": defaultTemplate
};
const admin = {
  type: "admin",
  routes: [
    {
      method: "GET",
      path: "/settings",
      handler: "settings.getSettings",
      config: { policies: [] }
    },
    {
      method: "PUT",
      path: "/settings",
      handler: "settings.setSettings",
      config: { policies: [] }
    },
    {
      method: "GET",
      path: "/triggers",
      handler: "triggers.getTriggers",
      config: { policies: [] }
    },
    {
      method: "PUT",
      path: "/triggers",
      handler: "triggers.setTriggers",
      config: { policies: [] }
    },
    {
      method: "GET",
      path: "/content-types",
      handler: "content-types.list",
      config: { policies: [] }
    },
    {
      method: "GET",
      path: "/depth-attributes",
      handler: "depth-attributes.get",
      config: { policies: [] }
    },
    {
      method: "POST",
      path: "/generate-html",
      handler: "generate-html.generate",
      config: { policies: [] }
    },
    {
      method: "GET",
      path: "/default-template",
      handler: "default-template.get",
      config: { policies: [] }
    },
    {
      method: "PUT",
      path: "/default-template",
      handler: "default-template.update",
      config: { policies: [] }
    }
  ]
};
const contentApi = {
  type: "content-api",
  routes: [
    {
      method: "POST",
      path: "/send",
      handler: "send.send",
      config: {
        auth: false
      }
    }
  ]
};
const routes = {
  admin,
  "content-api": contentApi
};
function getByPath$1(obj, path) {
  if (path === "") return obj;
  const parts = path.split(".").filter(Boolean);
  let current = obj;
  for (const p of parts) {
    if (current == null || typeof current !== "object") return void 0;
    current = current[p];
  }
  return current;
}
function resolveRecipient(value, params2) {
  const match = value.trim().match(/^\{\{\s*([^}]+)\s*\}\}$/);
  if (!match) return value;
  const path = match[1].trim();
  const v = getByPath$1(params2, path);
  if (v == null) return "";
  if (typeof v === "object" && !Array.isArray(v) && v !== null && "url" in v) {
    return String(v.url ?? "");
  }
  if (Array.isArray(v)) {
    return v.map((x) => x && typeof x === "object" && "url" in x ? x.url : String(x)).join(", ");
  }
  return String(v);
}
const register = ({ strapi: strapi2 }) => {
  strapi2.documents.use(async (context, next) => {
    const result = await next();
    const { uid, action } = context;
    const event = action === "create" ? "create" : action === "update" ? "update" : action === "delete" ? "delete" : action === "publish" ? "publish" : action === "unpublish" ? "unpublish" : null;
    if (!event) return result;
    const triggerService = strapi2.service("plugin::brevo-template-sender.triggers");
    const trigger = await triggerService.getTrigger(uid, event);
    if (!trigger) {
      strapi2.log.debug(`[brevo-template-sender] Pas de trigger configuré pour ${uid} / ${event}`);
      return result;
    }
    strapi2.log.info(`[brevo-template-sender] Trigger trouvé pour ${uid} / ${event} (mode=${trigger.templateMode})`);
    const canSendBrevo = trigger.templateMode === "brevo" && trigger.brevoTemplateId != null && trigger.brevoTemplateId > 0;
    const canSendHtml = trigger.subject && trigger.html;
    if (!canSendBrevo && !canSendHtml) {
      strapi2.log.warn(`[brevo-template-sender] Trigger sans template valide pour ${uid} / ${event} — mode=${trigger.templateMode}, subject=${!!trigger.subject}, html=${!!trigger.html}, brevoTemplateId=${trigger.brevoTemplateId}`);
      return result;
    }
    const doc = (result && typeof result === "object" ? result : null) ?? context.params?.data ?? null;
    let params2 = doc && typeof doc === "object" ? { ...doc } : {};
    const documentId = doc?.documentId ?? doc?.id;
    if (documentId && typeof documentId === "string") {
      const paramsService = strapi2.service("plugin::brevo-template-sender.params");
      const withDepth = await paramsService.getDocumentWithDepth(uid, documentId, 2);
      if (withDepth && typeof withDepth === "object") params2 = withDepth;
    }
    const fromDoc = trigger.sendToField && doc?.[trigger.sendToField] ? String(doc[trigger.sendToField]).trim() : "";
    const rawRecipients = (trigger.recipients || "").split(",").map((s) => s.trim()).filter(Boolean);
    const resolved = rawRecipients.flatMap((addr) => {
      const v = resolveRecipient(addr, params2);
      return v ? v.split(",").map((e) => e.trim()).filter(Boolean) : [];
    });
    const sendToList = [fromDoc, ...resolved].filter(Boolean);
    const sendTo = sendToList.length ? sendToList : process.env.BREVO_SENDER ? [process.env.BREVO_SENDER] : [];
    if (!sendTo.length) {
      strapi2.log.warn(`[brevo-template-sender] Aucun destinataire pour ${uid} / ${event} — configurez « Recipients » dans le trigger ou la variable d'env BREVO_SENDER`);
      return result;
    }
    try {
      strapi2.log.info(`[brevo-template-sender] Envoi email pour ${uid} événement ${event} vers ${sendTo.join(", ")}`);
      const sender2 = strapi2.service("plugin::brevo-template-sender.sender");
      for (const to of sendTo) {
        await sender2.sendFromTrigger({
          subject: trigger.subject,
          html: trigger.html,
          params: params2,
          sendTo: to,
          templateMode: trigger.templateMode,
          brevoTemplateId: trigger.brevoTemplateId
        });
      }
    } catch (e) {
      strapi2.log?.error?.("brevo-template-sender trigger", e);
    }
    return result;
  });
};
const STORE_KEY$1 = "triggers";
const triggers = ({ strapi: strapi2 }) => ({
  async getTriggers() {
    const store = strapi2.store({ type: "plugin", name: "brevo-template-sender" });
    const value = await store.get({ key: STORE_KEY$1 });
    return Array.isArray(value) ? value : [];
  },
  async setTriggers(triggers2) {
    const store = strapi2.store({ type: "plugin", name: "brevo-template-sender" });
    await store.set({ key: STORE_KEY$1, value: triggers2 });
  },
  async getTrigger(contentTypeUid, event) {
    const triggers2 = await this.getTriggers();
    return triggers2.find((t) => t.contentTypeUid === contentTypeUid && t.event === event) ?? null;
  }
});
const brevo = require("@getbrevo/brevo");
function getByPath(obj, path) {
  if (path === "") return obj;
  const parts = path.split(".").filter(Boolean);
  let current = obj;
  for (const p of parts) {
    if (current == null || typeof current !== "object") return void 0;
    current = current[p];
  }
  return current;
}
function replacePlaceholders(template, params2) {
  if (!template || typeof template !== "string") return template;
  const regex = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;
  return template.replace(regex, (_, path) => {
    const value = getByPath(params2, path.trim());
    if (value != null && typeof value === "object" && !Array.isArray(value) && "url" in value) {
      return String(value.url ?? "");
    }
    if (Array.isArray(value)) return value.map((v) => v && typeof v === "object" && "url" in v ? v.url : String(v)).join(", ");
    return String(value ?? "");
  });
}
const sender = ({ strapi: strapi2 }) => ({
  async sendHtml({
    htmlContent,
    subject,
    sendTo,
    replyTo,
    attachment
  }) {
    const settingsService = strapi2.service("plugin::brevo-template-sender.settings");
    const { apiKey, senderEmail, senderName } = await settingsService.getSettingsForSend();
    if (!apiKey) {
      throw new Error("Brevo API key is not configured. Set it in the plugin settings or BREVO_API_KEY env.");
    }
    if (!senderEmail) {
      throw new Error("Brevo sender email is not configured. Set it in the plugin settings (Sender Email) or BREVO_SENDER env.");
    }
    const apiInstance = new brevo.TransactionalEmailsApi();
    const apiKeyAuth = apiInstance.authentications["apiKey"];
    apiKeyAuth.apiKey = apiKey;
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.sender = new brevo.SendSmtpEmailSender();
    sendSmtpEmail.sender.email = senderEmail;
    sendSmtpEmail.sender.name = senderName || void 0;
    const replyEmail = replyTo || senderEmail;
    sendSmtpEmail.replyTo = replyEmail ? { email: replyEmail } : void 0;
    sendSmtpEmail.to = [{ email: sendTo }];
    if (attachment && attachment.length > 0) {
      sendSmtpEmail.attachment = attachment;
    }
    strapi2.log.info(`[brevo-template-sender] sendHtml from=${senderEmail} to=${sendTo} subject="${subject}"`);
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    strapi2.log.info(`[brevo-template-sender] sendHtml OK → ${sendTo}`);
  },
  /**
   * Envoi via un template Brevo (templateId). Les params sont passés à Brevo pour les variables du template.
   */
  async sendWithBrevoTemplateId({
    templateId,
    sendTo,
    params: params2 = {}
  }) {
    const settingsService = strapi2.service("plugin::brevo-template-sender.settings");
    const { apiKey, senderEmail, senderName } = await settingsService.getSettingsForSend();
    if (!apiKey) {
      throw new Error("Brevo API key is not configured. Set it in the plugin settings or BREVO_API_KEY env.");
    }
    if (!senderEmail) {
      throw new Error("Brevo sender email is not configured. Set it in the plugin settings (Sender Email) or BREVO_SENDER env.");
    }
    const apiInstance = new brevo.TransactionalEmailsApi();
    const apiKeyAuth = apiInstance.authentications["apiKey"];
    apiKeyAuth.apiKey = apiKey;
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.templateId = templateId;
    const stringParams = {};
    for (const [k, v] of Object.entries(params2)) {
      if (v != null && typeof v === "object" && "url" in v) {
        stringParams[k] = String(v.url ?? "");
      } else {
        stringParams[k] = typeof v === "string" ? v : String(v ?? "");
      }
    }
    sendSmtpEmail.params = stringParams;
    sendSmtpEmail.sender = new brevo.SendSmtpEmailSender();
    sendSmtpEmail.sender.email = senderEmail;
    sendSmtpEmail.sender.name = senderName || void 0;
    sendSmtpEmail.to = [{ email: sendTo }];
    strapi2.log.info(`[brevo-template-sender] sendWithBrevoTemplateId templateId=${templateId} from=${senderEmail} to=${sendTo}`);
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    strapi2.log.info(`[brevo-template-sender] sendWithBrevoTemplateId OK → ${sendTo}`);
  },
  /**
   * Charge un template par code, remplace les placeholders et envoie l'email.
   * Utilisé par les routes /contact, /brevo/inquiry et les lifecycles inquiry-request.
   */
  async sendWithTemplateCode({
    templateCode,
    to,
    params: params2 = {},
    attachment
  }) {
    const settingsService = strapi2.service("plugin::brevo-template-sender.settings");
    const { logoUrl } = await settingsService.getSettingsForSend();
    const config2 = strapi2.config.get("plugin::brevo-template-sender");
    const contentTypeUid = config2?.templateContentType || "plugin::brevo-template-sender.email-template";
    const mergedParams = {
      ...params2,
      logo_url: logoUrl || ""
    };
    const entries = await strapi2.documents(contentTypeUid).findMany({
      filters: { code: templateCode },
      status: "published"
    });
    const doc = Array.isArray(entries) ? entries[0] : entries;
    if (!doc) {
      throw new Error(`Email template not found: ${templateCode}`);
    }
    const templateMode = doc.templateMode ?? "html";
    const brevoTemplateId = doc.brevoTemplateId != null ? Number(doc.brevoTemplateId) : void 0;
    if (templateMode === "brevo" && brevoTemplateId != null && brevoTemplateId > 0) {
      await this.sendWithBrevoTemplateId({
        templateId: brevoTemplateId,
        sendTo: to,
        params: mergedParams
      });
      return;
    }
    const subject = replacePlaceholders(doc.subject || "", mergedParams);
    const htmlContent = replacePlaceholders(doc.html || "", mergedParams);
    if (!htmlContent) {
      throw new Error(`Email template "${templateCode}" has no HTML content`);
    }
    const sender2 = strapi2.service("plugin::brevo-template-sender.sender");
    const { senderEmail } = await settingsService.getSettingsForSend();
    await sender2.sendHtml({
      htmlContent,
      subject,
      sendTo: to,
      replyTo: senderEmail,
      attachment
    });
  },
  /**
   * Envoi à partir d'une config trigger : mode HTML (subject + html) ou mode template Brevo (templateId).
   */
  async sendFromTrigger({
    subject,
    html,
    params: params2,
    sendTo,
    templateMode,
    brevoTemplateId
  }) {
    if (templateMode === "brevo" && brevoTemplateId != null && brevoTemplateId > 0) {
      const settingsService2 = strapi2.service("plugin::brevo-template-sender.settings");
      const { logoUrl: logoUrl2 } = await settingsService2.getSettingsForSend();
      const mergedParams2 = { ...params2, logo_url: logoUrl2 || "" };
      await this.sendWithBrevoTemplateId({
        templateId: brevoTemplateId,
        sendTo,
        params: mergedParams2
      });
      return;
    }
    const settingsService = strapi2.service("plugin::brevo-template-sender.settings");
    const { logoUrl, senderEmail } = await settingsService.getSettingsForSend();
    const mergedParams = {
      ...params2,
      logo_url: logoUrl || ""
    };
    const finalSubject = replacePlaceholders(subject, mergedParams);
    const htmlContent = replacePlaceholders(html, mergedParams);
    await this.sendHtml({
      htmlContent,
      subject: finalSubject,
      sendTo,
      replyTo: senderEmail
    });
  }
});
function getAttributeType(attr) {
  if (!attr || typeof attr !== "object") return "unknown";
  const a = attr;
  return a.type ?? a.model ?? "unknown";
}
function getAttributeKind(type) {
  if (type === "relation") return "relation";
  if (type === "media") return "media";
  if (type === "component") return "component";
  if (type === "dynamiczone") return "dynamiczone";
  return "scalar";
}
const params = ({ strapi: strapi2 }) => ({
  /**
   * Retourne les métadonnées des attributs d'un content type (nom, type, kind, target).
   * Permet à l'admin de distinguer champs simples (texte) vs champs à profondeur (relation, media).
   */
  getAttributesMeta(uid) {
    const ct = strapi2.contentTypes?.[uid];
    if (!ct?.attributes) return [];
    return Object.entries(ct.attributes).map(([name, attr]) => {
      const type = getAttributeType(attr);
      const kind2 = getAttributeKind(type);
      const target = attr?.target;
      return { name, type, kind: kind2, target };
    });
  },
  /**
   * Returns the list of depth attributes for a relation/media/component attribute
   * (e.g. for "thumbnail" media: id, url, name, ...; for relation: target content type attributes).
   */
  getDepthAttributes(uid, attributeName) {
    const meta = this.getAttributesMeta(uid);
    const attr = meta.find((m) => m.name === attributeName);
    if (!attr) return [];
    if (attr.kind === "media") {
      return [
        { name: "id" },
        { name: "url" },
        { name: "name" },
        { name: "alternativeText" },
        { name: "caption" },
        { name: "width" },
        { name: "height" }
      ];
    }
    if (attr.kind === "relation" && attr.target) {
      return this.getAttributesMeta(attr.target).map((m) => ({ name: m.name }));
    }
    if (attr.kind === "component" && attr.target) {
      const comp = strapi2.components?.[attr.target];
      if (comp?.attributes) {
        return Object.keys(comp.attributes).map((name) => ({ name }));
      }
    }
    return [];
  },
  /**
   * Construit un objet populate pour strapi.documents(uid).findOne()
   * en incluant les relations et media jusqu'à la profondeur demandée.
   */
  buildPopulate(uid, depth) {
    if (depth <= 0) return {};
    const meta = this.getAttributesMeta(uid);
    const relationAndMedia = meta.filter((m) => m.kind === "relation" || m.kind === "media" || m.kind === "component");
    if (relationAndMedia.length === 0) return {};
    if (depth === 1) return relationAndMedia.map((m) => m.name);
    const populate = {};
    for (const m of relationAndMedia) {
      if (m.kind === "relation" && m.target && depth > 1) {
        const nested = this.buildPopulate(m.target, depth - 1);
        populate[m.name] = Array.isArray(nested) ? { populate: nested } : { populate: nested };
      } else {
        populate[m.name] = true;
      }
    }
    return populate;
  },
  /**
   * Récupère le document avec les relations/media peuplés jusqu'à la profondeur donnée.
   * Pour les media, on normalise pour avoir .url accessible ; pour les relations, l'objet peuplé.
   */
  async getDocumentWithDepth(uid, documentId, depth = 2) {
    try {
      const populate = this.buildPopulate(uid, depth);
      const doc = await strapi2.documents(uid).findOne({
        documentId,
        populate: Object.keys(populate).length ? populate : void 0
      });
      if (!doc || typeof doc !== "object") return null;
      return this.normalizeForTemplate(doc, uid, depth);
    } catch (e) {
      strapi2.log?.warn?.("brevo-template-sender getDocumentWithDepth", e);
      return null;
    }
  },
  /**
   * Normalise le document pour le template : media → { url, ... }, relations déjà en objet.
   */
  normalizeForTemplate(doc, uid, _depth) {
    const meta = this.getAttributesMeta(uid);
    const out = { ...doc };
    for (const m of meta) {
      const val = out[m.name];
      if (val == null) continue;
      if (m.kind === "media") {
        if (Array.isArray(val)) {
          out[m.name] = val.map((v) => v && typeof v === "object" && v.url ? v : { url: "" });
        } else if (typeof val === "object" && val !== null && "url" in val) {
          out[m.name] = val;
        } else {
          out[m.name] = { url: String(val) };
        }
      }
      if (m.kind === "relation" && typeof val === "object" && val !== null && !Array.isArray(val)) {
        out[m.name] = val;
      }
      if (m.kind === "relation" && Array.isArray(val)) {
        out[m.name] = val;
      }
    }
    return out;
  }
});
const STORE_KEY = "brevo-settings";
const settings = ({ strapi: strapi2 }) => {
  const store = strapi2.store({ type: "plugin", name: "brevo-template-sender" });
  return {
    /** Pour l’admin : retourne les paramètres avec la clé API masquée (présente ou non). */
    async getSettings() {
      const saved = await store.get({ key: STORE_KEY });
      const config2 = strapi2.config.get("plugin::brevo-template-sender");
      return {
        apiKeySet: Boolean(saved?.apiKey || process.env.BREVO_API_KEY),
        senderEmail: saved?.senderEmail ?? process.env.BREVO_SENDER ?? "",
        senderName: saved?.senderName ?? process.env.BREVO_SENDER_NAME ?? "",
        logoUrl: saved?.logoUrl ?? config2?.logoUrl ?? process.env.STRAPI_LOGO_URL ?? "",
        sendEmailTemplateCode: saved?.sendEmailTemplateCode ?? "contact",
        openaiApiKeySet: Boolean(saved?.openaiApiKey),
        isDevelopment: process.env.NODE_ENV === "development",
        supportRepoUrl: process.env.BREVO_TEMPLATE_SENDER_REPO_URL || "https://github.com/calistock/strapi-plugin-brevo-template-sender",
        supportBmcUrl: process.env.BREVO_TEMPLATE_SENDER_BMC_URL || "https://buymeacoffee.com/dupflo"
      };
    },
    /** Enregistre les paramètres (seules les clés fournies sont mises à jour). */
    async setSettings(partial) {
      const current = await store.get({ key: STORE_KEY });
      const next = { ...current, ...partial };
      if (partial.apiKey === "") delete next.apiKey;
      else if (partial.apiKey != null) next.apiKey = partial.apiKey;
      if (partial.openaiApiKey === "") delete next.openaiApiKey;
      else if (partial.openaiApiKey != null) next.openaiApiKey = partial.openaiApiKey;
      await store.set({ key: STORE_KEY, value: next });
    },
    /** Pour l’envoi côté serveur uniquement : retourne la clé API et l’expéditeur (store puis env). */
    async getOpenAiApiKey() {
      const saved = await store.get({ key: STORE_KEY });
      return saved?.openaiApiKey ?? process.env.OPENAI_API_KEY ?? "";
    },
    async getSettingsForSend() {
      const saved = await store.get({ key: STORE_KEY });
      const config2 = strapi2.config.get("plugin::brevo-template-sender");
      return {
        apiKey: saved?.apiKey ?? process.env.BREVO_API_KEY ?? "",
        senderEmail: saved?.senderEmail ?? process.env.BREVO_SENDER ?? "",
        senderName: saved?.senderName ?? process.env.BREVO_SENDER_NAME ?? "",
        logoUrl: saved?.logoUrl ?? config2?.logoUrl ?? process.env.STRAPI_LOGO_URL ?? ""
      };
    }
  };
};
const services = {
  triggers,
  sender,
  params,
  settings
};
const index = () => ({
  register,
  config,
  contentTypes: contentTypes$1,
  controllers,
  routes,
  services
});
module.exports = index;
