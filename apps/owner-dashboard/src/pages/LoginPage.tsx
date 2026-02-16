import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import heroImage from '../assets/login-hero.jpg';

// Color constants matching Figma design
const colors = {
  gold: '#FEBC2F',
  goldHover: '#E5AA2A',
  darkGray: '#262626',
  mediumGray: '#595959',
  lightGray: '#5F5F5F',
  inputBg: '#F8F8F8',
  inputBorder: 'rgba(178,178,178,0.25)',
  textLight: '#E6E6E6',
  textMuted: 'rgba(95,95,95,0.5)',
};

export default function LoginPage() {
  const { sendOTP, resendOTP, loginWithOTP, isLoading: authLoading } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [challengeId, setChallengeId] = useState<string | null>(null);

  // Resend timer countdown
  useEffect(() => {
    if (showOtpInput && resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showOtpInput, resendTimer]);

  const formatPhone = () => '+91' + phoneNumber;

  const validatePhone = () => {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast.error('Please enter a valid 10-digit Indian mobile number');
      return false;
    }
    return true;
  };

  const handleSendOtp = async () => {
    if (!validatePhone()) return;

    setIsLoading(true);
    try {
      const challenge = await sendOTP(formatPhone());
      setChallengeId(challenge.challengeId);
      setShowOtpInput(true);
      setResendTimer(30);
      setCanResend(false);
    } catch {
      // Toast is handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || !challengeId) return;

    setIsLoading(true);
    try {
      const challenge = await resendOTP(challengeId);
      setChallengeId(challenge.challengeId);
      setResendTimer(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    } catch {
      // Toast is handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      setOtp(pastedData.split(''));
      const lastInput = document.getElementById('otp-5');
      lastInput?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    if (!challengeId) {
      toast.error('Session expired. Please request a new OTP.');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithOTP({ challengeId, otp: otpValue });
    } catch {
      // Toast is handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && phoneNumber.length === 10) {
      handleSendOtp();
    }
  };

  const handleOtpSubmitKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && otp.every(d => d)) {
      handleVerify();
    }
  };

  const loading = isLoading || authLoading;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#ffffff' }}>
      {/* Left Section - Hero Image */}
      <div
        className="hidden lg:flex lg:w-1/2 relative"
        style={{ backgroundColor: '#1a1a1a' }}
      >
        <img
          src={heroImage}
          alt="SalonMind Dashboard"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Overlay Content */}
        <div
          className="absolute inset-0 flex flex-col justify-end p-12"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.3), transparent)' }}
        >
          {/* Features */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="text-center">
              <div style={{ width: '1px', height: '48px', backgroundColor: 'rgba(255,255,255,0.8)', margin: '0 auto 12px' }}></div>
              <p style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', lineHeight: '1.2' }}>
                Manage<br />Appointments
              </p>
            </div>
            <div className="text-center">
              <div style={{ width: '1px', height: '48px', backgroundColor: 'rgba(255,255,255,0.8)', margin: '0 auto 12px' }}></div>
              <p style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', lineHeight: '1.2' }}>
                Track<br />Sales & Insights
              </p>
            </div>
            <div className="text-center">
              <div style={{ width: '1px', height: '48px', backgroundColor: 'rgba(255,255,255,0.8)', margin: '0 auto 12px' }}></div>
              <p style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', lineHeight: '1.2' }}>
                Automate<br />Social Media
              </p>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="text-center">
            <p style={{ color: 'white', fontSize: '18px' }}>
              Trusted by <span style={{ color: colors.gold, fontWeight: 'bold', fontSize: '24px' }}>200+</span> Salons Across India
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div style={{ width: '8px', height: '8px', backgroundColor: 'white', borderRadius: '50%' }}></div>
              <div style={{ width: '8px', height: '8px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '50%' }}></div>
              <div style={{ width: '8px', height: '8px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '50%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12"
        style={{ backgroundColor: colors.darkGray }}
      >
        <div style={{ width: '100%', maxWidth: '28rem' }}>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 style={{ color: 'white', fontSize: '20px', marginBottom: '16px' }}>
              Sign in to your <span style={{ color: colors.gold, fontWeight: 'bold' }}>SalonMind</span> Dashboard
            </h1>
            <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
          </div>

          {/* Login Form */}
          <div className="space-y-6">
            {/* Step 1: Phone Number */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: colors.gold,
                    borderRadius: '50%'
                  }}
                >
                  <span style={{ color: colors.mediumGray, fontWeight: '600', fontSize: '14px' }}>1</span>
                </div>
                <label style={{ color: 'white', fontWeight: '500' }}>Enter Your Mobile Number</label>
              </div>

              <div
                className="flex items-center gap-4 p-4 rounded-lg"
                style={{
                  backgroundColor: colors.inputBg,
                  border: `1px solid ${colors.inputBorder}`
                }}
              >
                <span style={{ color: colors.lightGray, fontSize: '14px' }}>+91 |</span>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  onKeyDown={handlePhoneKeyDown}
                  disabled={loading || showOtpInput}
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    outline: 'none',
                    border: 'none',
                    fontSize: '14px',
                    color: colors.lightGray,
                    opacity: (loading || showOtpInput) ? 0.5 : 1
                  }}
                />
              </div>

              <button
                onClick={handleSendOtp}
                disabled={phoneNumber.length < 10 || loading || showOtpInput}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg transition-colors"
                style={{
                  backgroundColor: (phoneNumber.length < 10 || loading || showOtpInput) ? 'rgba(254,188,47,0.5)' : colors.gold,
                  color: colors.mediumGray,
                  fontWeight: '600',
                  cursor: (phoneNumber.length < 10 || loading || showOtpInput) ? 'not-allowed' : 'pointer'
                }}
              >
                {loading && !showOtpInput && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign in
              </button>
            </div>

            {/* Step 2: OTP */}
            {showOtpInput && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: '24px',
                      height: '24px',
                      backgroundColor: colors.gold,
                      borderRadius: '50%'
                    }}
                  >
                    <span style={{ color: colors.mediumGray, fontWeight: '600', fontSize: '14px' }}>2</span>
                  </div>
                  <label style={{ color: 'white', fontWeight: '500' }}>Enter OTP</label>
                </div>

                {/* OTP Input Fields */}
                <div className="flex gap-3 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => {
                        handleOtpKeyDown(index, e);
                        if (index === 5) handleOtpSubmitKeyDown(e);
                      }}
                      disabled={loading}
                      style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: colors.inputBg,
                        border: `1px solid ${colors.inputBorder}`,
                        borderRadius: '16px',
                        textAlign: 'center',
                        fontSize: '18px',
                        color: '#333',
                        outline: 'none',
                        opacity: loading ? 0.5 : 1
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={handleVerify}
                  disabled={otp.some(digit => !digit) || loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg transition-colors"
                  style={{
                    backgroundColor: (otp.some(digit => !digit) || loading) ? 'rgba(254,188,47,0.5)' : colors.gold,
                    color: colors.mediumGray,
                    fontWeight: '600',
                    cursor: (otp.some(digit => !digit) || loading) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Verify & Continue
                </button>

                {/* Resend OTP */}
                <div className="flex items-center justify-center gap-4">
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(230,230,230,0.3)' }}></div>
                  <button
                    onClick={handleResendOtp}
                    disabled={!canResend || loading}
                    style={{
                      fontSize: '14px',
                      color: colors.textLight,
                      cursor: (!canResend || loading) ? 'not-allowed' : 'pointer',
                      background: 'none',
                      border: 'none'
                    }}
                  >
                    {canResend ? (
                      <span style={{ color: colors.gold }}>Resend OTP</span>
                    ) : (
                      <>
                        Resend OTP in{' '}
                        <span style={{ color: colors.gold }}>{resendTimer} sec</span>
                      </>
                    )}
                  </button>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(230,230,230,0.3)' }}></div>
                </div>

                {/* Change number link */}
                <div className="text-center">
                  <button
                    onClick={() => {
                      setShowOtpInput(false);
                      setOtp(['', '', '', '', '', '']);
                      setChallengeId(null);
                    }}
                    style={{
                      fontSize: '14px',
                      color: 'rgba(230,230,230,0.7)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    ← Change phone number
                  </button>
                </div>
              </div>
            )}

            {/* Terms */}
            <div className="flex items-center gap-2 pt-4">
              <svg style={{ width: '24px', height: '8px', flexShrink: 0 }} viewBox="0 0 26.5 7.364" fill="none">
                <path d="M0.499998 3.68198L22.182 0.499978L22.182 6.86398L0.499998 3.68198Z" fill="white" />
              </svg>
              <p style={{ fontSize: '14px', color: colors.textLight }}>
                By continuing, you agree to our{' '}
                <a href="/terms" style={{ color: colors.gold, textDecoration: 'underline' }}>
                  Terms of Service.
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
