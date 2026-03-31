import { AlertCircle, ArrowRight, Layers, Maximize2, Share2, Grid } from 'lucide-react';
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

interface GalleryProps {
  onNavigate: (page: string) => void;
}

export default function Gallery({ onNavigate }: GalleryProps) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    cardRefs.current.forEach((ref) => {
      if (ref) {
        VanillaTilt.init(ref, {
          max: 8,
          speed: 1000,
          glare: true,
          "max-glare": 0.15,
          perspective: 1500,
          scale: 1.03,
        });
      }
    });
    return () => {
      cardRefs.current.forEach((ref) => (ref as any)?.vanillaTilt?.destroy());
    };
  }, []);

  const galleryImages = [
    {
      src: '/img/img3.png',
      title: 'Avant-Garde Cafe Concept',
      category: 'Container Cafes',
    },
    {
      src: '/img/img9.PNG',
      title: 'Executive Modular Workspace',
      category: 'Container Offices',
    },
    {
      src: '/img/img5.png',
      title: 'Elite Sanitation Infrastructure',
      category: 'Public Toilets',
    },
    {
      src: '/img/img10.PNG',
      title: 'Bespoke Architectural Conversion',
      category: 'Custom Solutions',
    },
  ];

  return (
    <div className="bg-transparent relative z-10 overflow-hidden">

      {/* HERO */}

      <section className="relative py-24 lg:py-40 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-slate-950/5"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-600/30 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="text-orange-600 font-black uppercase tracking-[0.5em] text-[10px] mb-8">Visual Portfolio</div>
            <Heading3D tag="h1" className="text-6xl sm:text-8xl lg:text-9xl font-black text-slate-900 mb-10 tracking-tighter uppercase leading-[0.8]">
              DESIGN <span className="text-orange-600">ARCHIVE</span>
            </Heading3D>
            <p className="text-xl text-slate-500 max-w-4xl mx-auto font-light leading-relaxed uppercase tracking-widest">
              A curated collection of <span className="text-slate-900 font-black">conceptual ecosystems</span> pushing the boundaries of modular design.
            </p>
          </div>

          <div className="glass-card bg-orange-600/5 backdrop-blur-[40px] border border-orange-600/10 rounded-[3rem] p-10 lg:p-16 max-w-5xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-10">
              <div className="bg-orange-600/10 p-5 rounded-[2rem] shadow-inner">
                <AlertCircle className="text-orange-600 flex-shrink-0" size={40} />
              </div>
              <div className="text-center lg:text-left">
                <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tighter" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Conceptual <span className="text-orange-600">Protocol</span>
                </h3>
                <p className="text-slate-600 leading-relaxed font-medium tracking-tight text-lg">
                  These visualizations serve as <span className="font-black text-slate-900">architectural benchmarks</span>. Final implementation protocols, material specifications, and structural configurations are strictly customized to align with your specific operational requirements and brand identity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY GRID */}

      <section className="py-40 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 gap-16">
            {galleryImages.map((image, index) => (
              <div 
                key={index} 
                ref={(el) => (cardRefs.current[index] = el)}
                className="glass-card rounded-[4rem] overflow-hidden group transform-gpu cursor-crosshair" 
              >
                <div className="relative overflow-hidden aspect-[16/10]">
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex flex-col justify-end p-12">
                    <div className="flex items-center gap-3 mb-4 tilt-inner">
                      <span className="bg-orange-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">{image.category}</span>
                      <div className="w-8 h-px bg-white/30"></div>
                    </div>
                    <h3 className="text-white text-4xl font-black uppercase tracking-tighter tilt-inner leading-tight">{image.title}</h3>
                    
                    <div className="flex gap-4 mt-8 tilt-inner opacity-0 group-hover:opacity-100 translate-y-10 group-hover:translate-y-0 transition-all duration-700 delay-100">
                      <button className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl text-white hover:bg-orange-600 transition-colors">
                        <Maximize2 size={20} />
                      </button>
                      <button className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl text-white hover:bg-orange-600 transition-colors">
                        <Share2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-12">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-orange-600 font-black text-[10px] uppercase tracking-[0.4em] mb-3 block">{image.category}</span>
                      <h3 className="text-slate-900 text-2xl font-black uppercase tracking-tighter leading-tight">{image.title}</h3>
                    </div>
                    <div className="bg-slate-950/5 p-3 rounded-xl">
                      <Layers size={20} className="text-slate-400" />
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('quotation')}
                    className="group flex items-center gap-4 text-orange-600 font-black text-xs uppercase tracking-[0.3em] hover:text-slate-900 transition-all"
                  >
                    Initiate Configuration <ArrowRight size={18} className="group-hover:translate-x-3 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CAPABILITIES REFINED */}

      <section className="py-40 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-orange-600/5"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-600/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-32">
            <div className="text-orange-600 font-black uppercase tracking-[0.4em] text-xs mb-8">Structural Parameters</div>
            <Heading3D tag="h2" className="text-5xl sm:text-7xl font-black text-slate-900 mb-10 tracking-tighter uppercase leading-[0.8]">
              DIMENSIONAL <span className="text-orange-600">FLEXIBILITY</span>
            </Heading3D>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: 'Standard', value: '20ft', icon: Grid },
              { label: 'Extended', value: '40ft', icon: Layers },
              { label: 'Combined', value: 'Multi', icon: Grid },
              { label: 'Bespoke', value: 'Custom', icon: Maximize2 }
            ].map((dim, i) => (
              <div key={i} className="glass-card bg-white border border-slate-100 rounded-[3rem] p-12 text-center group hover:bg-orange-600/5 transition-all duration-700">
                <div className="bg-orange-600/10 w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-10 group-hover:scale-110 transition-transform">
                  <dim.icon className="text-orange-600" size={32} />
                </div>
                <h3 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tighter leading-none">{dim.value}</h3>
                <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">{dim.label} Module</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA REFINED */}

      <section className="py-40 bg-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Heading3D tag="h2" className="text-5xl sm:text-7xl font-black mb-12 text-slate-900 tracking-tighter uppercase leading-[0.8]">
            VISION TO <span className="text-orange-600">REALITY</span>
          </Heading3D>
          <p className="text-2xl mb-20 text-slate-500 font-light uppercase tracking-[0.3em]">
            Schedule your <span className="text-slate-900 font-black">Strategic Design session</span> today
          </p>

          <div className="flex flex-col sm:flex-row gap-10 justify-center items-center">
            <button
              onClick={() => onNavigate('contact')}
              className="w-full sm:w-auto px-16 py-8 bg-orange-600 text-white rounded-full font-black uppercase tracking-widest hover:bg-orange-700 transition-all duration-700 hover:scale-110 shadow-2xl shadow-orange-600/30"
            >
              Consult Experts
            </button>
            <button
              onClick={() => onNavigate('solutions')}
              className="w-full sm:w-auto px-16 py-8 bg-transparent border-2 border-orange-600 text-orange-600 rounded-full font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all duration-700 hover:scale-110"
            >
              Explore Solutions
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}