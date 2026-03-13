import type { ContentTypeInfo } from "../types";
interface ActiveTemplatesCardProps {
    selectedContentTypes: ContentTypeInfo[];
    hasTrigger: (uid: string, event: string) => boolean;
    onManageContentTypes: () => void;
    onEditTemplate: (ct: ContentTypeInfo) => void;
}
export default function ActiveTemplatesCard({ selectedContentTypes, hasTrigger, onManageContentTypes, onEditTemplate, }: ActiveTemplatesCardProps): import("react/jsx-runtime").JSX.Element;
export {};
