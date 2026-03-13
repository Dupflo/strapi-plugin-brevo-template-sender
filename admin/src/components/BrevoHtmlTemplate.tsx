import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Field } from '@strapi/design-system';
import { useIntl } from 'react-intl';
import { useFetchClient } from '@strapi/strapi/admin';
import styled from 'styled-components';

const PREVIEW_DEBOUNCE_MS = 300;

interface BrevoHtmlTemplateProps {
  label: string;
  hint: string;
  name: string;
  disabled: boolean;
  error: string;
  onChange: (event: { target: { name: string; value: string; type: string } }) => void;
  placeholder: string;
  required: boolean;
  value: string;
}

const PLACEHOLDER_REGEX = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

const sampleValues: Record<string, string> = {
  logo_url: '',
  email: 'email@exemple.com',
  subject: 'Sujet du message',
  message: 'Contenu du message...',
  firstname: 'Jean',
  lastname: 'Dupont',
  company: 'Ma Société',
  phone: '06 12 34 56 78',
  mailto: 'contact@exemple.com',
  customer_email_url: 'https://exemple.com/ma-page',
  type: 'Type de demande',
  requestId: 'abc123',
  unit: 'Box 5m²',
  duration: '12 mois',
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const SplitView = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  min-height: 360px;
  border-radius: 4px;
  border: 1px solid var(--strapi-colors-neutral200);
  overflow: hidden;
`;

const EditorPanel = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-right: 1px solid var(--strapi-colors-neutral200);
`;

const PreviewPanel = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--strapi-colors-neutral100);
`;

const PanelLabel = styled.div`
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--strapi-colors-neutral600);
  background: var(--strapi-colors-neutral100);
  border-bottom: 1px solid var(--strapi-colors-neutral200);
`;

const Textarea = styled.textarea`
  flex: 1;
  min-height: 280px;
  font-family: monospace;
  font-size: 13px;
  padding: 12px;
  border: none;
  resize: none;
  outline: none;
  background: var(--strapi-colors-neutral0);
  color: var(--strapi-colors-neutral800);
  &::placeholder {
    color: var(--strapi-colors-neutral500);
  }
`;

const PreviewFrame = styled.iframe`
  flex: 1;
  min-height: 280px;
  border: none;
  background: white;
  width: 100%;
`;

function replacePlaceholders(html: string, params: Record<string, string>): string {
  if (!html || typeof html !== 'string') return html;
  return html.replace(PLACEHOLDER_REGEX, (_, key) => params[key] ?? `{{${key}}}`);
}

function wrapInHtmlDocument(html: string): string {
  const trimmed = html.trim();
  if (trimmed.toLowerCase().startsWith('<!doctype') || trimmed.toLowerCase().startsWith('<html')) {
    return html;
  }
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0; padding:12px; font-family: sans-serif;">
${html}
</body>
</html>`;
}

const BrevoHtmlTemplate = ({
  value,
  onChange,
  name,
  label,
  hint,
  placeholder,
  disabled,
  error,
  required,
}: BrevoHtmlTemplateProps) => {
  const intl = useIntl();
  const { get } = useFetchClient();
  const [logoUrl, setLogoUrl] = useState('');
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const apply = (res: { data?: { logoUrl?: string } }) => {
      if (!cancelled && res?.data?.logoUrl) {
        setLogoUrl(res.data.logoUrl);
      }
    };
    get('/brevo-template-sender/settings').then(apply).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [get]);

  const previewParams = useMemo(() => ({
    ...sampleValues,
    logo_url: logoUrl || 'https://via.placeholder.com/120x40?text=Logo',
  }), [logoUrl]);

  const [debouncedValue, setDebouncedValue] = useState(value ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const raw = value ?? '';
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedValue(raw);
      debounceRef.current = null;
    }, PREVIEW_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  const previewHtml = useMemo(() => {
    const withValues = replacePlaceholders(debouncedValue, previewParams);
    return wrapInHtmlDocument(withValues);
  }, [debouncedValue, previewParams]);

  useEffect(() => {
    setPreviewKey((k) => k + 1);
  }, [previewHtml]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange({
        target: { name, value: e.target.value, type: 'text' },
      });
    },
    [name, onChange]
  );

  return (
    <Field.Root error={error} hint={hint}>
      <Field.Label>{label}</Field.Label>
      <Wrapper>
        <SplitView>
          <EditorPanel>
            <PanelLabel>
              {intl.formatMessage({
                id: 'brevo-template-sender.editor-label',
                defaultMessage: 'HTML code',
              })}
            </PanelLabel>
            <Textarea
              name={name}
              id={name}
              disabled={disabled}
              required={required}
              placeholder={placeholder}
              value={value ?? ''}
              onChange={handleChange}
              spellCheck={false}
            />
          </EditorPanel>
          <PreviewPanel>
            <PanelLabel>
              {intl.formatMessage({
                id: 'brevo-template-sender.preview-label',
                defaultMessage: 'Aperçu de l’e-mail',
              })}
            </PanelLabel>
            <PreviewFrame
              key={previewKey}
              title={intl.formatMessage({
                id: 'brevo-template-sender.preview-iframe-title',
                defaultMessage: 'Template preview',
              })}
              srcDoc={previewHtml}
              sandbox="allow-same-origin"
            />
          </PreviewPanel>
        </SplitView>
      </Wrapper>
      <Field.Hint>
        {intl.formatMessage({
          id: 'brevo-template-sender.placeholders-hint',
          defaultMessage:
            'Use {{field_name}} in the HTML and subject for variables (e.g. {{email}}, {{subject}}, {{logo_url}} for the logo).',
        })}
      </Field.Hint>
      {error && <Field.Error />}
    </Field.Root>
  );
};

export default BrevoHtmlTemplate;
