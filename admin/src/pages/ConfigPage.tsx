import { Box, Flex, Loader, Typography } from "@strapi/design-system";
import { useFetchClient } from "@strapi/strapi/admin";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import bmcButtonImg from "../assets/default-yellow.png";
import { BrevoLogo } from "../components/BrevoLogo";
import type {
  AttributeMeta,
  BrevoSettingsState,
  ContentTypeInfo,
  TriggerConfig,
} from "../types";
import { DEFAULT_SEND_EMAIL_ATTRIBUTES, makeId } from "../types";
import ActiveTemplatesCard from "./ActiveTemplatesCard";
import ConfigCard from "./ConfigCard";
import ManageContentTypesModal from "./ManageContentTypesModal";
import SendEmailApiCard from "./SendEmailApiCard";
import SupportPluginCard from "./SupportPluginCard";
import TemplateModal from "./TemplateModal";

export default function ConfigPage() {
  const { get, put } = useFetchClient();
  const intl = useIntl();
  const [contentTypes, setContentTypes] = useState<ContentTypeInfo[]>([]);
  const [triggers, setTriggers] = useState<TriggerConfig[]>([]);
  const [settings, setSettings] = useState<BrevoSettingsState>({
    apiKey: "",
    apiKeySet: false,
    senderEmail: "",
    senderName: "",
    sendEmailTemplateCode: "contact",
    openaiApiKey: "",
    openaiApiKeySet: false,
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [defaultTemplateModalOpen, setDefaultTemplateModalOpen] =
    useState(false);
  const [settingsMessage, setSettingsMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [triggerSaveError, setTriggerSaveError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalContentType, setModalContentType] = useState<{
    contentTypeUid: string;
    attributes: AttributeMeta[];
    displayName: string;
    trigger: TriggerConfig | null;
  } | null>(null);
  const [manageContentTypesModalOpen, setManageContentTypesModalOpen] =
    useState(false);
  const [devSupport, setDevSupport] = useState<{
    isDevelopment: boolean;
    supportRepoUrl: string;
    supportBmcUrl: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const base = "/brevo-template-sender";
      const [ctRes, trRes, settingsRes] = await Promise.all([
        get(base + "/content-types"),
        get(base + "/triggers"),
        get(base + "/settings"),
      ]);
      const ctData = ctRes?.data ?? ctRes;
      const trData = trRes?.data ?? trRes;
      const settingsData = settingsRes?.data ?? settingsRes;
      const list = Array.isArray(ctData) ? ctData : [];
      setContentTypes(
        list.map((ct: ContentTypeInfo & { attributes?: unknown }) => ({
          ...ct,
          attributes: Array.isArray(ct.attributes)
            ? ct.attributes.map((a: AttributeMeta | string) =>
                typeof a === "string"
                  ? { name: a, type: "string", kind: "scalar" as const }
                  : a
              )
            : [],
        }))
      );
      setTriggers(Array.isArray(trData) ? trData : []);
      if (settingsData && typeof settingsData === "object") {
        setSettings({
          apiKey: "",
          apiKeySet: Boolean(settingsData.apiKeySet),
          senderEmail: String(settingsData.senderEmail ?? ""),
          senderName: String(settingsData.senderName ?? ""),
          sendEmailTemplateCode: String(
            settingsData.sendEmailTemplateCode ?? "contact"
          ),
          openaiApiKey: "",
          openaiApiKeySet: Boolean(settingsData.openaiApiKeySet),
        });
        setDevSupport({
          isDevelopment: Boolean(settingsData.isDevelopment),
          supportRepoUrl: String(
            settingsData.supportRepoUrl ??
              "https://github.com/calistock/strapi-plugin-brevo-template-sender"
          ),
          supportBmcUrl: String(
            settingsData.supportBmcUrl ?? "https://buymeacoffee.com/dupflo"
          ),
        });
      }
    } finally {
      setLoading(false);
    }
  }, [get]);

  const saveSettings = async () => {
    setSavingSettings(true);
    setSettingsMessage(null);
    try {
      const base = "/brevo-template-sender";
      const body: Record<string, string> = {
        senderEmail: settings.senderEmail,
        senderName: settings.senderName,
      };
      if (settings.apiKey) body.apiKey = settings.apiKey;
      body.openaiApiKey = settings.openaiApiKey ?? "";
      await put(base + "/settings", body);
      setSettings((s) => ({
        ...s,
        apiKey: "",
        apiKeySet: s.apiKeySet || Boolean(settings.apiKey),
      }));
      setSettingsMessage({
        type: "success",
        text: intl.formatMessage({
          id: "brevo-template-sender.settings.savedSuccess",
          defaultMessage: "Settings saved.",
        }),
      });
    } catch (e: any) {
      setSettingsMessage({
        type: "error",
        text:
          e?.message ??
          intl.formatMessage({
            id: "brevo-template-sender.settings.savedError",
            defaultMessage: "Failed to save settings.",
          }),
      });
    } finally {
      setSavingSettings(false);
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  const hasTrigger = (uid: string, event: string) =>
    triggers.some((t) => t.contentTypeUid === uid && t.event === event);

  const toggleTrigger = async (
    contentTypeUid: string,
    event: TriggerConfig["event"],
    checked: boolean
  ) => {
    const existingForCt = triggers.filter(
      (t) => t.contentTypeUid === contentTypeUid
    );
    const template = existingForCt[0] ?? null;
    let next = triggers.filter(
      (t) => !(t.contentTypeUid === contentTypeUid && t.event === event)
    );
    if (checked) {
      next = [
        ...next,
        {
          id: makeId(contentTypeUid, event),
          contentTypeUid,
          event,
          subject: template?.subject ?? "",
          html: template?.html ?? "",
          sendToField: template?.sendToField,
          recipients: template?.recipients,
          templateMode: template?.templateMode ?? "html",
          brevoTemplateId: template?.brevoTemplateId,
        },
      ];
    }
    setTriggers(next);
    try {
      const base = "/brevo-template-sender";
      await put(base + "/triggers", { body: { triggers: next } });
    } catch (e) {
      setTriggers(triggers);
    }
  };

  /** Un seul template par content type : on prend le premier trigger pour ce uid (même sujet/HTML pour tous les events). */
  const getTemplateForContentType = (uid: string): TriggerConfig | null =>
    triggers.find((t) => t.contentTypeUid === uid) ?? null;

  const openModal = (ct: ContentTypeInfo, closeManageModal = false) => {
    if (closeManageModal) setManageContentTypesModalOpen(false);
    const trigger = getTemplateForContentType(ct.uid) ?? null;
    setModalContentType({
      contentTypeUid: ct.uid,
      attributes: ct.attributes,
      displayName: ct.displayName,
      trigger,
    });
  };

  /** Content types that have at least one event enabled (for the "Active Content-Type templates" section). */
  const selectedContentTypes = useMemo(
    () =>
      contentTypes.filter((ct) =>
        triggers.some((t) => t.contentTypeUid === ct.uid)
      ),
    [contentTypes, triggers]
  );

  /** Enregistre le template et l’applique à tous les événements déjà activés pour ce content type. */
  const saveTrigger = async (updated: TriggerConfig) => {
    setTriggerSaveError(null);
    const baseTrigger = {
      subject: updated.subject,
      html: updated.html,
      sendToField: updated.sendToField,
      recipients: updated.recipients,
      templateMode: updated.templateMode ?? "html",
      brevoTemplateId: updated.brevoTemplateId,
    };
    const next = triggers.map((t) =>
      t.contentTypeUid === updated.contentTypeUid
        ? { ...t, ...baseTrigger, id: t.id }
        : t
    );
    try {
      const base = "/brevo-template-sender";
      await put(base + "/triggers", { triggers: next });
      setTriggers(next);
      setModalContentType(null);
    } catch (e: any) {
      setTriggerSaveError(
        e?.message ?? "Erreur lors de l'enregistrement du template."
      );
    }
  };

  if (loading) {
    return (
      <Flex justifyContent="center" padding={10}>
        <Loader />
      </Flex>
    );
  }

  return (
    <Box padding={10}>
      <Box paddingBottom={6}>
        <Flex gap={3} alignItems="start">
          <BrevoLogo style={{ height: 32, width: "auto" }} aria-hidden />
          <Typography variant="alpha" as="h1">
            {intl.formatMessage({
              id: "brevo-template-sender.config.title",
              defaultMessage: "HTML Sender configuration",
            })}
          </Typography>
        </Flex>
      </Box>
      <Box paddingBottom={8}>
        <Typography variant="epsilon" textColor="neutral600">
          {intl.formatMessage({
            id: "brevo-template-sender.config.description",
            defaultMessage:
              "Check the events (Create, Update, Delete, Publish, Unpublish) that should trigger an email. One template per content type: edit it via « Edit Template ».",
          })}
        </Typography>
      </Box>

      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          marginBottom: 40,
        }}
      >
        <ConfigCard
          settings={settings}
          setSettings={setSettings}
          saving={savingSettings}
          onSave={saveSettings}
          message={settingsMessage}
          onDismissMessage={() => setSettingsMessage(null)}
        />

        <ActiveTemplatesCard
          selectedContentTypes={selectedContentTypes}
          hasTrigger={hasTrigger}
          onManageContentTypes={() => setManageContentTypesModalOpen(true)}
          onEditTemplate={(ct) => openModal(ct)}
        />

        <SendEmailApiCard
          onConfigureTemplate={() => setDefaultTemplateModalOpen(true)}
        />

        {devSupport?.isDevelopment && (
          <SupportPluginCard
            supportRepoUrl={devSupport.supportRepoUrl}
            bmcButtonImg={bmcButtonImg}
          />
        )}
      </Box>

      <ManageContentTypesModal
        open={manageContentTypesModalOpen}
        onOpenChange={setManageContentTypesModalOpen}
        contentTypes={contentTypes}
        hasTrigger={hasTrigger}
        toggleTrigger={toggleTrigger}
        getTemplateForContentType={getTemplateForContentType}
        onEditTemplate={(ct) => openModal(ct, true)}
      />

      {defaultTemplateModalOpen && (
        <TemplateModal
          contentTypeUid=""
          attributes={DEFAULT_SEND_EMAIL_ATTRIBUTES}
          displayName={intl.formatMessage({
            id: "brevo-template-sender.sendEmail.defaultTemplateName",
            defaultMessage: "Send Email API (default)",
          })}
          trigger={null}
          defaultTemplateCode={settings.sendEmailTemplateCode || "contact"}
          openaiApiKeySet={settings.openaiApiKeySet}
          onClose={() => setDefaultTemplateModalOpen(false)}
          onSave={() => {}}
          onSaved={() => load()}
        />
      )}
      {modalContentType && (
        <TemplateModal
          contentTypeUid={modalContentType.contentTypeUid}
          attributes={modalContentType.attributes}
          displayName={modalContentType.displayName}
          trigger={modalContentType.trigger}
          saveError={triggerSaveError}
          openaiApiKeySet={settings.openaiApiKeySet}
          onClose={() => {
            setModalContentType(null);
            setTriggerSaveError(null);
          }}
          onDismissError={() => setTriggerSaveError(null)}
          onSave={saveTrigger}
        />
      )}
    </Box>
  );
}
