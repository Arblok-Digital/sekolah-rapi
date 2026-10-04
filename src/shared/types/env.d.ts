export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      SUPABASE_SERVICE_ROLE_KEY: string;
      NEXT_PUBLIC_APP_NAME: string;
      NEXT_PUBLIC_APP_URL: string;
      NEXT_PUBLIC_POWERED_BY: string;
      /** Opsional: kunci untuk autentikasi request cron (Vercel mengirim otomatis). */
      CRON_SECRET?: string;
      /** Opsional: kunci API Gemini untuk chat "Tanya Arblok". */
      GEMINI_API_KEY?: string;
    }
  }
}
