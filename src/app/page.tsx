import ClientHome from "./components/clientHome";

export const dynamic = "force-dynamic";

/**
 * Root page component
 * 
 * Note: Authentication redirects are now handled by the middleware:
 * - Authenticated users visiting / are redirected to /home
 * - Unauthenticated users visiting protected routes are redirected to /auth
 * 
 * This page simply renders ClientHome which handles any remaining client-side
 * authentication logic for unauthenticated users.
 */
export default function Home() {
  return <ClientHome />;
}
