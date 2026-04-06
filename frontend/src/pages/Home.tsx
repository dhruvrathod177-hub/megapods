import { Coffee, Building2, DoorOpen, Box, CheckCircle, Users, Award, Clock, ArrowRight, PhoneCall } from 'lucide-react';
import { useEffect, useRef } from 'react';
import VanillaTilt from 'vanilla-tilt';


type HTMLTag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';

interface Heading3DProps {
  children: React.ReactNode;
  className?: string;
  tag?: HTMLTag;
}

function Heading3D({ children, className = '', tag: Tag = 'h2' }: Heading3DProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current) {
      VanillaTilt.init(ref.current, {
        max: 12,
        speed: 400,
        glare: true,
        "max-glare": 0.2,
        scale: 1.05,
      });
    }
    return () => {
      (ref.current as any)?.vanillaTilt?.destroy();
    };
  }, []);

  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className={`heading-3d ${className}`}
    >
      {children}
    </Tag>
  );
}


interface HomeProps {
  onNavigate: (page: string) => void;
}
// 🔥 PREMIUM TYPEWRITER


const CinematicText = () => {
  const words = [
    "CRAFTING",
    "ULTRA-PREMIUM",
    "SPACES",
    "WITH",
    "VISIONARY",
    "MODULAR",
    "ENGINEERING."
  ];

  return (
    <div
      className="flex flex-wrap justify-center text-sm md:text-sm tracking-[0.25em] uppercase text-white"
    >
      {words.map((word, i) => (
        <span
          key={i}
          className={`mr-3 ${word === "ULTRA-PREMIUM"
            ? "text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 font-bold"
            : ""
            }`}
        >
          {word}
        </span>
      ))}
    </div>
  );
};
export default function Home({ onNavigate }: HomeProps) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Premium 3D Entrance for the heading words removed for a static feel

    cardRefs.current.forEach((ref) => {
      if (ref) {
        VanillaTilt.init(ref, {
          max: 8,
          speed: 1000,
          glare: true,
          "max-glare": 0.15,
          perspective: 1000,
          scale: 1.02,
        });
      }
    });
    return () => {
      cardRefs.current.forEach((ref) => (ref as any)?.vanillaTilt?.destroy());
    };
  }, []);

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

  return (
    <div className="bg-transparent overflow-hidden">

      {/* HERO */}
      <section className="relative min-h-[100dvh] w-full flex items-center justify-center overflow-hidden pt-24 sm:pt-28">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover object-center contrast-110 brightness-95 saturate-110"
        >
          <source src="/video/hero-1080.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/10"></div>
        <div className="absolute inset-0 backdrop-blur-[0px]"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col items-center justify-center text-center">

            <div className="inline-block px-6 py-2 mb-10 rounded-full bg-orange-600/10 backdrop-blur-xl border border-orange-600/30 text-orange-600 text-[10px] font-black uppercase tracking-[0.5em] animate-fade-in shadow-2xl shadow-orange-600/20">
              Future of Modular Architecture
            </div>
            <h1 className="font-rajdhani text-6xl sm:text-8xl lg:text-[10rem] font-black leading-[0.8] mb-12 text-slate-900 pointer-events-none [transform-style:preserve-3d]">
              <span className="hero-3d-line block-3d-dark block">BEYOND</span>
              <span className="hero-3d-line block-3d-orange block text-orange-600 mt-2">LIMITS.</span>
            </h1>

            <style>{`
              .block-3d-dark {
                text-shadow: 1px 1px 0 #cbd5e1, 2px 2px 0 #94a3b8, 3px 3px 0 #64748b, 4px 4px 20px rgba(0,0,0,0.2);
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                transform-origin: center bottom;
                cursor: default;
              }

              .block-3d-orange {
                text-shadow: 1px 1px 0 #fb923c, 2px 2px 0 #f97316, 3px 3px 0 #ea580c, 4px 4px 20px rgba(234,88,12,0.3);
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                transform-origin: center bottom;
                cursor: default;
              }
            `}</style>
            <div className="mb-12">
              <CinematicText />
            </div>    <div className="flex flex-col sm:flex-row gap-8 justify-center animate-fade-up delay-2">

              <button
                onClick={() => onNavigate('contact')}
                className="group px-12 py-6 bg-orange-600 text-white rounded-full font-black uppercase tracking-[0.2em] transition-all duration-700 hover:scale-110 hover:bg-orange-700 hover:shadow-[0_0_60px_rgba(234,88,12,0.6)]"
              >
                <div className="flex items-center gap-4">
                  Start Building <ArrowRight size={24} className="group-hover:translate-x-3 transition-transform duration-700" />
                </div>
              </button>

              <a
                href="tel:+918758176693"
                className="group px-12 py-6 bg-white border-2 border-slate-200 text-slate-900 rounded-full font-black uppercase tracking-[0.2em] transition-all duration-700 hover:scale-110 hover:bg-slate-50 hover:border-slate-300"
              >
                <div className="flex items-center gap-4">
                  <PhoneCall size={24} className="group-hover:rotate-12 transition-transform" />
                  Live Chat
                </div>
              </a>

            </div>

          </div>

        </div>

        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
          <div className="rounded-full bg-gradient-to-b from-white via-white/50 to-transparent"></div>
        </div>

      </section>


      {/* SOLUTIONS */}

      <section className="py-40 relative z-10">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-32">

            <div className="text-orange-600 font-black uppercase tracking-[0.4em] text-xs mb-6">Our Capabilities</div>
            <Heading3D tag="h2" className="text-5xl sm:text-7xl lg:text-8xl font-black text-slate-900 mb-10 tracking-tighter">
              ELITE <span className="text-orange-600">SOLUTIONS</span>
            </Heading3D>

            <p className="text-xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed uppercase tracking-widest">
              Fusing architectural artistry with industrial precision to redefine modern living.
            </p>

          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">

            {services.map((service, index) => (

              <div
                key={index}
                ref={(el) => (cardRefs.current[index] = el)}
                className="glass-card rounded-[3rem] p-12 cursor-pointer group animate-fade-up relative overflow-hidden"
                style={{ animationDelay: `${index * 0.15}s` }}
                onClick={() => onNavigate('solutions')}
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-orange-600/5 rounded-full -mr-24 -mt-24 transition-all duration-1000 group-hover:bg-orange-600/10 group-hover:scale-150"></div>

                <div className="bg-orange-600 text-white w-20 h-20 rounded-3xl flex items-center justify-center mb-12 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 shadow-2xl shadow-orange-600/40 tilt-inner">
                  <service.icon size={40} />
                </div>

                <h3 className="text-3xl font-black text-black mb-6 group-hover:text-orange-600 transition-colors uppercase tracking-tighter tilt-inner">{service.title}</h3>
                <p className="text-slate-400 leading-relaxed font-light tilt-inner">{service.description}</p>

                <div className="mt-12 flex items-center text-orange-600 font-black text-xs uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-20px] group-hover:translate-x-0 tilt-inner">
                  View Detail <ArrowRight size={18} className="ml-3" />
                </div>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* PROCESS */}

      <section className="py-40 relative z-10">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-32">
            <div className="text-orange-600 font-black uppercase tracking-[0.4em] text-xs mb-6">The Methodology</div>
            <Heading3D tag="h2" className="text-5xl sm:text-7xl lg:text-8xl font-black text-slate-900 mb-10 tracking-tighter">
              THE <span className="text-orange-600">BLUEPRINT</span>
            </Heading3D>
            <p className="text-xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed uppercase tracking-widest">
              A high-performance ecosystem ensuring flawless execution from concept to completion.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">

            {process.map((item, index) => (

              <div key={index} className="relative group">

                <div
                  ref={(el) => (cardRefs.current[index + 4] = el)}
                  className="glass-card rounded-[3.5rem] p-12 h-full text-center transition-all duration-700 hover:bg-orange-600/5 group-hover:border-orange-600/40"
                >

                  <div className="relative mb-12 flex justify-center tilt-inner">
                    <div className="text-[10rem] font-black text-slate-950/5 absolute -top-16 left-1/2 -translate-x-1/2 group-hover:text-orange-600/10 transition-colors duration-700">
                      0{item.step}
                    </div>
                    <div className="bg-orange-600 text-white w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl font-black relative z-10 shadow-2xl shadow-orange-600/30">
                      {item.step}
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tighter tilt-inner">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-light tilt-inner">{item.description}</p>

                </div>



              </div>

            ))}

          </div>

        </div>

      </section>


      {/* WHY CHOOSE US */}

      <section className="py-40 relative z-10">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-32">
            <div className="text-orange-600 font-black uppercase tracking-[0.4em] text-xs mb-6">Why Megapods</div>
            <Heading3D tag="h2" className="text-5xl sm:text-7xl lg:text-8xl font-black text-slate-900 mb-10 tracking-tighter">
              ELITE <span className="text-orange-600">EDGE</span>
            </Heading3D>
            <p className="text-xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed uppercase tracking-widest">
              Defining the gold standard in modular construction with zero compromise on quality.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">

            {whyChooseUs.map((item, index) => (

              <div
                key={index}
                ref={(el) => (cardRefs.current[index + 8] = el)}
                className="glass-card rounded-[3rem] p-12 text-center animate-fade-up relative group"
                style={{ animationDelay: `${index * 0.15}s` }}
              >

                <div className="bg-orange-600/5 w-24 h-24 rounded-[2rem] flex items-center justify-center mb-10 mx-auto group-hover:bg-orange-600 group-hover:text-white transition-all duration-700 shadow-inner group-hover:scale-110 group-hover:rotate-6 tilt-inner">
                  <item.icon className="text-orange-600 group-hover:text-black transition-colors duration-700" size={44} />
                </div>

                <h3 className="text-3xl font-black text-slate-900 mb-6 group-hover:text-orange-600 transition-colors uppercase tracking-tighter tilt-inner">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-light tilt-inner">{item.description}</p>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* CTA */}

      <section className="py-32 relative overflow-hidden bg-slate-50">

        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 to-transparent opacity-30"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-600/20 to-transparent"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">

          <Heading3D tag="h2" className="text-5xl sm:text-7xl font-black mb-10 text-slate-900 tracking-tighter">
            READY TO <span className="text-orange-600">EVOLVE?</span>
          </Heading3D>

          <p className="text-2xl mb-16 text-slate-500 font-light uppercase tracking-[0.3em]">
            Elevate your vision with <span className="text-slate-900 font-bold">Megapods India</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">

            <button
              onClick={() => onNavigate('contact')}
              className="w-full sm:w-auto px-16 py-6 bg-orange-600 text-white rounded-full font-black uppercase tracking-widest transition-all duration-700 hover:scale-110 shadow-2xl shadow-orange-600/30"
            >
              Consult Experts
            </button>

            <a
              href="https://wa.me/919265380907?text=Hello!%20I%20would%20like%20to%20know%20more%20about%20your%20container%20solutions."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-16 py-6 bg-green-600/10 backdrop-blur-xl border-2 border-green-600/30 text-green-600 rounded-full font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all duration-700 hover:scale-110 shadow-2xl shadow-green-600/10"
            >
              WhatsApp
            </a>

          </div>

        </div>

      </section>

    </div>
  );
}