import { useQuery } from "@tanstack/react-query";
import { apiInstance, unwrap } from "../libs/instance";

export interface AdminProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  profile_image: string;
  store_location: {
    id: number;
    name: string;
    address: string;
    is_head_office: boolean;
  } | null;
  role_name?: string;
  role_slug?: string;
  status: number;
}

export const adminProfileKey = ["admin", "profile"] as const;

/** `GET /admins/profile` — the signed-in admin, used for the app shell header. */
export function useAdminProfile() {
  return useQuery({
    queryKey: adminProfileKey,
    queryFn: async () => {
      const res = await apiInstance.get("/admins/profile");
      return unwrap<AdminProfile>(res.data);
    },
    staleTime: 1000 * 60 * 5,
  });
}
