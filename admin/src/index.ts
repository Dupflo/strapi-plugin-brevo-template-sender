import { PLUGIN_ID } from './pluginId';
import { BrevoHtmlTemplateIcon } from './components/BrevoHtmlTemplateIcon';

export default {
  register(app: any) {
    app.addMenuLink({
      to: `/plugins/${PLUGIN_ID}`,
      icon: BrevoHtmlTemplateIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: 'Brevo Template Sender',
      },
      Component: () => import('./pages/ConfigPage').then((m) => m.default),
      permissions: [],
    });
    app.registerPlugin({
      id: PLUGIN_ID,
      name: 'Brevo Template Sender',
    });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);
          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  },
};
