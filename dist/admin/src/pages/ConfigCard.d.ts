/// <reference types="react" />
import type { BrevoSettingsState } from "../types";
interface ConfigCardProps {
    settings: BrevoSettingsState;
    setSettings: React.Dispatch<React.SetStateAction<BrevoSettingsState>>;
    saving: boolean;
    onSave: () => void;
    message: {
        type: "success" | "error";
        text: string;
    } | null;
    onDismissMessage: () => void;
}
export default function ConfigCard({ settings, setSettings, saving, onSave, message, onDismissMessage, }: ConfigCardProps): import("react/jsx-runtime").JSX.Element;
export {};
