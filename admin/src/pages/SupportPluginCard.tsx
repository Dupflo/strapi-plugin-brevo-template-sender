import { Box, Flex, Typography } from "@strapi/design-system";
import { Star } from "@strapi/icons";
import { useState } from "react";
import { useIntl } from "react-intl";

const STAR_COLOR_GRAY = "#6b7280";
const STAR_COLOR_GOLD = "#ca8a04";

interface SupportPluginCardProps {
  supportRepoUrl: string;
  bmcButtonImg: string;
}

/** Dérive owner/repo depuis l’URL GitHub (ex. https://github.com/Dupflo/strapi-plugin-brevo-template-sender → Dupflo/strapi-plugin-brevo-template-sender). */
function getRepoPath(url: string): string {
  return url.replace(/^https?:\/\/github\.com\/?/i, "").replace(/\/$/, "");
}

export default function SupportPluginCard({
  supportRepoUrl,
  bmcButtonImg,
}: SupportPluginCardProps) {
  const intl = useIntl();
  const [starHighlight, setStarHighlight] = useState(false);
  const repoPath = getRepoPath(supportRepoUrl);
  const repoUrl = repoPath ? `https://github.com/${repoPath}` : supportRepoUrl;
  const starColor = starHighlight ? STAR_COLOR_GOLD : STAR_COLOR_GRAY;

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
      position="relative"
    >
      <Typography variant="delta" as="h2" style={{ marginBottom: 15 }}>
        {intl.formatMessage({
          id: "brevo-template-sender.promo.title",
          defaultMessage: "Support the plugin",
        })}
      </Typography>
      <Box
        padding={3}
        marginBottom={4}
        background="primary100"
        borderColor="primary200"
        borderWidth="1px"
        borderStyle="solid"
        borderRadius="4px"
        style={{ width: "100%" }}
      >
        <Typography variant="pi" textColor="primary700">
          {intl.formatMessage({
            id: "brevo-template-sender.promo.badge",
            defaultMessage:
              "This block is hidden in run start so your end users won't see this block. As a developer, you can support the plugin.",
          })}
        </Typography>
      </Box>
      <Typography variant="pi" textColor="neutral600">
        {intl.formatMessage({
          id: "brevo-template-sender.promo.description",
          defaultMessage:
            "Find this plugin helpful? Support me by buying a coffee and/or leave a star to the repo on GitHub.",
        })}
      </Typography>
      <Flex gap={3} wrap="wrap" alignItems="center" style={{ marginTop: 15 }}>
        <a
          href="https://www.buymeacoffee.com/dupflo"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={bmcButtonImg}
            alt="Buy Me A Coffee"
            style={{ height: 60, width: 217 }}
          />
        </a>
        <Flex
          as="a"
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          gap={2}
          paddingTop={2}
          paddingBottom={2}
          paddingLeft={3}
          paddingRight={3}
          background="neutral100"
          borderColor="neutral200"
          borderWidth="1px"
          borderStyle="solid"
          borderRadius="4px"
          alignItems="center"
          style={{ textDecoration: "none", cursor: "pointer" }}
          onMouseEnter={() => setStarHighlight(true)}
          onMouseLeave={() => setStarHighlight(false)}
          onMouseDown={() => setStarHighlight(true)}
          onMouseUp={() => setStarHighlight(false)}
        >
          <Box style={{ color: starColor, display: "flex" }}>
            <Star aria-hidden style={{ width: 16, height: 16, flexShrink: 0 }} />
          </Box>
          <Typography variant="pi" textColor="neutral700" fontWeight="semiBold">
            {intl.formatMessage({
              id: "brevo-template-sender.promo.starGitHub",
              defaultMessage: "Star on GitHub",
            })}
          </Typography>
        </Flex>
      </Flex>
    </Box>
  );
}
