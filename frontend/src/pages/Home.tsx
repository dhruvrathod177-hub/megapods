import { Coffee, Building2, DoorOpen, Box, CheckCircle, Users, Award, Clock, ArrowRight, PhoneCall } from 'lucide-react';
import { useEffect, useState } from "react";

function useTypewriter(text: string, speed = 32) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayText(text.slice(0, index + 1));
      index++;
      if (index === text.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return displayText;
}


interface HomeProps {
  onNavigate: (page: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const services = [
    {
      icon: Coffee,
      title: 'Container Cafes',
      description: 'Transform your coffee business with stylish, fully-equipped container cafes. Perfect for modern entrepreneurs.',
    },
    {
      icon: Building2,
      title: 'Container Offices',
      description: 'Premium, cost-effective office spaces built from containers. Ideal for startups and established businesses.',
    },
    {
      icon: DoorOpen,
      title: 'Public Toilets',
      description: 'Hygienic, durable, and easy-to-install public toilet solutions for municipalities and commercial spaces.',
    },
    {
      icon: Box,
      title: 'Custom Solutions',
      description: 'Bespoke container conversions tailored to your unique business needs and specifications.',
    },
  ];

  const process = [
    { step: '1', title: 'Consultation', description: 'Share your vision and requirements with our experts' },
    { step: '2', title: 'Design', description: 'We create custom 3D designs based on your needs' },
    { step: '3', title: 'Manufacturing', description: 'High-quality construction with premium materials' },
    { step: '4', title: 'Delivery & Setup', description: 'Complete installation at your location' },
  ];

  const whyChooseUs = [
    { icon: Award, title: 'Premium Quality', description: 'ISO-certified materials and expert craftsmanship' },
    { icon: Clock, title: 'Fast Delivery', description: 'Quick turnaround time without compromising quality' },
    { icon: Users, title: 'Expert Team', description: 'Experienced professionals dedicated to your project' },
    { icon: CheckCircle, title: 'Customizable', description: 'Fully tailored solutions to match your brand' },
  ];

  const typedParagraph = useTypewriter(
    "Megapods India specializes in innovative container conversions for cafes, offices, public toilets, and custom projects. Build your dream space with our expert modular solutions.",
    32
  ); 
  return (
    <div>
   <section className="relative min-h-[75vh] overflow-hidden py-16">

{/* 🎥 VIDEO BACKGROUND */}
<video
  className="absolute inset-0 w-full h-full object-cover"
  src="/video/video.mov"
  autoPlay
  muted
  loop
  playsInline
  preload="auto"
/>

{/* 🌑 DARK OVERLAY (for text readability) */}
<div className="absolute inset-0 bg-black/35"></div>

{/* CONTENT */}
<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <div className="flex flex-col items-center justify-center text-center min-h-[60vh]">

    {/* HEADING */}
    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white drop-shadow-lg animate-fade-up">
      Transform Spaces with{" "}
      <span className="text-orange-400">
        Premium Container Solutions
      </span>
    </h1>

    {/* ✅ TYPING PARAGRAPH */}
    <p className="text-lg text-white/90 mb-8 leading-relaxed max-w-3xl drop-shadow animate-fade-up delay-1">
      {typedParagraph}
    </p>

    {/* BUTTONS */}
    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up delay-2">
      <button
        onClick={() => onNavigate("contact")}
        className="bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
      >
        Get Free Consultation
        <ArrowRight size={20} />
      </button>

      <a
        href="tel:+918758176693"
        className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2"
      >
        <PhoneCall size={20} />
        Call Now
      </a>
    </div>

  </div>
</div>
</section>
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Solutions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Innovative container conversions designed to meet diverse business needs across India
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-shadow cursor-pointer group"
                onClick={() => onNavigate('solutions')}
              >
                <div className="bg-orange-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-600 transition-colors">
                  <service.icon className="text-orange-600 group-hover:text-white transition-colors" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <button
              onClick={() => onNavigate('solutions')}
              className="text-orange-600 font-semibold hover:text-orange-700 transition-colors flex items-center gap-2 mx-auto"
            >
              Explore All Solutions
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Process
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From concept to completion, we ensure a smooth and transparent journey
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="bg-orange-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="text-orange-300" size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Megapods India?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your trusted partner for innovative and reliable container solutions
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, index) => (
              <div key={index} className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="text-orange-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-orange-600 to-orange-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Build Your Dream Project?
          </h2>
          <p className="text-xl mb-8 text-orange-100">
            Get a free consultation and discover how container solutions can transform your business
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('contact')}
              className="bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Free Consultation
            </button>
            <a
              href="https://wa.me/919265380907?text=Hello!%20I%20would%20like%20to%20know%20more%20about%20your%20container%20solutions."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
