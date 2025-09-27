import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaUser, FaEnvelope, FaLock, FaArrowRight, FaCheck, FaTimes } from 'react-icons/fa';
import './Auth.css';
import { ACCESS_TOKEN, } from "./../../constants";

const AuthPage = () => {
  const [activeForm, setActiveForm] = useState('signup'); // 'login' or 'signup'
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
    setActiveForm(activeForm === 'login' ? 'signup' : 'login');
    console.log(`Switch to ${activeForm === 'login' ? 'signup' : 'login'} form`);
  };

  const onSignupSubmit = (data) => {
    console.log('Signup submitted:', data);
    // OTP-based authentication for signup
    handleSignupWithOtp(data);
  };


  const switchToSignup = () => {
    setActiveForm('signup');
    console.log('Switch to signup form');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 auth-container overflow-hidden">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh]">
        <div className="flex flex-col lg:flex-row">
          {/* Login Section - Left Panel */}
          <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-900 to-blue-600 p-8 flex flex-col items-center text-white gradient-bg auth-panel lg:rounded-l-2xl min-h-[500px]">
            {/* Recruva Branding */}
            <div className="mb-6">
              <h1 className="text-5xl font-bold text-white mb-2">Recruva</h1>
              <div className="w-24 h-1 bg-white mx-auto rounded-full"></div>
            </div>
            
            <div className="text-center max-w-md flex flex-col justify-center" style={{ minHeight: 'calc(100% - 120px)' }}>
              <h1 className="text-4xl font-bold mb-4 uppercase tracking-wide auth-title">
                {activeForm === 'login' ? 'CREATE ACCOUNT!' : 'WELCOME BACK!'}
              </h1>
              <p className="text-lg mb-6 opacity-90 leading-relaxed auth-subtitle">
                {activeForm === 'login' 
                  ? 'New to our platform? Click below to create your account.' 
                  : 'Already have an account? Click below to continue using the service.'}
              </p>
              <button 
                onClick={handleToggleForm}
                className="bg-white text-blue-900 px-8 py-3 rounded-full font-semibold text-lg transition-all duration-300 hover:bg-gray-100 hover:scale-105 transform shadow-lg btn-hover-lift mb-4"
              >
                {activeForm === 'login' ? 'SIGN UP' : 'SIGN IN'}
              </button>
            </div>
          </div>

          {/* Form Section - Right Panel */}
          <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center auth-panel lg:rounded-r-2xl rounded-b-2xl">
            <div className="max-w-md mx-auto w-full min-h-[500px] flex flex-col justify-center">
              {authMode === 'otp' ? (
                // OTP Verification Form
                <div className="space-y-6 flex-1 flex flex-col justify-center">
                  <div className="text-center mb-4">
                    <h2 className="text-3xl font-bold text-blue-900 mb-2 auth-title">Verify Email</h2>
                    <p className="text-gray-600 auth-subtitle">
                      We've sent a 6-digit code to {userEmail}
                    </p>
                  </div>
                  
                  <div className="flex justify-center gap-3 mb-6">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        placeholder="0"
                      />
                    ))}
                  </div>
                  
                  <div className="space-y-4">
                    <button
                      onClick={verifyOtp}
                      disabled={isVerifyingOtp}
                      className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold text-lg transition-all duration-300 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isVerifyingOtp ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <FaCheck className="text-lg" />
                          Verify OTP
                        </>
                      )}
                    </button>
                    
                    <div className="text-center">
                      <button
                        onClick={resendOtp}
                        disabled={timerActive || isSendingOtp}
                        className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSendingOtp ? 'Sending...' : 
                         timerActive ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                      </button>
                    </div>
                    
                    <button
                      onClick={resetToForm}
                      className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm transition-colors"
                    >
                      ← Back to {activeForm === 'login' ? 'Login' : 'Signup'}
                    </button>
                  </div>
                </div>
              ) : authMode === 'verified' ? (
                // Success Screen
                <div className="space-y-6 text-center flex-1 flex flex-col justify-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaCheck className="text-2xl text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-green-600 mb-2">Email Verified!</h2>
                  <p className="text-gray-600 mb-4">
                    {verificationMessage || 'Your email has been successfully verified. You can now access your account.'}
                  </p>
                  <button
                    onClick={resetToForm}
                    className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold text-lg transition-all duration-300 hover:bg-blue-800"
                  >
                    Continue to Dashboard
                  </button>
                </div>
              ) : activeForm === 'login' ? (
                // Login Form
                <div className="space-y-4 flex-1 flex flex-col justify-center">
                  <div className="text-center mb-4">
                    <h2 className="text-3xl font-bold text-blue-900 mb-2 auth-title">Login</h2>
                    <p className="text-gray-600 auth-subtitle">Enter your credentials to continue</p>
                  </div>
                  
                  <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        {...registerLogin('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-gray-400 input-field ${loginErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Email"
                      />
                      {loginErrors.email && (
                        <p className="mt-1 text-sm text-red-600">{loginErrors.email.message}</p>
                      )}
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <input
                        type="password"
                        {...registerLogin('password', {
                          required: 'Password is required',
                          minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters'
                          }
                        })}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-gray-400 input-field ${loginErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Password"
                      />
                      {loginErrors.password && (
                        <p className="mt-1 text-sm text-red-600">{loginErrors.password.message}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-gray-600">Remember me</span>
                      </label>
                      <a href="#" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">Forgot password?</a>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-900 text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-blue-800 btn-hover-lift"
                      >
                        LOGIN
                      </button>
                      <button
                        type="button"
                        onClick={switchToSignup}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-gray-300"
                      >
                        SIGN UP
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                // Signup Form
                <div className="space-y-4 flex-1 flex flex-col justify-center">
                  <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-blue-900 text-center mb-2 auth-title">Create Account</h2>
                    <p className="text-gray-600 text-center auth-subtitle">Fill in the details below to create your account</p>
                  </div>
                  
                  {/* Signup Form */}
                  <form onSubmit={handleSignupSubmit(onSignupSubmit)} className="space-y-6">
                    <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        {...registerSignup('username', {
                          required: 'Username is required',
                          minLength: {
                            value: 3,
                            message: 'Username must be at least 3 characters'
                          },
                          pattern: {
                            value: /^[a-zA-Z0-9_]+$/,
                            message: 'Username can only contain letters, numbers, and underscores'
                          }
                        })}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-gray-400 input-field ${signupErrors.username ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Username"
                      />
                      </div>
                      {signupErrors.username && (
                        <p className="mt-1 text-sm text-red-600">{signupErrors.username.message}</p>
                      )}
                    </div>
                    
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        {...registerSignup('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-gray-400 input-field ${signupErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Email"
                      />
                      {signupErrors.email && (
                        <p className="mt-1 text-sm text-red-600">{signupErrors.email.message}</p>
                      )}
                    </div>
                   </div>
                    <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <input
                        type="password"
                        {...registerSignup('password', {
                          required: 'Password is required',
                          minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters'
                          },
                          pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                            message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                          }
                        })}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-gray-400 input-field ${signupErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Password"
                      />
                    </div>
                      {signupErrors.password && (
                        <p className="mt-1 text-sm text-red-600">{signupErrors.password.message}</p>
                      )}
                    </div>
                    
                    <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <input
                        type="password"
                        {...registerSignup('confirmPassword', {
                          required: 'Please confirm your password',
                          validate: (value) => value === password || 'Passwords do not match'
                        })}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-gray-400 input-field ${signupErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Confirm Password"
                      />
                      </div>
                      {signupErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{signupErrors.confirmPassword.message}</p>
                      )}
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold text-lg transition-all duration-300 hover:bg-blue-800 hover:scale-105 transform shadow-lg btn-hover-lift"
                    >
                      SIGN UP
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Error Popup */}
      {showErrorPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 popup-overlay">
          <div className="bg-white rounded-lg p-6 max-w-md w-mx-4 shadow-2xl transform transition-all duration-300 scale-95 animate-scaleIn">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-red-100 rounded-full p-2 mr-3">
                  <FaTimes className="text-red-600 text-lg" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Error</h3>
              </div>
              <button
                onClick={closeErrorPopup}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            <p className="text-gray-700 mb-6">{errorMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={closeErrorPopup}
                className="bg-blue-900 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-blue-800 hover:scale-105 transform"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;