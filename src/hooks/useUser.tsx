import { supabase } from "$/supabase/client";
import { useEffect, useState } from "react";

export const useUser = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        setUserId(null);
      } else {
        setUserId(data.user?.id || null);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  return { userId, loading };
};
