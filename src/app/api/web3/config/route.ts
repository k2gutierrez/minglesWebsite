import { COLLECTION } from "@/lib/web3/collection";
import { json } from "@/lib/server/http";
export function GET() {
  return json({
    chainId: COLLECTION.chain.id,
    chainName: COLLECTION.chain.name,
    address: COLLECTION.address,
    name: COLLECTION.name,
    authConfigured: !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ),
    walletConfigured: !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.APP_ORIGIN
    ),
    protocolLive: false,
  });
}
