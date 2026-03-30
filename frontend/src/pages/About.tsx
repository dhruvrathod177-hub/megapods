import { Target, Eye, Lightbulb, Shield, Zap, Heart, ArrowRight } from 'lucide-react';
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

interface AboutProps {
  onNavigate: (page: string) => void;
}

export default function About({ onNavigate }: AboutProps) {
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
          scale: 1.02,
        });
      }
    });
    return () => {
      cardRefs.current.forEach((ref) => (ref as any)?.vanillaTilt?.destroy());
    };
  }, []);

  const values = [
    {
      icon: Shield,
      title: 'Quality Protocol',
      description: 'Implementing aerospace-grade material standards across all modular ecosystems.',
    },
    {
      icon: Zap,
      title: 'Innovation Lab',
      description: 'Continuous R&D in structural engineering and sustainable architecture.',
    },
    {
      icon: Heart,
      title: 'Strategic Focus',
      description: 'Bespoke alignment with client operational requirements and brand DNA.',
    },
    {
      icon: Lightbulb,
      title: 'Eco-Systemic',
      description: 'Minimizing environmental footprint through advanced circular construction.',
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
            <div className="text-orange-600 font-black uppercase tracking-[0.5em] text-[10px] mb-8 animate-fade-in">Corporate Identity</div>
            <Heading3D tag="h1" className="text-6xl sm:text-8xl lg:text-9xl font-black text-slate-900 mb-10 tracking-tighter uppercase leading-[0.8]">
              MEGAPODS <span className="text-orange-600">INDIA</span>
            </Heading3D>

            <p className="text-xl text-slate-500 max-w-4xl mx-auto font-light leading-relaxed uppercase tracking-widest animate-fade-up">
              Architectural <span className="text-slate-900 font-black">pioneers</span> engineering the next generation of physical modular ecosystems.
            </p>

          </div>

        </div>

      </section>


      {/* ABOUT IMAGE */}

      <section className="py-40 bg-transparent relative z-10">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid lg:grid-cols-2 gap-32 items-center">

            <div 
              ref={(el) => (cardRefs.current[0] = el)}
              className="relative group transform-gpu"
            >
              <div className="absolute inset-0 bg-orange-600 rounded-[4rem] rotate-3 scale-95 opacity-10 group-hover:rotate-0 group-hover:scale-100 transition-all duration-1000"></div>
              <img
                src="/img/img7.jpg"
                alt="Megapods India Container Solutions"
                className="w-full rounded-[4rem] shadow-2xl relative z-10 transition-all duration-1000 group-hover:-translate-y-8 tilt-inner"
              />
            </div>

            <div className="tilt-inner">
              <div className="text-orange-600 font-black uppercase tracking-[0.4em] text-xs mb-8">Executive Summary</div>
              <Heading3D tag="h2" className="text-5xl font-black text-slate-900 mb-10 uppercase tracking-tighter leading-tight">
                Engineering <span className="text-orange-600">Possibilities</span> Beyond Boundaries.
              </Heading3D>

              <div className="space-y-8 text-xl text-slate-500 font-light leading-relaxed uppercase tracking-widest">
                <p>
                  Headquartered in <span className="text-slate-900 font-black">Surat, Gujarat</span>, Megapods India stands at the intersection of architectural artistry and industrial precision.
                </p>
                <p>
                  Our multidisciplinary team engineers <span className="text-slate-900 font-black">high-performance environments</span> that redefine the limitations of traditional construction.
                </p>
                <p>
                  We provide end-to-end lifecycle management for modular assets, ensuring <span className="text-slate-900 font-black">operational excellence</span> for global brands.
                </p>
              </div>

              <button
                onClick={() => onNavigate('solutions')}
                className="group relative mt-16 px-16 py-8 bg-orange-600 text-white rounded-full font-black uppercase tracking-[0.2em] overflow-hidden transition-all duration-700 hover:scale-110 hover:shadow-[0_0_60px_rgba(234,88,12,0.6)] flex items-center gap-6"
              >
                <span className="relative z-10 flex items-center gap-6">
                  Explore Ecosystems <ArrowRight size={26} className="group-hover:translate-x-3 transition-transform duration-700" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-700 translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
              </button>

            </div>

          </div>

        </div>

      </section>


      {/* MISSION & VISION */}

   {/* MISSION & VISION */}
<section className="py-40 bg-transparent relative z-10">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid lg:grid-cols-2 gap-16">

      <div className="glass-card rounded-[4rem] p-16 lg:p-24 group">
        <div className="bg-orange-600 text-white w-20 h-20 rounded-[1.5rem] flex items-center justify-center mb-12 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 shadow-2xl shadow-orange-600/30">
          <Target size={40} />
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-8 uppercase tracking-tighter">
          Our Mission
        </h2>
        <p className="text-slate-500 text-xl font-light leading-relaxed uppercase tracking-widest">
          To disrupt the architectural landscape by deploying <span className="text-slate-900 font-black">sustainable modular assets</span> that catalyze enterprise growth.
        </p>
      </div>

      <div className="glass-card rounded-[4rem] p-16 lg:p-24 group">
        <div className="bg-orange-600 text-white w-20 h-20 rounded-[1.5rem] flex items-center justify-center mb-12 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 shadow-2xl shadow-orange-600/30">
          <Eye size={40} />
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-8 uppercase tracking-tighter">
          Our Vision
        </h2>
        <p className="text-slate-500 text-xl font-light leading-relaxed uppercase tracking-widest">
          To establish the <span className="text-slate-900 font-black">Global Benchmark</span> for modular engineering, fusing visionary design with industrial precision.
        </p>
      </div>

    </div>
  </div>
</section>


      {/* VALUES */}

      <section className="py-40 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-orange-600/5"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-600/20 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="text-center mb-32">
            <div className="text-orange-600 font-black uppercase tracking-[0.4em] text-xs mb-8">Performance Invariants</div>
            <Heading3D tag="h2" className="text-5xl sm:text-7xl font-black text-slate-900 mb-10 tracking-tighter uppercase">CORE <span className="text-orange-600">VALUES</span></Heading3D>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">

            {values.map((item, index) => (

              <div 
                key={index} 
                ref={(el) => (cardRefs.current[index + 3] = el)}
                className="glass-card bg-white p-12 text-center animate-fade-up group transform-gpu" 
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="bg-orange-600/10 w-24 h-24 rounded-[2rem] flex items-center justify-center mb-10 mx-auto group-hover:bg-orange-600 group-hover:text-white transition-all duration-700 shadow-inner group-hover:scale-110 group-hover:rotate-6 tilt-inner">
                  <item.icon className="text-orange-600 group-hover:text-white transition-colors duration-700" size={44} />
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tighter tilt-inner">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-light tilt-inner">{item.description}</p>

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
              className="w-full sm:w-auto px-16 py-8 bg-slate-950 text-white rounded-full font-black uppercase tracking-widest hover:bg-orange-600 transition-all duration-700 hover:scale-110 shadow-2xl shadow-slate-950/20"
            >
              Consult Strategy
            </button>

            <button
              onClick={() => onNavigate('solutions')}
              className="w-full sm:w-auto px-16 py-8 bg-transparent border-2 border-slate-950/10 text-slate-950 rounded-full font-black uppercase tracking-widest hover:bg-slate-950 hover:text-white transition-all duration-700 hover:scale-110"
            >
              View Ecosystems
            </button>

          </div>

        </div>

      </section>

    </div>
  );
}