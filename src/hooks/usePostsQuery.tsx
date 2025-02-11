import { getPosts } from "$/queries/post/getPosts";
import { Client, supabase } from "$/supabase/client";

import { Post } from "$/types/data.types";
import { useQuery } from "@tanstack/react-query";

export function usePostsQuery(start: number, end: number) {
  return useQuery<Post[], Error>({
    queryKey: ["posts"],
    queryFn: async (): Promise<Post[]> => {
      const result = await getPosts(supabase, start, end);
      return result ?? []; // Ensure it always returns an array
    },
  });
}

//export default useOrganizationQuery;
// function usePostsQuery(organizationId: number) {

//  const queryKey = ['posts', organizationI];

//  const queryFn = async () => {
//    return getOrganizationById(supabase, organizationId).then(
//      (result) => result.data
//    );
//  };

//  return useQuery({ queryKey, queryFn });
// }

// export default useOrganizationQuery;
