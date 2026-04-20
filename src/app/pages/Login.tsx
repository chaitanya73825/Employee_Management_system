import React, { useState } from "react";
import { useNavigate } from "react-router";
import { GlassCard } from "../components/ui/GlassCard";
import { GlowButton } from "../components/ui/GlowButton";
import { GlowInput } from "../components/ui/GlowInput";
import { Lock, Mail, Fingerprint, ScanFace } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { api } from "../lib/api";
import { useAuth, type UserRole } from "../context/AuthContext";

const ROLES: { id: UserRole; label: string }[] = [
  { id: "admin", label: "Admin" },
  { id: "hr", label: "HR" },
  { id: "employee", label: "Employee" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setErrorMsg("");
    
    try {
      const data = await api.post("/login", { email, password });
      setUser(data.user);
      navigate(`/${data.user.role}/dashboard`);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <GlassCard 
          blur="xl" 
          glow
          className="w-full max-w-md p-8 md:p-10 relative overflow-hidden flex flex-col items-center"
        >
          {/* Subtle scanner line animation */}
          {isAuthenticating && (
            <motion.div
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.5)] z-50 pointer-events-none"
            />
          )}

          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center border border-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
               <ScanFace className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">EMS</h1>
            <p className="text-slate-500 text-sm mt-2">Employee Management System</p>
          </motion.div>

          <form onSubmit={handleLogin} className="w-full space-y-6">
            
            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                {errorMsg}
              </div>
            )}

            <div className="space-y-4">
              <GlowInput
                type="email"
                placeholder="Identification Node (Email)"
                icon={<Mail className="w-5 h-5" />}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <GlowInput
                type="password"
                placeholder="Secure Access Key"
                icon={<Lock className="w-5 h-5" />}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <GlowButton type="submit" className="w-full py-4 text-lg mt-2" size="lg">
              {isAuthenticating ? (
                <>
                  <Fingerprint className="w-5 h-5 animate-pulse text-white/80" />
                  <span className="text-white/80">Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Initialize Sequence</span>
                </>
              )}
            </GlowButton>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}
