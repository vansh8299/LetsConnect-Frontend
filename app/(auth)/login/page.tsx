// app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/app/components/ui/Header";
import { Chrome } from "lucide-react";
import { authService } from "@/app/lib/services/auth.service";

interface ValidationErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const router = useRouter();
   const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
useEffect(() => {
    const authStatus = searchParams.get("auth");
    const error = searchParams.get("error");

    if (authStatus === "success") {
      // Successfully authenticated via Google OAuth
      router.push("/");
    } else if (error) {
      // Handle OAuth errors
      const errorMessages: Record<string, string> = {
        auth_failed: "Google authentication failed. Please try again.",
        no_user: "Unable to retrieve user information. Please try again.",
      };
      setError(errorMessages[error] || "Authentication failed");
    }
  }, [searchParams, router]);

  

  // Load saved email on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const validateEmail = (email: string): string | undefined => {
    if (!email) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
    };

    setErrors(newErrors);
    setTouched({ email: true, password: true });

    return !Object.values(newErrors).some((error) => error !== undefined);
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouched({ ...touched, [field]: true });

    if (field === "email") {
      setErrors({ ...errors, email: validateEmail(formData.email) });
    } else if (field === "password") {
      setErrors({ ...errors, password: validatePassword(formData.password) });
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });

    // Clear server error when user starts typing
    if (error) setError("");

    // Validate on change if field has been touched
    if (touched[field]) {
      if (field === "email") {
        setErrors({ ...errors, email: validateEmail(value) });
      } else if (field === "password") {
        setErrors({ ...errors, password: validatePassword(value) });
      }
    }
  };

  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);

    // If unchecking, remove saved email immediately
    if (!checked) {
      localStorage.removeItem("rememberedEmail");
    }
  };

  const handleSubmit = async () => {
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Call GraphQL login mutation
      await authService.login({
        email: formData.email.toLowerCase(),
        password: formData.password,
      });

      // Save or remove email based on remember me checkbox
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Redirect to home page
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    authService.googleLogin();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleSubmit();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      <Header />
      <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 py-8 sm:px-6 lg:px-8 dark:from-zinc-900 dark:to-zinc-950">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          {/* Header Text */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Form Container */}
          <div className="space-y-5 sm:space-y-6 rounded-xl bg-white p-6 sm:p-8 shadow-lg dark:bg-zinc-900">
            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 sm:py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <Chrome className="h-5 w-5" />
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-300 dark:border-zinc-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 p-3 sm:p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Form Fields */}
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
                  required
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  onKeyPress={handleKeyPress}
                  className={`flex h-11 sm:h-12 w-full rounded-lg border ${
                    touched.email && errors.email
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-zinc-200 focus:border-blue-500 focus:ring-blue-500/20"
                  } bg-white px-3 sm:px-4 text-sm text-zinc-900 transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600`}
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
                  onKeyPress={handleKeyPress}
                  className={`flex h-11 sm:h-12 w-full rounded-lg border ${
                    touched.password && errors.password
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-zinc-200 focus:border-blue-500 focus:ring-blue-500/20"
                  } bg-white px-3 sm:px-4 text-sm text-zinc-900 transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600`}
                  placeholder="••••••••"
                />
                {touched.password && errors.password && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => handleRememberMeChange(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:ring-offset-zinc-900"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    Remember me
                  </label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 sm:py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
