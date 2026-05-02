import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaEnvelope, FaLock } from "react-icons/fa";
import api from "./../../api";
import { ACCESS_TOKEN } from "./../../constants";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Steps: 'login' | 'forgot-email' | 'forgot-otp' | 'forgot-reset' | 'forgot-done'

const AdminLoginPage = () => {
  const [step, setStep] = useState("login");
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [animateLeft, setAnimateLeft] = useState(false);
  const [animateRight, setAnimateRight] = useState(false);

  // Forgot password state
  const [fpEmail, setFpEmail] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpResetToken, setFpResetToken] = useState("");
  const [fpNewPassword, setFpNewPassword] = useState("");
  const [fpConfirmPassword, setFpConfirmPassword] = useState("");
  const [fpError, setFpError] = useState("");
  const [fpMessage, setFpMessage] = useState("");

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => { setAnimate(true); }, []);
  useEffect(() => {
    setTimeout(() => setAnimateLeft(true), 200);
    setTimeout(() => setAnimateRight(true), 400);
  }, []);
  useEffect(() => {
    if (loginError) {
      const t = setTimeout(() => setLoginError(""), 5000);
      return () => clearTimeout(t);
    }
  }, [loginError]);
  useEffect(() => {
    if (errors.email || errors.password) {
      const t = setTimeout(() => clearErrors(["email", "password"]), 5000);
      return () => clearTimeout(t);
    }
  }, [errors, clearErrors]);

  // ── Login ──────────────────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setLoginError("");
    try {
      const res = await api.post("/auth/login", data);
      if (res.data.success) {
        localStorage.setItem(ACCESS_TOKEN, res.data.token);
        const decoded = jwtDecode(res.data.token);
        if (decoded?.role === "HR") navigate("/hr/dashboard");
        else if (decoded?.role === "DEPARTMENT") navigate("/dept/dashboard");
      } else {
        setLoginError(res.data.message || "Invalid credentials");
      }
    } catch {
      setLoginError("Invalid credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Forgot: send OTP ───────────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setFpError("");
    setIsSubmitting(true);
    try {
      const res = await api.post("/auth/forgot-password", { email: fpEmail });
      if (res.data.success) {
        setFpMessage(`OTP sent to ${fpEmail}`);
        setStep("forgot-otp");
      } else {
        setFpError(res.data.message);
      }
    } catch (err) {
      setFpError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Forgot: verify OTP ─────────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setFpError("");
    setIsSubmitting(true);
    try {
      const res = await api.post("/auth/verify-reset-otp", { email: fpEmail, otp: fpOtp });
      if (res.data.success) {
        setFpResetToken(res.data.resetToken);
        setFpMessage("");
        setStep("forgot-reset");
      } else {
        setFpError(res.data.message);
      }
    } catch (err) {
      setFpError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Forgot: reset password ─────────────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setFpError("");
    if (fpNewPassword !== fpConfirmPassword) {
      setFpError("Passwords do not match");
      return;
    }
    if (fpNewPassword.length < 6) {
      setFpError("Password must be at least 6 characters");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.post("/auth/reset-password", {
        resetToken: fpResetToken,
        newPassword: fpNewPassword,
      });
      if (res.data.success) {
        setStep("forgot-done");
      } else {
        setFpError(res.data.message);
      }
    } catch (err) {
      setFpError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForgotFlow = () => {
    setStep("login");
    setFpEmail("");
    setFpOtp("");
    setFpResetToken("");
    setFpNewPassword("");
    setFpConfirmPassword("");
    setFpError("");
    setFpMessage("");
  };

  // ── Shared input style ─────────────────────────────────────────────────────
  const inputClass = (hasError) =>
    `w-full pl-11 pr-4 py-3 rounded-2xl border bg-gray-900 text-gray-100 shadow-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent ${
      hasError ? "border-red-600" : "border-gray-700"
    }`;

  const plainInputClass =
    "w-full px-4 py-3 rounded-2xl border border-gray-700 bg-gray-900 text-gray-100 shadow-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none";

  const submitBtnClass =
    "w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:from-gray-700 hover:via-gray-600 hover:to-gray-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed";

  // ── Right panel content per step ───────────────────────────────────────────
  const renderRight = () => {
    if (step === "login") return (
      <>
        <div className="mb-6 space-y-2 text-center lg:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-400">
            Administrator Access
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-100">Sign in</h2>
          <p className="text-sm text-gray-400">Enter your admin credentials to continue.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-500" />
              </div>
              <input
                type="email"
                placeholder="Email"
                {...register("email", {
                  required: "Email required",
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
                })}
                className={inputClass(errors.email)}
              />
            </div>
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-500" />
              </div>
              <input
                type="password"
                placeholder="Password"
                {...register("password", {
                  required: "Password required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" },
                })}
                className={inputClass(errors.password)}
              />
            </div>
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
          </div>

          {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}

          <button type="submit" disabled={isSubmitting} className={submitBtnClass}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-sm text-gray-500">
            <button
              type="button"
              onClick={() => { setStep("forgot-email"); setFpError(""); }}
              className="text-gray-400 hover:text-gray-200 underline underline-offset-2 transition"
            >
              Forgot password?
            </button>
          </p>
        </form>
      </>
    );

    if (step === "forgot-email") return (
      <>
        <div className="mb-6 space-y-2 text-center lg:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-400">
            Password Reset
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-100">Forgot password</h2>
          <p className="text-sm text-gray-400">
            Enter your account email and we'll send you a 6-digit OTP.
          </p>
        </div>

        <form onSubmit={handleSendOtp} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="text-gray-500" />
            </div>
            <input
              type="email"
              placeholder="Email"
              value={fpEmail}
              onChange={(e) => setFpEmail(e.target.value)}
              required
              className={`w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-700 bg-gray-900 text-gray-100 shadow-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none`}
            />
          </div>

          {fpError && <p className="text-red-500 text-sm text-center">{fpError}</p>}

          <button type="submit" disabled={isSubmitting} className={submitBtnClass}>
            {isSubmitting ? "Sending OTP..." : "Send OTP"}
          </button>

          <p className="text-center text-sm">
            <button type="button" onClick={resetForgotFlow} className="text-gray-400 hover:text-gray-200 transition">
              ← Back to login
            </button>
          </p>
        </form>
      </>
    );

    if (step === "forgot-otp") return (
      <>
        <div className="mb-6 space-y-2 text-center lg:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-400">
            Password Reset
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-100">Enter OTP</h2>
          <p className="text-sm text-gray-400">
            {fpMessage || `Check your email for the 6-digit code.`} It expires in 5 minutes.
          </p>
        </div>

        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <input
            type="text"
            placeholder="6-digit OTP"
            value={fpOtp}
            onChange={(e) => setFpOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
            required
            className={`${plainInputClass} text-center text-2xl tracking-[0.5em] font-mono`}
          />

          {fpError && <p className="text-red-500 text-sm text-center">{fpError}</p>}

          <button type="submit" disabled={isSubmitting || fpOtp.length !== 6} className={submitBtnClass}>
            {isSubmitting ? "Verifying..." : "Verify OTP"}
          </button>

          <p className="text-center text-sm">
            <button
              type="button"
              onClick={() => { setStep("forgot-email"); setFpError(""); setFpOtp(""); }}
              className="text-gray-400 hover:text-gray-200 transition"
            >
              ← Resend OTP
            </button>
          </p>
        </form>
      </>
    );

    if (step === "forgot-reset") return (
      <>
        <div className="mb-6 space-y-2 text-center lg:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-400">
            Password Reset
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-100">New password</h2>
          <p className="text-sm text-gray-400">Choose a strong password for your account.</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-500" />
            </div>
            <input
              type="password"
              placeholder="New password"
              value={fpNewPassword}
              onChange={(e) => setFpNewPassword(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-700 bg-gray-900 text-gray-100 shadow-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-500" />
            </div>
            <input
              type="password"
              placeholder="Confirm new password"
              value={fpConfirmPassword}
              onChange={(e) => setFpConfirmPassword(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-700 bg-gray-900 text-gray-100 shadow-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none"
            />
          </div>

          {fpError && <p className="text-red-500 text-sm text-center">{fpError}</p>}

          <button type="submit" disabled={isSubmitting} className={submitBtnClass}>
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </>
    );

    if (step === "forgot-done") return (
      <div className="flex flex-col items-center justify-center h-full gap-6 text-center py-8">
        <div className="w-16 h-16 rounded-full bg-green-900/40 border border-green-700/50 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-100 mb-2">Password reset</h2>
          <p className="text-sm text-gray-400">
            Your password has been updated. You can now sign in with your new password.
          </p>
        </div>
        <button onClick={resetForgotFlow} className={submitBtnClass} style={{ maxWidth: 240 }}>
          Back to Login
        </button>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-out ${
        animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <div className="relative mx-auto w-full max-w-5xl">
        <div className="grid items-stretch gap-6 lg:grid-cols-2">

          {/* LEFT – Branding */}
          <div
            className={`hidden lg:flex relative min-h-[520px] flex-col justify-center gap-6 overflow-hidden rounded-[32px] p-12 text-white shadow-2xl bg-gradient-to-b from-black to-gray-800 transform transition-all duration-700 ease-out ${
              animateLeft ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <div className="pointer-events-none absolute inset-0 opacity-20">
              <span className="absolute top-10 right-8 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
              <span className="absolute bottom-6 left-4 h-40 w-40 rounded-full bg-gray-600/20 blur-3xl" />
            </div>
            <div className="relative z-10 flex flex-col gap-4 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold">Recruva</h1>
              <h2 className="text-2xl sm:text-2xl lg:text-3xl font-bold text-gray-200">Admin Portal</h2>
              <p className="text-sm sm:text-base text-gray-300 max-w-sm mx-auto lg:mx-0">
                Secure admin access for platform management. Manage confidently — log in with trust.
              </p>
            </div>
          </div>

          {/* RIGHT – Dynamic content */}
          <div
            className={`relative min-h-[520px] lg:min-h-[560px] rounded-[32px] border border-gray-700 bg-gray-950 p-6 sm:p-10 shadow-xl flex flex-col justify-center transform transition-all duration-700 ease-out ${
              animateRight ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            {renderRight()}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
