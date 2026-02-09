// app/signup/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/app/components/ui/Header";
import { Chrome } from "lucide-react";
import { authService } from "@/app/lib/services/auth.service";

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignupPage() {
  const router = useRouter();
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateName = (name: string): string | undefined => {
    if (!name.trim()) {
      return "Name is required";
    }
    if (name.trim().length < 2) {
      return "Name must be at least 2 characters";
    }
    if (name.trim().length > 50) {
      return "Name must be less than 50 characters";
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      return "Name can only contain letters, spaces, hyphens, and apostrophes";
    }
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    if (email.length > 100) {
      return "Email must be less than 100 characters";
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
    if (password.length > 128) {
      return "Password must be less than 128 characters";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Password must contain at least one special character";
    }
    return undefined;
  };

  const validateConfirmPassword = (
    confirmPassword: string,
    password: string,
  ): string | undefined => {
    if (!confirmPassword) {
      return "Please confirm your password";
    }
    if (confirmPassword !== password) {
      return "Passwords do not match";
    }
    return undefined;
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

    return !Object.values(newErrors).some((error) => error !== undefined);
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouched({ ...touched, [field]: true });

    let fieldError: string | undefined;
    if (field === "name") {
      fieldError = validateName(formData.name);
    } else if (field === "email") {
      fieldError = validateEmail(formData.email);
    } else if (field === "password") {
      fieldError = validatePassword(formData.password);
      // Re-validate confirm password if password changes
      if (touched.confirmPassword) {
        setErrors({
          ...errors,
          password: fieldError,
          confirmPassword: validateConfirmPassword(
            formData.confirmPassword,
            formData.password,
          ),
        });
        return;
      }
    } else if (field === "confirmPassword") {
      fieldError = validateConfirmPassword(
        formData.confirmPassword,
        formData.password,
      );
    }

    setErrors({ ...errors, [field]: fieldError });
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });

    // Clear server error when user starts typing
    if (error) setError("");

    // Validate on change if field has been touched
    if (touched[field]) {
      let fieldError: string | undefined;
      if (field === "name") {
        fieldError = validateName(value);
      } else if (field === "email") {
        fieldError = validateEmail(value);
      } else if (field === "password") {
        fieldError = validatePassword(value);
        // Re-validate confirm password if password changes and it's been touched
        if (touched.confirmPassword) {
          setErrors({
            ...errors,
            password: fieldError,
            confirmPassword: validateConfirmPassword(
              formData.confirmPassword,
              value,
            ),
          });
          return;
        }
      } else if (field === "confirmPassword") {
        fieldError = validateConfirmPassword(value, formData.password);
      }

      setErrors({ ...errors, [field]: fieldError });
    }
  };

  const handleSubmit = async () => {
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Call GraphQL signup mutation
      await authService.signup({
        name: formData.name.trim(),
        email: formData.email.toLowerCase(),
        password: formData.password,
      });

      // Redirect to home page after successful signup
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    authService.googleLogin();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleSubmit();
    }
  };

  const getPasswordStrength = (
    password: string,
  ): {
    strength: number;
    label: string;
    color: string;
  } => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: "Weak", color: "bg-red-500" };
    if (strength <= 4)
      return { strength, label: "Medium", color: "bg-yellow-500" };
    return { strength, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      <Header />
      <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 py-8 sm:px-6 lg:px-8 dark:from-zinc-900 dark:to-zinc-950">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          {/* Header Text */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Create an account
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Enter your information to get started
            </p>
          </div>

          {/* Form Container */}
          <div className="space-y-5 sm:space-y-6 rounded-xl bg-white p-6 sm:p-8 shadow-lg dark:bg-zinc-900">
            {/* Google Signup Button */}
            <button
              onClick={handleGoogleSignup}
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
                  onKeyPress={handleKeyPress}
                  className={`flex h-11 sm:h-12 w-full rounded-lg border ${
                    touched.name && errors.name
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-zinc-200 focus:border-blue-500 focus:ring-blue-500/20"
                  } bg-white px-3 sm:px-4 text-sm text-zinc-900 transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600`}
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
                {formData.password && !errors.password && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        Password strength: {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-zinc-200 rounded-full overflow-hidden dark:bg-zinc-800">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{
                          width: `${(passwordStrength.strength / 6) * 100}%`,
                        }}
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
                  onKeyPress={handleKeyPress}
                  className={`flex h-11 sm:h-12 w-full rounded-lg border ${
                    touched.confirmPassword && errors.confirmPassword
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-zinc-200 focus:border-blue-500 focus:ring-blue-500/20"
                  } bg-white px-3 sm:px-4 text-sm text-zinc-900 transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600`}
                  placeholder="••••••••"
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 sm:py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>

          {/* Sign In Link */}
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
