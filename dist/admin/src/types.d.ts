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
export declare function makeId(uid: string, event: string): string;
export declare function formatContentTypeUid(uid: string): string;
export declare const EVENTS: {
    value: TriggerConfig["event"];
    labelKey: string;
}[];
/** Attributs proposés pour le template par défaut Send Email API. */
export declare const DEFAULT_SEND_EMAIL_ATTRIBUTES: AttributeMeta[];
