import { Phone, Mail, MapPin, Instagram, Facebook, Globe } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {

  // ✅ ADD THIS FUNCTION
  const handleNavigate = (page: string) => {
    onNavigate(page);

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 50);
  };

  return (
    <footer className="relative z-10 bg-white backdrop-blur-2xl border-t border-slate-100 text-slate-900 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-orange-600/5 rounded-full blur-[120px] -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-900/5 rounded-full blur-[150px] translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-20">
          
          <div className="space-y-8">
            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => handleNavigate('home')}>
              <div className="relative">
              <div className="relative h-16 w-16 group cursor-pointer">

{/* 🔥 Glow */}
<div className="absolute inset-0 rounded-full bg-orange-500 blur-lg opacity-50 group-hover:opacity-80 transition duration-500"></div>

{/* 🔥 Logo wrapper */}
<div className="relative h-full w-full rounded-full overflow-hidden border-2 border-white shadow-lg">

  {/* Shine effect */}
  <div className="absolute inset-0 overflow-hidden rounded-full">
    <div className="absolute top-0 -left-[120%] h-full w-[120%] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 group-hover:left-[120%] transition-all duration-700"></div>
  </div>

  {/* Image */}
  <img
    src="/img/logo1.JPG"
    alt="Megapodsindia"
    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
  />

</div>
</div>
</div>
              <div>
                <h3 className="text-2xl font-black tracking-tighter uppercase text-slate-900">Megapods<span className="text-orange-600">india</span></h3>
                <p className="text-[10px] font-bold tracking-[0.4em] text-orange-600 uppercase opacity-80">Modular Excellence</p>
              </div>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed font-light">
              Leading provider of premium container conversion and modular solutions in India. Crafting versatile environments with precision engineering.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-orange-600 mb-8">Quick Navigation</h4>
            <ul className="space-y-4">
              {['Home', 'About Us', 'Solutions', 'Gallery', 'Contact Us'].map((item) => (
                <li key={item}>
                  <button 
                    onClick={() => handleNavigate(item.toLowerCase().replace(' ', ''))} 
                    className="text-slate-500 hover:text-orange-600 transition-all duration-300 text-sm font-medium flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-orange-600 transition-all duration-300 group-hover:w-4"></span>
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-orange-600 mb-8">Get In Touch</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4 group">
                <div className="bg-slate-50 p-2.5 rounded-xl group-hover:bg-orange-600 transition-all duration-500">
                  <Phone size={18} className="text-orange-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <a href="tel:+918758176693" className="text-slate-700 hover:text-orange-600 transition-all block text-sm font-bold tracking-wide">
                    +91 87581 76693
                  </a>
                  <a href="tel:+919265380907" className="text-slate-700 hover:text-orange-600 transition-all block text-sm font-bold tracking-wide">
                    +91 92653 80907
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="bg-slate-50 p-2.5 rounded-xl group-hover:bg-orange-600 transition-all duration-500">
                  <Mail size={18} className="text-orange-600 group-hover:text-white transition-colors" />
                </div>
                <a href="mailto:megapodsindia@gmail.com" className="text-slate-700 hover:text-orange-600 transition-all text-sm font-bold tracking-wide">
  megapodsindia@gmail.com
</a>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="bg-slate-50 p-2.5 rounded-xl group-hover:bg-orange-600 transition-all duration-500">
                  <MapPin size={18} className="text-orange-600 group-hover:text-white transition-colors" />
                </div>
                <span className="text-slate-700 text-sm font-bold tracking-wide">Surat, Gujarat, India</span>
              </li>
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-orange-600 mb-8">Social Presence</h4>
            <div className="flex gap-4">
              {[
                { icon: Instagram, href: "https://www.instagram.com/megapods_india?igsh=dmhvaWk2d3J4c25p" },
                { icon: Facebook, href: "https://www.facebook.com/share/1HHNbTTaTn/?mibextid=wwXIfr" },
                { icon: Globe, href: "https://share.google/Y0sBn8WEMHjAFcjl7" }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-50 p-4 rounded-2xl hover:bg-orange-600 hover:text-white hover:scale-110 hover:-translate-y-1 transition-all duration-500 shadow-xl shadow-black/5 text-orange-600"
                >
                  <social.icon size={22} />
                </a>
              ))}
            </div>

            <button
              onClick={() => handleNavigate('contact')}
              className="group relative bg-orange-600 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs overflow-hidden transition-all duration-500 hover:scale-105 shadow-2xl shadow-orange-600/20 w-full"
            >
              <span className="relative z-10">Start Your Project</span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            </button>
          </div>

        </div>

        <div className="border-t border-slate-100 pt-10">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center lg:items-start gap-2">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                © 2025 MEGAPODSINDIA. ALL RIGHTS RESERVED.
              </p>
              <p className="text-slate-500 text-[9px] font-medium max-w-xl text-center lg:text-left italic">
                Designed for modular excellence and architectural innovation.
              </p>
            </div>
            <p className="text-slate-500 text-[9px] font-medium text-center lg:text-right max-w-sm leading-relaxed">
              Images and designs shown are for reference and concept purposes only. Final output may vary based on client requirements.
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}