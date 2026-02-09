"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) { setErrorMsg(error.message); return; }
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/Lumen+Therapy+Collective-+Logo.png"
            alt="Lumen Therapy Collective logo"
            width={60}
            height={60}
            className="rounded-md mb-3"
          />
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            Sign up for Mood Tracker
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
            />
          </div>
          {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <a href="/auth/login" className="text-blue-600 hover:underline font-medium">Log in</a>
        </p>
      </div>
    </div>
  );
}