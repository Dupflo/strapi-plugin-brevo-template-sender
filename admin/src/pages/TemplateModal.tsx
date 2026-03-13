import {
  Alert,
  Box,
  Button,
  Field,
  Flex,
  Loader,
  Modal,
  TextInput,
  Typography,
} from "@strapi/design-system";
import { useFetchClient } from "@strapi/strapi/admin";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";
import styled from "styled-components";

interface TriggerConfig {
  id: string;
  contentTypeUid: string;
  event: "create" | "update" | "delete" | "publish" | "unpublish";
  subject: string;
  html: string;
  sendToField?: string;
  recipients?: string;
  templateMode?: "html" | "brevo";
  brevoTemplateId?: number;
}

interface AttributeMeta {
  name: string;
  type: string;
  kind: "scalar" | "relation" | "media" | "component" | "dynamiczone";
  target?: string;
}

interface TemplateModalProps {
  contentTypeUid: string;
  attributes: AttributeMeta[];
  displayName: string;
  trigger: TriggerConfig | null;
  saveError?: string | null;
  openaiApiKeySet?: boolean;
  /** When set, modal is for Send Email API default template: load/save via default-template API, no recipients. */
  defaultTemplateCode?: string;
  onClose: () => void;
  onDismissError?: () => void;
  onSave: (t: TriggerConfig) => void | Promise<void>;
  /** Called after successful save when defaultTemplateCode is set (before onClose). */
  onSaved?: () => void;
}

const SAMPLE: Record<string, string> = {
  logo_url: "",
  email: "email@example.com",
  subject: "Subject",
  message: "Message...",
  firstname: "John",
  lastname: "Doe",
  mailto: "contact@example.com",
};

/** Builds default email template HTML with translated body text. */
function getDefaultEmailTemplateHtml(greeting: string, body: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;font-family:sans-serif;">
  <tr>
    <td style="padding:24px;background:#fff;border-bottom:1px solid #eee;">
      <img src="{{logo_url}}" alt="Logo" style="max-height:80px;display:block;" />
    </td>
  </tr>
  <tr>
    <td style="padding:24px;background:#fff;">
      <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">${greeting}</p>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">${body}</p>
    </td>
  </tr>
</table>`;
}

const ModalContentLarge = styled(Modal.Content)`
  width: 100%;
  max-width: 720px;
  height: 95vh;
  max-height: 95vh;
`;

const ModalContentHtmlEditor = styled(Modal.Content)`
  width: 90vw;
  max-width: 1400px;
  height: 85vh;
  max-height: 85vh;
`;

const PreviewOnlyLayout = styled(Box)`
  display: flex;
  flex-direction: column;
  min-height: 400px;
  height: calc(95vh - 320px);
`;

const GridLayoutHtmlEditor = styled(Box)`
  display: grid;
  grid-template-columns: 1fr;
  min-height: 480px;
  height: calc(85vh - 180px);
`;

const Column = styled(Box)`
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-radius: 6px;
  border: 1px solid var(--strapi-colors-neutral200);
  background: var(--strapi-colors-neutral50);
`;

const ColumnLabel = styled.div`
  padding: 10px 14px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--strapi-colors-neutral600);
  background: var(--strapi-colors-neutral100);
  border-bottom: 1px solid var(--strapi-colors-neutral200);
  border-radius: 6px 6px 0 0;
`;

const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--strapi-colors-neutral600);
  background: var(--strapi-colors-neutral100);
  border-bottom: 1px solid var(--strapi-colors-neutral200);
  border-radius: 6px 6px 0 0;
`;

const PreviewBody = styled.div`
  flex: 1;
  min-height: 0;
  padding: 8px;
  display: flex;
  flex-direction: column;
`;

const FieldsList = styled.div`
  padding: 10px;
  overflow-y: auto;
  flex: 1;
`;

const FieldTag = styled.div<{ $isLogo?: boolean; $isRelation?: boolean }>`
  padding: 10px 14px;
  margin-bottom: 8px;
  font-family: monospace;
  font-size: 13px;
  background: ${(p) =>
    p.$isLogo
      ? "var(--strapi-colors-primary100)"
      : p.$isRelation
        ? "var(--strapi-colors-secondary100, var(--strapi-colors-primary100))"
        : "var(--strapi-colors-neutral0)"};
  border: 1px solid
    ${(p) =>
      p.$isLogo
        ? "var(--strapi-colors-primary200)"
        : p.$isRelation
          ? "var(--strapi-colors-secondary200, var(--strapi-colors-primary200))"
          : "var(--strapi-colors-neutral200)"};
  border-radius: 6px;
  cursor: grab;
  user-select: none;
  &:active {
    cursor: grabbing;
  }
`;

const RelationLabel = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--strapi-colors-neutral700);
  background: var(--strapi-colors-neutral200);
  border: 1px solid var(--strapi-colors-neutral400);
  border-radius: 6px;
  margin-left: 8px;
  vertical-align: middle;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const ModalContentFieldPicker = styled(Modal.Content)`
  width: 90%;
  max-width: 420px;
`;

const FieldPickerList = styled.div`
  padding: 8px 0;
  max-height: 60vh;
  overflow-y: auto;
`;

const FieldPickerItem = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 14px;
  margin-bottom: 6px;
  font-family: monospace;
  font-size: 13px;
  text-align: left;
  border: 1px solid var(--strapi-colors-neutral200);
  border-radius: 6px;
  background: var(--strapi-colors-neutral0);
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
  &:hover {
    background: var(--strapi-colors-neutral100);
    border-color: var(--strapi-colors-neutral300);
  }
  &:last-child {
    margin-bottom: 0;
  }
`;

const FieldPickerItemRelation = styled(FieldPickerItem)<{ $isLogo?: boolean }>`
  background: ${(p) =>
    p.$isLogo
      ? "var(--strapi-colors-primary100)"
      : "var(--strapi-colors-secondary100, var(--strapi-colors-primary100))"};
  border-color: ${(p) =>
    p.$isLogo
      ? "var(--strapi-colors-primary200)"
      : "var(--strapi-colors-secondary200, var(--strapi-colors-primary200))"};
  &:hover {
    background: ${(p) =>
      p.$isLogo
        ? "var(--strapi-colors-primary200)"
        : "var(--strapi-colors-secondary200, var(--strapi-colors-primary200))"};
  }
`;

const Textarea = styled.textarea`
  flex: 1;
  min-height: 240px;
  font-family: monospace;
  font-size: 13px;
  padding: 14px;
  border: none;
  resize: none;
  outline: none;
  background: var(--strapi-colors-neutral0);
`;

const PreviewFrame = styled.iframe`
  flex: 1;
  min-height: 240px;
  border: none;
  background: white;
  width: 100%;
`;

const Label = styled.label`
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--strapi-colors-neutral600);
  margin-bottom: 6px;
`;

const RecipientsTagsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  font-size: 12px;
  background: var(--strapi-colors-primary100);
  color: var(--strapi-colors-primary700);
  border-radius: 4px;
  gap: 6px;
`;

const BadgeDynamic = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  font-size: 12px;
  font-family: monospace;
  background: var(
    --strapi-colors-secondary100,
    var(--strapi-colors-primary100)
  );
  color: var(--strapi-colors-secondary700, var(--strapi-colors-primary700));
  border: 1px solid
    var(--strapi-colors-secondary200, var(--strapi-colors-primary200));
  border-radius: 4px;
  gap: 6px;
`;

const BadgeRemove = styled.button`
  padding: 0;
  margin: 0;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--strapi-colors-neutral600);
  font-size: 14px;
  line-height: 1;
  &:hover {
    color: var(--strapi-colors-danger600);
  }
`;

const RelationBadgeInTag = styled.button`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  margin-left: 8px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--strapi-colors-neutral700);
  background: var(--strapi-colors-neutral200);
  border: 1px solid var(--strapi-colors-neutral400);
  border-radius: 6px;
  cursor: pointer;
  vertical-align: middle;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  &:hover {
    background: var(--strapi-colors-neutral300);
    border-color: var(--strapi-colors-neutral500);
  }
`;

function getByPath(obj: unknown, path: string): unknown {
  if (path === "") return obj;
  const parts = path.split(".").filter(Boolean);
  let current: unknown = obj;
  for (const p of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[p];
  }
  return current;
}

function replacePlaceholders(
  template: string,
  params: Record<string, unknown>
): string {
  const regex = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;
  return template.replace(regex, (_, path: string) => {
    const value = getByPath(params, path.trim());
    if (
      value != null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      "url" in value
    ) {
      return String((value as { url?: string }).url ?? "");
    }
    if (Array.isArray(value)) {
      return value
        .map((v) =>
          v && typeof v === "object" && "url" in v
            ? (v as { url: string }).url
            : String(v)
        )
        .join(", ");
    }
    return String(value ?? `{{${path}}}`);
  });
}

function wrapHtml(html: string): string {
  const t = html.trim();
  if (
    t.toLowerCase().startsWith("<!doctype") ||
    t.toLowerCase().startsWith("<html")
  )
    return html;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:12px;">${html}</body></html>`;
}

function parseRecipients(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function formatRecipients(emails: string[]): string {
  return emails.join(", ");
}

function getPlaceholderRootKey(placeholder: string): string {
  const match = placeholder.trim().match(/\{\{\s*([^}.]+)/);
  return match ? match[1].trim() : "";
}

export default function TemplateModal({
  contentTypeUid,
  attributes,
  displayName,
  trigger,
  saveError = null,
  openaiApiKeySet = false,
  defaultTemplateCode,
  onClose,
  onDismissError,
  onSave,
  onSaved,
}: TemplateModalProps) {
  const intl = useIntl();
  const { get, post, put } = useFetchClient();
  const isDefaultTemplate = Boolean(defaultTemplateCode);
  const [subject, setSubject] = useState(trigger?.subject ?? "");
  const [html, setHtml] = useState(trigger?.html ?? "");
  const [recipientsStr, setRecipientsStr] = useState(trigger?.recipients ?? "");
  const [recipientsInputValue, setRecipientsInputValue] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const subjectInputRef = useRef<HTMLInputElement>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [htmlEditorOpen, setHtmlEditorOpen] = useState(false);
  const [fieldPickerFor, setFieldPickerFor] = useState<
    "recipients" | "subject" | "html" | null
  >(null);
  const [recipientDynamicHint, setRecipientDynamicHint] = useState<
    string | null
  >(null);
  const [depthModalFor, setDepthModalFor] = useState<number | null>(null);
  const [depthAttributes, setDepthAttributes] = useState<{ name: string }[]>(
    []
  );
  const [depthLoading, setDepthLoading] = useState(false);
  const [depthPickerFromFieldPicker, setDepthPickerFromFieldPicker] = useState<{
    rootKey: string;
    context: "recipients" | "subject" | "html";
  } | null>(null);
  const [depthModalForHtml, setDepthModalForHtml] = useState<{
    rootKey: string;
    insertStart: number;
    insertEnd: number;
  } | null>(null);
  const [depthAttributesForPicker, setDepthAttributesForPicker] = useState<
    { name: string }[]
  >([]);
  const [depthLoadingForPicker, setDepthLoadingForPicker] = useState(false);
  const [depthAttributesForHtmlDrop, setDepthAttributesForHtmlDrop] = useState<
    { name: string }[]
  >([]);
  const [depthLoadingForHtmlDrop, setDepthLoadingForHtmlDrop] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [templateMode, setTemplateMode] = useState<"html" | "brevo">(
    trigger?.templateMode ?? "html"
  );
  const [brevoTemplateIdStr, setBrevoTemplateIdStr] = useState(
    trigger?.brevoTemplateId != null ? String(trigger.brevoTemplateId) : ""
  );
  const [savingDefault, setSavingDefault] = useState(false);
  const [defaultTemplateLoading, setDefaultTemplateLoading] =
    useState(isDefaultTemplate);
  const [errors, setErrors] = useState<{
    subject?: string;
    brevoTemplateId?: string;
    recipients?: string;
  }>({});

  const recipientsList = useMemo(
    () => parseRecipients(recipientsStr),
    [recipientsStr]
  );

  const isPlaceholder = (value: string) => /^\s*\{\{[^}]+\}\}\s*$/.test(value);

  const isRelationPlaceholder = (value: string) => {
    if (!isPlaceholder(value)) return false;
    const rootKey = getPlaceholderRootKey(value);
    const attr = attributes.find((a) => a.name === rootKey);
    return (
      attr &&
      (attr.kind === "relation" ||
        attr.kind === "media" ||
        attr.kind === "component")
    );
  };

  // Fetch depth attributes when depth modal opens (relation tag clicked)
  useEffect(() => {
    if (depthModalFor === null) return;
    const placeholder = recipientsList[depthModalFor];
    const rootKey = getPlaceholderRootKey(placeholder ?? "");
    if (!rootKey) {
      setDepthAttributes([]);
      return;
    }
    setDepthLoading(true);
    const base = "/brevo-template-sender";
    get(
      `${base}/depth-attributes?contentTypeUid=${encodeURIComponent(contentTypeUid)}&attributeName=${encodeURIComponent(rootKey)}`
    )
      .then((res: { data?: { attributes?: { name: string }[] } }) => {
        const list = res?.data?.attributes ?? [];
        setDepthAttributes(Array.isArray(list) ? list : []);
      })
      .finally(() => setDepthLoading(false));
  }, [depthModalFor, contentTypeUid, get, recipientsList]);

  // Fetch depth attributes when in field picker user chose a relation (step 2: select depth attribute)
  useEffect(() => {
    if (depthPickerFromFieldPicker === null) return;
    const { rootKey } = depthPickerFromFieldPicker;
    setDepthLoadingForPicker(true);
    const base = "/brevo-template-sender";
    get(
      `${base}/depth-attributes?contentTypeUid=${encodeURIComponent(contentTypeUid)}&attributeName=${encodeURIComponent(rootKey)}`
    )
      .then((res: { data?: { attributes?: { name: string }[] } }) => {
        const list = res?.data?.attributes ?? [];
        setDepthAttributesForPicker(Array.isArray(list) ? list : []);
      })
      .finally(() => setDepthLoadingForPicker(false));
  }, [depthPickerFromFieldPicker, contentTypeUid, get]);

  // Fetch depth attributes when user dropped a relation placeholder onto HTML (choose which attribute to insert)
  useEffect(() => {
    if (depthModalForHtml === null) return;
    const { rootKey } = depthModalForHtml;
    setDepthLoadingForHtmlDrop(true);
    const base = "/brevo-template-sender";
    get(
      `${base}/depth-attributes?contentTypeUid=${encodeURIComponent(contentTypeUid)}&attributeName=${encodeURIComponent(rootKey)}`
    )
      .then((res: { data?: { attributes?: { name: string }[] } }) => {
        const list = res?.data?.attributes ?? [];
        setDepthAttributesForHtmlDrop(Array.isArray(list) ? list : []);
      })
      .finally(() => setDepthLoadingForHtmlDrop(false));
  }, [depthModalForHtml, contentTypeUid, get]);

  // Default template on modal open when HTML is empty (trigger has no template yet)
  const initialHtml = trigger?.html ?? "";
  useEffect(() => {
    if (isDefaultTemplate) return;
    if (!initialHtml.trim()) {
      const greeting = intl.formatMessage({
        id: "brevo-template-sender.modal.defaultTemplateGreeting",
        defaultMessage: "Hello,",
      });
      const body = intl.formatMessage({
        id: "brevo-template-sender.modal.defaultTemplateBody",
        defaultMessage: "Content of your message...",
      });
      setHtml(getDefaultEmailTemplateHtml(greeting, body));
    }
  }, [initialHtml, intl, isDefaultTemplate]);

  // Load default template from API when in Send Email API mode
  useEffect(() => {
    if (!defaultTemplateCode) return;
    let cancelled = false;
    setDefaultTemplateLoading(true);
    const base = "/brevo-template-sender";
    get(
      `${base}/default-template?code=${encodeURIComponent(defaultTemplateCode)}`
    )
      .then((res: { data?: { template?: unknown }; template?: unknown }) => {
        if (cancelled) return;
        const raw = res?.data ?? res;
        const t = (raw as { template?: unknown })?.template as {
          subject?: string;
          html?: string;
          templateMode?: string;
          brevoTemplateId?: number;
          recipients?: string;
        } | null;
        if (t) {
          setSubject(t.subject ?? "");
          setHtml(t.html ?? "");
          setTemplateMode(t.templateMode === "brevo" ? "brevo" : "html");
          setBrevoTemplateIdStr(
            t.brevoTemplateId != null ? String(t.brevoTemplateId) : ""
          );
          setRecipientsStr(t.recipients ?? "");
        } else {
          setSubject("");
          setHtml(
            getDefaultEmailTemplateHtml(
              intl.formatMessage({
                id: "brevo-template-sender.modal.defaultTemplateGreeting",
                defaultMessage: "Hello,",
              }),
              intl.formatMessage({
                id: "brevo-template-sender.modal.defaultTemplateBody",
                defaultMessage: "Content of your message...",
              })
            )
          );
          setTemplateMode("html");
          setBrevoTemplateIdStr("");
        }
      })
      .catch(() => {
        if (!cancelled) setHtml("<p>Hello {{firstname}}</p>");
      })
      .finally(() => {
        if (!cancelled) setDefaultTemplateLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [defaultTemplateCode, get, intl]);

  // Logo : priorité 1 = menu logo Strapi (Customization), 2 = paramètre Brevo, 3 = placeholder
  useEffect(() => {
    let cancelled = false;
    const backendUrl =
      typeof (window as any)?.strapi?.backendURL === "string"
        ? (window as any).strapi.backendURL.replace(/\/$/, "")
        : window.location.origin;

    Promise.all([
      get("/admin/project-settings").catch(() => ({ data: null })),
      get("/brevo-template-sender/settings").catch(() => ({ data: null })),
    ]).then(([projectRes, brevoRes]: [any, any]) => {
      if (cancelled) return;
      const menuLogoUrl = projectRes?.data?.menuLogo?.url;
      const brevoLogoUrl = brevoRes?.data?.logoUrl;
      const resolved =
        (typeof menuLogoUrl === "string" &&
          menuLogoUrl.trim() &&
          `${backendUrl}${menuLogoUrl.trim().startsWith("/") ? "" : "/"}${menuLogoUrl.trim()}`) ||
        (typeof brevoLogoUrl === "string" && brevoLogoUrl.trim()
          ? brevoLogoUrl.trim()
          : "");
      setLogoUrl(resolved);
    });
    return () => {
      cancelled = true;
    };
  }, [get]);

  const params = useMemo(
    () => ({
      ...Object.fromEntries(
        attributes.map((a) => [
          a.name,
          SAMPLE[a.name] ??
            (a.kind === "media"
              ? { url: "https://via.placeholder.com/120x40" }
              : a.kind !== "scalar"
                ? { title: `(${a.name})`, url: "#" }
                : `(${a.name})`),
        ])
      ),
      logo_url: logoUrl || "https://via.placeholder.com/120x40?text=Logo",
    }),
    [attributes, logoUrl]
  );

  useEffect(() => {
    const out = replacePlaceholders(html, params);
    setPreviewHtml(wrapHtml(out));
  }, [html, params]);

  const fields = useMemo(
    () => [
      {
        key: "logo_url",
        label: "{{logo_url}}",
        isLogo: true,
        kind: "scalar" as const,
      },
      ...attributes.map((a) => ({
        key: a.name,
        label: `{{${a.name}}}`,
        hint:
          a.kind === "media"
            ? `→ ex: {{${a.name}.url}}`
            : a.kind === "relation" || a.kind === "component"
              ? `→ ex: {{${a.name}.title}} ou {{${a.name}.slug}}`
              : undefined,
        kind: a.kind,
        type: a.type,
        target: a.target,
      })),
    ],
    [attributes]
  );

  const handleDragStart = (e: React.DragEvent, placeholder: string) => {
    e.dataTransfer.setData("text/plain", placeholder);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const text = e.dataTransfer.getData("text/plain");
    const ta = textareaRef.current;
    if (!ta || !text) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    if (isRelationPlaceholder(text)) {
      const rootKey = getPlaceholderRootKey(text);
      if (rootKey)
        setDepthModalForHtml({ rootKey, insertStart: start, insertEnd: end });
      return;
    }
    const before = html.slice(0, start);
    const after = html.slice(end);
    setHtml(before + text + after);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const handleGenerateWithAi = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const base = "/brevo-template-sender";
      const res = await post(`${base}/generate-html`, {
        prompt: aiPrompt.trim(),
        currentHtml: html || undefined,
      });
      const data = res?.data ?? res;
      const generated = typeof data?.html === "string" ? data.html : null;
      if (generated) {
        setHtml(generated);
        setAiModalOpen(false);
        setAiPrompt("");
      } else {
        setAiError(
          intl.formatMessage({
            id: "brevo-template-sender.ai.generateError",
            defaultMessage: "Invalid response from server.",
          })
        );
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ??
        err?.message ??
        intl.formatMessage({
          id: "brevo-template-sender.ai.generateError",
          defaultMessage: "Failed to generate.",
        });
      setAiError(typeof msg === "string" ? msg : "Failed to generate.");
    } finally {
      setAiLoading(false);
    }
  };

  const addRecipient = (email: string) => {
    const trimmed = email.trim();
    if (!trimmed) return;
    // Do not allow adding dynamic placeholders via the input; user must use the { } button
    if (/^\s*\{\{[^}]+\}\}\s*$/.test(trimmed)) {
      setRecipientDynamicHint(
        intl.formatMessage({
          id: "brevo-template-sender.modal.recipientsUseDynamicButton",
          defaultMessage:
            "Use the { } button to add dynamic fields from the content type.",
        })
      );
      return;
    }
    setRecipientDynamicHint(null);
    const next = [...recipientsList, trimmed];
    setRecipientsStr(formatRecipients(next));
    setRecipientsInputValue("");
    if (errors.recipients)
      setErrors((prev) => ({ ...prev, recipients: undefined }));
  };

  const addRecipientPlaceholder = (placeholder: string) => {
    const trimmed = placeholder.trim();
    if (!trimmed) return;
    const next = [...recipientsList, trimmed];
    setRecipientsStr(formatRecipients(next));
    if (errors.recipients)
      setErrors((prev) => ({ ...prev, recipients: undefined }));
  };

  const insertIntoSubject = (placeholder: string) => {
    const trimmed = placeholder.trim();
    if (!trimmed) return;
    const input = subjectInputRef.current;
    if (input && typeof input.selectionStart === "number") {
      const start = input.selectionStart ?? subject.length;
      const end = input.selectionEnd ?? start;
      setSubject(subject.slice(0, start) + trimmed + subject.slice(end));
      setFieldPickerFor(null);
      setTimeout(() => {
        input.focus();
        const newPos = start + trimmed.length;
        input.setSelectionRange(newPos, newPos);
      }, 0);
    } else {
      setSubject((prev) => prev + trimmed);
      setFieldPickerFor(null);
      setTimeout(() => subjectInputRef.current?.focus(), 0);
    }
  };

  const insertIntoHtml = (placeholder: string) => {
    const trimmed = placeholder.trim();
    if (!trimmed) return;
    const ta = textareaRef.current;
    if (ta && typeof ta.selectionStart === "number") {
      const start = ta.selectionStart;
      const end = ta.selectionEnd ?? start;
      setHtml(html.slice(0, start) + trimmed + html.slice(end));
      setFieldPickerFor(null);
      setTimeout(() => {
        ta.focus();
        const newPos = start + trimmed.length;
        ta.setSelectionRange(newPos, newPos);
      }, 0);
    } else {
      setHtml((prev) => prev + trimmed);
      setFieldPickerFor(null);
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  };

  const handleFieldPickerSelect = (placeholder: string) => {
    if (fieldPickerFor === "recipients") addRecipientPlaceholder(placeholder);
    else if (fieldPickerFor === "subject") insertIntoSubject(placeholder);
    else if (fieldPickerFor === "html") insertIntoHtml(placeholder);
    setFieldPickerFor(null);
  };

  const handleDepthAttributeFromPicker = (attrName: string) => {
    if (depthPickerFromFieldPicker === null) return;
    const { rootKey, context } = depthPickerFromFieldPicker;
    const placeholder = `{{${rootKey}.${attrName}}}`;
    if (context === "recipients") addRecipientPlaceholder(placeholder);
    else if (context === "subject") insertIntoSubject(placeholder);
    else if (context === "html") insertIntoHtml(placeholder);
    setDepthPickerFromFieldPicker(null);
    setFieldPickerFor(null);
  };

  const applyDepthAttributeForHtmlDrop = (attrName: string) => {
    if (depthModalForHtml === null) return;
    const { rootKey, insertStart, insertEnd } = depthModalForHtml;
    const placeholder = `{{${rootKey}.${attrName}}}`;
    setHtml(html.slice(0, insertStart) + placeholder + html.slice(insertEnd));
    setDepthModalForHtml(null);
    setTimeout(() => {
      textareaRef.current?.focus();
      const newPos = insertStart + placeholder.length;
      textareaRef.current?.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const removeRecipient = (index: number) => {
    const next = recipientsList.filter((_, i) => i !== index);
    setRecipientsStr(formatRecipients(next));
  };

  const applyDepthAttribute = (attrName: string) => {
    if (depthModalFor === null) return;
    const placeholder = recipientsList[depthModalFor];
    const rootKey = getPlaceholderRootKey(placeholder ?? "");
    if (!rootKey) return;
    const newPlaceholder = `{{${rootKey}.${attrName}}}`;
    const next = recipientsList.map((item, i) =>
      i === depthModalFor ? newPlaceholder : item
    );
    setRecipientsStr(formatRecipients(next));
    setDepthModalFor(null);
  };

  const handleRecipientsKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      if (recipientsInputValue.trim()) addRecipient(recipientsInputValue);
    }
  };

  const handleRecipientsBlur = () => {
    if (recipientsInputValue.trim()) addRecipient(recipientsInputValue);
  };

  const openHtmlEditor = () => {
    if (!html.trim()) {
      const greeting = intl.formatMessage({
        id: "brevo-template-sender.modal.defaultTemplateGreeting",
        defaultMessage: "Hello,",
      });
      const body = intl.formatMessage({
        id: "brevo-template-sender.modal.defaultTemplateBody",
        defaultMessage: "Content of your message...",
      });
      setHtml(getDefaultEmailTemplateHtml(greeting, body));
    }
    setHtmlEditorOpen(true);
  };

  const handleSave = async () => {
    const brevoId = brevoTemplateIdStr.trim()
      ? parseInt(brevoTemplateIdStr.trim(), 10)
      : undefined;

    const newErrors: typeof errors = {};
    if (templateMode === "html" && !subject.trim()) {
      newErrors.subject = intl.formatMessage({
        id: "brevo-template-sender.modal.subjectRequired",
        defaultMessage: "Subject is required.",
      });
    }
    if (
      templateMode === "brevo" &&
      (!Number.isFinite(brevoId) || (brevoId ?? 0) <= 0)
    ) {
      newErrors.brevoTemplateId = intl.formatMessage({
        id: "brevo-template-sender.modal.brevoTemplateIdRequired",
        defaultMessage: "A valid Brevo template ID is required.",
      });
    }
    if (recipientsList.length === 0) {
      newErrors.recipients = intl.formatMessage({
        id: "brevo-template-sender.modal.recipientsRequired",
        defaultMessage: "At least one recipient is required.",
      });
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    if (isDefaultTemplate && defaultTemplateCode) {
      setSavingDefault(true);
      try {
        const base = "/brevo-template-sender";
        const body = {
          code: defaultTemplateCode,
          name: "Send Email Default",
          subject: subject.trim() || "Message",
          html: templateMode === "html" ? html.trim() : "<p></p>",
          templateMode,
          brevoTemplateId:
            templateMode === "brevo" && Number.isFinite(brevoId)
              ? brevoId
              : undefined,
          recipients: recipientsStr.trim() || undefined,
        };
        await put(`${base}/default-template`, body);
        onSaved?.();
        onClose();
      } finally {
        setSavingDefault(false);
      }
      return;
    }
    onSave({
      id: trigger?.id ?? `${contentTypeUid}::create`,
      contentTypeUid,
      event: trigger?.event ?? "create",
      subject,
      html,
      sendToField: trigger?.sendToField,
      recipients: recipientsStr.trim() || undefined,
      templateMode,
      brevoTemplateId: Number.isFinite(brevoId) ? brevoId : undefined,
    });
  };

  return (
    <>
      <Modal.Root open onOpenChange={(open: boolean) => !open && onClose()}>
        <ModalContentLarge labelledBy="template-modal-title">
          <Modal.Header>
            <Typography id="template-modal-title" variant="beta" as="h2">
              {intl.formatMessage(
                {
                  id: "brevo-template-sender.modal.title",
                  defaultMessage: "Template: {name}",
                },
                { name: displayName }
              )}
            </Typography>
          </Modal.Header>
          <Modal.Body>
            {defaultTemplateLoading ? (
              <Flex padding={6} justifyContent="center">
                <Loader />
              </Flex>
            ) : (
              <>
                {saveError && (
                  <Alert
                    variant="danger"
                    marginBottom={4}
                    onClose={onDismissError}
                    closeLabel={intl.formatMessage({
                      id: "app.components.Button.close",
                      defaultMessage: "Close",
                    })}
                  >
                    {saveError}
                  </Alert>
                )}
                <Flex gap={2} marginBottom={4}>
                  <Button
                    variant={templateMode === "html" ? "default" : "tertiary"}
                    size="S"
                    onClick={() => setTemplateMode("html")}
                  >
                    {intl.formatMessage({
                      id: "brevo-template-sender.modal.modeHtml",
                      defaultMessage: "HTML",
                    })}
                  </Button>
                  <Button
                    variant={templateMode === "brevo" ? "default" : "tertiary"}
                    size="S"
                    onClick={() => setTemplateMode("brevo")}
                  >
                    {intl.formatMessage({
                      id: "brevo-template-sender.modal.modeBrevo",
                      defaultMessage: "Template Brevo",
                    })}
                  </Button>
                </Flex>
                {templateMode === "brevo" && (
                  <Box paddingBottom={4}>
                    <Field.Root
                      id="brevo-template-id"
                      error={errors.brevoTemplateId}
                      required
                    >
                      <Field.Label>
                        {intl.formatMessage({
                          id: "brevo-template-sender.modal.brevoTemplateId",
                          defaultMessage: "ID du template Brevo",
                        })}
                      </Field.Label>
                      <Field.Hint>
                        {intl.formatMessage({
                          id: "brevo-template-sender.modal.brevoTemplateIdHint",
                          defaultMessage:
                            "Saisissez l'ID du template créé dans Brevo (Campagnes → Templates).",
                        })}
                      </Field.Hint>
                      <TextInput
                        id="brevo-template-id"
                        type="number"
                        value={brevoTemplateIdStr}
                        onChange={(e: { target: { value: string } }) => {
                          setBrevoTemplateIdStr(e.target.value);
                          if (errors.brevoTemplateId)
                            setErrors((prev) => ({
                              ...prev,
                              brevoTemplateId: undefined,
                            }));
                        }}
                        placeholder="123"
                        size="M"
                      />
                      <Field.Error />
                    </Field.Root>
                  </Box>
                )}
                {templateMode === "html" && (
                  <Box paddingBottom={4}>
                    <Field.Root id="subject" error={errors.subject} required>
                      <Field.Label>
                        {intl.formatMessage({
                          id: "brevo-template-sender.modal.subject",
                          defaultMessage: "Subject",
                        })}
                      </Field.Label>
                      <Flex gap={2} alignItems="stretch">
                        <Box flex="1" minWidth={0}>
                          <TextInput
                            id="subject"
                            ref={subjectInputRef}
                            value={subject}
                            onChange={(e: { target: { value: string } }) => {
                              setSubject(e.target.value);
                              if (errors.subject)
                                setErrors((prev) => ({
                                  ...prev,
                                  subject: undefined,
                                }));
                            }}
                            placeholder="E.g. New message {{email}}"
                            size="M"
                          />
                        </Box>
                        <Button
                          type="button"
                          variant="tertiary"
                          size="M"
                          style={{ minHeight: 40 }}
                          onClick={() => setFieldPickerFor("subject")}
                          title={intl.formatMessage({
                            id: "brevo-template-sender.modal.recipientsDynamicTitle",
                            defaultMessage:
                              "Insert dynamic field from content type",
                          })}
                        >
                          {intl.formatMessage({
                            id: "brevo-template-sender.modal.recipientsDynamicButton",
                            defaultMessage: "{ }",
                          })}
                        </Button>
                      </Flex>
                      <Field.Error />
                    </Field.Root>
                  </Box>
                )}
                <Box paddingBottom={5}>
                  <Field.Root
                    id="template-recipients"
                    error={errors.recipients}
                    required
                    hint={intl.formatMessage({
                      id: "brevo-template-sender.modal.recipientsHint",
                      defaultMessage:
                        "Enter an address then click « Add » or press Enter. Addresses appear as tags below. Use the { } button for dynamic fields.",
                    })}
                  >
                    <Field.Label>
                      {intl.formatMessage({
                        id: "brevo-template-sender.modal.recipientsLabel",
                        defaultMessage: "Recipients",
                      })}
                    </Field.Label>
                    <Field.Hint />
                    <Flex gap={2} alignItems="stretch">
                      <Box flex="1" minWidth={0}>
                        <TextInput
                          id="template-recipients-input"
                          type="text"
                          value={recipientsInputValue}
                          onChange={(e: { target: { value: string } }) =>
                            setRecipientsInputValue(e.target.value)
                          }
                          onKeyDown={handleRecipientsKeyDown}
                          onBlur={handleRecipientsBlur}
                          placeholder="email@example.com"
                          size="M"
                        />
                      </Box>
                      <Button
                        type="button"
                        variant="tertiary"
                        size="M"
                        style={{ minHeight: 40 }}
                        onClick={() => setFieldPickerFor("recipients")}
                        title={intl.formatMessage({
                          id: "brevo-template-sender.modal.recipientsDynamicTitle",
                          defaultMessage:
                            "Insert dynamic field from content type",
                        })}
                      >
                        {intl.formatMessage({
                          id: "brevo-template-sender.modal.recipientsDynamicButton",
                          defaultMessage: "{ }",
                        })}
                      </Button>
                      <Button
                        type="button"
                        variant="tertiary"
                        size="M"
                        style={{ minHeight: 40 }}
                        onClick={() => addRecipient(recipientsInputValue)}
                      >
                        {intl.formatMessage({
                          id: "brevo-template-sender.modal.recipientsAdd",
                          defaultMessage: "Add",
                        })}
                      </Button>
                    </Flex>
                    {recipientsList.length > 0 && (
                      <RecipientsTagsRow>
                        {recipientsList.map((item, i) => {
                          const dynamic = isPlaceholder(item);
                          const relationPlaceholder =
                            dynamic && isRelationPlaceholder(item);
                          const B = dynamic ? BadgeDynamic : Badge;
                          return (
                            <B key={`${item}-${i}`}>
                              {item}
                              {relationPlaceholder && (
                                <RelationBadgeInTag
                                  type="button"
                                  onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    setDepthModalFor(i);
                                  }}
                                  title={intl.formatMessage({
                                    id: "brevo-template-sender.modal.relationDepthTitle",
                                    defaultMessage: "Choose a depth attribute",
                                  })}
                                >
                                  Relation
                                </RelationBadgeInTag>
                              )}
                              <BadgeRemove
                                type="button"
                                onClick={() => removeRecipient(i)}
                                aria-label={intl.formatMessage({
                                  id: "brevo-template-sender.modal.removeRecipient",
                                  defaultMessage: "Remove",
                                })}
                              >
                                ×
                              </BadgeRemove>
                            </B>
                          );
                        })}
                      </RecipientsTagsRow>
                    )}
                    <Field.Error />
                  </Field.Root>
                </Box>
                {templateMode === "html" && (
                  <PreviewOnlyLayout>
                    <PreviewHeader>
                      <span>
                        {intl.formatMessage({
                          id: "brevo-template-sender.modal.preview",
                          defaultMessage: "Preview",
                        })}
                      </span>
                      <Button
                        variant="tertiary"
                        size="S"
                        onClick={openHtmlEditor}
                      >
                        {intl.formatMessage({
                          id: "brevo-template-sender.modal.editHtmlTemplate",
                          defaultMessage: "Edit HTML Template",
                        })}
                      </Button>
                    </PreviewHeader>
                    <PreviewBody>
                      <PreviewFrame
                        title="Preview"
                        srcDoc={previewHtml}
                        sandbox="allow-same-origin"
                      />
                    </PreviewBody>
                  </PreviewOnlyLayout>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="tertiary" onClick={onClose}>
              {intl.formatMessage({
                id: "app.components.Button.cancel",
                defaultMessage: "Cancel",
              })}
            </Button>
            <Button
              onClick={handleSave}
              loading={savingDefault}
              disabled={defaultTemplateLoading}
            >
              {intl.formatMessage({
                id: "app.components.Button.save",
                defaultMessage: "Save",
              })}
            </Button>
          </Modal.Footer>
        </ModalContentLarge>
      </Modal.Root>

      {htmlEditorOpen && (
        <Modal.Root
          open
          onOpenChange={(open: boolean) => !open && setHtmlEditorOpen(false)}
        >
          <ModalContentHtmlEditor labelledBy="html-editor-modal-title">
            <Modal.Header>
              <Typography id="html-editor-modal-title" variant="beta" as="h2">
                {intl.formatMessage({
                  id: "brevo-template-sender.modal.editHtmlTemplateTitle",
                  defaultMessage: "Edit HTML template",
                })}
              </Typography>
            </Modal.Header>
            <Modal.Body>
              <GridLayoutHtmlEditor>
                <Column>
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    marginBottom={2}
                    wrap="wrap"
                    gap={2}
                  >
                    <Flex alignItems="center" gap={2}>
                      <ColumnLabel as="span">
                        {intl.formatMessage({
                          id: "brevo-template-sender.modal.html",
                          defaultMessage: "Message (HTML)",
                        })}
                      </ColumnLabel>

                      <Button
                        type="button"
                        variant="tertiary"
                        size="M"
                        style={{ minHeight: 32 }}
                        onClick={() => setFieldPickerFor("html")}
                        title={intl.formatMessage({
                          id: "brevo-template-sender.modal.recipientsDynamicTitle",
                          defaultMessage:
                            "Insert dynamic field from content type",
                        })}
                      >
                        {intl.formatMessage({
                          id: "brevo-template-sender.modal.recipientsDynamicButton",
                          defaultMessage: "{ }",
                        })}
                      </Button>
                    </Flex>
                    <Button
                      variant="tertiary"
                      size="S"
                      disabled={!openaiApiKeySet}
                      onClick={() => {
                        setAiError(null);
                        setAiPrompt("");
                        setAiModalOpen(true);
                      }}
                    >
                      {intl.formatMessage({
                        id: "brevo-template-sender.modal.generateWithAi",
                        defaultMessage: "Generate with AI",
                      })}
                    </Button>
                  </Flex>
                  <Textarea
                    ref={textareaRef}
                    value={html}
                    onChange={(e) => setHtml(e.target.value)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    placeholder="<p>Type HTML. Use { } to insert dynamic fields.</p>"
                  />
                </Column>
              </GridLayoutHtmlEditor>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="tertiary"
                onClick={() => setHtmlEditorOpen(false)}
              >
                {intl.formatMessage({
                  id: "app.components.Button.cancel",
                  defaultMessage: "Cancel",
                })}
              </Button>
              <Button onClick={() => setHtmlEditorOpen(false)}>
                {intl.formatMessage({
                  id: "brevo-template-sender.modal.closeEditor",
                  defaultMessage: "Close",
                })}
              </Button>
            </Modal.Footer>
          </ModalContentHtmlEditor>
        </Modal.Root>
      )}

      {aiModalOpen && (
        <Modal.Root
          open
          onOpenChange={(open: boolean) => !open && setAiModalOpen(false)}
        >
          <Modal.Content
            labelledBy="ai-generate-title"
            style={{ maxWidth: 520 }}
          >
            <Modal.Header>
              <Typography id="ai-generate-title" variant="beta" as="h2">
                {intl.formatMessage({
                  id: "brevo-template-sender.modal.generateWithAi",
                  defaultMessage: "Generate with AI",
                })}
              </Typography>
            </Modal.Header>
            <Modal.Body>
              {aiError && (
                <Alert
                  variant="danger"
                  marginBottom={3}
                  onClose={() => setAiError(null)}
                  closeLabel="Close"
                >
                  {aiError}
                </Alert>
              )}
              <Field.Root>
                <Field.Label>
                  {intl.formatMessage({
                    id: "brevo-template-sender.ai.promptLabel",
                    defaultMessage:
                      "Describe the email template you want (or how to improve the current one)",
                  })}
                </Field.Label>
                <TextInput
                  placeholder={intl.formatMessage({
                    id: "brevo-template-sender.ai.promptPlaceholder",
                    defaultMessage:
                      "e.g. Confirmation email with logo, greeting and {{firstname}}",
                  })}
                  value={aiPrompt}
                  onChange={(e: { target: { value: string } }) =>
                    setAiPrompt(e.target.value)
                  }
                  disabled={aiLoading}
                />
              </Field.Root>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="tertiary"
                onClick={() => setAiModalOpen(false)}
                disabled={aiLoading}
              >
                {intl.formatMessage({
                  id: "app.components.Button.cancel",
                  defaultMessage: "Cancel",
                })}
              </Button>
              <Button onClick={handleGenerateWithAi} loading={aiLoading}>
                {intl.formatMessage({
                  id: "brevo-template-sender.ai.generate",
                  defaultMessage: "Generate",
                })}
              </Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal.Root>
      )}

      {fieldPickerFor !== null && (
        <Modal.Root
          open
          onOpenChange={(open: boolean) => {
            if (!open) {
              setFieldPickerFor(null);
              setDepthPickerFromFieldPicker(null);
            }
          }}
        >
          <ModalContentFieldPicker labelledBy="field-picker-modal-title">
            <Modal.Header>
              <Typography id="field-picker-modal-title" variant="beta" as="h2">
                {depthPickerFromFieldPicker
                  ? intl.formatMessage(
                      {
                        id: "brevo-template-sender.modal.depthModalTitle",
                        defaultMessage:
                          "Choose depth attribute for {placeholder}",
                      },
                      {
                        placeholder: `{{${depthPickerFromFieldPicker.rootKey}}}`,
                      }
                    )
                  : intl.formatMessage({
                      id: "brevo-template-sender.modal.recipientsFieldPickerTitle",
                      defaultMessage: "Insert dynamic field",
                    })}
              </Typography>
            </Modal.Header>
            <Modal.Body>
              {depthPickerFromFieldPicker ? (
                <>
                  <Typography
                    variant="pi"
                    textColor="neutral600"
                    marginBottom={3}
                  >
                    {intl.formatMessage({
                      id: "brevo-template-sender.modal.depthModalHint",
                      defaultMessage:
                        "Click an attribute to use it (e.g. {{relation.id}}, {{relation.url}}).",
                    })}
                  </Typography>
                  {depthLoadingForPicker ? (
                    <Flex padding={6} justifyContent="center">
                      <Loader />
                    </Flex>
                  ) : (
                    <FieldPickerList>
                      {depthAttributesForPicker.map((attr) => {
                        const rootKey = depthPickerFromFieldPicker.rootKey;
                        const label = `{{${rootKey}.${attr.name}}}`;
                        return (
                          <Box key={attr.name} marginBottom={2}>
                            <FieldPickerItem
                              type="button"
                              onClick={() =>
                                handleDepthAttributeFromPicker(attr.name)
                              }
                            >
                              {label}
                            </FieldPickerItem>
                          </Box>
                        );
                      })}
                    </FieldPickerList>
                  )}
                </>
              ) : (
                <>
                  <Typography
                    variant="pi"
                    textColor="neutral600"
                    marginBottom={3}
                  >
                    {fieldPickerFor === "subject"
                      ? intl.formatMessage({
                          id: "brevo-template-sender.modal.subjectFieldPickerHint",
                          defaultMessage:
                            "Choose a field to insert into the subject line.",
                        })
                      : fieldPickerFor === "html"
                        ? intl.formatMessage({
                            id: "brevo-template-sender.modal.htmlFieldPickerHint",
                            defaultMessage:
                              "Choose a field to insert into the HTML content (e.g. {{firstname}}, {{relation.url}}).",
                          })
                        : intl.formatMessage({
                            id: "brevo-template-sender.modal.recipientsFieldPickerHint",
                            defaultMessage:
                              "Choose a field from the content type. Its value will be used as recipient at send time.",
                          })}
                  </Typography>
                  <FieldPickerList>
                    {fields.map((f) => {
                      const isRelation =
                        f.kind === "relation" ||
                        f.kind === "component" ||
                        f.kind === "media";
                      const Item =
                        isRelation || f.key === "logo_url"
                          ? FieldPickerItemRelation
                          : FieldPickerItem;
                      const onClick =
                        isRelation || f.key === "logo_url"
                          ? () =>
                              setDepthPickerFromFieldPicker({
                                rootKey: f.key,
                                context: fieldPickerFor,
                              })
                          : () => handleFieldPickerSelect(f.label);
                      return (
                        <Box key={f.key} marginBottom={2}>
                          <Item
                            type="button"
                            $isLogo={f.key === "logo_url"}
                            onClick={onClick}
                          >
                            {f.label}
                            {isRelation && (
                              <RelationLabel>Relation</RelationLabel>
                            )}
                          </Item>
                        </Box>
                      );
                    })}
                  </FieldPickerList>
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              {depthPickerFromFieldPicker ? (
                <Button
                  variant="tertiary"
                  onClick={() => setDepthPickerFromFieldPicker(null)}
                >
                  {intl.formatMessage({
                    id: "brevo-template-sender.modal.back",
                    defaultMessage: "Back",
                  })}
                </Button>
              ) : null}
              <Button
                variant="tertiary"
                onClick={() => {
                  setFieldPickerFor(null);
                  setDepthPickerFromFieldPicker(null);
                }}
              >
                {intl.formatMessage({
                  id: "app.components.Button.cancel",
                  defaultMessage: "Cancel",
                })}
              </Button>
            </Modal.Footer>
          </ModalContentFieldPicker>
        </Modal.Root>
      )}

      {depthModalFor !== null && (
        <Modal.Root
          open
          onOpenChange={(open: boolean) => !open && setDepthModalFor(null)}
        >
          <ModalContentFieldPicker labelledBy="depth-modal-title">
            <Modal.Header>
              <Typography id="depth-modal-title" variant="beta" as="h2">
                {intl.formatMessage(
                  {
                    id: "brevo-template-sender.modal.depthModalTitle",
                    defaultMessage: "Choose depth attribute for {placeholder}",
                  },
                  { placeholder: recipientsList[depthModalFor] ?? "" }
                )}
              </Typography>
            </Modal.Header>
            <Modal.Body>
              <Typography variant="pi" textColor="neutral600" marginBottom={3}>
                {intl.formatMessage({
                  id: "brevo-template-sender.modal.depthModalHint",
                  defaultMessage:
                    "Click an attribute to use it (e.g. {{relation.id}}, {{relation.url}}).",
                })}
              </Typography>
              {depthLoading ? (
                <Flex padding={6} justifyContent="center">
                  <Loader />
                </Flex>
              ) : (
                <FieldPickerList>
                  {depthAttributes.map((attr) => {
                    const rootKey = getPlaceholderRootKey(
                      recipientsList[depthModalFor!] ?? ""
                    );
                    const label = `{{${rootKey}.${attr.name}}}`;
                    return (
                      <Box key={attr.name} marginBottom={2}>
                        <FieldPickerItem
                          type="button"
                          onClick={() => applyDepthAttribute(attr.name)}
                        >
                          {label}
                        </FieldPickerItem>
                      </Box>
                    );
                  })}
                </FieldPickerList>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="tertiary" onClick={() => setDepthModalFor(null)}>
                {intl.formatMessage({
                  id: "app.components.Button.cancel",
                  defaultMessage: "Cancel",
                })}
              </Button>
            </Modal.Footer>
          </ModalContentFieldPicker>
        </Modal.Root>
      )}

      {depthModalForHtml !== null && (
        <Modal.Root
          open
          onOpenChange={(open: boolean) => !open && setDepthModalForHtml(null)}
        >
          <ModalContentFieldPicker labelledBy="depth-html-modal-title">
            <Modal.Header>
              <Typography id="depth-html-modal-title" variant="beta" as="h2">
                {intl.formatMessage(
                  {
                    id: "brevo-template-sender.modal.depthModalTitle",
                    defaultMessage: "Choose depth attribute for {placeholder}",
                  },
                  { placeholder: `{{${depthModalForHtml.rootKey}}}` }
                )}
              </Typography>
            </Modal.Header>
            <Modal.Body>
              <Typography variant="pi" textColor="neutral600" marginBottom={3}>
                {intl.formatMessage({
                  id: "brevo-template-sender.modal.depthModalHint",
                  defaultMessage:
                    "Click an attribute to use it (e.g. {{relation.id}}, {{relation.url}}).",
                })}
              </Typography>
              {depthLoadingForHtmlDrop ? (
                <Flex padding={6} justifyContent="center">
                  <Loader />
                </Flex>
              ) : (
                <FieldPickerList>
                  {depthAttributesForHtmlDrop.map((attr) => {
                    const label = `{{${depthModalForHtml.rootKey}.${attr.name}}}`;
                    return (
                      <Box key={attr.name} marginBottom={2}>
                        <FieldPickerItem
                          type="button"
                          onClick={() =>
                            applyDepthAttributeForHtmlDrop(attr.name)
                          }
                        >
                          {label}
                        </FieldPickerItem>
                      </Box>
                    );
                  })}
                </FieldPickerList>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="tertiary"
                onClick={() => setDepthModalForHtml(null)}
              >
                {intl.formatMessage({
                  id: "app.components.Button.cancel",
                  defaultMessage: "Cancel",
                })}
              </Button>
            </Modal.Footer>
          </ModalContentFieldPicker>
        </Modal.Root>
      )}
    </>
  );
}
