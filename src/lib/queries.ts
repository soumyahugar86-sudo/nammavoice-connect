import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
export const complaintsQuery = queryOptions({
  queryKey: ["complaints"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("complaints")
      .select("id,code,title,description,summary,category,urgency,status,area,latitude,longitude,photo_url,language,ai_source,created_at,updated_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return data;
  },
});
export type Complaint = import("@/integrations/supabase/types").Database["public"]["Tables"]["complaints"]["Row"];
