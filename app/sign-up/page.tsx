import type { Metadata } from "next"
import Link from "next/link"

import { AuthLayout } from "@/components/auth/auth-layout"
import { SignUpForm } from "@/components/auth/sign-up-form"

export const metadata: Metadata = {
  title: "Sign Up — SalonBook",
}

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Create Your Account"
      description="Join SalonBook and discover premium salon services."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-gold-hover underline decoration-gold/50 underline-offset-4 transition-colors hover:text-midnight"
          >
            Sign In
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthLayout>
  )
}
