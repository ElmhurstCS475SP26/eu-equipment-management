// Login Page - Default Landing Page
"use client";

import { SignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const role = user?.publicMetadata?.role;

    if (role === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, user, router]);

  if (!isLoaded) {
    return <div className="p-6">Loading...</div>;
  }

  if (isSignedIn) {
    return <div className="p-6">Redirecting...</div>;
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center gap-4 bg-slate-50 p-4">
      <SignIn routing="hash" signUpUrl="/sign-up" />
      <p className="text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <a href="/sign-up" className="font-medium text-blue-600 hover:underline">
          Create one here
        </a>
      </p>
    </div>
  );
}