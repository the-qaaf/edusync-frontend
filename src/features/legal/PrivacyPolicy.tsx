import React from "react";
import {
  ArrowLeft,
  Shield,
  Lock,
  Server,
  Database,
  Globe,
  Mail,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-100/50 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-20">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-8 group"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-3 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all shadow-sm">
            <ArrowLeft size={14} />
          </div>
          Back to Home
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Hero Header */}
          <div className="bg-slate-900 text-white p-8 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-medium mb-6 backdrop-blur-md">
                <Shield size={12} />
                <span>Legal Documentation</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight leading-tight">
                Privacy Policy
              </h1>
              <p className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed">
                We believe in total transparency. This document explains how{" "}
                <strong className="text-white">EduSync</strong> collects, uses,
                and safeguards your data to ensure a secure learning
                environment.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-8 md:p-16">
            <div className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600 prose-strong:text-slate-900 prose-a:text-blue-600 hover:prose-a:text-blue-700">
              <p className="lead">
                Welcome to <strong>EduSync</strong> ("we," "our," or "us"). We
                are committed to protecting your privacy and ensuring the
                security of your personal information.
              </p>

              <div className="grid md:grid-cols-2 gap-8 my-12 not-prose">
                <InfoCard
                  icon={<Database className="text-blue-600" size={24} />}
                  title="Data Minimization"
                  desc="We only collect what is strictly necessary to provide our educational services."
                />
                <InfoCard
                  icon={<Lock className="text-emerald-600" size={24} />}
                  title="Bank-grade Security"
                  desc="Your data is encrypted in transit and at rest using industry-standard protocols."
                />
              </div>

              <h3>1. Information We Collect</h3>
              <p>
                We collect information necessary to provide our educational
                management services. This includes:
              </p>
              <ul className="list-none pl-0 space-y-4">
                <ListItem
                  title="School Administration Data"
                  content="Name, address, and contact details of the educational institution."
                />
                <ListItem
                  title="Student Data"
                  content="Names, roll numbers, class/section details, attendance records, and academic performance data."
                />
                <ListItem
                  title="Parent/Guardian Data"
                  content="Names, phone numbers, and email addresses for communication purposes."
                />
                <ListItem
                  title="User Account Data"
                  content="Login credentials (email addresses, encrypted passwords) for authorized staff."
                />
              </ul>

              <h3>2. How We Use Your Information</h3>
              <p>
                We use the collected data for the following specific purposes:
              </p>
              <ul>
                <li>
                  <strong>Service Delivery:</strong> To generate report cards,
                  track attendance, and manage student records.
                </li>
                <li>
                  <strong>Communication:</strong> To send automated
                  notifications, announcements, and performance reports to
                  parents via Email and WhatsApp.
                </li>
                <li>
                  <strong>Authentication:</strong> To securely log you into the
                  system and verify your identity.
                </li>
                <li>
                  <strong>Improvement:</strong> To analyze usage trends and
                  improve our platform's functionality.
                </li>
              </ul>

              <h3>3. Data Sharing and Third-Party Services</h3>
              <p>
                We <span className="text-red-600 font-bold">do not sell</span>{" "}
                your data. We share data only with trusted third-party service
                providers essential for our operations:
              </p>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 not-prose space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-orange-500">
                    <Server size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">
                      Firebase (Google)
                    </h5>
                    <p className="text-sm text-slate-500">
                      Infrastructure, authentication, and database hosting.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-green-500">
                    <Globe size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">
                      Meta (WhatsApp API)
                    </h5>
                    <p className="text-sm text-slate-500">
                      Delivery of critical alerts and notifications.
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="mt-8">4. Data Security</h3>
              <p>
                We implement robust security measures to protect your data,
                including HTTPS encryption, strict access controls, and regular
                security audits. However, please note that no method of
                transmission over the internet is 100% secure.
              </p>

              <h3>5. Your Rights</h3>
              <p>
                Depending on your jurisdiction, you have the right to access,
                correct, or request deletion of your data. Please contact your
                school administrator or our support team to exercise these
                rights.
              </p>

              <h3>6. Contact Us</h3>
              <p>
                If you have any questions about this Privacy Policy, please
                contact us at:
              </p>
              <div className="flex items-center gap-3 not-prose bg-blue-50 p-4 rounded-xl text-blue-900 font-medium w-fit">
                <Mail size={18} />
                <a
                  href="mailto:theqaaf.in@gmail.com"
                  className="hover:underline"
                >
                  theqaaf.in@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 p-8 md:p-12 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
            <p className="text-sm text-slate-500 font-medium">
              Last updated:{" "}
              <span className="text-slate-900">
                {new Date().toLocaleDateString()}
              </span>
            </p>
            <div className="flex gap-6">
              <Link
                to="/terms-and-conditions"
                className="text-sm font-bold text-blue-600 hover:text-blue-800"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const InfoCard = ({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) => (
  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
    <div className="mb-4">{icon}</div>
    <h4 className="font-bold text-slate-900 mb-2">{title}</h4>
    <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

const ListItem = ({ title, content }: { title: string; content: string }) => (
  <li className="flex gap-3">
    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 shrink-0" />
    <div>
      <strong className="text-slate-900">{title}:</strong>{" "}
      <span className="text-slate-600">{content}</span>
    </div>
  </li>
);

export default PrivacyPolicy;
