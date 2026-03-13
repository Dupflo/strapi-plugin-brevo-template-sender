import {
  Box,
  Button,
  Modal,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Typography,
  Checkbox,
} from "@strapi/design-system";
import { useIntl } from "react-intl";
import type { ContentTypeInfo, TriggerConfig } from "../types";
import { EVENTS, formatContentTypeUid } from "../types";

interface ManageContentTypesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentTypes: ContentTypeInfo[];
  hasTrigger: (uid: string, event: string) => boolean;
  toggleTrigger: (
    contentTypeUid: string,
    event: TriggerConfig["event"],
    checked: boolean
  ) => void;
  getTemplateForContentType: (uid: string) => TriggerConfig | null;
  onEditTemplate: (ct: ContentTypeInfo) => void;
}

export default function ManageContentTypesModal({
  open,
  onOpenChange,
  contentTypes,
  hasTrigger,
  toggleTrigger,
  getTemplateForContentType,
  onEditTemplate,
}: ManageContentTypesModalProps) {
  const intl = useIntl();

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content
        labelledBy="manage-content-types-title"
        style={{ maxWidth: "90vw", width: 960 }}
      >
        <Modal.Header>
          <Typography
            id="manage-content-types-title"
            variant="beta"
            as="h2"
            style={{ marginBottom: 15 }}
          >
            {intl.formatMessage({
              id: "brevo-template-sender.config.manageContentTypesTitle",
              defaultMessage: "Manage content types & events",
            })}
          </Typography>
        </Modal.Header>
        <Modal.Body>
          <Table>
            <Thead>
              <Tr>
                <Th>
                  {intl.formatMessage({
                    id: "brevo-template-sender.config.contentType",
                    defaultMessage: "Content Type",
                  })}
                </Th>
                {EVENTS.map((e) => (
                  <Th key={e.value}>
                    {intl.formatMessage({
                      id: `brevo-template-sender.event.${e.labelKey}`,
                      defaultMessage: e.value,
                    })}
                  </Th>
                ))}
                <Th>
                  {intl.formatMessage({
                    id: "brevo-template-sender.config.editTemplate",
                    defaultMessage: "Edit Template",
                  })}
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {contentTypes.map((ct) => (
                <Tr key={ct.uid}>
                  <Td>
                    <Box paddingTop={1} paddingBottom={1}>
                      <Typography fontWeight="semiBold">
                        {ct.displayName}
                      </Typography>
                    </Box>
                    <Box paddingTop={2}>
                      <Typography variant="pi" textColor="neutral600">
                        {formatContentTypeUid(ct.uid)}
                      </Typography>
                    </Box>
                  </Td>
                  {EVENTS.map((e) => (
                    <Td key={e.value}>
                      <Checkbox
                        checked={hasTrigger(ct.uid, e.value)}
                        onCheckedChange={(
                          checked: boolean | "indeterminate"
                        ) => toggleTrigger(ct.uid, e.value, checked === true)}
                      />
                    </Td>
                  ))}
                  <Td>
                    <Button
                      variant="tertiary"
                      size="S"
                      disabled={!getTemplateForContentType(ct.uid)}
                      onClick={() => onEditTemplate(ct)}
                    >
                      {intl.formatMessage({
                        id: "brevo-template-sender.config.editTemplate",
                        defaultMessage: "Edit Template",
                      })}
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="tertiary"
            onClick={() => onOpenChange(false)}
          >
            {intl.formatMessage({
              id: "app.components.Button.cancel",
              defaultMessage: "Cancel",
            })}
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            {intl.formatMessage({
              id: "brevo-template-sender.config.closeManage",
              defaultMessage: "Close",
            })}
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
