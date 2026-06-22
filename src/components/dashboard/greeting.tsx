"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/auth";

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function Greeting() {
  return isClerkConfigured ? <ClerkGreeting /> : <PlainGreeting />;
}

function useGreeting() {
  // computed after mount to avoid SSR/client time mismatch
  const [greeting, setGreeting] = useState("Welcome back");
  useEffect(() => setGreeting(timeGreeting()), []);
  return greeting;
}

function ClerkGreeting() {
  const greeting = useGreeting();
  const { user } = useUser();
  const name = user?.firstName ?? "";
  return (
    <h1 className="text-2xl font-bold tracking-tight text-ink">
      {greeting}
      {name ? `, ${name}` : ""}
    </h1>
  );
}

function PlainGreeting() {
  const greeting = useGreeting();
  return <h1 className="text-2xl font-bold tracking-tight text-ink">{greeting}</h1>;
}
