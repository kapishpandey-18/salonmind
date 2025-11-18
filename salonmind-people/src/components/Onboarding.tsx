import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Building2,
  Clock,
  Scissors,
  Users,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Plus,
  Trash2,
  Mail,
  Lock,
  Shield,
} from "lucide-react";
import { Progress } from "./ui/progress";
import SalonMindLogo from "./SalonMindLogo";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

interface OnboardingProps {
  onComplete: () => void;
  phoneNumber?: string;
}

interface SalonData {
  salonName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  businessHours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  services: Array<{ name: string; duration: string; price: string }>;
  staff: Array<{ name: string; role: string; email: string }>;
  plan: string;
  loginEmail: string;
  loginPassword: string;
  confirmPassword: string;
}

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function Onboarding({
  onComplete,
  phoneNumber,
}: OnboardingProps) {
  const { completeOnboarding, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [salonData, setSalonData] = useState<SalonData>({
    salonName: "",
    ownerName: "",
    email: "",
    phone: phoneNumber || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    businessHours: {
      Monday: { open: "09:00", close: "19:00", closed: false },
      Tuesday: { open: "09:00", close: "19:00", closed: false },
      Wednesday: { open: "09:00", close: "19:00", closed: false },
      Thursday: { open: "09:00", close: "19:00", closed: false },
      Friday: { open: "09:00", close: "19:00", closed: false },
      Saturday: { open: "09:00", close: "19:00", closed: false },
      Sunday: { open: "09:00", close: "19:00", closed: true },
    },
    services: [{ name: "", duration: "", price: "" }],
    staff: [{ name: "", role: "", email: "" }],
    plan: "",
    loginEmail: "",
    loginPassword: "",
    confirmPassword: "",
  });

  const steps = [
    { title: "Welcome", icon: Sparkles },
    { title: "Salon Details", icon: Building2 },
    { title: "Business Hours", icon: Clock },
    { title: "Services", icon: Scissors },
    { title: "Staff", icon: Users },
    { title: "Choose Plan", icon: CreditCard },
    { title: "Create Login", icon: Shield },
    { title: "Complete", icon: CheckCircle2 },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = async () => {
    // Validation for login credentials step (step 6)
    if (currentStep === 6) {
      if (!salonData.loginEmail) {
        toast.error("Please enter your email address");
        return;
      }
      if (!salonData.loginPassword) {
        toast.error("Please create a password");
        return;
      }
      if (salonData.loginPassword.length < 8) {
        toast.error("Password must be at least 8 characters");
        return;
      }
      if (salonData.loginPassword !== salonData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      toast.success("Login credentials created successfully!");
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - submit onboarding data
      setIsSubmitting(true);
      try {
        // Split owner name into first and last
        const [firstName, ...lastNameParts] = salonData.ownerName
          .trim()
          .split(" ");
        const lastName = lastNameParts.join(" ");

        // Format business hours for API
        const businessHours = daysOfWeek.map((day) => ({
          day: day.toLowerCase(),
          isOpen: !salonData.businessHours[day].closed,
          openTime: salonData.businessHours[day].open,
          closeTime: salonData.businessHours[day].close,
        }));

        await completeOnboarding({
          firstName: firstName || "User",
          lastName: lastName || "",
          email: salonData.loginEmail,
          salonName: salonData.salonName,
          salonAddress: salonData.address,
          salonCity: salonData.city,
          salonState: salonData.state,
          salonZipCode: salonData.pincode,
          salonCountry: "India",
          salonPhoneNumber: salonData.phone,
          salonEmail: salonData.email,
          businessHours,
          currency: "INR",
          timezone: "Asia/Kolkata",
        });

        onComplete();
      } catch (error: any) {
        console.error("Onboarding error:", error);
        toast.error(error.message || "Failed to complete onboarding");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateBusinessHours = (
    day: string,
    field: string,
    value: string | boolean
  ) => {
    setSalonData({
      ...salonData,
      businessHours: {
        ...salonData.businessHours,
        [day]: {
          ...salonData.businessHours[day],
          [field]: value,
        },
      },
    });
  };

  const addService = () => {
    setSalonData({
      ...salonData,
      services: [...salonData.services, { name: "", duration: "", price: "" }],
    });
  };

  const removeService = (index: number) => {
    setSalonData({
      ...salonData,
      services: salonData.services.filter((_, i) => i !== index),
    });
  };

  const updateService = (index: number, field: string, value: string) => {
    const updatedServices = [...salonData.services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };
    setSalonData({ ...salonData, services: updatedServices });
  };

  const addStaff = () => {
    setSalonData({
      ...salonData,
      staff: [...salonData.staff, { name: "", role: "", email: "" }],
    });
  };

  const removeStaff = (index: number) => {
    setSalonData({
      ...salonData,
      staff: salonData.staff.filter((_, i) => i !== index),
    });
  };

  const updateStaff = (index: number, field: string, value: string) => {
    const updatedStaff = [...salonData.staff];
    updatedStaff[index] = { ...updatedStaff[index], [field]: value };
    setSalonData({ ...salonData, staff: updatedStaff });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6 py-8">
            <div className="mx-auto">
              <SalonMindLogo size={80} />
            </div>
            <div className="space-y-3">
              <h2 className="text-foreground">Welcome to SalonMind</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Transform your salon business with AI-powered management. Let's
                set up your account in just a few minutes.
              </p>
            </div>
            <div className="grid gap-4 text-left max-w-md mx-auto mt-8">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-foreground">Streamline Appointments</p>
                  <p className="text-sm text-muted-foreground">
                    Manage bookings with ease
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-foreground">Track Revenue</p>
                  <p className="text-sm text-muted-foreground">
                    Real-time analytics and insights
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-foreground">Manage Staff</p>
                  <p className="text-sm text-muted-foreground">
                    Optimize team performance
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-foreground">Tell us about your salon</h3>
              <p className="text-muted-foreground">
                Basic information to get started
              </p>
            </div>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salonName">Salon Name *</Label>
                  <Input
                    id="salonName"
                    placeholder="Elegant Hair Studio"
                    value={salonData.salonName}
                    onChange={(e) =>
                      setSalonData({ ...salonData, salonName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Name *</Label>
                  <Input
                    id="ownerName"
                    placeholder="John Doe"
                    value={salonData.ownerName}
                    onChange={(e) =>
                      setSalonData({ ...salonData, ownerName: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="owner@salon.com"
                    value={salonData.email}
                    onChange={(e) =>
                      setSalonData({ ...salonData, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={salonData.phone}
                    onChange={(e) =>
                      setSalonData({ ...salonData, phone: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Textarea
                  id="address"
                  placeholder="123 Main Street, Shop No. 5"
                  value={salonData.address}
                  onChange={(e) =>
                    setSalonData({ ...salonData, address: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="Mumbai"
                    value={salonData.city}
                    onChange={(e) =>
                      setSalonData({ ...salonData, city: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select
                    value={salonData.state}
                    onValueChange={(value) =>
                      setSalonData({ ...salonData, state: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                      <SelectItem value="Delhi">Delhi</SelectItem>
                      <SelectItem value="Karnataka">Karnataka</SelectItem>
                      <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                      <SelectItem value="Gujarat">Gujarat</SelectItem>
                      <SelectItem value="West Bengal">West Bengal</SelectItem>
                      <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                      <SelectItem value="Telangana">Telangana</SelectItem>
                      <SelectItem value="Uttar Pradesh">
                        Uttar Pradesh
                      </SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">PIN Code *</Label>
                  <Input
                    id="pincode"
                    placeholder="400001"
                    value={salonData.pincode}
                    onChange={(e) =>
                      setSalonData({ ...salonData, pincode: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-foreground">Set your business hours</h3>
              <p className="text-muted-foreground">When is your salon open?</p>
            </div>
            <div className="space-y-3">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="flex items-center gap-4 p-4 bg-muted rounded-lg"
                >
                  <div className="w-28 shrink-0">
                    <p className="text-foreground">{day}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={salonData.businessHours[day].open}
                        onChange={(e) =>
                          updateBusinessHours(day, "open", e.target.value)
                        }
                        disabled={salonData.businessHours[day].closed}
                        className="w-32"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={salonData.businessHours[day].close}
                        onChange={(e) =>
                          updateBusinessHours(day, "close", e.target.value)
                        }
                        disabled={salonData.businessHours[day].closed}
                        className="w-32"
                      />
                    </div>
                  </div>
                  <Button
                    variant={
                      salonData.businessHours[day].closed ? "outline" : "ghost"
                    }
                    size="sm"
                    onClick={() =>
                      updateBusinessHours(
                        day,
                        "closed",
                        !salonData.businessHours[day].closed
                      )
                    }
                    className="shrink-0"
                  >
                    {salonData.businessHours[day].closed ? "Closed" : "Open"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-foreground">Add your services</h3>
              <p className="text-muted-foreground">
                What services do you offer?
              </p>
            </div>
            <div className="space-y-3">
              {salonData.services.map((service, index) => (
                <div key={index} className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>Service Name</Label>
                      <Input
                        placeholder="e.g., Haircut"
                        value={service.name}
                        onChange={(e) =>
                          updateService(index, "name", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Duration (min)</Label>
                      <Input
                        placeholder="45"
                        type="number"
                        value={service.duration}
                        onChange={(e) =>
                          updateService(index, "duration", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price (₹)</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="500"
                          type="number"
                          value={service.price}
                          onChange={(e) =>
                            updateService(index, "price", e.target.value)
                          }
                          className="flex-1"
                        />
                        {salonData.services.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeService(index)}
                            className="shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" onClick={addService} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Another Service
            </Button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-foreground">Add your team members</h3>
              <p className="text-muted-foreground">
                Who will be working at your salon?
              </p>
            </div>
            <div className="space-y-3">
              {salonData.staff.map((member, index) => (
                <div key={index} className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>Staff Name</Label>
                      <Input
                        placeholder="e.g., Emma Wilson"
                        value={member.name}
                        onChange={(e) =>
                          updateStaff(index, "name", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select
                        value={member.role}
                        onValueChange={(value) =>
                          updateStaff(index, "role", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Senior Stylist">
                            Senior Stylist
                          </SelectItem>
                          <SelectItem value="Stylist">Stylist</SelectItem>
                          <SelectItem value="Junior Stylist">
                            Junior Stylist
                          </SelectItem>
                          <SelectItem value="Colorist">Colorist</SelectItem>
                          <SelectItem value="Barber">Barber</SelectItem>
                          <SelectItem value="Receptionist">
                            Receptionist
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="email@example.com"
                          type="email"
                          value={member.email}
                          onChange={(e) =>
                            updateStaff(index, "email", e.target.value)
                          }
                          className="flex-1"
                        />
                        {salonData.staff.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeStaff(index)}
                            className="shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" onClick={addStaff} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Another Team Member
            </Button>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-foreground">Choose your plan</h3>
              <p className="text-muted-foreground">
                Select the plan that fits your salon best
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Card
                className={`cursor-pointer transition-all ${
                  salonData.plan === "starter"
                    ? "border-yellow-600 shadow-lg shadow-yellow-600/20"
                    : "hover:border-gray-300"
                }`}
                onClick={() => setSalonData({ ...salonData, plan: "starter" })}
              >
                <CardHeader>
                  <CardTitle>Starter</CardTitle>
                  <CardDescription>Perfect for small salons</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <span className="text-foreground">₹999</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>Up to 3 staff members</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>100 appointments/month</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>Basic analytics</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>Email support</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  salonData.plan === "professional"
                    ? "border-yellow-600 shadow-lg shadow-yellow-600/20 ring-2 ring-yellow-600/20"
                    : "hover:border-gray-300"
                }`}
                onClick={() =>
                  setSalonData({ ...salonData, plan: "professional" })
                }
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Professional</CardTitle>
                    <Badge className="bg-gradient-to-r from-gray-900 to-yellow-600">
                      Popular
                    </Badge>
                  </div>
                  <CardDescription>For growing salons</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <span className="text-foreground">₹2,499</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>Up to 10 staff members</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>Unlimited appointments</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>Advanced analytics</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>Priority support</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>SMS notifications</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  salonData.plan === "enterprise"
                    ? "border-yellow-600 shadow-lg shadow-yellow-600/20"
                    : "hover:border-gray-300"
                }`}
                onClick={() =>
                  setSalonData({ ...salonData, plan: "enterprise" })
                }
              >
                <CardHeader>
                  <CardTitle>Enterprise</CardTitle>
                  <CardDescription>For salon chains</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <span className="text-foreground">₹4,999</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>Unlimited staff</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>Unlimited appointments</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>Custom analytics</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>24/7 support</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>Multi-location</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>API access</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-rose-400 to-purple-400 rounded-full flex items-center justify-center shadow-lg shadow-rose-400/30">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-foreground">Create Your Login Credentials</h3>
              <p className="text-muted-foreground">
                Set up email and password to access your dashboard
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div className="p-4 bg-green-50/50 border border-green-200/50 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <p className="text-sm">Phone Verified</p>
                </div>
                <p className="text-xs text-green-600">
                  +91 {phoneNumber || salonData.phone}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="owner@yoursalon.com"
                    value={salonData.loginEmail}
                    onChange={(e) =>
                      setSalonData({ ...salonData, loginEmail: e.target.value })
                    }
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  You'll use this email to sign in to SalonMind
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Create a strong password"
                    value={salonData.loginPassword}
                    onChange={(e) =>
                      setSalonData({
                        ...salonData,
                        loginPassword: e.target.value,
                      })
                    }
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum 8 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Re-enter your password"
                    value={salonData.confirmPassword}
                    onChange={(e) =>
                      setSalonData({
                        ...salonData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {salonData.loginPassword &&
                salonData.confirmPassword &&
                salonData.loginPassword !== salonData.confirmPassword && (
                  <p className="text-sm text-red-600">Passwords do not match</p>
                )}

              <div className="p-4 bg-blue-50/50 border border-blue-200/50 rounded-lg">
                <p className="text-xs text-blue-600">
                  <strong>Security Tip:</strong> Use a combination of uppercase,
                  lowercase, numbers, and special characters for a strong
                  password.
                </p>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-lg shadow-green-600/30">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-3">
              <h2 className="text-foreground">All Set! 🎉</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Your salon has been successfully set up. You're ready to start
                managing appointments, staff, and growing your business.
              </p>
            </div>
            <Card className="max-w-lg mx-auto text-left">
              <CardHeader>
                <CardTitle>Setup Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Salon Name:</span>
                  <span className="text-foreground">
                    {salonData.salonName || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="text-foreground">
                    {salonData.city || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Services Added:</span>
                  <span className="text-foreground">
                    {salonData.services.filter((s) => s.name).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Staff Members:</span>
                  <span className="text-foreground">
                    {salonData.staff.filter((s) => s.name).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plan:</span>
                  <Badge className="bg-gradient-to-r from-gray-900 to-yellow-600">
                    {salonData.plan || "Not selected"}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Login Email:</span>
                  <span className="text-foreground">
                    {salonData.loginEmail || "Not set"}
                  </span>
                </div>
              </CardContent>
            </Card>
            <div className="p-4 bg-green-50/50 border border-green-200/50 rounded-lg max-w-lg mx-auto">
              <p className="text-sm text-green-700">
                <strong>Next time,</strong> simply sign in with your email (
                {salonData.loginEmail}) and password to access your dashboard.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8 pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps Indicator */}
        <div className="hidden md:flex items-center justify-between mb-8 overflow-x-auto">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div key={index} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-gradient-to-br from-gray-900 to-yellow-600 text-yellow-400 shadow-lg shadow-yellow-600/30"
                        : isCompleted
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <span
                    className={`mt-2 text-xs text-center whitespace-nowrap ${
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      isCompleted ? "bg-green-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Content Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-6 md:p-8">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6 gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="min-w-24"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-gray-900 to-yellow-600 hover:from-black hover:to-yellow-700 text-white shadow-lg shadow-yellow-600/20 min-w-24"
          >
            {isSubmitting
              ? "Saving..."
              : currentStep === steps.length - 1
                ? "Get Started"
                : "Continue"}
            {currentStep !== steps.length - 1 && !isSubmitting && (
              <ArrowRight className="w-4 h-4 ml-2" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
