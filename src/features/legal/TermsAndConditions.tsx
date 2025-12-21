import React from "react";
import {
  ArrowLeft,
  FileText,
  UserCheck,
  Copyright,
  Scale,
  Ban,
  Mail,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

const TermsAndConditions = () => {
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
                <FileText size={12} />
                <span>Legal Documentation</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight leading-tight">
                Terms and Conditions
              </h1>
              <p className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed">
                Please read these terms carefully. They govern your use of the{" "}
                <strong className="text-white">EduSync</strong> platform and
                outline our mutual obligations.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-8 md:p-16">
            <div className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600 prose-strong:text-slate-900 prose-a:text-blue-600 hover:prose-a:text-blue-700">
              <p className="lead">
                Welcome to <strong>EduSync</strong>! By accessing or using our
                Service, you agree to be bound by these Terms.
              </p>

              <div className="grid md:grid-cols-2 gap-8 my-12 not-prose">
                <InfoCard
                  icon={<UserCheck className="text-blue-600" size={24} />}
                  title="Account Responsibility"
                  desc="You are responsible for maintaining the security of your account credentials."
                />
                <InfoCard
                  icon={<Scale className="text-emerald-600" size={24} />}
                  title="Fair Usage"
                  desc="The platform must be used lawfully and ethically at all times."
                />
              </div>

              <h3>1. Acceptance of Terms</h3>
              <p>
                By registering for or using our Service, you confirm that you
                have read, understood, and agree to these Terms. If you are
                using the Service on behalf of an educational institution, you
                represent that you have the authority to bind that institution
                to these Terms.
              </p>

              <h3>2. User Accounts</h3>
              <p>
                To access certain features, you must create an account. You
                agree to:
              </p>
              <ul className="list-none pl-0 space-y-4">
                <ListItem text="Provide accurate and complete information during registration." />
                <ListItem text="Maintain the security of your password and account details." />
                <ListItem text="Notify us immediately of any unauthorized use of your account." />
              </ul>

              <h3>3. Acceptable Use</h3>
              <p>You agree not to use the Service to:</p>
              <ul className="list-none pl-0 space-y-4">
                <ListItem
                  text="Upload or distribute content that is unlawful, harmful, or violates privacy rights."
                  icon={<Ban size={16} className="text-red-500" />}
                />
                <ListItem
                  text="Attempt to interfere with or disrupt the integrity or performance of the Service."
                  icon={<Ban size={16} className="text-red-500" />}
                />
                <ListItem
                  text="Reverse engineer or attempt to extract the source code of the Service."
                  icon={<Ban size={16} className="text-red-500" />}
                />
              </ul>

              <h3>4. Service Availability</h3>
              <p>
                We strive to ensure the Service is available 24/7. However, we
                reserve the right to modify, suspend, or discontinue any part of
                the Service at any time, with or without notice, for maintenance
                or improvements.
              </p>

              <h3>5. Intellectual Property</h3>
              <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100 not-prose mb-6">
                <Copyright className="text-blue-600 shrink-0 mt-1" />
                <p className="text-sm text-slate-600 m-0">
                  The Service and its original content, features, and
                  functionality are and will remain the exclusive property of
                  EduSync and its licensors.
                </p>
              </div>

              <h3>6. Limitation of Liability</h3>
              <p>
                To the maximum extent permitted by law, QAAF Connect shall not
                be liable for any indirect, incidental, special, consequential,
                or punitive damages arising out of your use or inability to use
                the Service.
              </p>

              <h3>7. Termination</h3>
              <p>
                We may terminate or suspend your account access immediately,
                without prior notice, if you breach these Terms. Upon
                termination, your right to use the Service will immediately
                cease.
              </p>

              <h3>8. Governing Law</h3>
              <p>
                These Terms shall be governed by and construed in accordance
                with the laws of [Your Jurisdiction/Country], without regard to
                its conflict of law provisions.
              </p>

              <h3>10. Contact Us</h3>
              <p>
                If you have any questions about these Terms, please contact us
                at:
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
                to="/privacy-policy"
                className="text-sm font-bold text-blue-600 hover:text-blue-800"
              >
                Privacy Policy
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

const ListItem = ({ text, icon }: { text: string; icon?: React.ReactNode }) => (
  <li className="flex gap-3">
    <div className="mt-1 shrink-0">
      {icon ? (
        icon
      ) : (
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
      )}
    </div>
    <span className="text-slate-600">{text}</span>
  </li>
);

export default TermsAndConditions;
