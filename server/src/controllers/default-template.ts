/**
 * API admin : récupérer / mettre à jour le template par défaut (Send Email API) par code.
 * Le template est un document du content-type email-template (config).
 */

function getContentTypeUid(): string {
  const config = strapi.config.get("plugin::brevo-template-sender") as {
    templateContentType?: string;
  };
  return config?.templateContentType || "plugin::brevo-template-sender.email-template";
}

export default {
  async get(ctx: any) {
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
      status: "published",
    });
    const list = Array.isArray(raw)
      ? raw
      : raw &&
          typeof raw === "object" &&
          Array.isArray((raw as { results?: unknown[] }).results)
        ? (raw as { results: unknown[] }).results
        : [];
    const doc = list[0] as
      | {
          documentId?: string;
          id?: number;
          code?: string;
          name?: string;
          subject?: string;
          html?: string;
          templateMode?: string;
          brevoTemplateId?: number;
          recipients?: string;
        }
      | undefined;
    if (!doc) {
      ctx.body = { template: null };
      return;
    }
    const documentId =
      doc.documentId ?? (doc.id != null ? String(doc.id) : undefined);
    ctx.body = {
      template: {
        documentId,
        code: doc.code,
        name: doc.name ?? "",
        subject: doc.subject ?? "",
        html: doc.html ?? "",
        templateMode: doc.templateMode ?? "html",
        brevoTemplateId: doc.brevoTemplateId ?? undefined,
        recipients: doc.recipients ?? "",
      },
    };
  },

  async update(ctx: any) {
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
    const toList = (r: unknown): unknown[] =>
      Array.isArray(r)
        ? r
        : r &&
            typeof r === "object" &&
            Array.isArray((r as { results?: unknown[] }).results)
          ? (r as { results: unknown[] }).results
          : [];
    let raw = await strapi.documents(uid).findMany({
      filters: { code: codeStr },
      status: "published",
    });
    let existing = toList(raw)[0] as
      | { documentId?: string; id?: number; name?: string }
      | undefined;
    if (!existing) {
      raw = await strapi.documents(uid).findMany({
        filters: { code: codeStr },
        status: "draft",
      });
      existing = toList(raw)[0] as
        | { documentId?: string; id?: number; name?: string }
        | undefined;
    }

    const documentId = existing
      ? (existing.documentId ??
        (existing.id != null ? String(existing.id) : undefined))
      : undefined;
    if (existing && documentId) {
      await strapi.documents(uid).update({
        documentId,
        status: "draft",
        data: {
          ...(typeof name === "string" && {
            name: name.trim() || existing.name,
          }),
          ...(typeof subject === "string" && { subject: subject.trim() }),
          ...(typeof html === "string" && { html: html.trim() }),
          ...((templateMode === "html" || templateMode === "brevo") && {
            templateMode,
          }),
          ...(typeof brevoTemplateId === "number"
            ? { brevoTemplateId }
            : typeof brevoTemplateId === "string"
              ? { brevoTemplateId: parseInt(brevoTemplateId, 10) }
              : {}),
          ...(typeof recipients === "string" && { recipients: recipients.trim() }),
        },
      });
      await strapi.documents(uid).publish({ documentId });
    } else {
      const created = (await strapi.documents(uid).create({
        data: {
          code: codeStr,
          name:
            typeof name === "string" && name.trim()
              ? name.trim()
              : "Send Email Default",
          subject: typeof subject === "string" ? subject.trim() : "Message",
          html:
            typeof html === "string"
              ? html.trim()
              : "<p>Hello {{firstname}}</p>",
          templateMode: templateMode === "brevo" ? "brevo" : "html",
          brevoTemplateId:
            typeof brevoTemplateId === "number"
              ? brevoTemplateId
              : typeof brevoTemplateId === "string"
                ? parseInt(brevoTemplateId, 10)
                : undefined,
          recipients: typeof recipients === "string" ? recipients.trim() : undefined,
        },
      })) as { documentId?: string; id?: number };
      const createdId =
        created?.documentId ??
        (created?.id != null ? String(created.id) : undefined);
      if (createdId) {
        await strapi.documents(uid).publish({ documentId: createdId });
      }
    }
    ctx.body = { ok: true };
  },
};
