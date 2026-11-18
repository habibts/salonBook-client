import type { Metadata } from "next"
import Link from "next/link"

import { AuthLayout } from "@/components/auth/auth-layout"
import { SignInForm } from "@/components/auth/sign-in-form"

export const metadata: Metadata = {
  title: "Sign In — SalonBook",
}

export default function SignInPage() {
  return (
    <AuthLayout
      title="Welcome Back"
      description="Sign in to your SalonBook account and manage your salon experience."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-gold-hover underline decoration-gold/50 underline-offset-4 transition-colors hover:text-midnight"
          >
            Create an Account
          </Link>
        </>
      }
    >
      <SignInForm />
    </AuthLayout>
  )
}
