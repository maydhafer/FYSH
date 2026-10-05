import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    role: '',
    assetSize: '$1B - $10B'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-[#191919] transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif text-[#191919]">Demo Requested</h3>
            <p className="text-sm text-[#191919]/70 max-w-xs mx-auto">
              Thank you, {formData.name || 'partner'}. Our financial institution solutions team will reach out to {formData.email || 'your email'} within 24 hours.
            </p>
            <div className="pt-4">
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-[#191919] text-white text-sm font-medium rounded-lg hover:bg-[#191919]/90 transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#191919]/50 font-medium">Enterprise Access</span>
              <h2 className="text-2xl sm:text-3xl font-serif text-[#191919] mt-1">Schedule a Boomerang Demo</h2>
              <p className="text-sm text-[#191919]/70 mt-2">
                See how top credit unions, banks, and lenders automate borrower lifecycles with compliant conversational AI.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#191919]/70 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Sarah Jenkins"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#191919]/20 focus:border-[#191919]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#191919]/70 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="s.jenkins@bankfinancial.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#191919]/20 focus:border-[#191919]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#191919]/70 mb-1">Financial Institution</label>
                  <input
                    type="text"
                    required
                    placeholder="First National Bank"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#191919]/20 focus:border-[#191919]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#191919]/70 mb-1">Institution Asset Size</label>
                  <select
                    value={formData.assetSize}
                    onChange={(e) => setFormData({ ...formData, assetSize: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#191919]/20 focus:border-[#191919]"
                  >
                    <option>&lt; $500M</option>
                    <option>$500M - $1B</option>
                    <option>$1B - $10B</option>
                    <option>$10B - $50B</option>
                    <option>$50B+</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#191919] text-white text-sm font-medium rounded-lg hover:bg-[#191919]/90 transition-colors shadow-sm"
                >
                  Request Personalized Walkthrough
                </button>
              </div>

              <p className="text-center text-[11px] text-gray-400 mt-3">
                SOC2 Type II Certified • Bank-grade 256-bit encryption • Read-only core integrations
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
