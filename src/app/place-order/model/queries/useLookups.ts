import { useQuery } from "@tanstack/react-query";
import { apiInstance, unwrap } from "../../../../libs/instance";
import type {
  PosAccessoryType,
  PosConfig,
  PosServiceItemModifier,
  PosTypeLookup,
} from "../../../../model/pos/types";

/** Lookups change rarely — hold them for the session rather than refetching per modal open. */
const LOOKUP_STALE_TIME = 1000 * 60 * 30;

function lookupQuery<T>(key: string, path: string) {
  return {
    queryKey: ["pos", "lookup", key],
    queryFn: async () => {
      const res = await apiInstance.get(`/pos/orders/catalog/${path}`);
      return unwrap<T[]>(res.data) ?? [];
    },
    staleTime: LOOKUP_STALE_TIME,
  };
}

export const useFabricTypes = () =>
  useQuery(lookupQuery<PosTypeLookup>("fabric-types", "fabric-types"));

export const useDefectTypes = () =>
  useQuery(lookupQuery<PosTypeLookup>("defect-types", "defect-types"));

export const useStainTypes = () =>
  useQuery(lookupQuery<PosTypeLookup>("stain-types", "stain-types"));

export const useAccessoryTypes = () =>
  useQuery(lookupQuery<PosAccessoryType>("accessory-types", "accessory-types"));

export const useServiceItemModifiers = () =>
  useQuery(
    lookupQuery<PosServiceItemModifier>("service-item-modifiers", "service-item-modifiers")
  );

/** `GET /pos/orders/catalog/config` — tax config, used only for pre-draft estimates. */
export const usePosConfig = () =>
  useQuery({
    queryKey: ["pos", "config"],
    queryFn: async () => {
      const res = await apiInstance.get("/pos/orders/catalog/config");
      return unwrap<PosConfig>(res.data);
    },
    staleTime: LOOKUP_STALE_TIME,
  });
