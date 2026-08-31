"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useUpdateProfileMutation,
  useChangePasswordMutation,
} from "@/lib/redux/features/auth/authApi";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { updateUser, logout } from "@/lib/redux/features/auth/authSlice";
import { ROUTES } from "@/constants/routes";
import { isScopedVendor } from "@/constants/roles";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2, AlertCircle, KeyRound, CheckCircle } from "lucide-react";

export default function AdminSettingsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const isVendor = isScopedVendor(user?.role);

  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChanging }] =
    useChangePasswordMutation();

  // ---- Profile form ----
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [profileMsg, setProfileMsg] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      setPhone(user.phone ?? "");
      setCompanyName(user.companyName ?? "");
      setLogoUrl(user.logoUrl ?? "");
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    try {
      const res = await updateProfile({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        phone: phone.trim() || undefined,
        ...(isVendor
          ? {
              companyName: companyName.trim() || undefined,
              logoUrl: logoUrl.trim() || undefined,
            }
          : {}),
      }).unwrap();
      // Keep the cached user (header, sidebar) in sync.
      dispatch(updateUser(res.data));
      setProfileMsg({ type: "ok", text: "Profile updated successfully." });
    } catch (err: any) {
      setProfileMsg({
        type: "err",
        text: err?.data?.message || "Failed to update profile.",
      });
    }
  };

  // ---- Password form ----
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwMsg, setPwMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);

    if (!currentPassword || !newPassword) {
      setPwMsg({ type: "err", text: "All password fields are required." });
      return;
    }
    if (newPassword.length < 8) {
      setPwMsg({
        type: "err",
        text: "New password must be at least 8 characters.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: "err", text: "New passwords do not match." });
      return;
    }
    if (newPassword === currentPassword) {
      setPwMsg({
        type: "err",
        text: "New password must be different from the current password.",
      });
      return;
    }

    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      // Changing the password revokes every existing session (this one
      // included), so the current token is now dead. Sign out cleanly and send
      // the user back to login instead of letting the next request 401.
      setPwMsg({
        type: "ok",
        text: "Password changed. Please sign in again with your new password.",
      });
      setTimeout(() => {
        dispatch(logout());
        router.push(ROUTES.LOGIN);
      }, 1800);
    } catch (err: any) {
      setPwMsg({
        type: "err",
        text: err?.data?.message || "Failed to change password.",
      });
    }
  };

  const Notice = ({
    msg,
  }: {
    msg: { type: "ok" | "err"; text: string } | null;
  }) =>
    msg ? (
      <p
        className={
          "text-sm flex items-center gap-1 " +
          (msg.type === "ok" ? "text-green-600" : "text-primary")
        }
      >
        {msg.type === "ok" ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        {msg.text}
      </p>
    ) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your {isVendor ? "vendor" : "account"} profile and password
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              {isVendor
                ? "Your company details shown across the store."
                : "Your account details."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {isVendor && (
                <>
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Your company / store name"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input
                      id="logoUrl"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://.../logo.png"
                      className="mt-2"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input value={user?.email ?? ""} disabled className="mt-2" />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed.
                </p>
              </div>

              <Notice msg={profileMsg} />

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change password */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Enter your current password and choose a new one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-2"
                />
              </div>

              <Notice msg={pwMsg} />

              <div className="flex justify-end">
                <Button type="submit" variant="outline" disabled={isChanging}>
                  {isChanging ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4 mr-2" />
                      Change Password
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
