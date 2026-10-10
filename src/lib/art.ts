/**
 * Las tres vistas de un Mingle.
 *
 * El sitio anterior las llamaba `bottled`, `unbottled` y `zoom`. Se conservan
 * las tres porque cada una sirve para algo distinto:
 *
 *  - `official`  → la imagen del `tokenURI` (con botella, como se minteó).
 *  - `unbottled` → el arte sin la botella.
 *  - `pfp`       → primer plano, listo para foto de perfil.
 *
 * ⚠️ VERIFICADO: el CDN de arte responde 200 en los dos extremos y en el centro
 * del rango (probados #1, #100, #1000, #2769, #3000, #4999, #5554 y #5555), así
 * que las tres vistas existen para toda la colección.
 *
 * Sobre la descarga: el sitio viejo tenía un botón "Download" que necesitaba un
 * proxy en el servidor (`/api/download-image`), y ese proxy permitía SSRF — se
 * podía usar para pedir cualquier URL interna. **No se revive.** En su lugar se
 * abre la imagen a tamaño completo en otra pestaña, y el navegador la guarda si
 * el usuario quiere. Mismo resultado, sin agujero de seguridad.
 */
const ART_CDN = "https://d9emswcmuvawb.cloudfront.net";

export type MingleViewId = "official" | "unbottled" | "pfp";

export type MingleView = {
  id: MingleViewId;
  /** Etiqueta corta para el selector. */
  label: string;
  /** Una línea explicando para qué sirve esta vista. */
  hint: string;
  /** `null` cuando el `tokenURI` no devolvió imagen (IPFS caído o sin metadata). */
  url: string | null;
};

export function mingleViews(
  tokenId: string,
  officialImage: string | null,
): MingleView[] {
  return [
    {
      id: "official",
      label: "Bottled",
      hint: "The minted image, bottle included. Comes from the token metadata.",
      url: officialImage,
    },
    {
      id: "unbottled",
      label: "Unbottled",
      hint: "The artwork on its own, without the bottle.",
      url: `${ART_CDN}/${tokenId}.png`,
    },
    {
      id: "pfp",
      label: "PFP",
      hint: "Close-up crop, ready to use as a profile picture.",
      url: `${ART_CDN}/PFP${tokenId}.png`,
    },
  ];
}
