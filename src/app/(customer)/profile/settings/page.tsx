"use client";

import { useSelector } from "react-redux";
import { Icon } from "@iconify/react";
import { RootState } from "@/lib/redux/store";
import ProfileNavMobile from "@/components/profile/ProfileNavMobile";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function InfoField({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-inter font-normal text-[12px] lg:text-[14px] leading-none text-[#4B4B4B]">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none">
          <Icon icon={icon} width={18} height={18} />
        </div>
        <input
          type="text"
          value={value}
          readOnly
          className="w-full h-10 pl-9 pr-3 border border-[#C9C9C9] rounded-[3px] bg-[#F8F8F8] font-inter lg:font-montserrat font-normal text-[14px] leading-6 lg:leading-normal tracking-[0.02em] lg:tracking-normal text-justify lg:text-left text-[#4B4B4B] outline-none cursor-default select-none"
        />
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 border border-[#D4D4D4] rounded-[5px] bg-[#F8F8F8] px-4 py-3">
      <Icon icon={icon} width={20} height={20} className="shrink-0 text-[#575F6E]" />
      <div className="flex flex-col gap-1">
        <span className="font-montserrat font-normal text-[12px] leading-4 text-[#575F6E]">
          {label}
        </span>
        <span className="font-montserrat font-medium text-[14px] leading-none text-black">
          {value}
        </span>
      </div>
    </div>
  );
}

export default function ProfileSettingsPage() {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) return null;

  return (
    <div className="flex flex-col gap-5">
      {/* Page title — centered on mobile, left-aligned on desktop */}
      <div className="w-fit mx-auto lg:mx-0 text-center">
        <h1 className="font-montserrat font-medium text-[18px] lg:text-[24px] leading-none text-black">
          My Profile
        </h1>
        <div className="h-0.5 bg-primary mt-1.5" />
      </div>

      {/* Mobile: User Settings dropdown */}
      <ProfileNavMobile />

      {/* Profile Information */}
      <div className="border border-[#E2E4E5] rounded-lg px-5 lg:px-8 py-5 flex flex-col gap-5">
        <h2 className="font-montserrat font-semibold text-[20px] leading-7 text-black">
          Profile Information
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <InfoField icon="mynaui:user" label="First Name" value={user.firstName || "—"} />
          <InfoField icon="mynaui:user" label="Last Name" value={user.lastName || "—"} />
          <InfoField icon="iconamoon:email-light" label="Email" value={user.email} />
          <InfoField icon="solar:phone-linear" label="Phone Number" value={user.phone || "—"} />
        </div>
      </div>

      {/* Account Information */}
      <div className="border border-[#E2E4E5] rounded-lg px-5 lg:px-8 py-5 flex flex-col gap-5">
        <h2 className="font-montserrat font-semibold text-[20px] leading-7 text-black">
          Account Information
        </h2>
        <div className="flex flex-col gap-3">
          <InfoCard
            icon="hugeicons:calendar-01"
            label="Member Since"
            value={formatDate(user.createdAt)}
          />
          <InfoCard
            icon="hugeicons:user-02"
            label="Account Type"
            value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          />
        </div>
      </div>
    </div>
  );
}
