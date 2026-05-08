import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-6">
      <Card>
        <div className="w-full max-w-md space-y-4">
          <h1 className="text-2xl font-semibold">Reset password</h1>
          <Input placeholder="Email" />
          <Button className="w-full">Send reset link</Button>
        </div>
      </Card>
    </div>
  );
}
