import { ReactNode, useState } from "react";
import { createClient } from "$/supabase/client";
import config from "$/config";

interface AuthBtnProps {
  icon: ReactNode;
  children: string;
  provider: string;
}

export default function AuthBtn({ icon, children, provider }: AuthBtnProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = () => {
    const redirectTo = `${config.domainName}/api/auth/callback`;
    setLoading(true);
    const supabase = createClient();
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${redirectTo}`,
      },
    });
    setLoading(false);
  };

  const login = () => {
    if (provider == "google") {
      handleGoogleSignIn();
    }
  };
  return (
    <button
      onClick={login}
      className="border-primary-9 text-primary-6 rounded-full flex justify-center items-center h-10 w-[276px] border-[1px]"
    >
      <div className="mx-3">{icon}</div>
      <p>{children}</p>
    </button>
  );
}
