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
    //const role = "admin";

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
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50 p-4">
      <SignIn routing="hash" />
    </div>
  );
}