import AuthPage from '@/components/auth/AuthPage';
import Signup from '@/components/auth/emailpassword/Signup';

export default function SignupPage() {
  return (
    <AuthPage
      title="Create your account"
      subtitle="Start building a clearer path to your next opportunity."
    >
      <Signup />
    </AuthPage>
  );
}
