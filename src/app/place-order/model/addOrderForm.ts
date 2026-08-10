/**
 * Draft capture for one catalogue item, before it is turned into
 * `order_items` by create-order or add-item.
 */
export interface AddOrderForm {
  serviceItemId: number;
  color: string | null;
  fabricTypeId: number | null;
  modifierIds: number[];
  preferenceItemId: number | null;
  defectTypeIds: number[];
  stainTypeIds: number[];
  hasAccessories: boolean;
  accessoryTypeIds: number[];
  /** No API equivalent — expands into this many identical `order_items`. */
  quantity: number;
  isHighValue: boolean;
  posNote: string;
}

export const defaultAddOrderForm: AddOrderForm = {
  serviceItemId: 0,
  color: null,
  fabricTypeId: null,
  modifierIds: [],
  preferenceItemId: null,
  defectTypeIds: [],
  stainTypeIds: [],
  hasAccessories: false,
  accessoryTypeIds: [],
  quantity: 1,
  isHighValue: false,
  posNote: "",
};
