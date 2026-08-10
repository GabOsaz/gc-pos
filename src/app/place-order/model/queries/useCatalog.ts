import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiInstance, unwrap } from "../../../../libs/instance";
import type { PosServiceGroup, PosServiceItem } from "../types";

export interface CatalogSubcategory {
  id: number;
  name: string;
}

/**
 * `GET /pos/orders/catalog` — the POS service catalog, scoped to the logged-in
 * admin. The endpoint accepts a `search` param, but the catalogue is small and
 * mostly static: fetching it whole keeps filtering instant and keeps preference
 * names available for items already on the draft.
 */
export function useCatalog() {
  const query = useQuery({
    queryKey: ["pos", "catalog"],
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const res = await apiInstance.get("/pos/orders/catalog");
      return unwrap<PosServiceGroup[]>(res.data) ?? [];
    },
  });

  const services = useMemo(() => query.data ?? [], [query.data]);

  const items = useMemo<PosServiceItem[]>(
    () => services.flatMap((s) => s.service_items ?? []).filter((i) => i.is_active),
    [services]
  );

  // Subcategories are duplicated across services; dedupe by id for the tab row.
  const subcategories = useMemo<CatalogSubcategory[]>(() => {
    const seen = new Map<number, CatalogSubcategory>();
    services.forEach((service) =>
      (service.service_subcategories ?? [])
        .filter((sub) => sub.is_active)
        .forEach((sub) => seen.set(sub.id, { id: sub.id, name: sub.name }))
    );
    return [...seen.values()];
  }, [services]);

  return { ...query, services, items, subcategories };
}
