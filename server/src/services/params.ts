/**
 * Résolution des paramètres pour les templates email : distinction champs scalaires
 * (title, content) vs champs à profondeur (relations, media) et population avec profondeur.
 */

type AttributeMeta = {
  name: string;
  type: string;
  kind: 'scalar' | 'relation' | 'media' | 'component' | 'dynamiczone';
  target?: string;
};

function getAttributeType(attr: unknown): string {
  if (!attr || typeof attr !== 'object') return 'unknown';
  const a = attr as Record<string, unknown>;
  return (a.type as string) ?? (a.model as string) ?? 'unknown';
}

function getAttributeKind(type: string): AttributeMeta['kind'] {
  if (type === 'relation') return 'relation';
  if (type === 'media') return 'media';
  if (type === 'component') return 'component';
  if (type === 'dynamiczone') return 'dynamiczone';
  return 'scalar';
}

export default ({ strapi }: { strapi: any }) => ({
  /**
   * Retourne les métadonnées des attributs d'un content type (nom, type, kind, target).
   * Permet à l'admin de distinguer champs simples (texte) vs champs à profondeur (relation, media).
   */
  getAttributesMeta(uid: string): AttributeMeta[] {
    const ct = strapi.contentTypes?.[uid] as { attributes?: Record<string, unknown> } | undefined;
    if (!ct?.attributes) return [];
    return Object.entries(ct.attributes).map(([name, attr]) => {
      const type = getAttributeType(attr);
      const kind = getAttributeKind(type);
      const target = (attr as Record<string, unknown>)?.target as string | undefined;
      return { name, type, kind, target };
    });
  },

  /**
   * Returns the list of depth attributes for a relation/media/component attribute
   * (e.g. for "thumbnail" media: id, url, name, ...; for relation: target content type attributes).
   */
  getDepthAttributes(uid: string, attributeName: string): { name: string }[] {
    const meta = this.getAttributesMeta(uid);
    const attr = meta.find((m) => m.name === attributeName);
    if (!attr) return [];
    if (attr.kind === 'media') {
      return [
        { name: 'id' },
        { name: 'url' },
        { name: 'name' },
        { name: 'alternativeText' },
        { name: 'caption' },
        { name: 'width' },
        { name: 'height' },
      ];
    }
    if (attr.kind === 'relation' && attr.target) {
      return this.getAttributesMeta(attr.target).map((m) => ({ name: m.name }));
    }
    if (attr.kind === 'component' && attr.target) {
      const comp = strapi.components?.[attr.target] as { attributes?: Record<string, unknown> } | undefined;
      if (comp?.attributes) {
        return Object.keys(comp.attributes).map((name) => ({ name }));
      }
    }
    return [];
  },

  /**
   * Construit un objet populate pour strapi.documents(uid).findOne()
   * en incluant les relations et media jusqu'à la profondeur demandée.
   */
  buildPopulate(uid: string, depth: number): Record<string, unknown> | string[] {
    if (depth <= 0) return {};
    const meta = this.getAttributesMeta(uid);
    const relationAndMedia = meta.filter((m) => m.kind === 'relation' || m.kind === 'media' || m.kind === 'component');
    if (relationAndMedia.length === 0) return {};
    if (depth === 1) return relationAndMedia.map((m) => m.name) as unknown as string[];
    const populate: Record<string, unknown> = {};
    for (const m of relationAndMedia) {
      if (m.kind === 'relation' && m.target && depth > 1) {
        const nested = this.buildPopulate(m.target, depth - 1);
        populate[m.name] = Array.isArray(nested) ? { populate: nested } : { populate: nested };
      } else {
        populate[m.name] = true;
      }
    }
    return populate;
  },

  /**
   * Récupère le document avec les relations/media peuplés jusqu'à la profondeur donnée.
   * Pour les media, on normalise pour avoir .url accessible ; pour les relations, l'objet peuplé.
   */
  async getDocumentWithDepth(
    uid: string,
    documentId: string,
    depth: number = 2
  ): Promise<Record<string, unknown> | null> {
    try {
      const populate = this.buildPopulate(uid, depth);
      const doc = await strapi.documents(uid).findOne({
        documentId,
        populate: Object.keys(populate).length ? populate : undefined,
      });
      if (!doc || typeof doc !== 'object') return null;
      return this.normalizeForTemplate(doc, uid, depth);
    } catch (e) {
      strapi.log?.warn?.('brevo-template-sender getDocumentWithDepth', e);
      return null;
    }
  },

  /**
   * Normalise le document pour le template : media → { url, ... }, relations déjà en objet.
   */
  normalizeForTemplate(
    doc: Record<string, unknown>,
    uid: string,
    _depth: number
  ): Record<string, unknown> {
    const meta = this.getAttributesMeta(uid);
    const out = { ...doc };
    for (const m of meta) {
      const val = out[m.name];
      if (val == null) continue;
      if (m.kind === 'media') {
        if (Array.isArray(val)) {
          out[m.name] = val.map((v: any) => (v && typeof v === 'object' && v.url ? v : { url: '' }));
        } else if (typeof val === 'object' && val !== null && 'url' in val) {
          out[m.name] = val;
        } else {
          out[m.name] = { url: String(val) };
        }
      }
      if (m.kind === 'relation' && typeof val === 'object' && val !== null && !Array.isArray(val)) {
        out[m.name] = val;
      }
      if (m.kind === 'relation' && Array.isArray(val)) {
        out[m.name] = val;
      }
    }
    return out;
  },
});
