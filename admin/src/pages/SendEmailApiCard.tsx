import { Box, Button, Flex, Modal, Typography } from "@strapi/design-system";
import { useState } from "react";
import { useIntl } from "react-intl";

interface SendEmailApiCardProps {
  onConfigureTemplate: () => void;
}

export default function SendEmailApiCard({
  onConfigureTemplate,
}: SendEmailApiCardProps) {
  const intl = useIntl();
  const [docModalOpen, setDocModalOpen] = useState(false);

  return (
    <>
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
        <Flex
          justifyContent="space-between"
          alignItems="center"
          marginBottom={4}
          gap={3}
          wrap="wrap"
        >
          <Typography variant="delta" as="h2" style={{ marginBottom: 0 }}>
            {intl.formatMessage({
              id: "brevo-template-sender.config.sendEmailApi",
              defaultMessage: "Send Email API",
            })}
          </Typography>
          <Flex gap={2} alignItems="center" wrap="wrap">
            <Typography
              variant="pi"
              textColor="neutral700"
              style={{ fontFamily: "monospace", fontSize: 12 }}
            >
              POST /api/brevo-template-sender/send
            </Typography>
            <Button variant="secondary" size="S" onClick={onConfigureTemplate}>
              {intl.formatMessage({
                id: "brevo-template-sender.sendEmail.configureTemplate",
                defaultMessage: "Configure template",
              })}
            </Button>
            <Button
              variant="tertiary"
              size="S"
              onClick={() => setDocModalOpen(true)}
            >
              {intl.formatMessage({
                id: "brevo-template-sender.sendEmail.documentation",
                defaultMessage: "Documentation",
              })}
            </Button>
          </Flex>
        </Flex>
        <Typography variant="epsilon" textColor="neutral600">
          {intl.formatMessage({
            id: "brevo-template-sender.sendEmail.description",
            defaultMessage:
              "API that can be called at any time to send an email with the default template. Recipients are configured in the template (above). Dynamic values (params) are set by the caller.",
          })}
        </Typography>
      </Box>

      <Modal.Root
        open={docModalOpen}
        onOpenChange={(open: boolean) => setDocModalOpen(open)}
      >
        <Modal.Content
          labelledBy="send-email-api-doc-title"
          style={{ maxWidth: 560 }}
        >
          <Modal.Header>
            <Typography id="send-email-api-doc-title" variant="beta" as="h2">
              {intl.formatMessage({
                id: "brevo-template-sender.sendEmail.docModalTitle",
                defaultMessage: "Send Email API — Documentation",
              })}
            </Typography>
          </Modal.Header>
          <Modal.Body>
            <Flex
              direction="column"
              gap={6}
              alignItems="flex-start"
              style={{ width: "100%" }}
            >
              <Typography
                variant="pi"
                textColor="neutral700"
                lineHeight={1.6}
                style={{ textAlign: "left", width: "100%" }}
              >
                {intl.formatMessage({
                  id: "brevo-template-sender.sendEmail.docModalIntro",
                  defaultMessage:
                    "Call this endpoint to send an email using the default template (configured above).",
                })}
              </Typography>

              <Box paddingTop={2} paddingBottom={2} style={{ width: "100%" }}>
                <Typography
                  variant="epsilon"
                  fontWeight="bold"
                  textColor="neutral800"
                  marginBottom={2}
                >
                  {intl.formatMessage({
                    id: "brevo-template-sender.sendEmail.docModalEndpoint",
                    defaultMessage: "Endpoint",
                  })}
                </Typography>
                <Flex
                  gap={2}
                  alignItems="center"
                  wrap="wrap"
                  justifyContent="flex-start"
                >
                  <Box
                    paddingLeft={2}
                    paddingRight={2}
                    paddingTop={1}
                    paddingBottom={1}
                    background="primary100"
                    borderRadius="4px"
                  >
                    <Typography
                      variant="pi"
                      fontWeight="bold"
                      textColor="primary700"
                      style={{ fontSize: 11 }}
                    >
                      POST
                    </Typography>
                  </Box>
                  <Typography
                    variant="pi"
                    textColor="neutral800"
                    style={{
                      fontFamily: "monospace",
                      fontSize: 13,
                      wordBreak: "break-all",
                    }}
                  >
                    /api/brevo-template-sender/send
                  </Typography>
                </Flex>
              </Box>

              <Box paddingTop={2} paddingBottom={2} style={{ width: "100%" }}>
                <Typography
                  variant="epsilon"
                  fontWeight="bold"
                  textColor="neutral800"
                  marginBottom={2}
                >
                  {intl.formatMessage({
                    id: "brevo-template-sender.sendEmail.docModalBody",
                    defaultMessage: "Request body (JSON)",
                  })}
                </Typography>
                <Flex direction="column" gap={2} alignItems="flex-start">
                  <Box>
                    <Typography
                      variant="pi"
                      fontWeight="semiBold"
                      textColor="neutral800"
                      style={{ fontFamily: "monospace", fontSize: 12 }}
                    >
                      {"to "}
                    </Typography>
                    <Typography
                      variant="pi"
                      textColor="neutral500"
                      style={{ fontSize: 11 }}
                    >
                      {intl.formatMessage({
                        id: "brevo-template-sender.sendEmail.docModalBodyToOptional",
                        defaultMessage: "(optional)",
                      })}
                    </Typography>
                    <Typography
                      variant="pi"
                      textColor="neutral600"
                      lineHeight={1.5}
                      marginLeft={2}
                    >
                      {intl.formatMessage({
                        id: "brevo-template-sender.sendEmail.docModalBodyTo",
                        defaultMessage:
                          " — Override recipient email. If omitted, recipients configured in the template are used.",
                      })}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="pi"
                      fontWeight="semiBold"
                      textColor="neutral800"
                      style={{ fontFamily: "monospace", fontSize: 12 }}
                    >
                      params
                    </Typography>
                    <Typography
                      variant="pi"
                      textColor="neutral600"
                      lineHeight={1.5}
                      marginLeft={2}
                    >
                      {intl.formatMessage({
                        id: "brevo-template-sender.sendEmail.docModalBodyParams",
                        defaultMessage:
                          "Object with dynamic values for the template placeholders (e.g. {{firstname}}, {{message}}). Keys must match the placeholders used in the template.",
                      })}
                    </Typography>
                  </Box>
                </Flex>
              </Box>

              <Box
                paddingTop={2}
                paddingBottom={2}
                style={{ width: "100%", minWidth: 0 }}
              >
                <Typography
                  variant="epsilon"
                  fontWeight="bold"
                  textColor="neutral800"
                  marginBottom={2}
                >
                  {intl.formatMessage({
                    id: "brevo-template-sender.sendEmail.docModalExample",
                    defaultMessage: "Example",
                  })}
                </Typography>
                <Box
                  padding={4}
                  background="neutral100"
                  borderRadius="4px"
                  borderWidth="1px"
                  borderColor="neutral200"
                  borderStyle="solid"
                  style={{
                    width: "100%",
                    minWidth: 0,
                    boxSizing: "border-box",
                  }}
                >
                  <Typography
                    variant="pi"
                    textColor="neutral800"
                    as="pre"
                    style={{
                      fontFamily: "monospace",
                      fontSize: 12,
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                      margin: 0,
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    {`// Recipients configured in the template (admin)
{
  "params": {
    "firstname": "John",
    "message": "Hello!"
  }
}

// Override recipient (optional)
{
  "to": "user@example.com",
  "params": {
    "firstname": "John",
    "message": "Hello!"
  }
}`}
                  </Typography>
                </Box>
              </Box>
            </Flex>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => setDocModalOpen(false)}>
              {intl.formatMessage({
                id: "app.components.Button.close",
                defaultMessage: "Close",
              })}
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
    </>
  );
}
