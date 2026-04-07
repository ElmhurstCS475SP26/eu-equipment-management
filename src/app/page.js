// Login Page - Default Landing Page
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Video, Mail, Lock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // Mock authentication for the placeholder
    if (email && password) {
      if (email === 'admin@elmhurst.edu') {
        router.push('/admin');
        toast.success('Logged in as Admin');
      } else {
        router.push('/dashboard');
        toast.success('Logged in successfully');
      }
    } else {
      toast.error('Invalid credentials');
    }
  };

  const fillDemoCredentials = (role) => {
    if (role === 'student') {
      setEmail('demo@elmhurst.edu');
      setPassword('student123');
    } else {
      setEmail('admin@elmhurst.edu');
      setPassword('admin123');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Video className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-2xl">MediaHub</CardTitle>
            <CardDescription className="mt-2">
              Equipment Reservation System
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {/* Demo Credentials Alert */}
          <Alert className="mb-4 border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm">
              <div className="font-medium text-blue-900 mb-2">Demo Credentials:</div>
              <div className="space-y-1 text-blue-800">
                <div className="flex justify-between items-center">
                  <div>
                    <strong>Student:</strong> demo@elmhurst.edu / student123
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-xs text-blue-600"
                    onClick={() => fillDemoCredentials('student')}
                  >
                    Fill
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <strong>Admin:</strong> admin@elmhurst.edu / admin123
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-xs text-blue-600"
                    onClick={() => fillDemoCredentials('admin')}
                  >
                    Fill
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Elmhurst Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="student@elmhurst.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button variant="link" className="h-auto p-0 text-sm text-blue-600" type="button">
                  Forgot Password?
                </Button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Sign In
            </Button>
          </form>

          {/* Create Account Button */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Button
                variant="link"
                className="h-auto p-0 text-blue-600 font-medium"
                onClick={() => router.push('/register')}
                type="button"
              >
                Create Account
              </Button>
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <p className="w-full text-center text-xs text-gray-500">
            For Digital Media Department Students and Faculty
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}