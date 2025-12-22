import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../components/ui/input-otp";
import SalonMindLogo from "./SalonMindLogo";
import { ArrowLeft, Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

const gradientStyle = {
  background:
    "linear-gradient(135deg, #0a1b3f 0%, #123b7c 45%, #08101f 100%)",
};

export default function Login() {
  const { sendOTP, resendOTP, loginWithOTP } = useAuth();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [challengeId, setChallengeId] = useState<string | null>(null);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const limited = digits.slice(0, 10);
    if (limited.length > 5) {
      return limited.slice(0, 5) + " " + limited.slice(5);
    }
    return limited;
  };

  const cleanPhone = () => "+91" + phoneNumber.replace(/\s/g, "");

  const validatePhone = () => {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
      toast.error("Please enter a valid 10-digit Indian mobile number");
      return false;
    }
    return true;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone()) {
      return;
    }

    setIsLoading(true);
    try {
      const challenge = await sendOTP(cleanPhone());
      setChallengeId(challenge.challengeId);
      setStep("otp");
      toast.success("OTP sent successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    if (!challengeId) {
      toast.error("OTP challenge not found. Please resend the code.");
      return;
    }

    try {
      await loginWithOTP({ challengeId, otp });
      toast.success("Login successful!");
    } catch (error: any) {
      toast.error(error.message || "OTP verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!challengeId) {
      toast.error("No active challenge. Please restart the login flow.");
      return;
    }

    setIsLoading(true);
    try {
      const challenge = await resendOTP(challengeId);
      setChallengeId(challenge.challengeId);
      setOtp("");
      toast.success("OTP resent successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep("phone");
    setOtp("");
    setChallengeId(null);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={gradientStyle}
    >
      <Card className="w-full max-w-md border-slate-800 bg-slate-900/80 backdrop-blur">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <SalonMindLogo size={48} />
            <div>
              <CardTitle className="text-white text-2xl">SalonMind</CardTitle>
              <CardDescription className="text-slate-300">
                Welcome back. Continue with OTP verification.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {step === "phone" ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-200">
                  Phone Number
                </Label>
                <div className="relative">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                    className="pl-10 text-lg"
                  />
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                </div>
                <p className="text-xs text-slate-400">
                  We will send a 6-digit OTP to this number
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Send OTP"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBackToPhone}
                  className="text-sm text-slate-300 flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" /> Change number
                </button>
                <p className="text-sm text-slate-400">{phoneNumber}</p>
              </div>
              <div className="space-y-3">
                <Label className="text-slate-200">Enter OTP</Label>
                <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                <p className="text-xs text-slate-400">
                  Didn&apos;t receive the code?{' '}
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-primary hover:underline"
                    disabled={isLoading}
                  >
                    Resend OTP
                  </button>
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Verify & Continue"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
