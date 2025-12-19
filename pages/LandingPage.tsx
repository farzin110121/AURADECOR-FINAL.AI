
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="text-white">
      {/* Hero Section */}
      <section className="text-center py-20 lg:py-32">
        <h1 className="text-5xl lg:text-7xl font-bold font-display max-w-4xl mx-auto leading-tight">
          AI Interior Design from Floorplan in <span className="gold-gradient-text">3 Minutes</span>
        </h1>
        <p className="text-lg text-text-muted mt-6 max-w-2xl mx-auto">
          Transform your space with AURADECOR.ai. Upload a floorplan, generate photorealistic designs, and connect with top-tier suppliers instantly.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            to="/signup?role=owner"
            className="px-8 py-3 font-semibold rounded-full text-black bg-gradient-to-r from-primary-gold to-secondary-gold hover:shadow-[0_5px_20px_rgba(212,175,55,0.4)] transform hover:-translate-y-0.5 transition-all"
          >
            Start Free Owner Trial
          </Link>
          <Link
            to="/signup?role=supplier"
            className="px-8 py-3 font-semibold rounded-full border-2 border-primary-gold text-primary-gold bg-card-bg hover:bg-[rgba(212,175,55,0.2)] transition-all"
          >
            Supplier Signup
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <h2 className="text-4xl font-bold font-display text-center mb-12">How It Works</h2>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div className="border border-border-color bg-card-bg p-8 rounded-xl">
            <div className="text-3xl font-bold gold-gradient-text font-display mb-4">1</div>
            <h3 className="text-xl font-semibold mb-2">Upload Floorplan</h3>
            <p className="text-text-muted">Submit any floorplan image. Our AI performs a detailed architectural analysis.</p>
          </div>
          <div className="border border-border-color bg-card-bg p-8 rounded-xl">
            <div className="text-3xl font-bold gold-gradient-text font-display mb-4">2</div>
            <h3 className="text-xl font-semibold mb-2">Generate Designs</h3>
            <p className="text-text-muted">Choose a style and instantly generate unlimited, photorealistic design concepts.</p>
          </div>
          <div className="border border-border-color bg-card-bg p-8 rounded-xl">
            <div className="text-3xl font-bold gold-gradient-text font-display mb-4">3</div>
            <h3 className="text-xl font-semibold mb-2">Connect with Suppliers</h3>
            <p className="text-text-muted">Send your final design and material list to local suppliers for quotes with one click.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
