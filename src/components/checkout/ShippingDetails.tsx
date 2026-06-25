"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";
import { ShippingInfo } from "@/types/checkout.types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { NEPAL_PROVINCES, NEPAL_DISTRICTS, ESEWA_QR_CODE } from "@/constants/checkout";

const fmt = (price: number) =>
  `Rs. ${Math.round(price).toLocaleString("en-NP")}`;

const LBL = "font-inter font-normal text-[12px] lg:text-[14px] leading-none text-foreground block mb-1.5";

const SELECT =
  "w-full h-8.75 lg:h-10 px-3 border border-input rounded-md bg-background text-[12px] lg:text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none";

const INP = "h-8.75 lg:h-9 text-[12px] md:text-[12px] lg:text-sm";

interface Props {
  shippingInfo: ShippingInfo;
  onShippingChange: (info: ShippingInfo) => void;
  formErrors: Record<string, string>;
  paymentMethod: "cod" | "qr";
  onPaymentMethodChange: (method: "cod" | "qr") => void;
  transactionNumber: string;
  onTransactionNumberChange: (val: string) => void;
  customerNote: string;
  onCustomerNoteChange: (val: string) => void;
  total: number;
}

export default function ShippingDetails({
  shippingInfo,
  onShippingChange,
  formErrors,
  paymentMethod,
  onPaymentMethodChange,
  transactionNumber,
  onTransactionNumberChange,
  customerNote,
  onCustomerNoteChange,
  total,
}: Props) {
  const update = (field: keyof ShippingInfo, value: string) =>
    onShippingChange({ ...shippingInfo, [field]: value });

  return (
    <div className="flex flex-col gap-5 lg:gap-6">
      {/* Shipping Information */}
      <div className="border border-[#E2E4E5] rounded-lg p-6">
        <h2 className="font-montserrat font-semibold text-[18px] lg:text-[20px] leading-none text-black mb-6">
          Shipping Information
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-5 gap-y-5">
          {/* Full Name */}
          <div className="lg:col-span-2">
            <label htmlFor="fullName" className={LBL}>
              Full Name <span className="text-red-600">*</span>
            </label>
            <Input
              id="fullName"
              value={shippingInfo.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              placeholder="Enter your full name"
              className={`${INP} ${formErrors.fullName ? "border-red-500" : ""}`}
            />
            {formErrors.fullName && (
              <p className="text-xs text-red-600 mt-1">{formErrors.fullName}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className={LBL}>
              Phone Number <span className="text-red-600">*</span>
            </label>
            <Input
              id="phone"
              value={shippingInfo.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="9841234567"
              className={`${INP} ${formErrors.phone ? "border-red-500" : ""}`}
            />
            {formErrors.phone && (
              <p className="text-xs text-red-600 mt-1">{formErrors.phone}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className={LBL}>
              Email <span className="text-red-600">*</span>
            </label>
            <Input
              id="email"
              type="email"
              value={shippingInfo.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="your@email.com"
              className={`${INP} ${formErrors.email ? "border-red-500" : ""}`}
            />
            {formErrors.email && (
              <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>
            )}
          </div>

          {/* Address Line 1 */}
          <div>
            <label htmlFor="addressLine1" className={LBL}>
              Address Line 1 <span className="text-red-600">*</span>
            </label>
            <Input
              id="addressLine1"
              value={shippingInfo.addressLine1}
              onChange={(e) => update("addressLine1", e.target.value)}
              placeholder="Street address, P.O. box"
              className={`${INP} ${formErrors.addressLine1 ? "border-red-500" : ""}`}
            />
            {formErrors.addressLine1 && (
              <p className="text-xs text-red-600 mt-1">{formErrors.addressLine1}</p>
            )}
          </div>

          {/* Address Line 2 */}
          <div>
            <label htmlFor="addressLine2" className={LBL}>
              Address Line 2
            </label>
            <Input
              id="addressLine2"
              value={shippingInfo.addressLine2 ?? ""}
              onChange={(e) => update("addressLine2", e.target.value)}
              placeholder="Apartment, suite, unit, etc."
              className={INP}
            />
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className={LBL}>
              City / District <span className="text-red-600">*</span>
            </label>
            <select
              id="city"
              value={shippingInfo.city}
              onChange={(e) => update("city", e.target.value)}
              className={`${SELECT} ${formErrors.city ? "border-red-500" : ""}`}
            >
              <option value="">Select District</option>
              {NEPAL_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            {formErrors.city && (
              <p className="text-xs text-red-600 mt-1">{formErrors.city}</p>
            )}
            <div className="flex items-start gap-1.5 mt-1.5">
              <Icon icon="ph:info-thin" width={14} height={14} className="text-[#575F6E] shrink-0 mt-px" />
              <p className="font-montserrat font-light text-[11px] lg:text-[12px] leading-4 text-[#575F6E]">
                Inside Kathmandu Valley: Rs. 100<br />
                Outside Valley: Rs. 200.
              </p>
            </div>
          </div>

          {/* Province */}
          <div>
            <label htmlFor="province" className={LBL}>
              Province <span className="text-red-600">*</span>
            </label>
            <select
              id="province"
              value={shippingInfo.province}
              onChange={(e) => update("province", e.target.value)}
              className={`${SELECT} ${formErrors.province ? "border-red-500" : ""}`}
            >
              <option value="">Select Province</option>
              {NEPAL_PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {formErrors.province && (
              <p className="text-xs text-red-600 mt-1">{formErrors.province}</p>
            )}
          </div>

          {/* Landmark */}
          <div>
            <label htmlFor="landmark" className={LBL}>
              Landmark <span className="text-red-600">*</span>
            </label>
            <Input
              id="landmark"
              value={shippingInfo.landmark}
              onChange={(e) => update("landmark", e.target.value)}
              placeholder="Near ABC School"
              className={`${INP} ${formErrors.landmark ? "border-red-500" : ""}`}
            />
            {formErrors.landmark && (
              <p className="text-xs text-red-600 mt-1">{formErrors.landmark}</p>
            )}
          </div>

          {/* Postal Code */}
          <div>
            <label htmlFor="postalCode" className={LBL}>
              Postal Code <span className="text-red-600">*</span>
            </label>
            <Input
              id="postalCode"
              value={shippingInfo.postalCode}
              onChange={(e) => update("postalCode", e.target.value)}
              placeholder="44600"
              className={`${INP} ${formErrors.postalCode ? "border-red-500" : ""}`}
            />
            {formErrors.postalCode && (
              <p className="text-xs text-red-600 mt-1">{formErrors.postalCode}</p>
            )}
          </div>

          {/* Order Note */}
          <div className="lg:col-span-2">
            <label htmlFor="customerNote" className={LBL}>
              Order Note
            </label>
            <Textarea
              id="customerNote"
              value={customerNote}
              onChange={(e) => onCustomerNoteChange(e.target.value)}
              placeholder="Special delivery instructions, gate code, preferred time, etc."
              rows={3}
              className="text-[12px] md:text-[12px] lg:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="border border-[#E2E4E5] rounded-lg p-6">
        <h2 className="font-montserrat font-semibold text-[18px] lg:text-[20px] leading-none text-black mb-6">
          Payment Method
        </h2>

        <RadioGroup
          value={paymentMethod}
          onValueChange={(v) => onPaymentMethodChange(v as "cod" | "qr")}
        >
          <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg mb-3 hover:border-black transition-colors cursor-pointer">
            <RadioGroupItem value="cod" id="cod" />
            <label htmlFor="cod" className="flex-1 cursor-pointer flex items-center gap-3">
              <Icon icon="iconoir:wallet" width={20} height={20} className="text-gray-600 shrink-0" />
              <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-3">
                <span className="font-montserrat font-medium text-[14px] leading-none text-black">
                  Cash on Delivery
                </span>
                <span className="font-montserrat font-normal text-[12px] leading-4 text-[#575F6E]">
                  Pay with cash when your order is delivered
                </span>
              </div>
            </label>
          </div>

          <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:border-black transition-colors cursor-pointer">
            <RadioGroupItem value="qr" id="qr" className="mt-0.75" />
            <label htmlFor="qr" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-3">
                <Icon icon="bx:qr" width={20} height={20} className="text-gray-600 shrink-0" />
                <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-3">
                  <span className="font-montserrat font-medium text-[14px] leading-none text-black">
                    Pay via QR (eSewa)
                  </span>
                  <span className="font-montserrat font-normal text-[12px] leading-4 text-[#575F6E]">
                    Scan QR code and pay using eSewa
                  </span>
                </div>
              </div>

              {paymentMethod === "qr" && (
                <div className="mt-4 flex flex-col gap-4">
                  {/* QR image + instructions — stacked on mobile, side by side on desktop */}
                  <div className="flex flex-col lg:flex-row gap-5 items-start">
                    {/* QR Image */}
                    <div className="relative shrink-0 w-60 h-60 border border-[#C9C9C9] rounded-[20px] bg-white overflow-hidden">
                      <Image
                        src={ESEWA_QR_CODE}
                        alt="eSewa QR Code"
                        fill
                        className="object-contain p-2"
                        priority
                      />
                    </div>

                    {/* Instructions */}
                    <div className="flex flex-col gap-2">
                      <p className="font-montserrat font-semibold text-[12px] leading-4 text-[#575F6E]">
                        Payment Instructions:
                      </p>
                      <ol className="flex flex-col gap-1.5">
                        {[
                          "Open your eSewa mobile app.",
                          'Tap on "Scan QR" from the home screen.',
                          "Point your camera at the QR code above.",
                          `Enter the amount: ${fmt(total)}.`,
                          "Complete the payment.",
                          "Copy the transaction code and enter it below.",
                        ].map((step, i) => (
                          <li
                            key={i}
                            className="font-montserrat font-semibold text-[12px] leading-4 text-[#575F6E]"
                          >
                            {i + 1}. {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {/* Transaction Number */}
                  <div>
                    <label htmlFor="transactionNumber" className={LBL}>
                      Transaction Number <span className="text-red-600">*</span>
                    </label>
                    <Input
                      id="transactionNumber"
                      value={transactionNumber}
                      onChange={(e) => onTransactionNumberChange(e.target.value)}
                      placeholder="Enter transaction number from eSewa"
                      className={`${INP} ${formErrors.transactionNumber ? "border-red-500" : ""}`}
                    />
                    {formErrors.transactionNumber && (
                      <p className="text-xs text-red-600 mt-1">
                        {formErrors.transactionNumber}
                      </p>
                    )}
                    <div className="flex items-start gap-1.5 mt-1.5">
                      <Icon icon="ph:info-thin" width={14} height={14} className="text-[#575F6E] shrink-0 mt-px" />
                      <p className="font-montserrat font-light text-[11px] lg:text-[12px] leading-4 text-[#575F6E]">
                        After Payment, enter the transaction code shown in eSewa.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
