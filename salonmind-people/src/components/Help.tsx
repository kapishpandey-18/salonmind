import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Badge } from './ui/badge';
import { 
  HelpCircle, 
  BookOpen, 
  MessageCircle, 
  Mail, 
  Phone, 
  Video,
  FileText,
  ExternalLink,
  Search,
  Clock
} from 'lucide-react';

const faqs = [
  {
    question: "How do I add a new appointment?",
    answer: "Navigate to the Appointments section and click the 'New Appointment' button. Fill in the client details, select the service, choose a staff member, and pick your preferred date and time. Click 'Save' to confirm the booking."
  },
  {
    question: "How can I manage my staff schedules?",
    answer: "Go to the Staff section where you can view all your team members. Click on any staff member to edit their working hours, days off, and performance metrics. You can also set their commission rates and track their individual revenue."
  },
  {
    question: "How do I track inventory and low stock items?",
    answer: "The Inventory section shows all your products with current stock levels. Items running low are highlighted in red. You can set custom stock thresholds and enable automatic alerts when products need reordering."
  },
  {
    question: "Can I export revenue reports?",
    answer: "Yes! In the Revenue section, you can view detailed analytics by day, week, month, or custom date range. Use the export button to download reports in PDF or Excel format for accounting purposes."
  },
  {
    question: "How do I add new services or update pricing?",
    answer: "Visit the Services section and click 'Add Service' to create new offerings. For existing services, click the edit icon to update pricing, duration, or descriptions. Changes take effect immediately."
  },
  {
    question: "What payment methods are supported?",
    answer: "SalonMind supports all major Indian payment methods including UPI, Credit/Debit Cards, Net Banking, and Cash. You can also enable digital wallets like Paytm, PhonePe, and Google Pay for customer convenience."
  },
  {
    question: "How do I send appointment reminders to clients?",
    answer: "Automatic reminders are sent via SMS and email 24 hours before appointments. You can customize reminder timing and messages in Profile Settings > Notifications. Ensure you have SMS credits available."
  },
  {
    question: "Can I manage multiple salon locations?",
    answer: "Currently, each SalonMind account manages one location. For multiple salons, you can create separate accounts or contact our enterprise team for a multi-location solution with centralized reporting."
  },
  {
    question: "How secure is my salon data?",
    answer: "Your data is encrypted and stored securely on Indian servers. We comply with data protection regulations and perform regular backups. Enable two-factor authentication in Security Settings for added protection."
  },
  {
    question: "What should I do if I forget my password?",
    answer: "On the login page, click 'Forgot Password' and enter your registered email. You'll receive a password reset link within minutes. For security, the link expires after 24 hours."
  }
];

const videoTutorials = [
  {
    title: "Getting Started with SalonMind",
    duration: "5:30",
    description: "A complete walkthrough of the dashboard and key features"
  },
  {
    title: "Managing Appointments & Calendar",
    duration: "8:15",
    description: "Learn to schedule, edit, and manage client bookings"
  },
  {
    title: "Inventory & Stock Management",
    duration: "6:45",
    description: "Track products, set alerts, and manage suppliers"
  },
  {
    title: "Revenue Analytics & Reports",
    duration: "7:20",
    description: "Understand your business metrics and generate reports"
  }
];

const guides = [
  {
    title: "Quick Start Guide",
    description: "Get up and running in 10 minutes",
    icon: FileText
  },
  {
    title: "Staff Management Best Practices",
    description: "Optimize team scheduling and performance",
    icon: BookOpen
  },
  {
    title: "Client Retention Strategies",
    description: "Keep your customers coming back",
    icon: BookOpen
  },
  {
    title: "Inventory Optimization",
    description: "Reduce waste and maximize profit",
    icon: FileText
  }
];

export default function Help() {
  return (
    <div className="min-h-full p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl">Help & Support</h2>
        <p className="text-muted-foreground mt-1">Find answers, tutorials, and get support</p>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Search for help articles, tutorials, or FAQs..." 
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Support & Video Tutorials */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Contact Support */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-purple-400 rounded-full flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-lg">Contact Support</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2 border-rose-300/50 hover:bg-rose-50 h-auto py-3">
                <Mail className="w-4 h-4 shrink-0" />
                <span className="text-sm truncate">support@salonmind.com</span>
              </Button>
              
              <Button variant="outline" className="w-full justify-start gap-2 border-rose-300/50 hover:bg-rose-50 h-auto py-3">
                <Phone className="w-4 h-4 shrink-0" />
                <span className="text-sm">+91 1800 123 4567</span>
              </Button>
              
              <Button variant="outline" className="w-full justify-between gap-2 border-rose-300/50 hover:bg-rose-50 h-auto py-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span className="text-sm">Live Chat</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 shrink-0">Online</Badge>
              </Button>

              <div className="pt-3 mt-3 border-t border-rose-200">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    Mon - Sat<br />9:00 AM - 8:00 PM IST
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Video Tutorials */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-purple-400 rounded-full flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Video Tutorials</CardTitle>
                  <CardDescription>Learn through step-by-step video guides</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {videoTutorials.map((video, index) => (
                  <div 
                    key={index} 
                    className="p-4 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-rose-300 to-purple-300 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Video className="w-6 h-6 text-purple-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-medium text-sm leading-snug line-clamp-2 break-words">
                            {video.title}
                          </h4>
                          <Badge variant="secondary" className="shrink-0 text-xs">{video.duration}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 break-words">
                          {video.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" className="border-rose-300/50 hover:bg-rose-50">
                  View All Tutorials
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Guides & Documentation */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-purple-400 rounded-full flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Guides & Documentation</CardTitle>
              <CardDescription>Detailed guides to help you succeed</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {guides.map((guide, index) => {
              const Icon = guide.icon;
              return (
                <div 
                  key={index} 
                  className="p-4 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer group"
                >
                  <Icon className="w-8 h-8 text-rose-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-medium mb-1 break-words">{guide.title}</h4>
                  <p className="text-sm text-muted-foreground break-words">{guide.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-purple-400 rounded-full flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
              <CardDescription>Quick answers to common questions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left hover:text-rose-600 break-words">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground break-words whitespace-normal">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-6 p-4 bg-rose-50 rounded-lg border border-rose-200">
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <HelpCircle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-rose-900 break-words">Can't find what you're looking for?</p>
                <p className="text-sm text-rose-700 mt-1 break-words">
                  Contact our support team and we'll be happy to help you out.
                </p>
                <Button className="mt-3 bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500 text-white shadow-lg shadow-rose-400/20">
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div className="whitespace-nowrap">
                Version: <span className="text-foreground font-medium">2.1.0</span>
              </div>
              <div className="whitespace-nowrap">
                Last Updated: <span className="text-foreground font-medium">Nov 12, 2024</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="link" className="h-auto p-0 text-rose-500 hover:text-rose-600">
                Release Notes
              </Button>
              <span>•</span>
              <Button variant="link" className="h-auto p-0 text-rose-500 hover:text-rose-600">
                Privacy Policy
              </Button>
              <span>•</span>
              <Button variant="link" className="h-auto p-0 text-rose-500 hover:text-rose-600">
                Terms of Service
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
