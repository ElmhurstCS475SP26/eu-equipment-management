// Sign-Up Page
"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50 p-4">
      <SignUp routing="hash" signInUrl="/" />
    </div>
  );
}
