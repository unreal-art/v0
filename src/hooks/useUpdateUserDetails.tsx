import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "$/supabase/client";

type UserData = {
  full_name: string;
  bio: string | null;
  display_name: string;
};

export const useUpdateUserDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      user,
      id,
    }: {
      user: UserData;
      id: string;
    }): Promise<void> => {
      const updates = {
        full_name: user.full_name,
        bio: user.bio,
        display_name: user.display_name,
      };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onMutate: async ({ user, id }) => {
      await queryClient.cancelQueries({ queryKey: ["user"] });
      await queryClient.cancelQueries({ queryKey: ["profile_data", id] });

      const previousUser = queryClient.getQueryData<{ user: UserData }>([
        "user",
      ]);

      const previousProfile = queryClient.getQueryData<UserData>([
        "profile_data",
        id,
      ]);

      queryClient.setQueryData(["user"], (oldData: any) => ({
        ...oldData,
        user: { ...oldData?.user, ...user },
      }));

      queryClient.setQueryData(["profile_data", id], (oldData: any) => ({
        ...oldData,
        ...user,
      }));

      return { previousUser, previousProfile, id };
    },
    onError: (_, __, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(["user"], context.previousUser);
      }

      if (context?.previousProfile) {
        queryClient.setQueryData(
          ["profile_data", context.id],
          context.previousProfile,
        );
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["profile_data", id] });
    },
  });
};
