interface BrevoHtmlTemplateProps {
    label: string;
    hint: string;
    name: string;
    disabled: boolean;
    error: string;
    onChange: (event: {
        target: {
            name: string;
            value: string;
            type: string;
        };
    }) => void;
    placeholder: string;
    required: boolean;
    value: string;
}
declare const BrevoHtmlTemplate: ({ value, onChange, name, label, hint, placeholder, disabled, error, required, }: BrevoHtmlTemplateProps) => import("react/jsx-runtime").JSX.Element;
export default BrevoHtmlTemplate;
