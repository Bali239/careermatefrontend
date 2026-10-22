import AuthPage from "@/components/auth/AuthPage";
import VerifyEmail from "@/components/auth/emailpassword/VerifyEmail";

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <AuthPage title="Verify your email" subtitle="Confirm your address to activate your account."><VerifyEmail token={token} /></AuthPage>;
}
