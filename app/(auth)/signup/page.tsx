"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/app/components/ui/Header";
import { Chrome, Mail, RefreshCw, Camera, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/app/lib/services/auth.service";
import { useSignup } from "@/app/lib/hooks";
import { useSendOtp, useVerifyOtp } from "@/app/lib/hooks/useOtp";
import { useUploadProfilePicture } from "@/app/lib/hooks/useUpload";

type Step = "form" | "otp";
type LoadingStage =
  | "idle"
  | "verifying"
  | "uploading"
  | "creating"
  | "resending";

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const OTP_RESEND_SECONDS = 60;
const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useSignup();
  const { sendOtp, loading: sendOtpLoading } = useSendOtp();
  const { verifyOtp, loading: verifyOtpLoading } = useVerifyOtp();
  const { uploadProfilePicture, loading: uploadLoading } =
    useUploadProfilePicture();

  const [step, setStep] = useState<Step>("form");
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("idle");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpHasError, setOtpHasError] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(
      () => setResendTimer((t) => (t <= 1 ? 0 : t - 1)),
      1000,
    );
    return () => clearInterval(interval);
  }, [resendTimer]);

  // ─── Avatar ──────────────────────────────────────────────────────────────────
  const processImageFile = useCallback((file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Please upload a JPEG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be smaller than ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
    e.target.value = "";
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processImageFile(file);
    },
    [processImageFile],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const removeAvatar = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
  };

  // ─── Validation ──────────────────────────────────────────────────────────────
  const validateName = (v: string) => {
    if (!v.trim()) return "Name is required";
    if (v.trim().length < 2) return "Name must be at least 2 characters";
    if (v.trim().length > 50) return "Name must be less than 50 characters";
    if (!/^[a-zA-Z\s'-]+$/.test(v))
      return "Name can only contain letters, spaces, hyphens, and apostrophes";
  };
  const validateEmail = (v: string) => {
    if (!v) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
      return "Please enter a valid email address";
    if (v.length > 100) return "Email must be less than 100 characters";
  };
  const validatePassword = (v: string) => {
    if (!v) return "Password is required";
    if (v.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(v))
      return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(v))
      return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(v)) return "Password must contain at least one number";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(v))
      return "Password must contain at least one special character";
  };
  const validateConfirmPassword = (v: string, pw: string) => {
    if (!v) return "Please confirm your password";
    if (v !== pw) return "Passwords do not match";
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(
        formData.confirmPassword,
        formData.password,
      ),
    };
    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    return !Object.values(newErrors).some(Boolean);
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouched({ ...touched, [field]: true });
    const validators = {
      name: validateName,
      email: validateEmail,
      password: validatePassword,
      confirmPassword: (v: string) =>
        validateConfirmPassword(v, formData.password),
    };
    setErrors({ ...errors, [field]: validators[field](formData[field]) });
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (!touched[field]) return;
    const validators = {
      name: validateName,
      email: validateEmail,
      password: validatePassword,
      confirmPassword: (v: string) =>
        validateConfirmPassword(
          v,
          field === "password" ? value : formData.password,
        ),
    };
    const updated = { ...errors, [field]: validators[field](value) };
    if (field === "password" && touched.confirmPassword)
      updated.confirmPassword = validateConfirmPassword(
        formData.confirmPassword,
        value,
      );
    setErrors(updated);
  };

  // ─── Send OTP ────────────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      await sendOtp(formData.email.toLowerCase(), formData.name.trim());
      setStep("otp");
      setResendTimer(OTP_RESEND_SECONDS);
      toast.success("OTP sent! Check your inbox.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ─── OTP Input ───────────────────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    setOtpHasError(false);
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6);
      const newOtp = [...otpValues];
      digits.split("").forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d;
      });
      setOtpValues(newOtp);
      otpRefs.current[Math.min(index + digits.length, 5)]?.focus();
      return;
    }
    const updated = [...otpValues];
    updated[index] = value;
    setOtpValues(updated);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0)
      otpRefs.current[index - 1]?.focus();
  };

  // ─── Verify OTP → Upload → Signup ────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    const otp = otpValues.join("");
    if (otp.length < 6) {
      setOtpHasError(true);
      toast.error("Please enter the complete 6-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      setLoadingStage("verifying");
      await verifyOtp(formData.email.toLowerCase(), otp);

      let profilePictureUrl: string | undefined;
      if (avatarPreview && avatarFile) {
        setLoadingStage("uploading");
        const uploadResult = await uploadProfilePicture(
          avatarPreview,
          formData.email.toLowerCase(),
        );
        profilePictureUrl = uploadResult?.url;
      }

      setLoadingStage("creating");
      await signup({
        name: formData.name.trim(),
        email: formData.email.toLowerCase(),
        password: formData.password,
        profilePicture: profilePictureUrl,
      });

      toast.success("Account created! Welcome aboard 🎉");
      router.push("/chats");
      router.refresh();
    } catch (err) {
      setOtpHasError(true);
      toast.error(err instanceof Error ? err.message : "Verification failed.");
      setOtpValues(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
      setLoadingStage("idle");
    }
  };

  // ─── Resend OTP ───────────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setOtpValues(["", "", "", "", "", ""]);
    setOtpHasError(false);
    setLoading(true);
    setLoadingStage("resending");
    try {
      await sendOtp(formData.email.toLowerCase(), formData.name.trim());
      setResendTimer(OTP_RESEND_SECONDS);
      otpRefs.current[0]?.focus();
      toast.success("OTP resent!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resend OTP.");
    } finally {
      setLoading(false);
      setLoadingStage("idle");
    }
  };

  const getPasswordStrength = (password: string) => {
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[a-z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) s++;
    if (s <= 2) return { s, label: "Weak", color: "bg-red-500" };
    if (s <= 4) return { s, label: "Medium", color: "bg-yellow-500" };
    return { s, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const isLoading =
    loading || sendOtpLoading || verifyOtpLoading || uploadLoading;
  const isVerifyLoading =
    loadingStage === "verifying" ||
    loadingStage === "uploading" ||
    loadingStage === "creating";

  const verifyButtonLabel = () => {
    if (loadingStage === "verifying") return "Verifying OTP...";
    if (loadingStage === "uploading") return "Uploading photo...";
    if (loadingStage === "creating") return "Creating account...";
    return "Verify & Create Account";
  };

  const inputClass = (field: keyof ValidationErrors) =>
    `flex h-11 sm:h-12 w-full rounded-lg border ${
      touched[field] && errors[field]
        ? "border-red-500 focus:ring-red-500/20"
        : "border-zinc-200 focus:border-blue-500 focus:ring-blue-500/20"
    } bg-white px-3 sm:px-4 text-sm text-zinc-900 transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600`;

  // ─── OTP Step ────────────────────────────────────────────────────────────────
  if (step === "otp") {
    return (
      <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
        <Header />
        <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 py-8 sm:px-6 lg:px-8 dark:from-zinc-900 dark:to-zinc-950">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Mail className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Verify your email
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                We sent a 6-digit code to{" "}
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {formData.email}
                </span>
              </p>
            </div>

            <div className="space-y-6 rounded-xl bg-white p-6 sm:p-8 shadow-lg dark:bg-zinc-900">
              {avatarPreview && (
                <div className="flex items-center gap-3 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-blue-500">
                    <Image
                      src={avatarPreview}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {formData.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Profile picture ready to upload
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Enter 6-digit OTP
                </label>
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otpValues.map((val, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        otpRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={val}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => {
                        handleOtpKeyDown(i, e);
                        if (
                          e.key === "Enter" &&
                          otpValues.join("").length === 6
                        )
                          handleVerifyOtp();
                      }}
                      onFocus={(e) => e.target.select()}
                      disabled={isVerifyLoading}
                      className={`h-12 w-12 sm:h-14 sm:w-14 rounded-lg border-2 text-center text-lg font-bold transition-all focus:outline-none disabled:cursor-not-allowed disabled:opacity-50
                        ${
                          otpHasError
                            ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                            : val
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-zinc-200 focus:border-blue-500 dark:border-zinc-700"
                        }
                        text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50`}
                    />
                  ))}
                </div>
                <p className="mt-1 text-center text-xs text-zinc-500 dark:text-zinc-400">
                  {loadingStage === "uploading"
                    ? "Uploading your profile picture..."
                    : loadingStage === "creating"
                      ? "Almost done, creating your account..."
                      : avatarFile
                        ? "Your photo will be uploaded after verification"
                        : "Code expires in 15 minutes"}
                </p>
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={isVerifyLoading || otpValues.join("").length < 6}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600 sm:py-3"
              >
                <span className="flex items-center justify-center gap-2">
                  {isVerifyLoading && (
                    <svg
                      className="h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  )}
                  {verifyButtonLabel()}
                </span>
              </button>

              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Didn't receive the code?
                </span>
                {resendTimer > 0 ? (
                  <span className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500">
                    <RefreshCw className="h-3.5 w-3.5" />
                    Resend in {resendTimer}s
                  </span>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    disabled={loadingStage === "resending"}
                    className="flex items-center gap-1 font-medium text-blue-600 hover:underline disabled:opacity-50 dark:text-blue-400"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${loadingStage === "resending" ? "animate-spin" : ""}`}
                    />
                    {loadingStage === "resending" ? "Sending..." : "Resend OTP"}
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  setStep("form");
                  setOtpValues(["", "", "", "", "", ""]);
                  setOtpHasError(false);
                  setLoadingStage("idle");
                }}
                disabled={isVerifyLoading}
                className="w-full text-center text-sm text-zinc-500 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                ← Change email or details
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─── Form Step ───────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      <Header />
      <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 py-8 sm:px-6 lg:px-8 dark:from-zinc-900 dark:to-zinc-950">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Create an account
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Enter your information to get started
            </p>
          </div>

          <div className="space-y-5 rounded-xl bg-white p-6 shadow-lg sm:space-y-6 sm:p-8 dark:bg-zinc-900">
            <button
              onClick={() => authService.googleLogin()}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 sm:py-3"
            >
              <Chrome className="h-5 w-5" />
              <span>Continue with Google</span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-300 dark:border-zinc-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Profile Picture */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Profile Picture{" "}
                <span className="font-normal text-zinc-400">(optional)</span>
              </label>
              {!avatarPreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 transition-all
                    ${
                      isDragging
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                        : "border-zinc-200 hover:border-blue-400 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:border-blue-500 dark:hover:bg-zinc-800/50"
                    }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <Upload className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {isDragging
                        ? "Drop your photo here"
                        : "Click to upload or drag & drop"}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                      JPEG, PNG, WebP or GIF · Max {MAX_FILE_SIZE_MB}MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
                  <div className="relative h-16 w-16 flex-shrink-0">
                    <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-800">
                      <Image
                        src={avatarPreview}
                        alt="Profile preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition-colors hover:bg-blue-700"
                    >
                      <Camera className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {avatarFile?.name}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {avatarFile
                        ? (avatarFile.size / (1024 * 1024)).toFixed(2)
                        : ""}
                      MB · Ready to upload
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="flex-shrink-0 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  className={inputClass("name")}
                  placeholder="John Doe"
                />
                {touched.name && errors.name && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  className={inputClass("email")}
                  placeholder="you@example.com"
                />
                {touched.email && errors.email && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  onBlur={() => handleBlur("password")}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  className={inputClass("password")}
                  placeholder="••••••••"
                />
                {formData.password && !errors.password && (
                  <div className="space-y-1">
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">
                      Password strength: {passwordStrength.label}
                    </span>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: `${(passwordStrength.s / 6) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                {touched.password && errors.password && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  onBlur={() => handleBlur("confirmPassword")}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  className={inputClass("confirmPassword")}
                  placeholder="••••••••"
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleSendOtp}
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600 sm:py-3"
            >
              <span className="flex items-center justify-center gap-2">
                {isLoading && (
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                )}
                {isLoading ? "Sending OTP..." : "Continue"}
              </span>
            </button>
          </div>

          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
