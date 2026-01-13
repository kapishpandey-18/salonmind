import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
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
} from "lucide-react";
import { Progress } from "../components/ui/progress";
import SalonMindLogo from "./SalonMindLogo";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { ownerService } from "../services/ownerService";
import { ownerPlansService } from "../services/owner/plans.service";
import { STORAGE_KEYS } from "../constants/api";

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
  const { refreshUser, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success"
  >("idle");
  const [selectedPlan, setSelectedPlan] = useState<string | null>("BASIC");
  const [planOptions, setPlanOptions] = useState<
    Array<{
      code: string;
      name: string;
      price: string;
      description: string;
      features: string[];
    }>
  >([]);
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
  });

  const steps = [
    { title: "Welcome", icon: Sparkles },
    { title: "Salon Details", icon: Building2 },
    { title: "Business Hours", icon: Clock },
    { title: "Services", icon: Scissors },
    { title: "Staff", icon: Users },
    { title: "Plan & Payment", icon: CreditCard },
    { title: "Complete", icon: CheckCircle2 },
  ];

  const selectedPlanDetails = planOptions.find(
    (plan) => plan.code === selectedPlan
  );

  const progress = ((currentStep + 1) / steps.length) * 100;

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const plans = await ownerPlansService.list();
        setPlanOptions(plans);
      } catch (error) {
        console.error("Failed to load plans", error);
      }
    };

    loadPlans();
  }, []);

  useEffect(() => {
    if (!planOptions.length) {
      return;
    }
    if (!selectedPlan || !planOptions.some((plan) => plan.code === selectedPlan)) {
      setSelectedPlan(planOptions[0].code);
    }
  }, [planOptions, selectedPlan]);

  const buildBusinessHoursPayload = () =>
    daysOfWeek.map((day) => ({
      day: day.toLowerCase(),
      isOpen: !salonData.businessHours[day].closed,
      openTime: salonData.businessHours[day].open,
      closeTime: salonData.businessHours[day].close,
    }));

  const persistProfile = async () => {
    if (!salonData.ownerName || !salonData.salonName) {
      toast.error("Please fill salon and owner details");
      throw new Error("Missing profile fields");
    }
    await ownerService.saveProfile({
      ownerName: salonData.ownerName,
      salonName: salonData.salonName,
      email: salonData.email,
      salonEmail: salonData.email,
      salonPhoneNumber: salonData.phone,
      salonAddress: salonData.address,
      salonCity: salonData.city,
      salonState: salonData.state,
      salonZipCode: salonData.pincode,
    });
  };

  const persistBusinessHours = async () => {
    await ownerService.saveBusinessHours(buildBusinessHoursPayload());
  };

  const persistServices = async () => {
    const filled = salonData.services.filter((svc) => svc.name.trim());
    if (filled.length < 3) {
      toast.error("Please add at least 3 services");
      throw new Error("Minimum services not met");
    }
    await ownerService.saveServices(
      filled.map((svc) => ({
        name: svc.name,
        duration: svc.duration || "60",
        price: Number(svc.price) || 0,
      }))
    );
  };

  const persistStaff = async () => {
    const filled = salonData.staff.filter((member) => member.name.trim());
    if (filled.length < 1) {
      toast.error("Please add at least 1 staff member");
      throw new Error("Minimum staff not met");
    }
    await ownerService.saveStaff(filled);
  };

  const handleNext = async () => {
    if (currentStep >= 5) {
      return;
    }

    const actionMap: Record<number, () => Promise<void>> = {
      1: persistProfile,
      2: persistBusinessHours,
      3: persistServices,
      4: persistStaff,
    };

    const action = actionMap[currentStep];
    if (!action) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    setIsSubmitting(true);
    try {
      await action();
      setCurrentStep((prev) => prev + 1);
    } catch (error: any) {
      if (error?.message && !error.message.includes("Minimum")) {
        toast.error(error.message || "Unable to save");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedPlan) {
      toast.error("Please select a plan to continue");
      return;
    }
    setPaymentStatus("processing");
    try {
      const checkout = await ownerService.checkoutPlan(selectedPlan);
      const paymentId = `pay_${Date.now()}`;
      const confirmation = await ownerService.confirmPayment({
        orderId: checkout.order.id,
        paymentId,
        signature: "stub-signature",
      });
      if (confirmation?.defaultBranchId) {
        localStorage.setItem(
          STORAGE_KEYS.ACTIVE_BRANCH_ID,
          confirmation.defaultBranchId
        );
      }
      toast.success("Subscription activated successfully!");
      setPaymentStatus("success");
      setCurrentStep(6);
    } catch (error: any) {
      toast.error(error.message || "Unable to confirm payment");
    } finally {
      setPaymentStatus("idle");
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await refreshUser();
      onComplete();
    } catch (error: any) {
      toast.error(error.message || "Failed to refresh session");
    } finally {
      setIsSubmitting(false);
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
                Payment activates your subscription and unlocks your dashboard.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {planOptions.map((plan) => (
                <Card
                  key={plan.code}
                  className={`cursor-pointer transition-all ${
                    selectedPlan === plan.code
                      ? "border-yellow-600 shadow-lg shadow-yellow-600/20 ring-2 ring-yellow-600/20"
                      : "hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedPlan(plan.code)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </div>
                      {plan.code === "PRO" && (
                        <Badge className="bg-gradient-to-r from-gray-900 to-yellow-600">
                          Popular
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-xl font-semibold text-foreground">
                        {plan.price}
                      </p>
                      <ul className="space-y-2 text-sm">
                        {plan.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-center gap-2 text-muted-foreground"
                          >
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="p-4 bg-muted rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Your default branch will be created after payment and your
                  subscription will start immediately.
                </p>
                {selectedPlanDetails && (
                  <p className="text-sm text-foreground mt-1">
                    Selected plan:{" "}
                    <span className="font-semibold">
                      {selectedPlanDetails.name}
                    </span>{" "}
                    ({selectedPlanDetails.price})
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Secure Razorpay Checkout
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-lg shadow-green-600/30">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-3">
              <h2 className="text-foreground">Payment confirmed 🎉</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Your subscription is active and we've created your Main Branch.
                Finish setup to jump into the dashboard.
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
                    {selectedPlanDetails?.name || "Not selected"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <p className="text-sm text-muted-foreground">
              Click finish to enter the owner dashboard.
            </p>
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
        <div className="flex items-center justify-between mt-6 gap-4 flex-wrap">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || currentStep === 6}
            className="min-w-24"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          {currentStep <= 4 && (
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-gray-900 to-yellow-600 hover:from-black hover:to-yellow-700 text-white shadow-lg shadow-yellow-600/20 min-w-24"
            >
              {isSubmitting ? "Saving..." : "Continue"}
              {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          )}
          {currentStep === 5 && (
            <Button
              onClick={handlePayment}
              disabled={paymentStatus === "processing" || !selectedPlan}
              className="bg-gradient-to-r from-gray-900 to-yellow-600 hover:from-black hover:to-yellow-700 text-white shadow-lg shadow-yellow-600/20 min-w-32"
            >
              {paymentStatus === "processing"
                ? "Processing..."
                : selectedPlanDetails
                  ? `Pay & Activate (${selectedPlanDetails.price})`
                  : "Select a Plan"}
            </Button>
          )}
          {currentStep === 6 && (
            <Button
              onClick={handleComplete}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-gray-900 to-yellow-600 hover:from-black hover:to-yellow-700 text-white shadow-lg shadow-yellow-600/20 min-w-32"
            >
              {isSubmitting ? "Redirecting..." : "Go to Dashboard"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
