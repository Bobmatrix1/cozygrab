import { useState } from 'react';
import { Button } from '../components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';
import { toast } from 'sonner';
import type { Page } from '../App';

interface OTPProps {
  onNavigate: (page: Page) => void;
}

export function OTP({ onNavigate }: OTPProps) {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      toast.success('Verification successful!');
      onNavigate('login');
      setIsLoading(false);
    }, 1000);
  };

  const handleResend = () => {
    toast.success('Verification code sent!');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-center gap-2">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold">CozyGrab</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold mb-2">Verify Your Account</h1>
            <p className="text-muted-foreground">
              Enter the 6-digit code we sent to your email
            </p>
            <p className="text-sm font-medium mt-2">john.doe@example.com</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Didn't receive the code?{' '}
              <button
                onClick={handleResend}
                className="text-primary hover:underline font-medium"
              >
                Resend
              </button>
            </p>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => onNavigate('login')}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
