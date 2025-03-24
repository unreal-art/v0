import { redirect } from "next/navigation";
import { createClient as createServerClient } from "$/supabase/server";
import ClientHome from "./components/clientHome";

// Server-side auth check
async function getSession() {
  try {
    const supabase = await createServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error("Error checking session:", error);
    return null;
  }
}

// Server component for initial auth check
export default async function Home() {
  const session = await getSession();

  // Server-side redirect if authenticated
  if (session) {
    redirect("/home");
  }

  // If not authenticated, render client component for further checks
  return <ClientHome />;
}
