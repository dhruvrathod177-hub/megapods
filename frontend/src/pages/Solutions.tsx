import { Coffee, Building2, DoorOpen, Box, CheckCircle, ArrowRight } from 'lucide-react';
import { useRef, useEffect } from 'react';
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
        max: 15,
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

interface SolutionsProps {
  onNavigate: (page: string) => void;
}

export default function Solutions({ onNavigate }: SolutionsProps) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    cardRefs.current.forEach((ref) => {
      if (ref) {
        VanillaTilt.init(ref, {
          max: 5,
          speed: 1000,
          glare: true,
          "max-glare": 0.1,
          perspective: 2000,
          scale: 1.01,
        });
      }
    });
    return () => {
      cardRefs.current.forEach((ref) => (ref as any)?.vanillaTilt?.destroy());
    };
  }, []);

  const solutions = [
    {
      icon: Coffee,
      title: 'Container Cafes',
      description: 'Stand out in the competitive cafe market with a unique, Instagram-worthy container cafe that attracts customers and maximizes your brand presence.',
      features: [
        'Fully equipped kitchen and service area',
        'Modern interior with customizable branding',
        'Energy-efficient lighting and climate control',
        'Outdoor seating integration options',
        'Complete electrical and plumbing setup',
        'Weatherproof and durable construction',
      ],
      idealFor: 'Coffee shops, juice bars, food trucks, pop-up restaurants, beach cafes, event venues',
    },
    {
      icon: Building2,
      title: 'Container Offices',
      description: 'Create a professional workspace that reflects your brand identity while keeping costs low. Perfect for startups, remote teams, and growing businesses.',
      features: [
        'Climate-controlled work environment',
        'Professional interior finishes',
        'Electrical wiring and data cable setup',
        'Partition walls and meeting spaces',
        'Energy-efficient insulation',
        'Security features and access control',
      ],
      idealFor: 'Startups, construction site offices, remote workspaces, co-working spaces, satellite offices',
    },
    {
      icon: DoorOpen,
      title: 'Public Toilets',
      description: 'Hygienic, low-maintenance public toilet solutions that meet government standards and provide dignity to users in public spaces.',
      features: [
        'Multiple compartments available',
        'Water-efficient fixtures',
        'Ventilation and odor control systems',
        'Accessible design options',
        'Easy-to-clean surfaces',
        'Durable anti-corrosion materials',
      ],
      idealFor: 'Municipalities, parks, highways, construction sites, event venues, commercial complexes',
    },
    {
      icon: Box,
      title: 'Custom Container Solutions',
      description: 'Have a unique vision? We bring it to life. From retail stores to art studios, gyms to medical clinics – we customize containers for any purpose.',
      features: [
        'Tailored design consultation',
        'Multi-container configurations',
        'Specialized equipment integration',
        'Brand-specific aesthetics',
        'Advanced structural modifications',
        'Turnkey project management',
      ],
      idealFor: 'Retail stores, gyms, medical clinics, storage facilities, exhibition spaces, temporary housing',
    },
  ];

  return (
    <div className="bg-transparent relative z-10 overflow-hidden">

      {/* HERO */}

      <section className="relative py-24 lg:py-40 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-slate-950/5"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-600/30 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="text-center">
            <div className="text-orange-600 font-black uppercase tracking-[0.5em] text-xs mb-8">Precision Engineering</div>
            <Heading3D tag="h1" className="text-6xl sm:text-8xl lg:text-9xl font-black text-slate-900 mb-10 tracking-tighter uppercase leading-[0.8]">
              ELITE <span className="text-orange-600">MODULAR</span>
            </Heading3D>

            <p className="text-xl text-slate-500 max-w-4xl mx-auto font-light leading-relaxed uppercase tracking-widest">
              Redefining physical space with <span className="text-slate-900 font-black">advanced modular ecosystems</span> tailored for visionary entrepreneurs.
            </p>

          </div>

        </div>

      </section>

      {/* SOLUTIONS GRID */}

      <section className="py-40 bg-transparent relative z-10">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="space-y-40">

            {solutions.map((solution, index) => (

              <div
                key={index}
                ref={(el) => (cardRefs.current[index] = el)}
                className="glass-card rounded-[4rem] p-12 lg:p-24 relative overflow-hidden group transform-gpu"
              >
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-orange-600/5 rounded-full -mr-80 -mt-80 transition-all duration-1000 group-hover:bg-orange-600/10 group-hover:scale-125"></div>

                <div className="grid lg:grid-cols-12 gap-20 items-center relative z-10">

                  <div className="lg:col-span-5 tilt-inner">

                    <div className="bg-orange-600 text-white w-24 h-24 rounded-[2rem] flex items-center justify-center mb-12 shadow-2xl shadow-orange-600/30 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                      <solution.icon size={48} />
                    </div>

                    <Heading3D tag="h2" className="text-5xl font-black text-slate-900 mb-10 uppercase tracking-tighter leading-tight">{solution.title}</Heading3D>

                    <p className="text-slate-500 text-2xl leading-relaxed mb-12 font-light tracking-wide">
                      {solution.description}
                    </p>

                    <div className="bg-slate-950/5 rounded-[2rem] p-10 border border-slate-950/5 mb-12 backdrop-blur-xl">
                      <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.4em] mb-4">Strategic Applications</p>
                      <p className="text-slate-800 font-black text-xl leading-snug uppercase tracking-tight">{solution.idealFor}</p>
                    </div>

                    <button
                      onClick={() => onNavigate('contact')}
                      className="group relative px-12 py-6 bg-orange-600 text-white rounded-full font-black uppercase tracking-[0.2em] overflow-hidden transition-all duration-700 hover:scale-110 hover:shadow-[0_0_60px_rgba(234,88,12,0.6)] flex items-center gap-4"
                    >
                      <span className="relative z-10 flex items-center gap-4">
                        Initiate Project <ArrowRight size={24} className="group-hover:translate-x-3 transition-transform duration-700" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-700 translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
                    </button>

                  </div>

                  <div className="lg:col-span-7 tilt-inner">

                    <div className="grid sm:grid-cols-2 gap-8">

                      {solution.features.map((feature, fIndex) => (

                        <div key={fIndex} className="glass-card bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] flex flex-col gap-6 hover:bg-white/10 transition-all duration-700 hover:-translate-y-4 group/item">
                          <div className="bg-orange-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-xl shadow-orange-600/20 group-hover/item:scale-110 transition-transform duration-500">
                            <CheckCircle size={20} />
                          </div>
                          <span className="text-slate-800 font-black text-lg leading-tight uppercase tracking-tighter">{feature}</span>
                        </div>

                      ))}

                    </div>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* WHY CHOOSE US REFINED */}

      <section className="py-40 relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-orange-600/5"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-600/20 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center mb-32">
            <div className="text-orange-600 font-black uppercase tracking-[0.4em] text-xs mb-8">Performance Invariants</div>
            <Heading3D tag="h2" className="text-5xl sm:text-7xl font-black text-slate-900 mb-10 tracking-tighter uppercase">
              THE <span className="text-orange-600">DIFFERENCE</span>
            </Heading3D>
          </div>

          <div className="grid md:grid-cols-3 gap-12">

            {[
              { label: 'Tailored', value: '100%', desc: 'Hyper-customized ecosystems aligned with brand DNA' },
              { label: 'Quality', value: 'ISO', desc: 'Precision manufacturing with aerospace-grade standards' },
              { label: 'Support', value: '24/7', desc: 'Continuous lifecycle management for your modular assets' }
            ].map((item, i) => (
              <div key={i} className="glass-card bg-white p-16 rounded-[4rem] text-center group hover:bg-orange-600/5 transition-all duration-700">
                <div className="bg-orange-600/10 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-10 group-hover:scale-110 transition-transform">
                  <span className="text-orange-600 font-black text-2xl">{item.value}</span>
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter leading-none">{item.label}</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed uppercase tracking-widest">{item.desc}</p>
              </div>
            ))}

          </div>

        </div>

      </section>

      {/* CTA REFINED */}

      <section className="py-32 relative overflow-hidden bg-white">
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">

          <Heading3D tag="h2" className="text-5xl sm:text-7xl font-black mb-12 text-slate-900 tracking-tighter uppercase leading-[0.8]">
            READY TO <span className="text-orange-600">EVOLVE?</span>
          </Heading3D>

          <p className="text-2xl mb-20 text-slate-500 font-light uppercase tracking-[0.3em]">
            Elevate your modular strategy with <span className="text-slate-900 font-black">Megapods India</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-10 justify-center items-center">

            <button
              onClick={() => onNavigate('contact')}
              className="w-full sm:w-auto px-16 py-8 bg-orange-600 text-white rounded-full font-black uppercase tracking-widest hover:bg-orange-700 transition-all duration-700 hover:scale-110 shadow-2xl shadow-orange-600/30"
            >
              Consult Strategy
            </button>

            <button
              onClick={() => onNavigate('gallery')}
              className="w-full sm:w-auto px-16 py-8 bg-transparent border-2 border-orange-600 text-orange-600 rounded-full font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all duration-700 hover:scale-110"
            >
              View Portfolio
            </button>

          </div>

        </div>

      </section>
    </div>
  );
}