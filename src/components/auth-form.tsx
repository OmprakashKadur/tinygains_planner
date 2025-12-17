"use client";

import { useState } from "react";
import { login, signup } from "@/app/auth/actions";
import { cn } from "@/lib/utils";

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");

  async function handleSubmit(formData: FormData) {
    setMessage("");
    if (isLogin) {
      const res = await login(formData);
      if (res?.error) setMessage(res.error);
    } else {
      const res = await signup(formData);
      if (res?.error) setMessage(res.error);
      if (res?.success) setMessage(res.message!);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6 bg-card rounded-lg border shadow-sm">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {isLogin ? "Welcome back" : "Create an account"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isLogin
            ? "Enter your credentials to access your account"
            : "Enter your email below to create your account"}
        </p>
      </div>
      <form action={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div className="space-y-2">
            <label
              className="text-sm font-medium leading-none"
              htmlFor="full_name"
            >
              Full Name
            </label>
            <input
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              id="full_name"
              name="full_name"
              placeholder="John Doe"
              required
              type="text"
            />
          </div>
        )}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none" htmlFor="email">
            Email
          </label>
          <input
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            id="email"
            name="email"
            placeholder="m@example.com"
            required
            type="email"
          />
        </div>
        <div className="space-y-2">
          <label
            className="text-sm font-medium leading-none"
            htmlFor="password"
          >
            Password
          </label>
          <input
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            id="password"
            name="password"
            required
            type="password"
          />
        </div>
        {message && <p className="text-sm text-red-500">{message}</p>}
        <button
          className={cn(
            "inline-flex w-full items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            "bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          )}
          type="submit"
        >
          {isLogin ? "Sign In" : "Sign Up"}
        </button>
      </form>
      <div className="text-center text-sm">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="underline hover:text-primary"
        >
          {isLogin
            ? "Don't have an account? Sign Up"
            : "Already have an account? Sign In"}
        </button>
      </div>
    </div>
  );
}
