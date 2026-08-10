import { useState } from "react";
import CustomModal from "../../../components/Modal";
import { appToast } from "../../../libs";
import apiErrFn from "../../../utils/apiErrFn";
import { validateEmail, validatePhoneNumber } from "../../../utils/inputValidationSchema";
import { useCreateCustomer } from "../model/mutations/useCreateCustomer";
import type { PosCustomerSummary } from "../model/types";

interface AddCustomerModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onAddCustomer: (customer: PosCustomerSummary) => void;
}

interface AddCustomerForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  deliveryAddress: string;
}

const defaultForm: AddCustomerForm = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  deliveryAddress: "",
};

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-brand-blue bg-gray-50";

function AddCustomerModal({ isOpen, onCancel, onAddCustomer }: AddCustomerModalProps) {
  const [form, setForm] = useState<AddCustomerForm>(defaultForm);
  const { mutate: createCustomer, isPending } = useCreateCustomer();

  const patch = (p: Partial<AddCustomerForm>) => setForm((prev) => ({ ...prev, ...p }));

  const reset = () => setForm(defaultForm);

  const handleSave = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      appToast.error("First and last name are required");
      return;
    }
    if (validateEmail(form.email)) {
      appToast.error("Enter a valid email address");
      return;
    }
    if (validatePhoneNumber(form.phoneNumber)) {
      appToast.error("Enter a valid 11-digit phone number");
      return;
    }

    createCustomer(
      {
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phoneNumber.trim(),
        ...(form.deliveryAddress.trim() ? { address: form.deliveryAddress.trim() } : {}),
      },
      {
        onSuccess: (response) => {
          appToast.success(response.message || "Customer created");
          reset();
          onAddCustomer(response.data);
        },
        // A duplicate email or phone comes back as a 409.
        onError: (error) => apiErrFn(error, "Could not create customer"),
      }
    );
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  return (
    <CustomModal
      isOpen={isOpen}
      handleCancel={handleCancel}
      handleSave={handleSave}
      handleSaveBtnText="Add Customer"
      isHandleSaveBtnLoading={isPending}
      title="Add New Customer"
      subTitle="Creates a local POS customer account"
      canCloseAtTitle
      width="w-[440px]"
      centered
    >
      <div className="px-5 sm:px-8 py-6 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-brand-black mb-1.5">
              First Name
            </label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => patch({ firstName: e.target.value })}
              placeholder="Tobi"
              className={inputClass}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-brand-black mb-1.5">
              Last Name
            </label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => patch({ lastName: e.target.value })}
              placeholder="Joseph"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-black mb-1.5">
            Customer Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => patch({ email: e.target.value })}
            placeholder="Pjoseph233@gmail.com"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-black mb-1.5">
            Phone Number
          </label>
          <input
            type="tel"
            value={form.phoneNumber}
            onChange={(e) => patch({ phoneNumber: e.target.value })}
            placeholder="08081290122"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-black mb-1.5">
            Delivery Address (Optional)
          </label>
          <input
            type="text"
            value={form.deliveryAddress}
            onChange={(e) => patch({ deliveryAddress: e.target.value })}
            placeholder="Enter Address"
            className={inputClass}
          />
        </div>
      </div>
    </CustomModal>
  );
}

export default AddCustomerModal;
