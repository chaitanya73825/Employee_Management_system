import React, { useState } from "react";
import { GlassCard } from "../../components/ui/GlassCard";
import { GlowButton } from "../../components/ui/GlowButton";
import { GlowInput } from "../../components/ui/GlowInput";
import { UserPlus, Fingerprint, Mail, Lock, User, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { useSystem } from "../../context/SystemContext";

export default function Hiring() {
  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorStatus, setErrorStatus] = useState("");
  const [successStatus, setSuccessStatus] = useState("");
  
  const { fetchUsers } = useSystem();

  const handleHire = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorStatus("");
    setSuccessStatus("");

    try {
      const apiUrl = (import.meta as any).env.VITE_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "bypass-tunnel-reminder": "true",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({ name, employeeId, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to hire employee");
      }

      setSuccessStatus(`Successfully hired ${name} (${employeeId})!`);
      // Clear form
      setName("");
      setEmployeeId("");
      setEmail("");
      setPassword("");
      
      // Update global context so the users page instantly reflects the DB change
      fetchUsers();
    } catch (err: any) {
      setErrorStatus(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 w-full max-w-4xl mx-auto mt-8">
      <header className="mb-4">
        <h1 className="text-3xl font-light tracking-tight flex items-center gap-3 text-slate-800">
          <UserPlus className="text-blue-500 w-8 h-8" /> Employee <span className="text-blue-500 font-bold">.HIRING</span>
        </h1>
        <p className="text-slate-500 mt-1">Onboard new personnel and integrate them directly into MongoDB</p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <GlassCard blur="xl" className="p-8">
          <form onSubmit={handleHire} className="space-y-6">
            
            {errorStatus && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-sm font-medium">
                {errorStatus}
              </div>
            )}
            
            {successStatus && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600 text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                {successStatus}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600 ml-1">Full Name</label>
                <GlowInput
                  type="text"
                  placeholder="e.g. Tony Stark"
                  icon={<User className="text-slate-400" />}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600 ml-1">Employee ID</label>
                <GlowInput
                  type="text"
                  placeholder="e.g. EMP-001"
                  icon={<Fingerprint className="text-slate-400" />}
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600 ml-1">Email Address</label>
                <GlowInput
                  type="email"
                  placeholder="name@company.com"
                  icon={<Mail className="text-slate-400" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600 ml-1">Secure Password</label>
                <GlowInput
                  type="password"
                  placeholder="••••••••"
                  icon={<Lock className="text-slate-400" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <GlowButton type="submit" disabled={isSubmitting} className="min-w-[200px]">
                {isSubmitting ? "Processing..." : "Confirm & Hire Employee"}
              </GlowButton>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}
