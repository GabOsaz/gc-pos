import CustomModal from "../../../components/Modal";
import { formatNaira } from "../../../utils/money";
import {
  conflictsWithSelection,
  estimateLinePrice,
} from "../model/orderMapping";
import {
  useAccessoryTypes,
  useDefectTypes,
  useFabricTypes,
  useServiceItemModifiers,
  useStainTypes,
} from "../model/queries/useLookups";
import type { AddOrderForm } from "../model/addOrderForm";
import type { PosServiceItem } from "../model/types";

const COLOR_SWATCHES = [
  "#D1D5DB", "#FFFFFF", "#111827", "#3B3BCA", "#DC2626",
  "#16A34A", "#EA580C", "#14B8A6", "#EC4899", "#7C3AED",
  "#3B82F6", "#10B981", "#84CC16", "#EAB308",
];

interface AddOrderModalProps {
  product: PosServiceItem | null;
  form: AddOrderForm;
  onPatch: (patch: Partial<AddOrderForm>) => void;
  onCancel: () => void;
  onAddToOrder: () => void;
  isSaving?: boolean;
}

const selectClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-500 outline-none focus:border-brand-blue appearance-none bg-white";

const labelClass = "block text-sm font-medium text-brand-black mb-1.5";

/** Chip showing one selected lookup value; click removes it. */
function SelectedChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="px-3 py-1 rounded-full text-xs border border-brand-blue text-brand-blue bg-blue-50 cursor-pointer flex items-center gap-1.5"
    >
      {label}
      <span aria-hidden className="text-sm leading-none">×</span>
    </button>
  );
}

function AddOrderModal({
  product,
  form,
  onPatch,
  onCancel,
  onAddToOrder,
  isSaving,
}: AddOrderModalProps) {
  const { data: fabricTypes = [] } = useFabricTypes();
  const { data: defectTypes = [] } = useDefectTypes();
  const { data: stainTypes = [] } = useStainTypes();
  const { data: accessoryTypes = [] } = useAccessoryTypes();
  const { data: modifiers = [] } = useServiceItemModifiers();

  // Preferences are already embedded per service item on the catalog response.
  const preferenceOptions = (product?.preferences ?? []).filter((p) => p.is_active);
  const activeModifiers = modifiers.filter((m) => m.is_active);

  const selectedModifiers = activeModifiers.filter((m) => form.modifierIds.includes(m.id));
  const selectedPreference =
    preferenceOptions.find((p) => p.id === form.preferenceItemId) ?? null;

  const estimatedUnitPrice = estimateLinePrice(product, selectedModifiers, selectedPreference);

  const toggleId = (
    field: "modifierIds" | "defectTypeIds" | "stainTypeIds" | "accessoryTypeIds",
    id: number
  ) =>
    onPatch({
      [field]: form[field].includes(id)
        ? form[field].filter((value) => value !== id)
        : [...form[field], id],
    });

  const addId = (
    field: "modifierIds" | "defectTypeIds" | "stainTypeIds" | "accessoryTypeIds",
    id: number
  ) => {
    if (!id || form[field].includes(id)) return;
    onPatch({ [field]: [...form[field], id] });
  };

  const nameOf = (list: Array<{ id: number; name: string }>, id: number) =>
    list.find((entry) => entry.id === id)?.name ?? String(id);

  return (
    <CustomModal
      isOpen={!!product}
      handleCancel={onCancel}
      handleSave={onAddToOrder}
      handleSaveBtnText="Add to Order"
      isHandleSaveBtnLoading={isSaving}
      title="Add Order"
      subTitle="Generate bill to be sent to the customer for this order"
      canCloseAtTitle
      width="w-[1100px]"
    >
      <div className="px-5 sm:px-8 py-6 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left column */}
          <div className="flex-1 space-y-5">
            {/* Product info */}
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3">
              <div className="w-14 h-14 rounded-lg bg-[#1B2540] shrink-0" />
              <div>
                <p className="font-semibold text-brand-black">{product?.name}</p>
                {!!product?.pieces && (
                  <p className="text-sm text-gray-400">
                    {product.pieces} Piece{product.pieces > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>

            {/* Fabric type — the API holds a single fabric_type_id per item */}
            <div>
              <label className={labelClass}>Fabric Type</label>
              <select
                value={form.fabricTypeId ?? ""}
                onChange={(e) =>
                  onPatch({ fabricTypeId: e.target.value ? Number(e.target.value) : null })
                }
                className={selectClass}
              >
                <option value="">Select Fabric Type</option>
                {fabricTypes.map((fabric) => (
                  <option key={fabric.id} value={fabric.id}>
                    {fabric.name}
                  </option>
                ))}
              </select>
              {form.fabricTypeId && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <SelectedChip
                    label={nameOf(fabricTypes, form.fabricTypeId)}
                    onRemove={() => onPatch({ fabricTypeId: null })}
                  />
                </div>
              )}
            </div>

            {/* Packaging preference */}
            <div>
              <label className={labelClass}>Packaging preference</label>
              {preferenceOptions.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No preferences available for this service item.
                </p>
              ) : (
                <div className="flex flex-wrap gap-5">
                  {preferenceOptions.map((opt) => (
                    <label
                      key={opt.id}
                      className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="packaging"
                        checked={form.preferenceItemId === opt.id}
                        onChange={() => onPatch({ preferenceItemId: opt.id })}
                        className="accent-brand-blue"
                      />
                      {opt.name}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Accessories */}
            <div className="flex flex-col sm:flex-row gap-5 sm:gap-12 w-full">
              <div className="w-full sm:w-1/2 sm:border-r sm:border-gray-200">
                <label className={labelClass}>Accessories</label>
                <div className="flex gap-4">
                  {([true, false] as const).map((value) => (
                    <label
                      key={String(value)}
                      className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="accessories"
                        checked={form.hasAccessories === value}
                        onChange={() =>
                          onPatch({
                            hasAccessories: value,
                            accessoryTypeIds: value ? form.accessoryTypeIds : [],
                          })
                        }
                        className="accent-brand-blue"
                      />
                      {value ? "Yes" : "No"}
                    </label>
                  ))}
                </div>
              </div>
              {form.hasAccessories && (
                <div className="w-full sm:w-1/2">
                  <label className={labelClass}>Accessories Type</label>
                  <div className="flex flex-wrap gap-4">
                    {accessoryTypes.map((accessory) => (
                      <label
                        key={accessory.id}
                        className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={form.accessoryTypeIds.includes(accessory.id)}
                          onChange={() => toggleId("accessoryTypeIds", accessory.id)}
                          className="accent-brand-blue"
                        />
                        {accessory.name}
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    Each accessory adds an unpriced piece to this item.
                  </p>
                </div>
              )}
            </div>

            {/* Quantity + high value */}
            <div className="flex flex-col sm:flex-row gap-5 sm:gap-12 w-full">
              <div className="w-full sm:w-1/2 sm:border-r sm:border-gray-200">
                <label className={labelClass}>Quantity</label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => onPatch({ quantity: Math.max(1, form.quantity - 1) })}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer text-lg leading-none"
                  >
                    −
                  </button>
                  <span className="text-xl font-semibold w-8 text-center">
                    {String(form.quantity).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    onClick={() => onPatch({ quantity: form.quantity + 1 })}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer text-lg leading-none"
                  >
                    +
                  </button>
                </div>
                {form.quantity > 1 && (
                  <p className="text-xs text-gray-400 mt-1.5">
                    Adds {form.quantity} separate priced items.
                  </p>
                )}
              </div>

              <div className="w-full sm:w-1/2">
                <label className={labelClass}>ITEM of Extreme Value</label>
                <div className="flex gap-4">
                  {([true, false] as const).map((value) => (
                    <label
                      key={String(value)}
                      className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="extremeValue"
                        checked={form.isHighValue === value}
                        onChange={() => onPatch({ isHighValue: value })}
                        className="accent-brand-blue"
                      />
                      {value ? "Yes" : "No"}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex-1 space-y-5">
            {/* Colour swatches */}
            <div>
              <label className={labelClass}>Colour</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_SWATCHES.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() =>
                      onPatch({ color: form.color === color ? null : color })
                    }
                    className={`w-9 h-9 rounded-full border-2 transition-all cursor-pointer ${
                      form.color === color
                        ? "border-brand-blue scale-110"
                        : "border-gray-200"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Service modifiers */}
            <div>
              <label className={labelClass}>Service Modifier and Upcharge</label>
              <select
                value=""
                onChange={(e) => addId("modifierIds", Number(e.target.value))}
                className={selectClass}
              >
                <option value="">Select Option</option>
                {activeModifiers.map((modifier) => {
                  const disabled =
                    form.modifierIds.includes(modifier.id) ||
                    conflictsWithSelection(modifier, form.modifierIds, activeModifiers);
                  return (
                    <option key={modifier.id} value={modifier.id} disabled={disabled}>
                      {modifier.name}
                      {modifier.pricing_type === "PERCENTAGE"
                        ? ` (+${modifier.percentage_rate}%)`
                        : ` (+${formatNaira(modifier.flat_amount)})`}
                      {disabled && !form.modifierIds.includes(modifier.id)
                        ? " — conflicts"
                        : ""}
                    </option>
                  );
                })}
              </select>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.modifierIds.map((id) => (
                  <SelectedChip
                    key={id}
                    label={nameOf(activeModifiers, id)}
                    onRemove={() => toggleId("modifierIds", id)}
                  />
                ))}
              </div>
            </div>

            {/* Defects + stains */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Defects</label>
                <select
                  value=""
                  onChange={(e) => addId("defectTypeIds", Number(e.target.value))}
                  className={selectClass}
                >
                  <option value="">Select Defect</option>
                  {defectTypes.map((defect) => (
                    <option
                      key={defect.id}
                      value={defect.id}
                      disabled={form.defectTypeIds.includes(defect.id)}
                    >
                      {defect.name}
                    </option>
                  ))}
                </select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.defectTypeIds.map((id) => (
                    <SelectedChip
                      key={id}
                      label={nameOf(defectTypes, id)}
                      onRemove={() => toggleId("defectTypeIds", id)}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>Stains</label>
                <select
                  value=""
                  onChange={(e) => addId("stainTypeIds", Number(e.target.value))}
                  className={selectClass}
                >
                  <option value="">Select Stain</option>
                  {stainTypes.map((stain) => (
                    <option
                      key={stain.id}
                      value={stain.id}
                      disabled={form.stainTypeIds.includes(stain.id)}
                    >
                      {stain.name}
                    </option>
                  ))}
                </select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.stainTypeIds.map((id) => (
                    <SelectedChip
                      key={id}
                      label={nameOf(stainTypes, id)}
                      onRemove={() => toggleId("stainTypeIds", id)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* POS note */}
            <div>
              <label className={labelClass}>Description (optional)</label>
              <textarea
                value={form.posNote}
                onChange={(e) => onPatch({ posNote: e.target.value })}
                placeholder="Enter text"
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-500 outline-none focus:border-brand-blue resize-none bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Estimated price — the draft's server totals remain authoritative */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div>
            <span className="text-base font-semibold text-brand-black">Price</span>
            <p className="text-xs text-gray-400">
              Estimate before tax{form.quantity > 1 ? ` · ${form.quantity} × ${formatNaira(estimatedUnitPrice)}` : ""}
            </p>
          </div>
          <span className="text-lg font-bold text-brand-black">
            {formatNaira(estimatedUnitPrice * form.quantity)}
          </span>
        </div>
      </div>
    </CustomModal>
  );
}

export default AddOrderModal;
