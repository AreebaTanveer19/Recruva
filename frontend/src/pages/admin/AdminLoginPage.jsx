import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FaEnvelope, FaLock } from "react-icons/fa";
import api from "./../../api";
import { ACCESS_TOKEN } from "./../../constants";

const AdminLoginPage = () => {
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setLoginError("");

    try {
      const res = await api.post("/admin-login", data);
      if (res.data.success) {
        localStorage.setItem(ACCESS_TOKEN, res.data.token);
        window.location.href = "/admin-dashboard"; // redirect to admin dashboard
      } else {
        setLoginError(res.data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      setLoginError("Server error. Try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-12">
        <h1 className="text-4xl font-bold text-blue-900 mb-4 text-center">Admin Login</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="text-gray-400" />
            </div>
            <input
              type="email"
              placeholder="Email"
              {...register("email", {
                required: "Email required",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" }
              })}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? "border-red-500" : "border-gray-300"}`}
            />
            </div>
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
          </div>

        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" />
            </div>
            <input
              type="password"
              placeholder="Password"
              {...register("password", { required: "Password required", minLength: { value: 6, message: 'Password must be at least 6 characters' },pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                            message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                          } })}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.password ? "border-red-500" : "border-gray-300"}`}
            />
            </div>
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
          </div>

          {loginError && <p className="text-red-600 text-center">{loginError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Logging in..." : "LOGIN"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
