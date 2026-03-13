import {
  Alert,
  Box,
  Button,
  Field,
  Flex,
  TextInput,
  Typography,
} from "@strapi/design-system";
import { useIntl } from "react-intl";
import type { BrevoSettingsState } from "../types";

interface ConfigCardProps {
  settings: BrevoSettingsState;
  setSettings: React.Dispatch<React.SetStateAction<BrevoSettingsState>>;
  saving: boolean;
  onSave: () => void;
  message: { type: "success" | "error"; text: string } | null;
  onDismissMessage: () => void;
}

export default function ConfigCard({
  settings,
  setSettings,
  saving,
  onSave,
  message,
  onDismissMessage,
}: ConfigCardProps) {
  const intl = useIntl();

  return (
    <Box
      padding={8}
      background="neutral0"
      borderColor="neutral200"
      borderWidth="1px"
      borderStyle="solid"
      borderRadius="8px"
      shadow="tableShadow"
      height="100%"
    >
      <Typography variant="delta" as="h2" style={{ marginBottom: 15 }}>
        {intl.formatMessage({
          id: "brevo-template-sender.config.configTitle",
          defaultMessage: "Config",
        })}
      </Typography>
      <Typography variant="epsilon" textColor="neutral600">
        {intl.formatMessage({
          id: "brevo-template-sender.settings.description",
          defaultMessage:
            "Enter the information required to send emails via Brevo. The API key is in your Brevo account (Settings → API Keys).",
        })}
      </Typography>
      {message && (
        <Alert
          marginBottom={4}
          variant={message.type === "error" ? "danger" : "success"}
          onClose={onDismissMessage}
          closeLabel={intl.formatMessage({
            id: "app.components.Button.close",
            defaultMessage: "Close",
          })}
        >
          {message.text}
        </Alert>
      )}
      <Flex
        direction="column"
        gap={4}
        marginBottom={6}
        alignItems="flex-start"
        marginTop={4}
      >
        <Field.Root id="brevo-settings-apiKey" style={{ width: "100%" }}>
          <Field.Label>
            {intl.formatMessage({
              id: "brevo-template-sender.settings.apiKey",
              defaultMessage: "Brevo API key",
            })}
          </Field.Label>
          <Flex
            direction="row"
            gap={4}
            alignItems="flex-start"
            wrap="wrap"
            marginTop={2}
          >
            <Box
              style={{ minWidth: 200, maxWidth: 400, flex: "1 1 200px" }}
            >
              <TextInput
                id="brevo-settings-apiKey"
                type="password"
                value={settings.apiKey}
                onChange={(e: { target: { value: string } }) =>
                  setSettings((s) => ({ ...s, apiKey: e.target.value }))
                }
                placeholder={
                  settings.apiKeySet
                    ? intl.formatMessage({
                        id: "brevo-template-sender.settings.apiKeyPlaceholder",
                        defaultMessage: "Leave empty to keep current key",
                      })
                    : intl.formatMessage({
                        id: "brevo-template-sender.settings.apiKeyPlaceholderNew",
                        defaultMessage: "xkeysib-...",
                      })
                }
                size="M"
              />
              {settings.apiKey && !settings.apiKey.startsWith('xkeysib-') && (
                <Box paddingTop={1}>
                  <Typography variant="pi" textColor="warning600" fontWeight="bold">
                    {intl.formatMessage({
                      id: "brevo-template-sender.settings.apiKeyInvalidFormat",
                      defaultMessage: "⚠ This doesn't look like a Brevo API key (should start with xkeysib-). Make sure you're not using an SMTP key.",
                    })}
                  </Typography>
                </Box>
              )}
              {settings.apiKeySet && !settings.apiKey && (
                <Box paddingTop={1}>
                  <Typography
                    variant="pi"
                    textColor="success600"
                    fontWeight="bold"
                  >
                    {intl.formatMessage({
                      id: "brevo-template-sender.settings.apiKeySet",
                      defaultMessage: "An API key is already configured.",
                    })}
                  </Typography>
                </Box>
              )}
            </Box>
            <Box style={{ flex: "1 1 240px", minWidth: 0 }}>
              <Typography variant="pi" textColor="neutral600">
                {intl.formatMessage({
                  id: "brevo-template-sender.settings.apiKeyHint",
                  defaultMessage:
                    "To find or generate an API key, go to your Brevo account: Settings → SMTP & API → API keys.",
                })}{" "}
                <a
                  href="https://help.brevo.com/hc/articles/209467485"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "var(--strapi-colors-primary600)",
                    textDecoration: "underline",
                  }}
                >
                  {intl.formatMessage({
                    id: "brevo-template-sender.settings.apiKeyHintLink",
                    defaultMessage: "Documentation",
                  })}
                </a>
              </Typography>
            </Box>
          </Flex>
        </Field.Root>
        <Field.Root id="brevo-settings-senderEmail" style={{ width: "100%" }}>
          <Field.Label>
            {intl.formatMessage({
              id: "brevo-template-sender.settings.senderEmail",
              defaultMessage: "Sender email",
            })}
          </Field.Label>
          <Flex
            direction="row"
            gap={4}
            alignItems="flex-start"
            wrap="wrap"
            marginTop={2}
          >
            <Box
              style={{ minWidth: 200, maxWidth: 400, flex: "1 1 200px" }}
            >
              <TextInput
                id="brevo-settings-senderEmail"
                type="email"
                value={settings.senderEmail}
                onChange={(e: { target: { value: string } }) =>
                  setSettings((s) => ({
                    ...s,
                    senderEmail: e.target.value,
                  }))
                }
                placeholder="no-reply@yourdomain.com"
                size="M"
              />
            </Box>
            <Box style={{ flex: "1 1 240px", minWidth: 0 }}>
              <Typography variant="pi" textColor="neutral600">
                {intl.formatMessage({
                  id: "brevo-template-sender.settings.senderEmailHint",
                  defaultMessage:
                    "Remember to authenticate your sender domain in Brevo for better deliverability (SPF, DKIM).",
                })}{" "}
                <a
                  href="https://help.brevo.com/hc/articles/14925263522578"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "var(--strapi-colors-primary600)",
                    textDecoration: "underline",
                  }}
                >
                  {intl.formatMessage({
                    id: "brevo-template-sender.settings.senderEmailHintLink",
                    defaultMessage: "Documentation",
                  })}
                </a>
              </Typography>
            </Box>
          </Flex>
        </Field.Root>
        <Field.Root
          id="brevo-settings-senderName"
          style={{ width: "100%", maxWidth: "400px" }}
        >
          <Field.Label>
            {intl.formatMessage({
              id: "brevo-template-sender.settings.senderName",
              defaultMessage: "Sender name (optional)",
            })}
          </Field.Label>
          <TextInput
            id="brevo-settings-senderName"
            value={settings.senderName}
            onChange={(e: { target: { value: string } }) =>
              setSettings((s) => ({ ...s, senderName: e.target.value }))
            }
            placeholder="John Doe"
            size="M"
          />
        </Field.Root>
        <Field.Root
          id="brevo-settings-openaiApiKey"
          style={{ width: "100%" }}
        >
          <Field.Label>
            {intl.formatMessage({
              id: "brevo-template-sender.settings.openaiApiKey",
              defaultMessage: "OpenAI API key (optional)",
            })}
          </Field.Label>
          <Flex
            direction="row"
            gap={4}
            alignItems="flex-start"
            wrap="wrap"
            marginTop={2}
          >
            <Box
              style={{ minWidth: 200, maxWidth: 400, flex: "1 1 200px" }}
            >
              <TextInput
                id="brevo-settings-openaiApiKey"
                type="password"
                value={settings.openaiApiKey}
                onChange={(e: { target: { value: string } }) =>
                  setSettings((s) => ({
                    ...s,
                    openaiApiKey: e.target.value,
                  }))
                }
                placeholder={
                  settings.openaiApiKeySet
                    ? intl.formatMessage({
                        id: "brevo-template-sender.settings.apiKeyPlaceholder",
                        defaultMessage: "Leave empty to keep current key",
                      })
                    : "sk-..."
                }
                size="M"
              />
              {settings.openaiApiKeySet && (
                <Box paddingTop={1}>
                  <Typography
                    variant="pi"
                    textColor="success600"
                    fontWeight="bold"
                  >
                    {intl.formatMessage({
                      id: "brevo-template-sender.settings.openaiApiKeySet",
                      defaultMessage: "An OpenAI key is configured.",
                    })}
                  </Typography>
                </Box>
              )}
            </Box>
            <Box style={{ flex: "1 1 240px", minWidth: 0 }}>
              <Typography variant="pi" textColor="neutral600">
                {intl.formatMessage({
                  id: "brevo-template-sender.settings.openaiApiKeyHint",
                  defaultMessage:
                    "Enables « Generate with AI » in the template editor. Create a key at platform.openai.com.",
                })}
              </Typography>
            </Box>
          </Flex>
        </Field.Root>
      </Flex>
      <Button onClick={onSave} loading={saving} size="L">
        {intl.formatMessage({
          id: "brevo-template-sender.settings.save",
          defaultMessage: "Save settings",
        })}
      </Button>
    </Box>
  );
}
