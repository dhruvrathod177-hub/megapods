import { useState, useRef, useEffect } from 'react';
import { Phone, Mail, MapPin, Clock, Send, ChevronDown,  ArrowRight } from 'lucide-react';
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

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  });

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

  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const faqs = [
    {
      question: 'What is the typical timeline for a container conversion project?',
      answer: 'The timeline varies based on project complexity, but typically ranges from 4-8 weeks from design approval to delivery. Simple conversions may take less time, while complex multi-container projects may require additional weeks. We provide a detailed timeline during the consultation phase.',
    },
    {
      question: 'How much does a container conversion cost?',
      answer: 'Costs vary widely based on size, customization level, materials, and features. A basic container cafe might start around ₹5-8 lakhs, while complex office spaces or multi-unit projects can range higher. We provide detailed quotes after understanding your specific requirements during the free consultation.',
    },
    {
      question: 'Do you provide installation and setup services?',
      answer: 'Yes, we offer complete turnkey solutions including delivery, installation, and setup at your location. Our team handles all aspects of site preparation guidance, transportation, crane services (if needed), and final installation to ensure your container is ready to use.',
    },
    {
      question: 'Are container structures durable and weatherproof?',
      answer: 'Absolutely. Shipping containers are designed to withstand harsh ocean conditions. We enhance them further with weatherproofing, insulation, rust-proofing, and protective coatings. With proper maintenance, container structures can last 25+ years.',
    },
    {
      question: 'Can I relocate the container structure later?',
      answer: 'Yes, one of the key advantages of container solutions is portability. They can be relocated to a different site if needed. However, relocation requires professional handling, including crane services and transportation, which we can arrange for you.',
    },
    {
      question: 'What customization options are available?',
      answer: 'Nearly everything can be customized including exterior colors and branding, interior layouts and finishes, doors and windows placement, electrical and plumbing configurations, HVAC systems, furniture and fixtures, and security features. We work with you to match your exact specifications.',
    },
    {
      question: 'Do I need special permits for container structures?',
      answer: 'Permit requirements vary by location and intended use. For permanent installations, you may need building permits and approval from local authorities. For temporary or mobile setups, requirements are usually minimal. We can guide you through the local regulatory requirements during consultation.',
    },
    {
      question: 'What maintenance is required for container structures?',
      answer: 'Container structures require minimal maintenance. Regular tasks include cleaning exterior surfaces, checking and maintaining paint/coating, inspecting seals and gaskets, servicing HVAC systems, and checking electrical and plumbing systems. We provide a detailed maintenance guide with every project.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Name: ${formData.name}%0AEmail: ${formData.email}%0APhone: ${formData.phone}%0AService Interested: ${formData.service}%0AMessage: ${formData.message}`;
    window.open(`https://wa.me/919426951908?text=${message}`, '_blank');
  };

  return (
    <div className="bg-transparent relative z-10 overflow-hidden">

      {/* HERO */}

      <section className="relative py-24 lg:py-40 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-slate-950/5"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-600/30 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="text-center">
            <div className="text-orange-600 font-black uppercase tracking-[0.5em] text-[10px] mb-8 animate-fade-in">Communication Node</div>
            <Heading3D tag="h1" className="text-6xl sm:text-8xl lg:text-9xl font-black text-slate-900 mb-10 tracking-tighter uppercase leading-[0.8]">
              ESTABLISH <span className="text-orange-600">CONTACT</span>
            </Heading3D>

            <p className="text-xl text-slate-500 max-w-4xl mx-auto font-light leading-relaxed uppercase tracking-widest animate-fade-up">
              Initiate project <span className="text-slate-900 font-black">dialogue</span> with our modular architecture specialists to catalyze your vision.
            </p>

          </div>

        </div>

      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-40 relative z-10">

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-32">

          {/* CONTACT INFO */}

          <div>

            <div className="text-orange-600 font-black uppercase tracking-[0.4em] text-xs mb-8">Infrastructure</div>
            <Heading3D tag="h2" className="text-5xl font-black text-slate-900 mb-16 uppercase tracking-tighter leading-tight">Project <span className="text-orange-600">Sync.</span></Heading3D>

            <div className="space-y-6 lg:space-y-10">

              {[
                { icon: Phone, label: 'Transmission Line', value: '+91 87581 76693', subValue: '+91 92653 80907' },
                { icon: Mail, label: 'Digital Identity', value: 'megapodsindia@gmail.com' },
                { icon: MapPin, label: 'Physical HQ', value: 'Surat, Gujarat, India' },
                { icon: Clock, label: 'Operational Window', value: 'Mon - Sat: 9:00 AM - 7:00 PM', subValue: 'Sun: Closed' },
              ].map((item, index) => (

                <div key={index} className="glass-card rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-10 flex items-center gap-6 lg:gap-10 group overflow-hidden">

                  <div className="shrink-0 bg-orange-600 text-white w-16 h-16 lg:w-20 lg:h-20 rounded-[1rem] lg:rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 shadow-2xl shadow-orange-600/30">
                    <item.icon className="w-7 h-7 lg:w-9 lg:h-9" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] lg:tracking-[0.4em] mb-2 lg:mb-3 truncate">{item.label}</p>
                    <p className="text-sm sm:text-lg lg:text-2xl font-black text-slate-900 tracking-tight lg:tracking-tighter uppercase break-words">{item.value}</p>
                    {item.subValue && <p className="text-slate-400 font-bold text-[10px] lg:text-xs uppercase tracking-widest mt-1 lg:mt-2 break-words">{item.subValue}</p>}
                  </div>

                </div>

              ))}

            </div>

          </div>


          {/* CONTACT FORM */}

          <div 
            ref={(el) => (cardRefs.current[0] = el)}
            className="glass-card rounded-[4rem] p-12 lg:p-20 relative overflow-hidden group transform-gpu"
          >
            <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-orange-600/5 rounded-full -mr-60 -mt-60 transition-all duration-1000 group-hover:bg-orange-600/10 group-hover:scale-125"></div>

            <div className="relative z-10 tilt-inner">
              <Heading3D tag="h2" className="text-4xl font-black text-slate-900 mb-14 uppercase tracking-tighter leading-none">Submit <span className="text-orange-600">Protocol.</span></Heading3D>

              <form onSubmit={handleSubmit} className="space-y-10">

                <div className="grid sm:grid-cols-2 gap-10">

                  <div>
                    <label htmlFor="name" className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 ml-2">Identity</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="w-full px-8 py-5 glass-input rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-slate-300 font-bold uppercase tracking-widest text-xs"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 ml-2">Digital Endpoint</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full px-8 py-5 glass-input rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-slate-300 font-bold uppercase tracking-widest text-xs"
                      placeholder="john@protocol.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                </div>

                <div className="grid sm:grid-cols-2 gap-10">

                  <div>
                    <label htmlFor="phone" className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 ml-2">Secure Line</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      className="w-full px-8 py-5 glass-input rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-slate-300 font-bold uppercase tracking-widest text-xs"
                      placeholder="+91 00000 00000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="service" className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 ml-2">Ecosystem Type</label>
                    <select
                      id="service"
                      name="service"
                      className="w-full px-8 py-5 glass-input rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all font-black uppercase tracking-widest text-[10px] appearance-none cursor-pointer text-slate-900"
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    >
                      <option value="">Initialize Selection</option>
                      <option value="Cafe">Modular Cafe</option>
                      <option value="Office">Modular Office</option>
                      <option value="Toilet">Public Infrastructure</option>
                      <option value="Custom">Bespoke Solution</option>
                    </select>
                  </div>

                </div>

                <div>
                  <label htmlFor="message" className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 ml-2">System Parameters</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className="w-full px-8 py-5 glass-input rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none placeholder:text-slate-300 font-bold text-sm leading-relaxed"
                    placeholder="Detail project operational requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-600 text-white px-12 py-6 rounded-full font-black uppercase tracking-[0.3em] hover:bg-orange-700 transition-all duration-700 hover:scale-105 active:scale-95 shadow-2xl shadow-orange-600/40 flex items-center justify-center gap-6 group"
                >
                  Transmit via WhatsApp
                  <Send size={24} className="group-hover:translate-x-3 group-hover:-translate-y-2 transition-transform duration-700" />
                </button>

              </form>
            </div>

          </div>

        </div>

      </div>


      {/* FAQ */}

      <section className="py-40 bg-orange-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-transparent opacity-40"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-600/50 to-transparent"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="text-center mb-32">
            <div className="text-orange-600 font-black uppercase tracking-[0.4em] text-[10px] mb-8">System Knowledge Base</div>
            <Heading3D tag="h2" className="text-5xl sm:text-7xl font-black text-white mb-10 tracking-tighter uppercase leading-[0.8]">
              LOGISTICAL <span className="text-slate-950">INVARIANTS</span>
            </Heading3D>
          </div>

          <div className="space-y-6">

            {faqs.map((faq, index) => (

              <div key={index} className="glass-card bg-white/5 border-white/10 rounded-[2.5rem] overflow-hidden group/faq transition-all duration-700">

                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-10 text-left hover:bg-white/5 transition-all duration-500"
                >
                  <span className="text-xl font-black text-slate-950 uppercase tracking-tight pr-8">{faq.question}</span>
                  <div className={`bg-orange-600/10 p-3 rounded-xl transition-all duration-500 ${expandedFaq === index ? 'rotate-180 bg-orange-600 text-white' : 'text-orange-600'}`}>
                    <ChevronDown size={24} />
                  </div>
                </button>

                {expandedFaq === index && (
                  <div className="px-10 pb-10 animate-fade-in">
                    <p className="text-slate-950 leading-relaxed font-medium text-lg uppercase tracking-wider">{faq.answer}</p>
                  </div>
                )}

              </div>

            ))}

          </div>

          <div className="text-center mt-20">
            <p className="text-slate-950 font-black uppercase tracking-[0.3em] text-s mb-2">Immediate Resolution Required?</p>
            <a
              href="https://wa.me/918758176693?text=Hello!%20I%20have%20a%20question%20about%20your%20container%20solutions."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-4 text-orange-600 font-black uppercase tracking-[0.4em] text-[10px] hover:text-white transition-all duration-500 group"
            >
              Direct Link Established <ArrowRight size={16} className="group-hover:translate-x-3 transition-transform" />
            </a>
          </div>

        </div>

      </section>

    </div>
  );
}