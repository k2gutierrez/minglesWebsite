import { existsSync } from 'node:fs';
if(existsSync('.env.local'))process.loadEnvFile('.env.local');
const required=['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY','SUPABASE_SERVICE_ROLE_KEY','APP_ORIGIN'];
let missing=false;for(const key of required){const configured=!!process.env[key];console.log(`${configured?'OK':'MISSING'} ${key}`);if(!configured)missing=true;}
if(missing){console.error('Complete .env.local using .env.example. No secrets are printed by this script.');process.exitCode=1;}else{console.log('Environment present. Apply both migrations and test sign-in/wallet linking in staging.');}
