# Tipografía de la campaña

## Lo que está instalado

| Archivo | Qué es | Licencia | Uso |
| --- | --- | --- | --- |
| `Acme-Regular.ttf` | **Acme** (Google Fonts), un solo peso 400 | **OFL** — `Acme-OFL.txt` incluido | Títulos y bajadas (`--mw-display`) |

Acme **no** es la "ACME Gothic Condensed Semibold" del brandbook. Es la que mandó Memo
el 2 nov 2026 y es la única libre de regalías que tenemos. Funciona bien en titulares
grandes, pero es de un solo peso: no tiene negritas ni cursivas, así que **no puede ser
fuente de cuerpo**.

## Cómo queda el sistema

```
--mw-display : "Acme"                        → h1, h2, .mw-title, .mw-sub
--mw-title   : "Barlow Condensed"            → etiquetas, nombres de arena, cifras
--mw-copy    : "ACME Gothic Condensed"       → cuerpo (cae a Barlow mientras no exista)
```

Barlow Condensed ya la carga el sitio de Mingles, así que el cuerpo no cuesta nada extra
y mantiene la coherencia con el resto del sitio.

## Lo que falta

### 1. Gardein (Bold y Regular)

**No existe como archivo.** Memo solo tiene la fuente instalada en su máquina: el CSS
`font-family: "gardein"` funciona en su computadora y en ningún otro lado. Sin un
`.woff2`/`.ttf`/`.otf` no se puede servir en web.

Ese es el hueco real: Acme está sustituyendo los títulos de Gardein.

Si algún día aparece el archivo:

1. Déjalo como `public/fonts/Gardein-Bold.woff2` y `Gardein-Regular.woff2`.
2. Descomenta su `@font-face` en `src/app/mudwater.css`.
3. En `--mw-display`, pon `"Gardein"` **antes** de `"Acme"`.

No hay que tocar tamaños ni componentes.

### 2. ACME Gothic Condensed Semibold

Es de licencia. Memo comentó que Bored Ape usó una **versión trial**. No sirve para
producción: las licencias trial de fundidora suelen prohibir uso comercial y limitan
page views. Si se va a comprar, hacen falta cuatro datos:

- ¿Cubre self-hosting de `woff2` en dominio propio?
- ¿Límite de page views mensuales?
- ¿Se puede usar en imágenes OG y PDF?
- ¿Cubre al equipo de desarrollo o solo a un usuario?

Cuando llegue: `public/fonts/ACMEGothic-CondensedSemibold.woff2`, descomentar su
`@font-face`, y `--mw-copy` ya la tiene en primer lugar.

## Nota sobre el trial

Si en algún momento aparece un `.otf` de prueba de ACME Gothic, **no lo subas al repo**.
Está bien para ver cómo queda en local; en el servidor se cambia por la licencia o se
queda Barlow.
