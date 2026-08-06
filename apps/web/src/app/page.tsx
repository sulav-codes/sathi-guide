"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success("Welcome back to Sathi Guide Admin");
      router.push("/admin");
    } catch (err: any) {
      toast.error(err.message || "Failed to login");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background bg-gradient-to-br from-background to-active-card relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md p-8 rounded-2xl bg-card border border-border shadow-2xl shadow-shadow/5 backdrop-blur-xl relative z-10 transition-all duration-300 hover:shadow-primary/10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-primary to-tint rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-primary/30 transform transition-transform hover:scale-105">
            <span className="text-white font-bold text-2xl tracking-tighter">SG</span>
          </div>
          <h1 className="text-3xl font-bold text-text tracking-tight">Sathi Guide Admin</h1>
          <p className="text-text-secondary mt-2 text-sm">Enter your credentials to manage the platform</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2 transition-colors focus-within:text-primary">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-inactive-card border border-transparent focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10 text-text outline-none transition-all duration-200"
              placeholder="admin@sathiguide.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-2 transition-colors focus-within:text-primary">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-inactive-card border border-transparent focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10 text-text outline-none transition-all duration-200"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-primary hover:bg-tint text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-primary/30 hover:shadow-primary/50 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center group"
          >
            {isSubmitting ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <span className="flex items-center">
                Sign In
                <svg className="w-5 h-5 ml-2 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

