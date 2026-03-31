"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  Save,
  Edit3,
  X,
  Shield,
  LogOut,
  KeyRound,
  Check,
  Eye,
  EyeOff,
  ChevronRight,
  Mail,
  CalendarDays,
  User2,
  Sparkles,
} from "lucide-react";
import { ME_QUERY } from "@/app/lib/graphql/queries/index";
import { UPDATE_PROFILE_MUTATION } from "@/app/lib/graphql/mutations/auth.mutations";
import {
  useSendPasswordResetOtp,
  useVerifyPasswordResetOtp,
  useResetPassword,
} from "@/app/lib/hooks/index";
import { useUploadProfilePicture } from "@/app/lib/hooks/index";
import { useLogout } from "@/app/lib/hooks/index";

interface User {
  id: string;
  email: string;
  name?: string;
  about?: string;
  profilePicture?: string;
  googleId?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({
  src,
  name,
  size = "lg",
}: {
  src?: string | null;
  name?: string;
  size?: "lg" | "sm";
}) {
  const sizeClass =
    size === "lg" ? "h-28 w-28 text-4xl" : "h-10 w-10 text-base";
  const initial = name?.trim().charAt(0).toUpperCase() || "?";
  if (src) {
    return (
      <img
        src={src}
        alt="Profile"
        className={`${sizeClass} rounded-3xl object-cover ring-4 ring-white/10 shadow-2xl`}
      />
    );
  }
  return (
    <div
      className={`${sizeClass} rounded-3xl ring-4 ring-white/10 shadow-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 flex items-center justify-center font-bold text-white select-none shrink-0`}
    >
      {initial}
    </div>
  );
}

// ─── OTP Input ─────────────────────────────────────────────────────────────────
function OtpInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    refs.current.forEach((el, i) => {
      if (el) el.value = value[i] ?? "";
    });
  }, [value]);

  const buildValue = () => refs.current.map((el) => el?.value ?? "").join("");

  const handleInput = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw.length > 1) {
      const chars = raw.slice(0, 6 - i).split("");
      chars.forEach((ch, offset) => {
        const el = refs.current[i + offset];
        if (el) el.value = ch;
      });
      const nextFocus = Math.min(i + chars.length, 5);
      refs.current[nextFocus]?.focus();
    } else {
      e.target.value = raw.slice(-1);
      if (raw) refs.current[i + 1]?.focus();
    }
    onChange(buildValue());
  };

  const handleKeyDown = (
    i: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (!refs.current[i]?.value && i > 0) {
        const el = refs.current[i - 1];
        if (el) {
          el.value = "";
          el.focus();
        }
        onChange(buildValue());
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < 5) {
      refs.current[i + 1]?.focus();
    }
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={6}
          defaultValue=""
          onInput={(e) =>
            handleInput(i, e as React.ChangeEvent<HTMLInputElement>)
          }
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          className="w-12 h-14 text-center text-xl font-bold rounded-2xl border-2 border-white/10 bg-white/5 text-white outline-none transition-all duration-200 focus:border-violet-400 focus:bg-violet-500/10 focus:ring-2 focus:ring-violet-400/30 caret-transparent"
        />
      ))}
    </div>
  );
}

// ─── Reset Password Modal ───────────────────────────────────────────────────────
type ResetStep = "send" | "verify" | "reset" | "done";

function ResetPasswordModal({
  email,
  onClose,
}: {
  email: string;
  onClose: () => void;
}) {
  const [step, setStep] = useState<ResetStep>("send");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const { sendPasswordResetOtp, loading: sending } = useSendPasswordResetOtp();
  const { verifyPasswordResetOtp, loading: verifying } =
    useVerifyPasswordResetOtp();
  const { resetPassword, loading: resetting } = useResetPassword();

  const handleSend = async () => {
    setErrMsg("");
    const res = await sendPasswordResetOtp(email);
    if (res?.success) setStep("verify");
    else setErrMsg(res?.message || "Failed to send OTP. Try again.");
  };

  const handleVerify = async () => {
    const clean = otp.replace(/\s/g, "");
    if (clean.length < 6) {
      setErrMsg("Enter all 6 digits.");
      return;
    }
    setErrMsg("");
    const res = await verifyPasswordResetOtp(email, clean);
    if (res?.success) setStep("reset");
    else setErrMsg(res?.message || "Invalid OTP. Try again.");
  };

  const handleReset = async () => {
    if (newPassword.length < 8) {
      setErrMsg("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrMsg("Passwords do not match.");
      return;
    }
    setErrMsg("");
    const res = await resetPassword(email, newPassword);
    if (res?.success) setStep("done");
    else setErrMsg(res?.message || "Reset failed. Try again.");
  };

  const strengthLevel =
    newPassword.length === 0
      ? 0
      : newPassword.length < 6
        ? 1
        : newPassword.length < 8
          ? 2
          : newPassword.length < 12
            ? 3
            : 4;

  const strengthColors = [
    "bg-white/10",
    "bg-red-500",
    "bg-amber-500",
    "bg-yellow-400",
    "bg-emerald-400",
  ];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  const steps = ["Send OTP", "Verify", "New Password"];
  const stepIdx = { send: 0, verify: 1, reset: 2, done: 3 }[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-lg"
        onClick={step !== "done" ? undefined : onClose}
      />

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0d0d1a] shadow-[0_0_80px_rgba(139,92,246,0.15)] overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-pink-500" />

        <div className="p-8">
          <div className="flex items-start justify-between mb-7">
            <div>
              <h2 className="syne text-2xl font-bold text-white">
                Reset Password
              </h2>
              <p className="text-sm text-white/40 mt-1">{email}</p>
            </div>
            {step !== "done" && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-white/30 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {step !== "done" && (
            <div className="flex items-center gap-1 mb-8">
              {steps.map((label, i) => (
                <div
                  key={label}
                  className="flex items-center flex-1 last:flex-none"
                >
                  <div className="flex items-center gap-2 shrink-0">
                    <div
                      className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold transition-all duration-300 ${
                        stepIdx > i
                          ? "bg-violet-500 text-white"
                          : stepIdx === i
                            ? "bg-white text-black scale-110"
                            : "bg-white/10 text-white/30"
                      }`}
                    >
                      {stepIdx > i ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </div>
                    <span
                      className={`text-xs font-medium whitespace-nowrap transition-all ${
                        stepIdx === i ? "text-white" : "text-white/25"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`flex-1 h-px mx-3 rounded-full transition-all duration-500 ${
                        stepIdx > i ? "bg-violet-500" : "bg-white/10"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {errMsg && (
            <div className="mb-5 flex items-center gap-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3.5 text-sm text-red-400">
              <X className="h-4 w-4 shrink-0" />
              {errMsg}
            </div>
          )}

          {step === "send" && (
            <div className="space-y-5">
              <div className="rounded-2xl bg-white/[0.04] border border-white/8 p-5 text-sm text-white/55 leading-relaxed">
                <p>We'll send a 6-digit verification code to</p>
                <p className="text-white font-semibold mt-1">{email}</p>
              </div>
              <button
                onClick={handleSend}
                disabled={sending}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 transition-all shadow-lg shadow-violet-500/25 active:scale-[0.98]"
              >
                {sending ? "Sending…" : "Send Verification Code"}
              </button>
            </div>
          )}

          {step === "verify" && (
            <div className="space-y-6">
              <p className="text-sm text-white/40 text-center">
                Enter the 6-digit code sent to your email
              </p>
              <OtpInput value={otp} onChange={setOtp} />
              <button
                onClick={handleVerify}
                disabled={verifying}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 transition-all shadow-lg shadow-violet-500/25 active:scale-[0.98]"
              >
                {verifying ? "Verifying…" : "Verify Code"}
              </button>
              <button
                onClick={() => {
                  setOtp("");
                  handleSend();
                }}
                className="w-full text-xs text-white/25 hover:text-white/50 transition-colors"
              >
                Didn't receive it? Resend code
              </button>
            </div>
          )}

          {step === "reset" && (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 pr-12 text-sm text-white placeholder-white/25 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                >
                  {showPw ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {newPassword.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          n <= strengthLevel
                            ? strengthColors[strengthLevel]
                            : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                  <p
                    className={`text-xs ${strengthColors[strengthLevel].replace(
                      "bg-",
                      "text-",
                    )}`}
                  >
                    {strengthLabels[strengthLevel]}
                  </p>
                </div>
              )}

              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 pr-12 text-sm text-white placeholder-white/25 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {confirmPassword.length > 0 && (
                <p
                  className={`text-xs flex items-center gap-1.5 ${
                    newPassword === confirmPassword
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {newPassword === confirmPassword ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Passwords match
                    </>
                  ) : (
                    <>
                      <X className="h-3.5 w-3.5" /> Passwords do not match
                    </>
                  )}
                </p>
              )}

              <button
                onClick={handleReset}
                disabled={resetting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 transition-all shadow-lg shadow-violet-500/25 active:scale-[0.98]"
              >
                {resetting ? "Updating…" : "Update Password"}
              </button>
            </div>
          )}

          {step === "done" && (
            <div className="text-center space-y-6 py-4">
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30">
                  <Check className="h-9 w-9 text-emerald-400" />
                </div>
              </div>
              <div>
                <p className="syne text-white font-bold text-xl">
                  Password Updated!
                </p>
                <p className="text-white/40 text-sm mt-2">
                  Your password has been changed successfully.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all"
              >
                Back to Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Logout Confirm Modal ───────────────────────────────────────────────────────
function LogoutModal({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-lg"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#0d0d1a] shadow-2xl overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 to-orange-500" />
        <div className="p-8 text-center space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500/10 border border-rose-500/20">
            <LogOut className="h-7 w-7 text-rose-400" />
          </div>
          <div>
            <p className="syne text-white font-bold text-xl">Sign Out?</p>
            <p className="text-white/40 text-sm mt-2 leading-relaxed">
              You'll be signed out and redirected to the login page.
            </p>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={onCancel}
              className="flex-1 py-3.5 rounded-2xl border border-white/10 text-white/60 text-sm font-semibold hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-orange-600 text-white text-sm font-semibold hover:from-rose-500 hover:to-orange-500 disabled:opacity-50 transition-all"
            >
              {loading ? "Signing out…" : "Sign Out"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ProfilePage ───────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [about, setAbout] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const {
    data,
    loading: queryLoading,
    error: queryError,
  } = useQuery<{ me: User }>(ME_QUERY);

  const { uploadProfilePicture, loading: uploadLoading } =
    useUploadProfilePicture();

  const [updateProfile, { loading: mutationLoading }] = useMutation<{
    updateProfile: User;
  }>(UPDATE_PROFILE_MUTATION, {
    refetchQueries: [{ query: ME_QUERY }],
    onCompleted: () => {
      setIsEditing(false);
      setImagePreview(null);
      setErrMsg(null);
    },
    onError: () => setErrMsg("Failed to save changes. Please try again."),
  });

  const user = data?.me;

  // Derive a stable boolean — guards every Google SSO check in this component
  const isGoogleUser = Boolean(user?.googleId);

  useEffect(() => {
    if (user) {
      setAbout(user.about || "");
      setProfilePicture(user.profilePicture || "");
    }
  }, [user]);

  const { logout } = useLogout();

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
    } catch {
      // proceed to redirect even on error
    } finally {
      setLogoutLoading(false);
      setShowLogoutModal(false);
      router.push("/login");
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrMsg("Image must be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setImagePreview(base64);

      try {
        const res = await uploadProfilePicture(base64, user!.email);
        if (res?.url) {
          setProfilePicture(res.url);
          setErrMsg(null);
        } else {
          setErrMsg("Upload failed. Please try again.");
        }
      } catch {
        setErrMsg("Upload failed. Please try again.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setErrMsg(null);
    await updateProfile({
      variables: {
        about: about.trim() || undefined,
        profilePicture: profilePicture || undefined,
      },
    });
  };

  const handleCancel = () => {
    setAbout(user?.about || "");
    setProfilePicture(user?.profilePicture || "");
    setImagePreview(null);
    setErrMsg(null);
    setIsEditing(false);
  };

  const displayAvatar = isEditing
    ? imagePreview || profilePicture || null
    : user?.profilePicture || null;

  const formatDate = (iso: string) =>
    new Date(Number(iso)).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (queryLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080810]">
        <div className="text-center space-y-4">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          <p className="text-sm text-white/30 tracking-wider">
            Loading profile…
          </p>
        </div>
      </div>
    );
  }

  if (queryError || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080810]">
        <div className="text-center space-y-4">
          <p className="text-red-400 font-medium">Could not load profile.</p>
          <button
            onClick={() => router.back()}
            className="rounded-2xl bg-violet-600 px-6 py-2.5 text-sm text-white hover:bg-violet-500 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Syne:wght@600;700;800&display=swap');
        body { font-family: 'DM Sans', sans-serif; background: #080810; }
        .syne { font-family: 'Syne', sans-serif; }
      `}</style>

      <div className="min-h-screen bg-[#080810] text-white">
        {/* ── Ambient background ── */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-violet-700/10 blur-[140px]" />
          <div className="absolute top-1/3 -right-40 h-[400px] w-[400px] rounded-full bg-fuchsia-700/8 blur-[130px]" />
          <div className="absolute -bottom-40 left-1/4 h-[350px] w-[350px] rounded-full bg-indigo-700/8 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 py-10">
          {/* ── Top nav ── */}
          <div className="flex items-center justify-between mb-10">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
              Back
            </button>
            <p className="syne text-sm font-semibold text-white/20 uppercase tracking-widest">
              Profile
            </p>
            <div className="w-12" />
          </div>

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* ── LEFT: Identity card ── */}
            <div className="lg:col-span-1">
              <div className="rounded-3xl border border-white/8 bg-white/[0.03] backdrop-blur-sm overflow-hidden h-full">
                {/* Cover */}
                <div className="relative h-32 bg-gradient-to-br from-violet-600/50 via-fuchsia-600/30 to-indigo-600/20 overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-[0.07]"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                      backgroundSize: "20px 20px",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080810]/60 to-transparent" />
                </div>

                <div className="px-6 pb-7 -mt-14">
                  {/* Avatar */}
                  <div className="relative inline-block mb-4">
                    <Avatar src={displayAvatar} name={user.name} size="lg" />
                    {isEditing && (
                      <label
                        htmlFor="photo-input"
                        className={`absolute -bottom-2 -right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-2xl bg-violet-600 text-white shadow-xl hover:bg-violet-500 transition-colors border-2 border-[#080810] ${
                          uploadLoading ? "opacity-50 pointer-events-none" : ""
                        }`}
                      >
                        {uploadLoading ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                        <input
                          id="photo-input"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          disabled={uploadLoading}
                        />
                      </label>
                    )}
                  </div>

                  {/* Name & badges */}
                  <h1 className="syne text-2xl font-bold text-white leading-tight">
                    {user.name || "Unnamed User"}
                  </h1>
                  <p className="text-sm text-white/40 mt-1 break-all">
                    {user.email}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {user.isVerified && (
                      <span className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                        <Shield className="h-3 w-3" /> Verified
                      </span>
                    )}
                    {isGoogleUser && (
                      <span className="flex items-center gap-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-400">
                        <svg className="h-3 w-3" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Google
                      </span>
                    )}
                  </div>

                  {/* Remove photo — edit mode */}
                  {isEditing && displayAvatar && (
                    <button
                      onClick={() => {
                        setImagePreview(null);
                        setProfilePicture("");
                      }}
                      className="mt-4 text-xs text-white/25 hover:text-rose-400 transition-colors underline underline-offset-2"
                    >
                      Remove photo
                    </button>
                  )}

                  <div className="my-5 h-px bg-white/6" />

                  {/* Meta info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-violet-400 shrink-0" />
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-white/25 font-semibold">
                          Email
                        </p>
                        <p className="text-sm text-white/60 break-all">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-4 w-4 text-violet-400 shrink-0" />
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-white/25 font-semibold">
                          Member Since
                        </p>
                        <p className="text-sm text-white/60">
                          {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Edit / Info + Actions ── */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              {/* ── About card ── */}
              <div className="rounded-3xl border border-white/8 bg-white/[0.03] backdrop-blur-sm overflow-hidden flex-1">
                <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-white/6">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/20">
                      <User2 className="h-4 w-4 text-violet-400" />
                    </div>
                    <span className="syne font-bold text-white/80">About</span>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 rounded-xl bg-white/6 border border-white/8 px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/12 hover:text-white transition-all"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancel}
                        disabled={mutationLoading}
                        className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-white/50 hover:bg-white/6 disabled:opacity-50 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={mutationLoading || uploadLoading}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-xs font-semibold text-white hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 transition-all shadow-md shadow-violet-500/20"
                      >
                        <Save className="h-3.5 w-3.5" />
                        {mutationLoading ? "Saving…" : "Save Changes"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="px-7 py-6">
                  {errMsg && (
                    <div className="mb-5 flex items-center gap-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3.5 text-sm text-red-400">
                      <X className="h-4 w-4 shrink-0" />
                      {errMsg}
                    </div>
                  )}

                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        rows={6}
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                        maxLength={500}
                        placeholder="Write something about yourself… your role, interests, or what you're working on."
                        className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white placeholder-white/20 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all leading-relaxed"
                      />
                      <div className="flex items-center justify-between">
                        {isGoogleUser ? (
                          <p className="text-xs text-white/25">
                            Name &amp; email are managed by Google
                          </p>
                        ) : (
                          <p className="text-xs text-white/25">
                            Name &amp; email cannot be changed here
                          </p>
                        )}
                        <p className="text-xs text-white/25">
                          {about.length}/500
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="min-h-[120px] flex items-start">
                      {user.about ? (
                        <p className="text-white/60 text-sm leading-relaxed">
                          {user.about}
                        </p>
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full py-8 gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/8">
                            <Sparkles className="h-5 w-5 text-white/20" />
                          </div>
                          <p className="text-sm text-white/25 italic">
                            No bio yet. Tell the world about yourself.
                          </p>
                          <button
                            onClick={() => setIsEditing(true)}
                            className="text-xs text-violet-400 hover:text-violet-300 transition-colors underline underline-offset-2"
                          >
                            Add a bio
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Account actions card ── */}
              <div className="rounded-3xl border border-white/8 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
                <div className="px-7 pt-5 pb-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/20">
                    Account Settings
                  </p>
                </div>

                {/*
                 * Reset Password — hidden for Google SSO users.
                 * isGoogleUser is derived from Boolean(user.googleId) above,
                 * so null / undefined / "" all correctly hide this section.
                 */}
                {!isGoogleUser && (
                  <button
                    onClick={() => setShowResetModal(true)}
                    className="w-full flex items-center gap-4 px-7 py-4 border-b border-white/5 hover:bg-white/[0.03] transition-all group"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20 shrink-0 group-hover:bg-violet-500/20 transition-colors">
                      <KeyRound className="h-4 w-4 text-violet-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                        Reset Password
                      </p>
                      <p className="text-xs text-white/30 mt-0.5">
                        Change via OTP sent to your email
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/15 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all" />
                  </button>
                )}

                {/* Sign Out */}
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full flex items-center gap-4 px-7 py-4 hover:bg-rose-500/5 transition-all group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 shrink-0 group-hover:bg-rose-500/20 transition-colors">
                    <LogOut className="h-4 w-4 text-rose-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-rose-400">
                      Sign Out
                    </p>
                    <p className="text-xs text-white/30 mt-0.5">
                      End your current session
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/15 group-hover:text-rose-400/50 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals — ResetPasswordModal is double-guarded: state + isGoogleUser */}
      {showResetModal && !isGoogleUser && (
        <ResetPasswordModal
          email={user.email}
          onClose={() => setShowResetModal(false)}
        />
      )}
      {showLogoutModal && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
          loading={logoutLoading}
        />
      )}
    </>
  );
}
