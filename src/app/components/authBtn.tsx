"use client";
import { ReactNode, useState } from "react";
import { createClient } from "$/supabase/client";
import config from "$/config";
import { Provider } from "@supabase/supabase-js";

interface AuthBtnProps {
  icon: ReactNode;
  children: string;
  provider: Provider;
}

export default function AuthBtn({ icon, children, provider }: AuthBtnProps) {
  const [, setLoading] = useState(false);

  const handleSignIn = () => {
    const redirectTo = `${config.domainName}/api/auth/callback`;
    setLoading(true);
    const supabase = createClient();
    supabase.auth.signInWithOAuth({
      provider: provider ? provider : ("" as Provider),
      options: {
        redirectTo: `${redirectTo}`,
      },
    });
    setLoading(false);
  };

  return (
    <button
      onClick={handleSignIn}
      className="border-primary-9 text-primary-6 rounded-full flex justify-center items-center h-10 w-[276px] border-[1px]"
    >
      {icon}
      <p className="block w-40">{children}</p>
    </button>
  );
}
