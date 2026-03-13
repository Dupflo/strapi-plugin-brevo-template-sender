import { jsx } from "react/jsx-runtime";
import { Mail } from "@strapi/icons";
const __variableDynamicImportRuntimeHelper = (glob, path, segs) => {
  const v = glob[path];
  if (v) {
    return typeof v === "function" ? v() : Promise.resolve(v);
  }
  return new Promise((_, reject) => {
    (typeof queueMicrotask === "function" ? queueMicrotask : setTimeout)(
      reject.bind(
        null,
        new Error(
          "Unknown variable dynamic import: " + path + (path.split("/").length !== segs ? ". Note that variables only represent file names one level deep." : "")
        )
      )
    );
  });
};
const strapi = {
  name: "brevo-template-sender"
};
const pluginPkg = {
  strapi
};
const PLUGIN_ID = pluginPkg.strapi.name;
const BrevoHtmlTemplateIcon = () => /* @__PURE__ */ jsx(Mail, {});
const index = {
  register(app) {
    app.addMenuLink({
      to: `/plugins/${PLUGIN_ID}`,
      icon: BrevoHtmlTemplateIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: "Brevo Template Sender"
      },
      Component: () => import("../_chunks/ConfigPage-DLf1Pz1x.mjs").then((m) => m.default),
      permissions: []
    });
    app.registerPlugin({
      id: PLUGIN_ID,
      name: "Brevo Template Sender"
    });
  },
  async registerTrads({ locales }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "./translations/en.json": () => import("../_chunks/en-BWeSd96-.mjs"), "./translations/fr.json": () => import("../_chunks/fr-CcwfVp1l.mjs") }), `./translations/${locale}.json`, 3);
          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  }
};
export {
  index as default
};
