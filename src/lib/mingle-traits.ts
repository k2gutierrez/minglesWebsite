/**
 * Capas de arte de un Mingle, para el laboratorio del admin.
 *
 * La metadata real vive en el sitio viejo
 * (`mingles-metadata-clean.json`, 2.8 MB, 5550 entradas `{edition, attributes}`).
 * Aquí se sirve una versión compacta generada en `public/mingles-traits.json`
 * (~486 KB) con lo mínimo: la edición y los 6 valores de capa, y los 10 tokens
 * 1-of-1 fuera (698, 4245, 4927, 4163, 3154, 4355, 4288, 1172, 4175, 5453, que
 * son los únicos que traen capas especiales tipo `Cat` o `Galaxy`).
 *
 * Dos decisiones que conviene no deshacer:
 *  1. Los valores posibles de cada capa salen de la propia metadata, no de
 *     listar el bucket `traits`. Así el laboratorio no depende de las políticas
 *     de Storage (el bucket es público, pero listarlo no tiene por qué serlo).
 *  2. La imagen se pide a la ruta pública del bucket con el nombre normalizado
 *     sin acentos: en Storage los archivos son ASCII (`Añejo` → `Anejo.png`,
 *     `Catrín` → `Catrin.png`). Verificado con HEAD sobre los 125 valores.
 *
 * PENDIENTE (fuera de alcance a propósito): subir o reemplazar el PNG de una
 * capa. El generador viejo lo permitía escribiendo en el bucket `traits` de
 * producción; eso necesita políticas de Storage propias y revisión de arte, así
 * que este laboratorio solo lee.
 */

/** Las 6 capas, en orden de pintado (BG al fondo). */
export const MINGLE_LAYERS = [
  "BG",
  "Tequila Worm",
  "Fur",
  "Face",
  "Bottle",
  "Cap",
] as const;

export type MingleLayer = (typeof MINGLE_LAYERS)[number];

/**
 * z-index por capa. Es el mapa exacto del generador viejo: el fondo abajo, el
 * gusano de tequila por detrás del pelaje y el rostro, y botella y tapón encima.
 */
export const LAYER_Z_INDEX: Record<MingleLayer, number> = {
  BG: 0,
  "Tequila Worm": 10,
  Fur: 20,
  Face: 30,
  Bottle: 40,
  Cap: 50,
};

/** Bucket público de arte en Supabase Storage. */
export const TRAITS_BUCKET = "traits";

/** Copia local y compacta del registro. Se carga solo al abrir la sección. */
export const TRAIT_REGISTRY_URL = "/mingles-traits.json";

/** Cuántos Mingles añade cada pulsación de «cargar más», como el sitio viejo. */
export const TRAITS_PAGE_SIZE = 50;

export type MingleTraits = Record<MingleLayer, string>;

export type MingleRecord = {
  edition: number;
  traits: MingleTraits;
};

export type MingleRegistry = {
  layers: MingleLayer[];
  /** Valores posibles por capa, derivados de la metadata. */
  traits: Record<MingleLayer, string[]>;
  /** Ordenados por edición, sin los 10 tokens 1-of-1. */
  mingles: MingleRecord[];
};

/**
 * Storage guarda los PNG sin acentos. Sin esto, `Añejo` daría 404.
 */
export function sanitizeTraitName(name: string) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** URL pública del PNG de una capa. `label` es el valor tal cual viene en metadata. */
export function traitImageUrl(baseUrl: string, layer: string, label: string) {
  const root = baseUrl.replace(/\/+$/, "");
  return `${root}/storage/v1/object/public/${TRAITS_BUCKET}/${encodeURIComponent(layer)}/${encodeURIComponent(
    sanitizeTraitName(label),
  )}.png`;
}

/** Valores efectivos de un Mingle con los cambios de capa aplicados encima. */
export function composeTraits(
  record: MingleRecord,
  overrides?: Partial<MingleTraits>,
): MingleTraits {
  if (!overrides) return record.traits;
  return { ...record.traits, ...overrides };
}

/** Una línea legible con las 6 capas: se usa en `aria-label` y en textos de UI. */
export function describeTraits(traits: MingleTraits) {
  return MINGLE_LAYERS.map((layer) => `${layer}: ${traits[layer]}`).join(", ");
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Valida el JSON antes de confiar en él. Si la forma no es la esperada devuelve
 * `null`: preferimos un error explícito a pintar capas equivocadas en silencio
 * (una capa mal mapeada daría un Mingle que no existe).
 */
export function parseMingleRegistry(data: unknown): MingleRegistry | null {
  if (!isPlainObject(data)) return null;

  const layers = data.layers;
  if (
    !Array.isArray(layers) ||
    layers.length !== MINGLE_LAYERS.length ||
    !MINGLE_LAYERS.every((layer, i) => layers[i] === layer)
  ) {
    return null;
  }

  if (!isPlainObject(data.traits)) return null;
  const traitSets: Record<string, Set<string>> = {};
  const traits = {} as Record<MingleLayer, string[]>;
  for (const layer of MINGLE_LAYERS) {
    const values = data.traits[layer];
    if (
      !Array.isArray(values) ||
      !values.length ||
      !values.every((v) => typeof v === "string" && v.length > 0)
    ) {
      return null;
    }
    traits[layer] = values as string[];
    traitSets[layer] = new Set(values as string[]);
  }

  if (!Array.isArray(data.mingles)) return null;
  const mingles: MingleRecord[] = [];
  for (const entry of data.mingles) {
    if (!Array.isArray(entry) || entry.length !== MINGLE_LAYERS.length + 1) {
      return null;
    }
    const [edition, ...values] = entry;
    if (typeof edition !== "number" || !Number.isInteger(edition)) return null;
    const record = {} as MingleTraits;
    for (let i = 0; i < MINGLE_LAYERS.length; i += 1) {
      const layer = MINGLE_LAYERS[i];
      const value = values[i];
      if (typeof value !== "string" || !traitSets[layer].has(value))
        return null;
      record[layer] = value;
    }
    mingles.push({ edition, traits: record });
  }
  if (!mingles.length) return null;

  return { layers: [...MINGLE_LAYERS], traits, mingles };
}

/** Filtros activos: un valor por capa (vacío = cualquier valor). */
export type MingleFilters = Partial<Record<MingleLayer, string>>;

/**
 * Filtra por capa (todas las capas activas deben coincidir) y por edición.
 * `query` busca la edición como texto, así «76» encuentra la 276, la 760 y la
 * 1760 en una sola pasada.
 */
export function filterMingles(
  mingles: MingleRecord[],
  filters: MingleFilters,
  query: string,
): MingleRecord[] {
  const active = MINGLE_LAYERS.filter((layer) => filters[layer]);
  const search = query.trim();
  if (!active.length && !search) return mingles;
  return mingles.filter((record) => {
    if (search && !String(record.edition).includes(search)) return false;
    return active.every((layer) => record.traits[layer] === filters[layer]);
  });
}
