import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../modules/auth/AuthProvider";

const normalizePhone = (value: string) => {
  const digits = value.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) {
    return digits;
  }
  return `+91${digits}`;
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const { sendOtp, resendOtp, verifyOtp, isAuthenticated } = useAuth();
  const [phone, setPhone] = useState("+91");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timer, setTimer] = useState<number>(0);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!challengeId || timer <= 0) return;
    const interval = setInterval(() => setTimer((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, [challengeId, timer]);

  const canResend = useMemo(() => Boolean(challengeId) && timer === 0, [challengeId, timer]);

  const handleSendOtp = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSending(true);
    try {
      const normalized = normalizePhone(phone);
      const challenge = await sendOtp(normalized);
      setChallengeId(challenge.challengeId);
      setTimer(Math.floor(challenge.expiresIn / 1000));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to send OTP";
      setError(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleResend = async () => {
    if (!challengeId || !canResend) return;
    setError(null);
    setIsSending(true);
    try {
      const challenge = await resendOtp(challengeId);
      setChallengeId(challenge.challengeId);
      setTimer(Math.floor(challenge.expiresIn / 1000));
      setOtp("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to resend OTP";
      setError(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async (event: FormEvent) => {
    event.preventDefault();
    if (!challengeId) {
      setError("Request an OTP first");
      return;
    }
    setIsVerifying(true);
    setError(null);
    try {
      await verifyOtp({ challengeId, otp });
      navigate("/home", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "OTP verification failed";
      setError(message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-employee-500/10 to-white px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Salon Employee Login</h1>
          <p className="text-sm text-slate-500">
            Enter your phone number to receive a secure OTP.
          </p>
        </div>
        <form className="space-y-4" onSubmit={challengeId ? handleVerify : handleSendOtp}>
          <label className="block text-sm font-medium text-slate-600">
            Phone Number
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-employee-600 focus:outline-none"
              placeholder="+91XXXXXXXXXX"
            />
          </label>

          {challengeId && (
            <label className="block text-sm font-medium text-slate-600">
              OTP Code
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/[^0-9]/g, ""))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2 text-center text-lg tracking-widest focus:border-employee-600 focus:outline-none"
                placeholder="Enter 6 digit OTP"
              />
            </label>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          {!challengeId ? (
            <button
              type="submit"
              className="w-full rounded-lg bg-employee-600 px-4 py-2 font-semibold text-white"
              disabled={isSending}
            >
              {isSending ? "Sending..." : "Send OTP"}
            </button>
          ) : (
            <div className="space-y-3">
              <button
                type="submit"
                className="w-full rounded-lg bg-employee-600 px-4 py-2 font-semibold text-white"
                disabled={isVerifying || otp.length < 4}
              >
                {isVerifying ? "Verifying..." : "Verify OTP"}
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend || isSending}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
              >
                {canResend ? "Resend OTP" : `Resend available in ${timer}s`}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
