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
export default function TemplateModal({ contentTypeUid, attributes, displayName, trigger, saveError, openaiApiKeySet, defaultTemplateCode, onClose, onDismissError, onSave, onSaved, }: TemplateModalProps): import("react/jsx-runtime").JSX.Element;
export {};
