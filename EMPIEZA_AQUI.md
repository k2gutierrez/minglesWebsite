# Mingles — entrega para desarrollo

## Ya está integrado

El sitio tiene frontend Next.js, CMS conectado a Supabase, cuentas por email, conexión de wallets EVM, firma de verificación, backend de ownership y galería de NFTs desde el contrato oficial. El diseño negro y los efectos interactivos están incluidos.

**Colección configurada:** Mingles · ApeChain (chain ID 33139)

`0x6579cfd742d8982a7cdc4c00102d3087f6c6dd8e`

El contrato ya está en `src/lib/web3/collection.ts`. No hace falta volver a pegarlo. Ese archivo centraliza dirección, red y rango de tokens si posteriormente cambia la colección.

## Lo que debes hacer tú

1. Instala Node.js 24 LTS y abre esta carpeta en VS Code.
2. Ejecuta `npm ci`.
3. Crea un proyecto de Supabase de staging.
4. Ejecuta, en orden, los dos SQL de `supabase/migrations/` en el SQL Editor de ese proyecto.
5. Copia `.env.example` a `.env.local` y completa las variables indicadas abajo.
6. En Supabase Auth configura email/magic links, SMTP y URLs de retorno `/portal` y `/admin` del sitio. Para desarrollo: `http://localhost:3000`.
7. Crea/invita el usuario autorizado de Memo y asígnale el rol de contenido con el SQL de la guía Supabase.
8. Ejecuta `npm run check:backend`, `npm run verify:contract`, `npm test` y `npm run dev`.
9. Abre `/admin`, inicia sesión y publica el contenido aprobado. En `/portal`, inicia sesión por email, conecta la wallet, firma el mensaje y pulsa **Verify NFTs**. En **My Mingles** se muestran los NFTs encontrados.
10. Prueba el flujo completo en staging; configura dominio y variables en el hosting antes del despliegue.

## Variables necesarias

| Variable | Dónde se obtiene | Visibilidad |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Proyecto Supabase | Pública |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | API keys de Supabase, publishable/anon | Pública; protegida por RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | API keys del proyecto | SECRETA, solo servidor |
| `APP_ORIGIN` | Origen exacto del sitio, sin `/` final | Solo configuración de servidor |
| `APECHAIN_RPC_URL` | Endpoint RPC de ApeChain | Usa endpoint dedicado para producción |
| `NEXT_PUBLIC_SITE_URL` | URL del sitio | Pública |

Nunca pongas la service-role key en una variable `NEXT_PUBLIC_`, en Git ni en el ZIP. Nunca se necesita una seed phrase ni private key de wallet. **No se usa la API de OpenAI.**

## Qué hace el backend

- Valida el usuario con Supabase Auth en el servidor.
- Emite un mensaje SIWE con nonce aleatorio, dominio, red, cuenta y vencimiento de cinco minutos.
- Verifica la firma del mensaje exacto almacenado y consume el challenge de forma atómica.
- Limita intentos por usuario y evita vincular una wallet a dos cuentas distintas.
- Permite hasta cinco wallets por cuenta; desvincular no mueve NFTs.
- Consulta ownership en ApeChain en un mismo bloque observado, cruza los resultados con `balanceOf`, y guarda un snapshot con fecha y bloque.
- Revalida `ownerOf` antes de servir datos de cada NFT; la metadata viene del `tokenURI` real en IPFS.
- Aísla los datos de cada usuario con RLS. Los administradores de contenido no pueden fabricar verificaciones de wallets.

## Particularidad de este contrato

Se verificó por RPC: nombre `Mingles`, símbolo `MINGLES`, ERC-721, `totalSupply = 5555`, token IDs comprobados en extremos 1 y 5555. No implementa ERC721Enumerable ni `tokensOfOwner`.

Por eso la implementación consulta `ownerOf` del rango configurado, agrupado mediante Multicall, y exige que la cantidad encontrada sea exactamente la de `balanceOf`. No requiere una API de indexación adicional. Es más costoso que usar un indexador: usa RPC dedicado, prueba cuotas y permite hasta 120 segundos por request en el hosting. Las verificaciones se limitan a dos por minuto por cuenta. Para tráfico alto, reemplaza la estrategia de descubrimiento por un indexador; conserva la validación onchain y la comparación de balance.

Los snapshots son históricos, no una autorización permanente. Al transferir un NFT hay que refrescar; las operaciones futuras de acceso/claim deben revalidar ownership en su propia ejecución.

## Límites actuales

- El código y las migraciones están entregados; no hemos creado ni configurado un proyecto Supabase real con credenciales del equipo.
- La firma real desde una wallet del equipo y el ciclo Supabase Auth → challenge → verificación deben probarse en staging.
- Wallets de navegador/EIP-6963 y navegadores de wallet compatibles. No incluye QR de WalletConnect/Reown ni una API key de ese servicio.
- El login es primero por email y después se vincula la wallet. No es un login exclusivamente por wallet.
- Activación, migración de NFTs y distribuciones económicas siguen desactivadas. No hay contratos ni reglas aprobadas para implementarlas y no se inventaron.
- Faltan los assets oficiales y algunas extensiones avanzadas del CMS descritas en las guías originales: video, calendario de publicación y cobertura total de textos secundarios.

## Archivos importantes

- `src/lib/web3/collection.ts`: contrato, red, ABI y rango de tokens.
- `src/lib/server/chain.ts`: verificación onchain y consulta de la colección.
- `src/app/api/wallet/`: challenge, verificación y desvinculación.
- `src/app/api/holder/`: cuenta, refresh y metadata.
- `src/components/wallet-panel.tsx`: conexión y galería.
- `supabase/migrations/`: SQL del CMS y del backend Web3.
- `tests/backend.test.mjs`: pruebas reales de Postgres local con PGlite, RLS y no-replay.
- `docs/07-BACKEND-API.md`: contrato de endpoints y despliegue.

El ZIP excluye `node_modules`, `.next`, archivos privados `.env` y cachés. Instala las dependencias con `npm ci`. Los PDFs originales se incluyen como referencia, no como archivos públicos del sitio.
