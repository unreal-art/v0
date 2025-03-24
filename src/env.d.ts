declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_BUILD_VERSION: string;
    // Storage URLs
    NEXT_PUBLIC_R2_STORAGE_URL: string;
    // Cloudflare URL
    NEXT_PUBLIC_CF_URL: string;

    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;

    // Lighthouse
    NEXT_PUBLIC_LIGHTHOUSE_GATE_WAY: string;

    // Twitter
    NEXT_PUBLIC_TW_CLIENT_ID: string;

    // API
    NEXT_PUBLIC_API_URL: string;

    // Blockchain addresses
    NEXT_PUBLIC_DART_ADDRESS: string;
    NEXT_PUBLIC_ODP_ADDRESS: string;
    NEXT_PUBLIC_EXCHANGE_ADDRESS: string;

    // Debug and monitoring
    NEXT_PUBLIC_DEBUG: string;
    NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID: string;
  }
}
