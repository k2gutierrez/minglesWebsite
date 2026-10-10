// Genera public/data/mingles-traits.json, la copia compacta que carga el
// laboratorio de capas del admin (pestaña «Mingle lab»).
//
// La fuente vive en el sitio viejo y NO está en este repo:
//   ~/Documents/minglesWebsite/src/components/engine/mingles-metadata-clean.json
// Son 2.8 MB y 5550 entradas con atributos redundantes. Aquí se queda solo la
// edición y los 6 valores de capa (~486 KB), y fuera los 10 tokens 1-of-1, que
// son los únicos con capas especiales (Cat, Galaxy, FWOG…) que no existen como
// PNG en el bucket `traits`.
//
// Uso:
//   node scripts/build-mingle-traits.mjs [ruta-a-mingles-metadata-clean.json]
//
// Los valores se guardan tal cual vienen en la metadata (con acentos en NFD, como
// «Añejo»). La normalización a ASCII del nombre del PNG la hace el cliente en
// `sanitizeTraitName`, porque en Storage los archivos son `Anejo.png`.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const LAYERS = ["BG", "Tequila Worm", "Fur", "Face", "Bottle", "Cap"];
const EXCLUDED_1_OF_1 = [
  698, 4245, 4927, 4163, 3154, 4355, 4288, 1172, 4175, 5453,
];

const source =
  process.argv[2] ??
  join(
    homedir(),
    "Documents/minglesWebsite/src/components/engine/mingles-metadata-clean.json",
  );

const metadata = JSON.parse(readFileSync(source, "utf8"));
const excluded = new Set(EXCLUDED_1_OF_1);
const values = Object.fromEntries(LAYERS.map((layer) => [layer, new Set()]));
const mingles = [];

for (const entry of metadata) {
  if (excluded.has(entry.edition)) continue;
  const traits = Object.fromEntries(
    entry.attributes.map((a) => [a.trait_type, a.value]),
  );
  const missing = LAYERS.filter((layer) => !(layer in traits));
  if (missing.length) {
    throw new Error(
      `Edition ${entry.edition} has no value for: ${missing.join(", ")}`,
    );
  }
  for (const layer of LAYERS) values[layer].add(traits[layer]);
  mingles.push([entry.edition, ...LAYERS.map((layer) => traits[layer])]);
}

mingles.sort((a, b) => a[0] - b[0]);

const traits = Object.fromEntries(
  LAYERS.map((layer) => [layer, [...values[layer]].sort()]),
);
const document = { layers: LAYERS, traits, mingles };
const json = JSON.stringify(document);
// OJO con la ruta: va en una SUBcarpeta a propósito. La ruta dinámica
// `[section]` del sitio captura cualquier ruta de un solo segmento, así que un
// /mingles-traits.json en la raíz de public/ NO se sirve en producción: la ruta
// responde con la página 404 en su lugar (status 200, content-type text/html).
// Con dos segmentos sí se sirve como archivo estático. Comprobado en producción:
// /brand/*.png responde image/png, /mingles-traits.json respondía text/html.
const outDir = join("public", "data");
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, "mingles-traits.json");
writeFileSync(outFile, json);

const traitCount = LAYERS.reduce((sum, layer) => sum + traits[layer].length, 0);
console.log(
  `${outFile}: ${mingles.length} Mingles, ${traitCount} layer values, ${(json.length / 1024).toFixed(1)} KB (from ${source})`,
);
