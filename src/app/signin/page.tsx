import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "@/components/SignInForm";

export const metadata: Metadata = {
  title: "Sign in · SkyHunter",
  description: "Sign in to your SkyHunter account.",
};

export default function SignInPage() {
  return (
    <section className="bg-sky-art">
      <div className="mx-auto flex max-w-md flex-col justify-center px-5 py-20 sm:py-28">
        <div className="lift rounded-2xl border border-steel-line bg-void p-6 sm:p-8">
          <Suspense fallback={<div className="h-80" />}>
            <SignInForm />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-sm text-fog">
          Signing in keeps you connected to the community and your saved
          opportunities.
        </p>
      </div>
    </section>
  );
}
