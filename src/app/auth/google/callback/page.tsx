import AuthPage from '@/components/auth/AuthPage';
import GoogleCallback from '@/components/auth/google/GoogleCallback';

export default function GoogleCallbackPage() {
  return (
    <AuthPage title="Finishing sign-in" subtitle="We’re securely connecting your Google account.">
      <GoogleCallback />
    </AuthPage>
  );
}
