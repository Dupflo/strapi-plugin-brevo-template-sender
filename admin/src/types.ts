export interface AttributeMeta {
  name: string;
  type: string;
  kind: "scalar" | "relation" | "media" | "component" | "dynamiczone";
  target?: string;
}

export interface ContentTypeInfo {
  uid: string;
  displayName: string;
  attributes: AttributeMeta[];
}

export interface TriggerConfig {
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

export interface BrevoSettingsState {
  apiKey: string;
  apiKeySet: boolean;
  senderEmail: string;
  senderName: string;
  sendEmailTemplateCode: string;
  openaiApiKey: string;
  openaiApiKeySet: boolean;
}

export function makeId(uid: string, event: string): string {
  return `${uid}::${event}`;
}

export function formatContentTypeUid(uid: string): string {
  return uid.replace(/^api::/, "");
}

export const EVENTS: {
  value: TriggerConfig["event"];
  labelKey: string;
}[] = [
  { value: "create", labelKey: "create" },
  { value: "update", labelKey: "update" },
  { value: "delete", labelKey: "delete" },
  { value: "publish", labelKey: "publish" },
  { value: "unpublish", labelKey: "unpublish" },
];

/** Attributs proposés pour le template par défaut Send Email API. */
export const DEFAULT_SEND_EMAIL_ATTRIBUTES: AttributeMeta[] = [
  { name: "firstname", type: "string", kind: "scalar" },
  { name: "lastname", type: "string", kind: "scalar" },
  { name: "email", type: "string", kind: "scalar" },
  { name: "message", type: "string", kind: "scalar" },
];
