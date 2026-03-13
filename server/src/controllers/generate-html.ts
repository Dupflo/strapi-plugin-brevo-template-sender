/**
 * Génération de template HTML par OpenAI (optionnel, clé configurée dans les paramètres du plugin).
 */

const SYSTEM_PROMPT = `Tu es un expert en emails HTML transactionnels. Tu génères uniquement du HTML valide pour le corps d'un email (sans <!DOCTYPE> ni <html>), compatible avec les clients email.
Règles :
- Utilise des tables pour la mise en page si besoin (compatibilité email).
- Utilise des styles inline.
- Pour les variables dynamiques, utilise la syntaxe {{nom_variable}} (ex: {{firstname}}, {{email}}, {{logo_url}}).
- Ne renvoie que le HTML, sans markdown ni explication.`;

export default {
  async generate(ctx: any) {
    try {
      const { prompt, currentHtml } = ctx.request?.body ?? {};
      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        ctx.throw(400, 'prompt is required');
      }

      const settingsService = strapi.service('plugin::brevo-template-sender.settings');
      const openaiKey = await settingsService.getOpenAiApiKey();
      if (!openaiKey || typeof openaiKey !== 'string' || !openaiKey.trim()) {
        ctx.throw(400, 'OpenAI API key is not configured. Add it in the plugin settings (Config) or set OPENAI_API_KEY.');
      }

      const userContent = currentHtml && currentHtml.trim()
        ? `Contexte : le template actuel est :\n\n${currentHtml.trim()}\n\nInstruction : ${prompt.trim()}\n\nGénère le HTML mis à jour (uniquement le HTML).`
        : `Instruction : ${prompt.trim()}\n\nGénère un template HTML d'email (uniquement le HTML).`;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey.trim()}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userContent },
          ],
          temperature: 0.3,
          max_tokens: 4096,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: { message?: string };
        message?: string;
        choices?: Array<{ message?: { content?: string } }>;
      };
      if (!res.ok) {
        const errMsg = data?.error?.message ?? data?.message ?? `OpenAI API error ${res.status}`;
        ctx.throw(res.status >= 400 && res.status < 500 ? res.status : 502, errMsg);
      }

      const content = data?.choices?.[0]?.message?.content;
      if (!content || typeof content !== 'string') {
        ctx.throw(502, 'Invalid response from OpenAI');
      }

      // Enlever un éventuel wrapper markdown (```html ... ```)
      let html = content.trim();
      const codeBlock = /^```(?:html)?\s*([\s\S]*?)```\s*$/i;
      const match = html.match(codeBlock);
      if (match) html = match[1].trim();

      ctx.body = { html };
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      ctx.throw(err?.status || 500, err?.message || 'Failed to generate HTML');
    }
  },
};
