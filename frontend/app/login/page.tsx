"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  GraduationCap,
  Building2,
  ArrowRight,
  Sparkles,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regBranch, setRegBranch] = useState("");
  const [regCgpa, setRegCgpa] = useState("");
  const [regCollege, setRegCollege] = useState("");

  const branches = [
    "CSE",
    "IT",
    "ECE",
    "EEE",
    "Mechanical",
    "Civil",
    "MBA",
    "BCA",
    "Other",
  ];

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    return strength;
  };

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = [
    "",
    "bg-red-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-emerald-500",
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: authError } =
      await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (regPassword !== regConfirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    if (regPassword.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email: regEmail,
      password: regPassword,
      options: {
        data: {
          name: regName,
          branch: regBranch,
          cgpa: regCgpa ? parseFloat(regCgpa) : null,
          college: regCollege,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Update the profile with additional details (trigger creates the row)
      await supabase.from("users").upsert({
        id: data.user.id,
        email: regEmail,
        name: regName,
        branch: regBranch,
        cgpa: regCgpa ? parseFloat(regCgpa) : null,
        college: regCollege,
      });

      // If session exists (email confirm disabled), redirect directly
      if (data.session) {
        router.push("/dashboard");
        return;
      }

      setSuccess(true);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(forgotEmail);
    if (resetError) {
      setError(resetError.message);
    } else {
      setForgotSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#07080F] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#0A0B15] border border-[#12142A] rounded-2xl p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Account Created! 🎉
          </h2>
          <p className="text-slate-400 mb-6">
            Check your email to confirm your account. Once confirmed, you can
            sign in and start tracking opportunities.
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setActiveTab("login");
            }}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080F] flex">
      {/* Left Panel - Desktop only */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 animated-gradient" />
        <div className="absolute inset-0 pattern-bg" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-[150px]" />

        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-4xl">🔔</span>
            <span className="text-3xl font-black gradient-text">
              OpportUnity
            </span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            Never miss an opportunity
            <br />
            buried in WhatsApp again
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-10">
            Paste any forward → AI extracts everything → deadlines tracked →
            you apply on time.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                R
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Rahul Sharma
                </p>
                <p className="text-xs text-slate-500">
                  CSE, 3rd Year — IIT Delhi
                </p>
              </div>
            </div>
            <p className="text-slate-300 text-sm italic leading-relaxed">
              &ldquo;I was missing 3-4 opportunities every semester because they
              were buried in WhatsApp groups. OpportUnity changed everything —
              extracted, organized, and reminded me before every
              deadline.&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Forgot Password Modal */}
          {showForgotPassword ? (
            <div className="bg-[#0A0B15] border border-[#12142A] rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Reset Password
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                Enter your email and we&apos;ll send you a reset link.
              </p>

              {forgotSuccess ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                  <p className="text-emerald-400 font-medium mb-4">
                    Reset link sent! Check your email.
                  </p>
                  <button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotSuccess(false);
                    }}
                    className="text-indigo-400 text-sm hover:underline"
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword}>
                  {error && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 mb-4">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}
                  <div className="relative mb-4">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-[#12142A] rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50 mb-4"
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setError("");
                    }}
                    className="w-full text-center text-sm text-slate-400 hover:text-indigo-400"
                  >
                    Back to Login
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-[#0A0B15] border border-[#12142A] rounded-2xl p-8">
              {/* Mobile Logo */}
              <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
                <span className="text-2xl">🔔</span>
                <span className="text-xl font-bold gradient-text">
                  OpportUnity
                </span>
              </div>

              {/* Tabs */}
              <div className="flex mb-8 bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => {
                    setActiveTab("login");
                    setError("");
                  }}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${
                    activeTab === "login"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setActiveTab("register");
                    setError("");
                  }}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${
                    activeTab === "register"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 mb-4">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* LOGIN FORM */}
              {activeTab === "login" && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-[#12142A] rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-11 py-3 bg-white/5 border border-[#12142A] rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(true);
                        setError("");
                      }}
                      className="text-sm text-indigo-400 hover:text-indigo-300"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Sign In <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#12142A]" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-4 text-xs text-slate-500 bg-[#0A0B15]">
                        or continue with
                      </span>
                    </div>
                  </div>

                  {/* Google */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-[#12142A] hover:border-white/20 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </button>

                  <p className="text-center text-sm text-slate-500 mt-4">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("register");
                        setError("");
                      }}
                      className="text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      Register →
                    </button>
                  </p>
                </form>
              )}

              {/* REGISTER FORM */}
              {activeTab === "register" && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-[#12142A] rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-[#12142A] rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password (min 8 characters)"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                        minLength={8}
                        className="w-full pl-11 pr-11 py-3 bg-white/5 border border-[#12142A] rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {regPassword && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 flex gap-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`h-1.5 flex-1 rounded-full transition-all ${
                                getPasswordStrength(regPassword) >= level
                                  ? strengthColor[
                                      getPasswordStrength(regPassword)
                                    ]
                                  : "bg-white/10"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-slate-500">
                          {strengthLabel[getPasswordStrength(regPassword)]}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-11 py-3 bg-white/5 border border-[#12142A] rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <select
                        value={regBranch}
                        onChange={(e) => setRegBranch(e.target.value)}
                        required
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-[#12142A] rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all appearance-none"
                      >
                        <option value="" className="bg-[#0A0B15]">
                          Branch
                        </option>
                        {branches.map((b) => (
                          <option key={b} value={b} className="bg-[#0A0B15]">
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      placeholder="CGPA"
                      value={regCgpa}
                      onChange={(e) => setRegCgpa(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-[#12142A] rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="College Name"
                      value={regCollege}
                      onChange={(e) => setRegCollege(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-[#12142A] rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Create Account{" "}
                        <Sparkles className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-sm text-slate-500 mt-4">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("login");
                        setError("");
                      }}
                      className="text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      Sign In →
                    </button>
                  </p>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
