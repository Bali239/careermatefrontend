import AuthPage from "@/components/auth/AuthPage";
import Login from "@/components/auth/emailpassword/Login";

export default function LoginPage() {
  return <AuthPage title="Welcome back" subtitle="Sign in to continue your career journey."><Login /></AuthPage>;
}
