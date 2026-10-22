import AuthPage from "@/components/auth/AuthPage";
import Forgot from "@/components/auth/emailpassword/Forgot";

export default function ForgotPasswordPage() {
  return <AuthPage title="Reset your password" subtitle="We’ll email a secure link if an account matches your address."><Forgot /></AuthPage>;
}
