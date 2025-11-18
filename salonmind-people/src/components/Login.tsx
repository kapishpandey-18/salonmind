import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import SalonMindLogo from "./SalonMindLogo";
import { ArrowLeft, Loader2, Smartphone, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

interface LoginProps {
  onLogin: () => void;
  onSignUp: (phoneNumber: string) => void;
}

export default function Login({ onSignUp }: LoginProps) {
  const { login, sendOTP, loginWithOTP } = useAuth(); // Use AuthContext instead of prop

  // Sign In - Email/Password states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Sign In - OTP states
  const [signInMethod, setSignInMethod] = useState<"email" | "otp">("email");
  const [signInOtpStep, setSignInOtpStep] = useState<"phone" | "otp">("phone");
  const [signInPhone, setSignInPhone] = useState("");
  const [signInOtp, setSignInOtp] = useState("");
  const [isSignInOtpLoading, setIsSignInOtpLoading] = useState(false);

  // Sign Up states
  const [signUpStep, setSignUpStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Sign In - Email/Password Handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsSigningIn(true);

    try {
      // Call the real login API
      await login({ email, password });
      toast.success("Welcome back to SalonMind!");
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  // Sign In - Send OTP Handler
  const handleSignInSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(signInPhone.replace(/\s/g, ""))) {
      toast.error("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    setIsSignInOtpLoading(true);

    try {
      const cleanPhone = "+91" + signInPhone.replace(/\s/g, "");
      await sendOTP(cleanPhone);
      setSignInOtpStep("otp");
      toast.success("OTP sent successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setIsSignInOtpLoading(false);
    }
  };

  // Sign In - Verify OTP Handler
  const handleSignInVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signInOtp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsSignInOtpLoading(true);

    try {
      const cleanPhone = "+91" + signInPhone.replace(/\s/g, "");
      await loginWithOTP({ phoneNumber: cleanPhone, otp: signInOtp });
      toast.success("Login successful!");
    } catch (error: any) {
      toast.error(error.message || "OTP verification failed");
    } finally {
      setIsSignInOtpLoading(false);
    }
  };

  const handleSignInResendOTP = () => {
    setIsSignInOtpLoading(true);
    setTimeout(() => {
      setIsSignInOtpLoading(false);
      toast.success("OTP resent successfully!");
    }, 1000);
  };

  const handleSignInBackToPhone = () => {
    setSignInOtpStep("phone");
    setSignInOtp("");
  };

  // Sign Up - Send OTP Handler
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Indian phone number (10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
      toast.error("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    setIsLoading(true);

    try {
      const cleanPhone = "+91" + phoneNumber.replace(/\s/g, "");
      await sendOTP(cleanPhone);
      setSignUpStep("otp");
      toast.success("OTP sent successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up - Verify OTP Handler
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      const cleanPhone = "+91" + phoneNumber.replace(/\s/g, "");
      await loginWithOTP({ phoneNumber: cleanPhone, otp: otp });
      // On success, the onSignUp callback will handle navigation
      onSignUp(cleanPhone);
    } catch (error: any) {
      toast.error(error.message || "OTP verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      const cleanPhone = "+91" + phoneNumber.replace(/\s/g, "");
      await sendOTP(cleanPhone);
      toast.success("OTP resent successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setSignUpStep("phone");
    setOtp("");
  };

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const limited = digits.slice(0, 10);
    if (limited.length > 5) {
      return limited.slice(0, 5) + " " + limited.slice(5);
    }
    return limited;
  };

  const toggleSignInMethod = () => {
    setSignInMethod(signInMethod === "email" ? "otp" : "email");
    // Reset states when switching
    setSignInOtpStep("phone");
    setSignInPhone("");
    setSignInOtp("");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #0c4a6e 50%, #1e3a5f 75%, #0f172a 100%)",
      }}
    >
      <Card className="w-full max-w-md shadow-xl border-blue-400/30 bg-slate-800/80 backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto">
            <SalonMindLogo size={64} />
          </div>
          <div>
            <CardTitle className="text-blue-100">SalonMind</CardTitle>
            <CardDescription className="text-blue-300/70">
              Transform your salon business with AI
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Sign In Tab */}
            <TabsContent value="signin">
              {signInMethod === "email" ? (
                // Email/Password Sign In
                <form onSubmit={handleSignIn} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
                      <Mail className="w-5 h-5" />
                      <p className="text-sm">Sign in with your credentials</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="admin@salon.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                    disabled={isSigningIn}
                  >
                    {isSigningIn ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={toggleSignInMethod}
                      className="text-sm text-blue-400 hover:text-blue-300 flex items-center justify-center gap-2 mx-auto"
                    >
                      <Smartphone className="w-4 h-4" />
                      Login with OTP instead
                    </button>
                  </div>
                </form>
              ) : signInOtpStep === "phone" ? (
                // OTP Sign In - Phone Entry
                <form onSubmit={handleSignInSendOTP} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Smartphone className="w-5 h-5" />
                      <p className="text-sm">Sign in with OTP</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-phone">Mobile Number</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          +91
                        </span>
                        <Input
                          id="signin-phone"
                          type="tel"
                          placeholder="98765 43210"
                          value={signInPhone}
                          onChange={(e) =>
                            setSignInPhone(formatPhoneNumber(e.target.value))
                          }
                          className="pl-12 tracking-wider"
                          required
                          autoFocus
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                    disabled={
                      isSignInOtpLoading ||
                      signInPhone.replace(/\s/g, "").length !== 10
                    }
                  >
                    {isSignInOtpLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      "Send OTP"
                    )}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={toggleSignInMethod}
                      className="text-sm text-blue-400 hover:text-blue-300 flex items-center justify-center gap-2 mx-auto"
                    >
                      <Mail className="w-4 h-4" />
                      Login with Email/Password instead
                    </button>
                  </div>
                </form>
              ) : (
                // OTP Sign In - OTP Verification
                <form onSubmit={handleSignInVerifyOTP} className="space-y-6">
                  <div className="space-y-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleSignInBackToPhone}
                      className="mb-2"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Change Number
                    </Button>

                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Enter the OTP sent to
                      </p>
                      <p className="text-foreground">+91 {signInPhone}</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-otp" className="text-center block">
                        One-Time Password
                      </Label>
                      <div className="flex justify-center">
                        <InputOTP
                          maxLength={6}
                          value={signInOtp}
                          onChange={(value: string) => setSignInOtp(value)}
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
                    </div>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleSignInResendOTP}
                        disabled={isSignInOtpLoading}
                        className="text-sm text-blue-400 hover:text-blue-300 disabled:text-muted-foreground"
                      >
                        Didn't receive OTP? Resend
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                    disabled={isSignInOtpLoading || signInOtp.length !== 6}
                  >
                    {isSignInOtpLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify & Sign In"
                    )}
                  </Button>
                </form>
              )}
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup">
              {signUpStep === "phone" ? (
                <form onSubmit={handleSendOTP} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Smartphone className="w-5 h-5" />
                      <p className="text-sm">
                        Create account with mobile number
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Mobile Number</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          +91
                        </span>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="98765 43210"
                          value={phoneNumber}
                          onChange={(e) =>
                            setPhoneNumber(formatPhoneNumber(e.target.value))
                          }
                          className="pl-12 tracking-wider"
                          required
                          autoFocus
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                    disabled={
                      isLoading || phoneNumber.replace(/\s/g, "").length !== 10
                    }
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      "Send OTP"
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div className="space-y-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleBackToPhone}
                      className="mb-2"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Change Number
                    </Button>

                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Enter the OTP sent to
                      </p>
                      <p className="text-foreground">+91 {phoneNumber}</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="otp" className="text-center block">
                        One-Time Password
                      </Label>
                      <div className="flex justify-center">
                        <InputOTP
                          maxLength={6}
                          value={otp}
                          onChange={(value: string) => setOtp(value)}
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
                    </div>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={isLoading}
                        className="text-sm text-blue-400 hover:text-blue-300 disabled:text-muted-foreground"
                      >
                        Didn't receive OTP? Resend
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify & Continue"
                    )}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
