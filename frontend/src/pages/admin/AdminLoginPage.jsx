import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FaEnvelope, FaLock } from "react-icons/fa";
import api from "./../../api";
import { ACCESS_TOKEN,} from "./../../constants";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AdminLoginPage = () => {
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate=useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm({
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setLoginError("");

    try {
      const res = await api.post("/auth/login", data);
      if (res.data.success) {
        localStorage.setItem(ACCESS_TOKEN, res.data.token);
        // localStorage.setItem(ROLE, res.data.user.role);
        // localStorage.setItem(U_ID, res.data.user.id);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-200 p-4">
  <div className="w-full min-h-[620px] max-w-4xl bg-white rounded-2xl shadow-xl grid md:grid-cols-2 overflow-hidden">

    {/* LEFT SIDE - Branding */}
    <div className="bg-gradient-to-b from-black to-gray-800 text-white flex flex-col items-center justify-center p-12">
      <h1 className="text-4xl font-bold mb-4">Recruva</h1>
      <p className="text-2xl font-semibold mb-2">Admin Login</p>
      <p className="text-center text-gray-300 text-lg">
        Secure access for administrators only.  
        Manage with confidence, login with trust.
      </p>
    </div>

    {/* RIGHT SIDE - Login Form */}
    <div className="p-12 flex flex-col justify-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Sign In</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Email */}
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
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent ${errors.email ? "border-red-500" : "border-gray-300"}`}
            />
          </div>
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" />
            </div>
            <input
              type="password"
              placeholder="Password"
              {...register("password", { 
                required: "Password required", 
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-transparent ${errors.password ? "border-red-500" : "border-gray-300"}`}
            />
          </div>
          {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
        </div>

        {/* Error */}
        {loginError && <p className="text-red-600 text-center">{loginError}</p>}

        {/* Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-black text-white py-3 rounded-lg font-semibold text-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Logging in..." : "LOGIN"}
        </button>
      </form>
    </div>
  </div>
</div>


  );
};

export default AdminLoginPage;
