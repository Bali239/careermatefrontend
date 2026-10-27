import AuthPage from '@/components/auth/AuthPage';
import ResetPassword from '@/components/auth/emailpassword/ResetPassword';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <AuthPage
      title="Choose a new password"
      subtitle="Set a new password for your CareerMate account."
    >
      <ResetPassword token={token} />
    </AuthPage>
  );
}
