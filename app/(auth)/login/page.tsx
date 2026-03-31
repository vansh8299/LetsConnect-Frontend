"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/app/components/ui/Header";
import { Chrome, ArrowLeft, Mail, KeyRound, Lock } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/app/lib/services/auth.service";
import { useLogin } from "@/app/lib/hooks";
import {
  useSendPasswordResetOtp,
  useVerifyPasswordResetOtp,
  useResetPassword,
} from "@/app/lib/hooks/useForgotPassword";

interface ValidationErrors {
  email?: string;
  password?: string;
}

type ForgotStep = "email" | "otp" | "reset" | "done";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useLogin();
  const searchParams = useSearchParams();

  // ── Login state ──────────────────────────────────────────────
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // ── Forgot-password state ─────────────────────────────────────
  const [isForgot, setIsForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotStep>("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const { sendPasswordResetOtp, loading: sendLoading } =
    useSendPasswordResetOtp();
  const { verifyPasswordResetOtp, loading: verifyLoading } =
    useVerifyPasswordResetOtp();
  const { resetPassword, loading: resetLoading } = useResetPassword();

  // ── OAuth redirect handling ───────────────────────────────────
  useEffect(() => {
    const authStatus = searchParams.get("auth");
    const oauthError = searchParams.get("error");
    if (authStatus === "success") router.push("/");
    else if (oauthError) {
      const msgs: Record<string, string> = {
        auth_failed: "Google authentication failed. Please try again.",
        no_user: "Unable to retrieve user information. Please try again.",
      };
      toast.error(msgs[oauthError] || "Authentication failed");
    }
  }, [searchParams, router]);

  // ── Remember me ───────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("rememberedEmail");
    if (saved) {
      setFormData((p) => ({ ...p, email: saved }));
      setRememberMe(true);
    }
  }, []);

  // ── Login validation ──────────────────────────────────────────
  const validateEmail = (v: string) =>
    !v
      ? "Email is required"
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
        ? "Please enter a valid email address"
        : undefined;

  const validatePassword = (v: string) =>
    !v
      ? "Password is required"
      : v.length < 8
        ? "Password must be at least 8 characters"
        : undefined;

  const validateForm = () => {
    const newErrors = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
    };
    setErrors(newErrors);
    setTouched({ email: true, password: true });
    return !Object.values(newErrors).some(Boolean);
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouched({ ...touched, [field]: true });
    setErrors({
      ...errors,
      [field]:
        field === "email"
          ? validateEmail(formData.email)
          : validatePassword(formData.password),
    });
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (touched[field])
      setErrors({
        ...errors,
        [field]:
          field === "email" ? validateEmail(value) : validatePassword(value),
      });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      await login({
        email: formData.email.toLowerCase(),
        password: formData.password,
      });
      rememberMe
        ? localStorage.setItem("rememberedEmail", formData.email)
        : localStorage.removeItem("rememberedEmail");
      toast.success("Signed in successfully!");
      router.push("/");
      router.refresh();
    } catch (err) {
      // Now properly caught because useLogin throws on GraphQL errors
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot-password helpers ───────────────────────────────────
  const startCooldown = () => {
    setResendCooldown(60);
    const iv = setInterval(() => {
      setResendCooldown((p) => {
        if (p <= 1) {
          clearInterval(iv);
          return 0;
        }
        return p - 1;
      });
    }, 1000);
  };

  const openForgot = () => {
    setForgotEmail(formData.email);
    setForgotStep("email");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setIsForgot(true);
  };

  const closeForgot = () => {
    setIsForgot(false);
    setForgotStep("email");
  };

  const handleSendOtp = async () => {
    if (!forgotEmail) return toast.error("Please enter your email.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail))
      return toast.error("Please enter a valid email.");
    try {
      await sendPasswordResetOtp(forgotEmail.toLowerCase());
      setForgotStep("otp");
      startCooldown();
      toast.success("OTP sent to your email!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send OTP.");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6)
      return toast.error("Please enter the 6-digit OTP.");
    try {
      await verifyPasswordResetOtp(forgotEmail.toLowerCase(), otp);
      setForgotStep("reset");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "OTP verification failed.",
      );
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      await sendPasswordResetOtp(forgotEmail.toLowerCase());
      startCooldown();
      toast.success("OTP resent!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resend OTP.");
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8)
      return toast.error("Password must be at least 8 characters.");
    if (newPassword !== confirmPassword)
      return toast.error("Passwords do not match.");
    try {
      await resetPassword(forgotEmail.toLowerCase(), newPassword);
      setForgotStep("done");
      toast.success("Password reset successfully!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to reset password.",
      );
    }
  };

  // ── Shared styles ─────────────────────────────────────────────
  const inputCls =
    "flex h-11 w-full rounded-lg border border-zinc-200 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600 transition-colors";

  const btnPrimary =
    "w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-blue-500 dark:hover:bg-blue-600";

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      <Header />
      <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 py-8 sm:px-6 lg:px-8 dark:from-zinc-900 dark:to-zinc-950">
        <div className="w-full max-w-md space-y-6">
          {/* ── FORGOT PASSWORD FLOW ── */}
          {isForgot ? (
            <>
              {forgotStep !== "done" && (
                <button
                  onClick={
                    forgotStep === "email"
                      ? closeForgot
                      : () => setForgotStep("email")
                  }
                  className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {forgotStep === "email" ? "Back to login" : "Back"}
                </button>
              )}

              <div className="rounded-xl bg-white p-6 sm:p-8 shadow-lg dark:bg-zinc-900 space-y-6">
                {/* Step: Email */}
                {forgotStep === "email" && (
                  <>
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                        Forgot your password?
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Enter your email and we'll send you a one-time code.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Email address
                      </label>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                        placeholder="you@example.com"
                        className={inputCls}
                      />
                    </div>
                    <button
                      onClick={handleSendOtp}
                      disabled={sendLoading}
                      className={btnPrimary}
                    >
                      {sendLoading ? "Sending..." : "Send OTP"}
                    </button>
                  </>
                )}

                {/* Step: OTP */}
                {forgotStep === "otp" && (
                  <>
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <KeyRound className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                        Check your inbox
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        We sent a 6-digit code to{" "}
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          {forgotEmail}
                        </span>
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Enter OTP
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleVerifyOtp()
                        }
                        placeholder="123456"
                        className={`${inputCls} text-center text-lg font-semibold tracking-widest`}
                      />
                    </div>
                    <button
                      onClick={handleVerifyOtp}
                      disabled={verifyLoading}
                      className={btnPrimary}
                    >
                      {verifyLoading ? "Verifying..." : "Verify OTP"}
                    </button>
                    <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                      Didn't receive it?{" "}
                      <button
                        onClick={handleResendOtp}
                        disabled={resendCooldown > 0 || sendLoading}
                        className="font-medium text-blue-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed dark:text-blue-400"
                      >
                        {resendCooldown > 0
                          ? `Resend in ${resendCooldown}s`
                          : "Resend OTP"}
                      </button>
                    </p>
                  </>
                )}

                {/* Step: New password */}
                {forgotStep === "reset" && (
                  <>
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                        Set new password
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Choose a strong password for your account.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          New password
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className={inputCls}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Confirm password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleResetPassword()
                          }
                          placeholder="••••••••"
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleResetPassword}
                      disabled={resetLoading}
                      className={btnPrimary}
                    >
                      {resetLoading ? "Resetting..." : "Reset Password"}
                    </button>
                  </>
                )}

                {/* Step: Done */}
                {forgotStep === "done" && (
                  <div className="flex flex-col items-center text-center gap-4 py-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <svg
                        className="h-7 w-7 text-green-600 dark:text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                      Password reset!
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Your password has been updated. You can now sign in.
                    </p>
                    <button onClick={closeForgot} className={btnPrimary}>
                      Back to Login
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ── LOGIN FLOW ── */
            <>
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Welcome back
                </h2>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Enter your credentials to access your account
                </p>
              </div>

              <div className="space-y-5 sm:space-y-6 rounded-xl bg-white p-6 sm:p-8 shadow-lg dark:bg-zinc-900">
                <button
                  onClick={() => authService.googleLogin()}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 sm:py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
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

                <div className="space-y-4">
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
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      onKeyDown={(e) =>
                        e.key === "Enter" && !loading && handleSubmit()
                      }
                      placeholder="you@example.com"
                      className={`${inputCls} ${touched.email && errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
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
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      onBlur={() => handleBlur("password")}
                      onKeyDown={(e) =>
                        e.key === "Enter" && !loading && handleSubmit()
                      }
                      placeholder="••••••••"
                      className={`${inputCls} ${touched.password && errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                    />
                    {touched.password && errors.password && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => {
                          setRememberMe(e.target.checked);
                          if (!e.target.checked)
                            localStorage.removeItem("rememberedEmail");
                        }}
                        className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:ring-offset-zinc-900"
                      />
                      <label
                        htmlFor="remember-me"
                        className="ml-2 block text-sm text-zinc-700 dark:text-zinc-300"
                      >
                        Remember me
                      </label>
                    </div>
                    <button
                      onClick={openForgot}
                      className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400 text-left sm:text-right"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={btnPrimary}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </div>

              <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  Sign up
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
