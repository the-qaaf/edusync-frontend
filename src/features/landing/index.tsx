import React from "react";
import { Link } from "@tanstack/react-router";
import {
  Sparkles,
  GraduationCap,
  BarChart3,
  Globe2,
  ArrowRight,
  CheckCircle2,
  Zap,
  Users,
  Star,
  Quote,
  Menu,
} from "lucide-react";

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-400/10 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-pink-400/10 rounded-full blur-[80px]" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex flex-col leading-none">
            <Link
              to="/"
              className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2"
            >
              <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <GraduationCap size={20} />
              </span>
              EduSync
            </Link>
            <span className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase mt-1 ml-10">
              by The Qaaf Organization
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a
              href="#features"
              className="hover:text-blue-600 transition-colors"
            >
              Features
            </a>
            <a
              href="#solutions"
              className="hover:text-blue-600 transition-colors"
            >
              Solutions
            </a>
            <a
              href="#reviews"
              className="hover:text-blue-600 transition-colors"
            >
              Reviews
            </a>
            {/* <a
              href="#pricing"
              className="hover:text-blue-600 transition-colors"
            >
              Pricing
            </a> */}
          </div>

          {/* <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="hidden md:inline-flex px-6 py-2.5 rounded-full bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl"
            >
              Teacher Login
            </Link>
            <button className="md:hidden p-2 text-slate-600">
              <Menu size={24} />
            </button>
          </div> */}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles size={16} className="animate-pulse" />
            <span>Powering the Next Generation of Learning</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-slate-900 max-w-4xl leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Revolutionize Education with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Intelligent Tools
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Seamlessly connect students, teachers, and parents. Automate
            workflows, analyze performance, and deliver personalized AI tutoring
            at scale.
          </p>

          {/* <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Link
              to="/login"
              className="px-8 py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2 group"
            >
              Get Started
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <button className="px-8 py-4 rounded-xl bg-white text-slate-700 font-bold text-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
              Watch Demo
            </button>
          </div> */}
        </div>
      </section>

      {/* Solutions / Problem Section */}
      <section id="solutions" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 space-y-8">
              <div className="inline-flex items-center gap-2 text-blue-600 font-bold uppercase tracking-wider text-xs">
                <Zap size={16} />
                <span>The Problem</span>
              </div>
              <h2 className="text-4xl font-bold text-slate-900 leading-tight">
                Teachers are overwhelmed. Students need personalization.
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Traditional classrooms struggle to cater to every student's
                pace. Teachers spend hours on admin tasks instead of teaching.
                The gap between potential and performance is widening.
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex gap-4">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-500 shrink-0">
                    <Users size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">1:30 Ratio</h4>
                    <p className="text-sm text-slate-500">
                      Teachers can't give 1-on-1 attention to everyone.
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex gap-4">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500 shrink-0">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Data Silos</h4>
                    <p className="text-sm text-slate-500">
                      Performance data is scattered and rarely actionable.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-3xl blur-3xl" />
              <div className="relative bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl space-y-6 rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                  <span className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span className="w-3 h-3 bg-green-500 rounded-full" />
                  <div className="ml-auto text-xs text-slate-400 font-mono">
                    dashboard.exe
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-32 bg-slate-50 rounded-xl w-full flex items-center justify-center text-slate-300">
                    <BarChart3 size={48} />
                  </div>
                  <div className="flex gap-4">
                    <div className="h-20 bg-blue-50 rounded-xl w-1/3" />
                    <div className="h-20 bg-indigo-50 rounded-xl w-2/3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section
        id="features"
        className="relative z-10 py-24 px-6 bg-white/50 backdrop-blur-sm border-y border-slate-200/50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Everything you need to excel
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Our platform combines administrative power with pedagogical ease.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<GraduationCap className="text-blue-600" size={32} />}
              title="Universal AI Tutor"
              description="Empower students with 24/7 personalized assistance using our advanced, safe, and curriculum-aware AI."
              delay={0}
            />
            <FeatureCard
              icon={<BarChart3 className="text-emerald-600" size={32} />}
              title="Real-time Analytics"
              description="Track student progress, attendance, and performance with beautiful, actionable dashboards."
              delay={100}
            />
            <FeatureCard
              icon={<Globe2 className="text-indigo-600" size={32} />}
              title="Seamless Connectivity"
              description="Bridge the gap between home and school with instant updates, broadcasts, and digital portals."
              delay={200}
            />
            {/* Added more to balance the grid if needed, or keep 3 */}
          </div>
        </div>
      </section>

      {/* Scrolling Reviews */}
      <section
        id="reviews"
        className="relative z-10 py-24 overflow-hidden bg-slate-50"
      >
        <div className="text-center mb-12 px-6">
          <h2 className="text-3xl font-bold text-slate-900">
            Loved by Educators & Students
          </h2>
        </div>

        <div className="relative w-full mask-fade-right pause-on-hover">
          <div className="animate-marquee flex gap-6 px-6">
            {[...REVIEWS, ...REVIEWS].map((review, idx) => (
              <ReviewCard key={idx} {...review} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats / Trust */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto bg-slate-900 rounded-3xl p-12 md:p-16 text-white overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px]" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-lg">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Trusted by leading institutions
              </h2>
              <div className="space-y-4">
                <CheckItem text="99.9% Uptime SLA" />
                <CheckItem text="GDPR & FERPA Compliant" />
                <CheckItem text="Bank-grade Security" />
              </div>
            </div>

            <div className="flex gap-8 md:gap-16">
              <Stat number="10k+" label="Students" />
              <Stat number="50+" label="Schools" />
              <Stat number="1M+" label="Queries" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="flex flex-col max-w-sm">
            <span className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap size={24} className="text-blue-600" />
              EduSync
            </span>
            <p className="text-slate-500 mt-4 leading-relaxed">
              Making education accessible, intelligent, and engaging for
              everyone. Proudly built by The Qaaf Organization.
            </p>
            <span className="text-sm text-slate-400 mt-6">
              © 2024 The Qaaf Organization
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-sm">
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-slate-900">Product</h4>
              <a href="#" className="text-slate-500 hover:text-blue-600">
                Features
              </a>
              {/* <a href="#" className="text-slate-500 hover:text-blue-600">
                Pricing
              </a> */}
              <a href="#" className="text-slate-500 hover:text-blue-600">
                Security
              </a>
            </div>
            {/* <div className="flex flex-col gap-4">
              <h4 className="font-bold text-slate-900">Company</h4>
              <a href="#" className="text-slate-500 hover:text-blue-600">
                About Us
              </a>
              <a href="#" className="text-slate-500 hover:text-blue-600">
                Careers
              </a>
              <a href="#" className="text-slate-500 hover:text-blue-600">
                Blog
              </a>
            </div> */}
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-slate-900">Legal</h4>
              <Link
                to="/privacy-policy"
                className="text-slate-500 hover:text-blue-600"
              >
                Privacy
              </Link>
              <Link
                to="/terms-and-conditions"
                className="text-slate-500 hover:text-blue-600"
              >
                Terms
              </Link>
              {/* <a href="#" className="text-slate-500 hover:text-blue-600">
                Contact
              </a> */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- DATA & HELPER COMPONENTS ---

const REVIEWS = [
  {
    name: "Sarah Johnson",
    role: "Principal, West High",
    text: "EduSync has completely transformed how we manage our classrooms. The AI Tutor is a game changer for students lagging behind.",
    rating: 5,
  },
  {
    name: "Mark Thompson",
    role: "Math Teacher",
    text: "The analytics dashboard gives me insights I never had before. I can spot struggling students weeks before exams.",
    rating: 5,
  },
  {
    name: "Emily Davis",
    role: "Parent",
    text: "Finally, I know exactly what my child is learning and how to help. The broadcast feature keeps me in the loop instantly.",
    rating: 5,
  },
  {
    name: "James Wilson",
    role: "Administrator",
    text: "Setup was a breeze. We onboarded 500 students in a single day. The support team is phenomenal.",
    rating: 4,
  },
  {
    name: "Dr. Ayesha Khan",
    role: "Superintendent",
    text: "Cost-effective and powerful. It rivals the most expensive LMS platforms out there but feels much easier to use.",
    rating: 5,
  },
];

const FeatureCard = ({ icon, title, description, delay = 0 }: any) => (
  <div
    className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group animate-in fade-in slide-in-from-bottom-4"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{description}</p>
  </div>
);

const ReviewCard = ({ name, role, text, rating }: any) => (
  <div className="w-[350px] shrink-0 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex gap-1 text-yellow-400 mb-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          fill={i < rating ? "currentColor" : "none"}
          className={i < rating ? "" : "text-gray-200"}
        />
      ))}
    </div>
    <p className="text-slate-600 mb-6 leading-relaxed italic relative">
      <Quote
        size={20}
        className="absolute -top-2 -left-2 text-blue-100 -z-10 scale-150"
      />
      "{text}"
    </p>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
        {name.charAt(0)}
      </div>
      <div>
        <h5 className="font-bold text-slate-900 text-sm">{name}</h5>
        <p className="text-slate-400 text-xs">{role}</p>
      </div>
    </div>
  </div>
);

const CheckItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3">
    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
      <CheckCircle2 size={14} className="text-blue-400" />
    </div>
    <span className="text-slate-300 font-medium">{text}</span>
  </div>
);

const Stat = ({ number, label }: { number: string; label: string }) => (
  <div className="flex flex-col">
    <span className="text-4xl font-bold text-white mb-2">{number}</span>
    <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">
      {label}
    </span>
  </div>
);

export default LandingPage;
