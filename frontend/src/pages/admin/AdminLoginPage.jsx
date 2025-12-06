import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaEnvelope, FaLock } from "react-icons/fa";
import api from "./../../api";
import { ACCESS_TOKEN } from "./../../constants";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AdminLoginPage = () => {
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [animateLeft, setAnimateLeft] = useState(false);
  const [animateRight, setAnimateRight] = useState(false);
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

  useEffect(() => {
    setAnimate(true);
  }, []);

  useEffect(() => {
    if (loginError) {
      const timer = setTimeout(() => setLoginError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [loginError]);

  useEffect(() => {
    if (errors.email || errors.password) {
      const timer = setTimeout(() => {
        clearErrors(["email", "password"]);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [errors, clearErrors]);

  useEffect(() => {
    setTimeout(() => setAnimateLeft(true), 200);
    setTimeout(() => setAnimateRight(true), 400);
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setLoginError("");

    try {
      const res = await api.post("/auth/login", data);
      if (res.data.success) {
        localStorage.setItem(ACCESS_TOKEN, res.data.token);
        const decoded = res.data.token ? jwtDecode(res.data.token) : null;
        const userRole = decoded?.role;
        if (userRole === "HR") {
          navigate("/hr/dashboard");
        } else if (userRole === "DEPARTMENT") {
          navigate("/dept/dashboard");
        }
      } else {
        setLoginError(res.data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      setLoginError("Invalid credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 px-4 sm:px-6 lg:px-8
      transition-all duration-700 ease-out
      ${animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      {/* FLOATING BACKGROUND SHAPES */}
      {/* <div className="pointer-events-none absolute inset-0">
      <div className="absolute -top-16 -left-8 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-purple-200/20 blur-3xl" />
    </div> */}

      <div className="relative mx-auto w-full max-w-5xl">
        <div className="grid items-stretch gap-6 lg:grid-cols-2">
          {/* LEFT SIDE – Branding */}
          <div
            className={`hidden lg:flex relative min-h-[520px] flex-col justify-center gap-6 overflow-hidden rounded-[32px] p-12 text-white shadow-2xl 
    bg-gradient-to-b from-black to-gray-800
    transform transition-all duration-700 ease-out
    ${animateLeft ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
          >
            <div className="pointer-events-none absolute inset-0 opacity-20">
              <span className="absolute top-10 right-8 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
              <span className="absolute bottom-6 left-4 h-40 w-40 rounded-full bg-gray-600/20 blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col gap-4 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold">
                Recruva
              </h1>
              <h2 className="text-2xl sm:text-2xl lg:text-3xl font-bold text-gray-200">
                Admin Portal
              </h2>
              <p className="text-sm sm:text-base text-gray-300 max-w-sm mx-auto lg:mx-0">
                Secure admin access for platform management. Manage confidently
                — log in with trust.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE – Login Form */}
          <div
            className={`relative min-h-[520px] lg:min-h-[560px] rounded-[32px] border border-gray-700 bg-gray-950 p-6 sm:p-10 shadow-xl flex flex-col justify-center
    transform transition-all duration-700 ease-out
    ${animateRight ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
          >
            <div className="mb-6 space-y-2 text-center lg:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-400">
                Administrator Access
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-100">
                Sign in
              </h2>
              <p className="text-sm text-gray-400">
                Enter your admin credentials to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
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
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Invalid email",
                      },
                    })}
                    className={`w-full pl-11 pr-4 py-3 rounded-2xl border bg-gray-900 text-gray-100 shadow-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent ${
                      errors.email ? "border-red-600" : "border-gray-700"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
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
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    className={`w-full pl-11 pr-4 py-3 rounded-2xl border bg-gray-900 text-gray-100 shadow-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent ${
                      errors.password ? "border-red-600" : "border-gray-700"
                    }`}
                  />
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Error */}
              {loginError && (
                <p className="text-red-600 text-center">{loginError}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="
    w-full flex items-center justify-center gap-2 rounded-2xl 
    bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 
    py-3 font-semibold text-white shadow-lg 
    transition-all duration-300 
    hover:from-gray-700 hover:via-gray-600 hover:to-gray-700 
    hover:scale-[1.02] active:scale-[0.98]
    disabled:opacity-60 disabled:cursor-not-allowed
  "
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
