import type { ContentTypeInfo, TriggerConfig } from "../types";
interface ManageContentTypesModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contentTypes: ContentTypeInfo[];
    hasTrigger: (uid: string, event: string) => boolean;
    toggleTrigger: (contentTypeUid: string, event: TriggerConfig["event"], checked: boolean) => void;
    getTemplateForContentType: (uid: string) => TriggerConfig | null;
    onEditTemplate: (ct: ContentTypeInfo) => void;
}
export default function ManageContentTypesModal({ open, onOpenChange, contentTypes, hasTrigger, toggleTrigger, getTemplateForContentType, onEditTemplate, }: ManageContentTypesModalProps): import("react/jsx-runtime").JSX.Element;
export {};
