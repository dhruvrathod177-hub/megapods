import { Phone, Mail, MapPin, Instagram, Facebook, Globe } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/img/logo1.JPG"
                alt="Megapodsindia"
                className="h-12 w-12 rounded-full object-contain"
              />
              <div>
                <h3 className="text-xl font-bold">Megapodsindia</h3>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Leading provider of premium container conversion and modular solutions in India.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('home')} className="text-gray-400 hover:text-orange-500 transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="text-gray-400 hover:text-orange-500 transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('solutions')} className="text-gray-400 hover:text-orange-500 transition-colors">
                  Solutions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('gallery')} className="text-gray-400 hover:text-orange-500 transition-colors">
                  Gallery
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="text-gray-400 hover:text-orange-500 transition-colors">
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Phone size={18} className="text-orange-500 mt-1 flex-shrink-0" />
                <div>
                  <a href="tel:+9187581766937" className="text-gray-400 hover:text-orange-500 transition-colors block">
                    +91 8758176693
                  </a>
                  <a href="tel:+919265380907" className="text-gray-400 hover:text-orange-500 transition-colors block">
                    +91 9265380907
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={18} className="text-orange-500 mt-1 flex-shrink-0" />
                <a href="mailto:megapodsindia@gmail.com" className="text-gray-400 hover:text-orange-500 transition-colors break-all">
                  megapodsindia@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={18} className="text-orange-500 mt-1 flex-shrink-0" />
                <span className="text-gray-400">Surat, Gujarat, India</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4 mb-6">
              <a
                href="https://www.instagram.com/megapodsindia"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-3 rounded-lg hover:bg-orange-600 transition-colors"
                aria-label="Open website in new tab"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.facebook.com/share/1HHNbTTaTn/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-3 rounded-lg hover:bg-orange-600 transition-colors"
                aria-label="Open website in new tab"
              >
                <Facebook size={20} />
              </a>
              <a
  href="https://share.google/Y0sBn8WEMHjAFcjl7"
  target="_blank"
  rel="noopener noreferrer"
  className="bg-gray-800 p-3 rounded-lg hover:bg-orange-600 transition-colors"
  aria-label="Open website in new tab"
>
  <Globe size={20} />
</a>
            </div>
            <button
              onClick={() => onNavigate('contact')}
              className="bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-orange-700 transition-colors w-full"
            >
              Get Free Consultation
            </button>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © 2025 megapodsindia. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs text-center md:text-right max-w-1xl">
              Images and designs shown are for reference and concept purposes only. Final output may vary based on client requirements.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
