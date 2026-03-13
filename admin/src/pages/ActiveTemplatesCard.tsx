import { Box, Button, Flex, Typography } from "@strapi/design-system";
import { useIntl } from "react-intl";
import type { ContentTypeInfo } from "../types";
import { EVENTS, formatContentTypeUid } from "../types";

interface ActiveTemplatesCardProps {
  selectedContentTypes: ContentTypeInfo[];
  hasTrigger: (uid: string, event: string) => boolean;
  onManageContentTypes: () => void;
  onEditTemplate: (ct: ContentTypeInfo) => void;
}

export default function ActiveTemplatesCard({
  selectedContentTypes,
  hasTrigger,
  onManageContentTypes,
  onEditTemplate,
}: ActiveTemplatesCardProps) {
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
      <Flex
        justifyContent="space-between"
        alignItems="center"
        marginBottom={4}
        gap={3}
      >
        <Typography variant="delta" as="h2" style={{ marginBottom: 15 }}>
          {intl.formatMessage({
            id: "brevo-template-sender.config.activeTemplates",
            defaultMessage: "Active Content-Type templates",
          })}
        </Typography>
        <Button variant="secondary" size="S" onClick={onManageContentTypes}>
          {intl.formatMessage({
            id: "brevo-template-sender.config.manageContentTypes",
            defaultMessage: "Manage content types",
          })}
        </Button>
      </Flex>
      {selectedContentTypes.length === 0 ? (
        <Typography variant="pi" textColor="neutral600">
          {intl.formatMessage({
            id: "brevo-template-sender.config.noActiveTemplates",
            defaultMessage:
              "No content type selected. Click « Manage content types » to enable events and edit templates.",
          })}
        </Typography>
      ) : (
        <Flex direction="column" gap={3} style={{ width: "100%" }}>
          {selectedContentTypes.map((ct) => (
            <Box
              key={ct.uid}
              padding={3}
              background="neutral100"
              borderColor="neutral200"
              borderWidth="1px"
              borderStyle="solid"
              borderRadius="4px"
              style={{ width: "100%", minWidth: 0 }}
            >
              <Flex
                justifyContent="space-between"
                alignItems="center"
                wrap="wrap"
                style={{ width: "100%", gap: 4 }}
              >
                <Box>
                  <Typography fontWeight="semiBold">
                    {ct.displayName}
                  </Typography>
                  <Typography
                    variant="pi"
                    textColor="neutral600"
                    marginLeft={2}
                  >
                    {formatContentTypeUid(ct.uid)}
                  </Typography>
                </Box>
                <Flex gap={2} alignItems="center" wrap="wrap">
                  <Flex gap={1} wrap="wrap">
                    {EVENTS.filter((e) => hasTrigger(ct.uid, e.value)).map(
                      (e) => (
                        <Box
                          key={e.value}
                          paddingLeft={2}
                          paddingRight={2}
                          paddingTop={1}
                          paddingBottom={1}
                          background="primary100"
                          borderRadius="4px"
                        >
                          <Typography
                            variant="pi"
                            textColor="primary700"
                            fontWeight="bold"
                          >
                            {intl.formatMessage({
                              id: `brevo-template-sender.event.${e.labelKey}`,
                              defaultMessage: e.value,
                            })}
                          </Typography>
                        </Box>
                      )
                    )}
                  </Flex>
                  <Button
                    variant="tertiary"
                    size="S"
                    onClick={() => onEditTemplate(ct)}
                  >
                    {intl.formatMessage({
                      id: "brevo-template-sender.config.editTemplate",
                      defaultMessage: "Edit Template",
                    })}
                  </Button>
                </Flex>
              </Flex>
            </Box>
          ))}
        </Flex>
      )}
    </Box>
  );
}
