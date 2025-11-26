import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { FaUser, FaEnvelope, FaLock, FaArrowRight, FaCheck, FaTimes } from 'react-icons/fa';
import './Auth.css';
import { ACCESS_TOKEN, } from "./../../constants";

const InputField = ({
  icon: Icon,
  label,
  type = 'text',
  registration,
  error,
  placeholder,
}) => (
  <div>
    <label className="block text-sm font-medium text-slate-500 mb-1">{label}</label>
    <div className="relative group">
      {Icon && (
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
      )}
      <input
        type={type}
        placeholder={placeholder}
        {...registration}
        className={`w-full pl-12 pr-4 py-3 rounded-2xl border bg-white/80 backdrop-blur-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-300 shadow-sm ${
          error ? 'border-red-400' : 'border-slate-200'
        }`}
      />
      <span className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 transition-opacity duration-300 border border-indigo-500/50"></span>
    </div>
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

const AuthPage = () => {
  const [activeForm, setActiveForm] = useState('login'); // 'login' or 'signup'
  const [authMode, setAuthMode] = useState('form'); // 'form', 'otp', 'verified'
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [userEmail, setUserEmail] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(120);
  const [timerActive, setTimerActive] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [currentAction, setCurrentAction] = useState('verify'); // 'verify' or 'register'
  const [pendingRegistration, setPendingRegistration] = useState(null);
  
  // Error popup state
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Login form validation
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLogin
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Signup form validation
  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
    watch,
    reset: resetSignup
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const password = watch('password');

  // Timer for OTP resend
  React.useEffect(() => {
    let interval;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  // Handle OTP input changes
  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  // Handle OTP key events
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };
  // OTP generation is now handled entirely by backend

  // Send OTP to email using backend API
  const sendOtp = async (email, action = 'verify', name = '', password = '') => {
    setIsSendingOtp(true);
    try {
      const payload = { email, action };
      if (action === 'register' && name && password) {
        payload.name = name;
        payload.password = password;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUserEmail(email);
        setOtpSent(true);
        setTimer(120);
        setTimerActive(true);
        setAuthMode('otp');
        
        console.log(`OTP sent to ${email}: ${data.otp}`);
        // alert(`OTP sent to ${email}: ${data.otp}`); // For demo purposes - remove in production
      } else {
        throw new Error(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Failed to send OTP:', error);
      showError('Failed to send OTP. Please try again with another valid email.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify OTP using backend API
  const verifyOtp = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      showError('Please enter complete OTP');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail, otp: otpValue }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`OTP verified successfully for ${userEmail}: ${otpValue}`);
        
        // Store JWT token if provided
        if (data.token) {
          localStorage.setItem(ACCESS_TOKEN, data.token);
          localStorage.setItem('candidateData', JSON.stringify(data.candidate));
        }
        
        setVerificationMessage('Email verification successful!');
        setAuthMode('verified');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          window.location.href = '/candidate/dashboard';
        }, 2000);
      } else {
        throw new Error(data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
      showError(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    setTimer(120);
    setTimerActive(true);
    if (currentAction === 'register' && pendingRegistration) {
      await sendOtp(userEmail, 'register', pendingRegistration.name, pendingRegistration.password);
    } else {
      await sendOtp(userEmail, 'verify');
    }
  };

  // Handle login with direct authentication
  const handleLoginDirect = async (data) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/candidate/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('Login successful:', result);
        
        localStorage.setItem(ACCESS_TOKEN, result.token);
        localStorage.setItem('candidateData', JSON.stringify(result.candidate));
        
        // Redirect to dashboard
        window.location.href = '/candidate/dashboard';
      } else {
        // Check if it's specifically invalid credentials error
        if (result.message === 'Invalid credentials') {
          showError('Invalid credentials. Please check your email and password and try again.');
        } else {
          showError(result.message || 'Login failed. Please check your credentials.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('Login failed. Please try again.');
    }
  };

  // Handle signup with OTP
  const handleSignupWithOtp = (data) => {
    setCurrentAction('register');
    setPendingRegistration({ name: data.username, password: data.password });
    sendOtp(data.email, 'register', data.username, data.password);
  };

  // Error popup functions
  const showError = (message) => {
    setErrorMessage(message);
    setShowErrorPopup(true);
  };

  const closeErrorPopup = () => {
    setShowErrorPopup(false);
    setErrorMessage('');
  };

  // Reset to form mode
  const resetToForm = () => {
    setAuthMode('form');
    setOtp(['', '', '', '', '', '']);
    setOtpSent(false);
    setTimer(120);
    setTimerActive(false);
    setVerificationMessage('');
    setCurrentAction('verify');
    setPendingRegistration(null);
  };

  const onLoginSubmit = (data) => {
    console.log('Login submitted:', data);
    // Direct password-based authentication
    handleLoginDirect(data);
  };

  const handleToggleForm = () => {
    const nextForm = activeForm === 'login' ? 'signup' : 'login';
    setActiveForm(nextForm);
    setAuthMode('form');
  };

  const handleFormTab = (formType) => {
    setActiveForm(formType);
    setAuthMode('form');
  };

  const onSignupSubmit = (data) => {
    console.log('Signup submitted:', data);
    // OTP-based authentication for signup
    handleSignupWithOtp(data);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 auth-container">
      <div className="pointer-events-none absolute inset-0">
        <div className="floating-shape absolute -top-16 -left-8 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="floating-shape floating-shape-delay absolute bottom-0 right-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-6xl"
      >
        <div className="auth-panels grid items-stretch gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="animated-gradient auth-left-panel relative flex min-h-[520px] flex-col justify-between gap-10 overflow-hidden rounded-[32px] p-10 text-white shadow-2xl"
          >
            <div className="pointer-events-none absolute inset-0 opacity-40">
              <span className="floating-shape absolute top-10 right-8 h-32 w-32 rounded-full bg-white/30 blur-3xl" />
              <span className="floating-shape floating-shape-delay absolute bottom-6 left-4 h-40 w-40 rounded-full bg-blue-200/30 blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col gap-6">
              <span className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">Candidate Portal</span>
              <h1 className="text-4xl font-semibold text-white lg:text-5xl">Recruva</h1>
              <h2 className="text-3xl font-semibold text-white">
                {activeForm === 'login' ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-base text-white/80 max-w-md">
                {activeForm === 'login'
                  ? 'Build once, apply everywhere—your journey starts here.'
                  : 'Already part of Recruva? Jump back in and continue your journey.'}
              </p>

              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleFormTab(activeForm === 'login' ? 'signup' : 'login')}
                className="mt-4 inline-flex w-fit items-center justify-center gap-3 rounded-full bg-white/90 px-8 py-3 font-semibold text-indigo-700 shadow-xl shadow-indigo-900/30 backdrop-blur"
              >
                {activeForm === 'login' ? 'Create account' : 'Go to login'}
                <FaArrowRight />
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="auth-right-panel relative rounded-[32px] border border-slate-100 bg-white/95 p-8 shadow-lg sm:p-10"
          >

            <div className="mb-6 space-y-2 text-center sm:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-500">
                {activeForm === 'login' ? 'Welcome back' : 'New to Recruva'}
              </p>
              <h2 className="text-3xl font-bold text-slate-900">
                {activeForm === 'login' ? 'Log in to continue' : 'Create your candidate account'}
              </h2>
              <p className="text-sm text-slate-500">
                {activeForm === 'login'
                  ? 'Access personalized job recommendations, saved roles, and live application tracking.'
                  : 'Set up your professional profile once and reuse it across every Recruva opportunity.'}
              </p>
            </div>

            <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 p-1 text-sm font-semibold text-slate-500 shadow-inner">

              {['login', 'signup'].map((form) => (
                <button
                  key={form}
                  type="button"
                  onClick={() => handleFormTab(form)}
                  className={`flex-1 rounded-full px-4 py-2 transition-all ${
                    activeForm === form ? 'bg-white text-indigo-600 shadow' : 'text-slate-500'
                  }`}
                >
                  {form === 'login' ? 'Login' : 'Sign Up'}
                </button>
              ))}
            </div>

            {authMode === 'otp' ? (
              <div className="mt-8 space-y-6 text-center">
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-slate-900">Verify your email</h3>
                  <p className="text-sm text-slate-500">Enter the 6-digit code we sent to {userEmail}</p>
                </div>

                <div className="flex justify-center gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="h-14 w-12 rounded-2xl border border-slate-200 bg-white text-center text-2xl font-semibold text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300"
                      placeholder="0"
                    />
                  ))}
                </div>

                <motion.button
                  type="button"
                  whileHover={{ scale: isVerifyingOtp ? 1 : 1.01 }}
                  whileTap={{ scale: isVerifyingOtp ? 1 : 0.98 }}
                  onClick={verifyOtp}
                  disabled={isVerifyingOtp}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3 font-semibold text-white shadow-lg shadow-indigo-500/30 transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isVerifyingOtp ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      Verify OTP
                    </>
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={timerActive || isSendingOtp}
                  className="text-sm font-medium text-indigo-600 transition hover:text-indigo-500 disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  {isSendingOtp ? 'Sending OTP…' : timerActive ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                </button>

                <button
                  type="button"
                  onClick={resetToForm}
                  className="text-sm text-slate-500 underline-offset-4 transition hover:text-slate-700"
                >
                  ← Back to {activeForm === 'login' ? 'Login' : 'Sign Up'}
                </button>
              </div>
            ) : authMode === 'verified' ? (
              <div className="mt-10 space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <FaCheck className="text-2xl text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900">Email verified!</h3>
                <p className="text-sm text-slate-500">{verificationMessage || 'You are all set. Redirecting you to your dashboard.'}</p>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetToForm}
                  className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3 font-semibold text-white shadow-lg shadow-indigo-500/30"
                >
                  Continue
                </motion.button>
              </div>
            ) : activeForm === 'login' ? (
              <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="mt-8 space-y-6">
                <InputField
                  icon={FaEnvelope}
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  registration={registerLogin('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  error={loginErrors.email?.message}
                />

                <InputField
                  icon={FaLock}
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  registration={registerLogin('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  error={loginErrors.password?.message}
                />

                <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    Remember me
                  </label>
                  <button type="button" className="font-semibold text-indigo-600 transition hover:text-indigo-500">
                    Forgot password?
                  </button>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3 font-semibold text-white shadow-lg shadow-indigo-500/30"
                >
                  Login
                  <FaArrowRight />
                </motion.button>

                <p className="text-center text-sm text-slate-500">
                  Need an account?{' '}
                  <button type="button" onClick={() => handleFormTab('signup')} className="font-semibold text-indigo-600 hover:text-indigo-500">
                    Sign up
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleSignupSubmit(onSignupSubmit)} className="mt-8 space-y-5">
                <InputField
                  icon={FaUser}
                  label="Full name"
                  placeholder="Jane Candidate"
                  registration={registerSignup('username', {
                    required: 'Name is required',
                    minLength: {
                      value: 3,
                      message: 'Name must be at least 3 characters',
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_ ]+$/,
                      message: 'Only letters, numbers, spaces, and underscores allowed',
                    },
                  })}
                  error={signupErrors.username?.message}
                />

                <InputField
                  icon={FaEnvelope}
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  registration={registerSignup('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  error={signupErrors.email?.message}
                />

                <InputField
                  icon={FaLock}
                  label="Password"
                  type="password"
                  placeholder="Create a strong password"
                  registration={registerSignup('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Include upper, lower, and numeric characters',
                    },
                  })}
                  error={signupErrors.password?.message}
                />

                <InputField
                  icon={FaLock}
                  label="Confirm password"
                  type="password"
                  placeholder="Repeat password"
                  registration={registerSignup('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === password || 'Passwords do not match',
                  })}
                  error={signupErrors.confirmPassword?.message}
                />

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3 font-semibold text-white shadow-lg shadow-indigo-500/30"
                >
                  Start verification
                  <FaArrowRight />
                </motion.button>

                <p className="text-center text-sm text-slate-500">
                  Already have an account?{' '}
                  <button type="button" onClick={() => handleFormTab('login')} className="font-semibold text-indigo-600 hover:text-indigo-500">
                    Sign in
                  </button>
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </motion.div>

      {showErrorPopup && (
        <div className="popup-overlay fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <FaTimes className="text-lg text-red-600" />
                </span>
                <h3 className="text-lg font-semibold text-slate-900">We hit a snag</h3>
              </div>
              <button onClick={closeErrorPopup} className="text-slate-400 transition hover:text-slate-600">
                <FaTimes className="text-xl" />
              </button>
            </div>
            <p className="text-sm text-slate-600">{errorMessage}</p>
            <div className="mt-6 flex justify-end">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={closeErrorPopup}
                className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30"
              >
                Okay
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;