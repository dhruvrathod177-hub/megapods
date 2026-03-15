import { AlertCircle } from 'lucide-react';

interface GalleryProps {
  onNavigate: (page: string) => void;
}

export default function Gallery({ onNavigate }: GalleryProps) {
  const galleryImages = [
    {
      src: '/img/img3.png',
      title: 'Modern Container Cafe Concept',
      category: 'Container Cafes',
    },
    {
      src: '/img/img9.PNG',
      title: 'Professional Office Space',
      category: 'Container Offices',
    },
    {
      src: '/img/img5.png',
      title: 'Public Toilet Facility',
      category: 'Public Toilets',
    },
    {
      src: '/img/img10.PNG',
      title: 'Custom Container Solution',
      category: 'Custom Solutions',
    },
  ];

  return (
    <div>
      <section className="bg-gradient-to-br from-orange-50 to-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Design <span className="text-orange-600">Gallery</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explore our concept designs and get inspired for your next container project
            </p>
          </div>
          <div className="bg-orange-50 border-l-4 border-orange-600 rounded-lg p-6 max-w-4xl mx-auto">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-orange-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Concept Designs Disclaimer</h3>
                <p className="text-gray-700 leading-relaxed">
                  The images and designs shown in this gallery are concept references and for illustration purposes only.
                  Final designs, materials, finishes, and specifications will be fully customized based on your specific
                  requirements, budget, and preferences. We work closely with each client to create unique solutions
                  tailored to their vision.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 gap-8">
            {galleryImages.map((image, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-shadow">
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-full h-80 object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <span className="inline-block bg-orange-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-2">
                        {image.category}
                      </span>
                      <h3 className="text-white text-xl font-bold">{image.title}</h3>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-orange-600 font-semibold">{image.category}</span>
                  <h3 className="text-lg font-bold text-gray-900 mt-1">{image.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 italic">
                    *Concept design - Fully customizable to your requirements
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Your Design, Your Vision
            </h2>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Customization Options</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• External color schemes and branding</li>
                  <li>• Interior layouts and finishes</li>
                  <li>• Lighting and electrical configurations</li>
                  <li>• Furniture and fixture selection</li>
                  <li>• HVAC and climate control systems</li>
                  <li>• Security and access control features</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Design Process</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Initial consultation to understand your needs</li>
                  <li>• 3D design mockups for visualization</li>
                  <li>• Multiple revision rounds included</li>
                  <li>• Material and finish selection guidance</li>
                  <li>• Budget-conscious recommendations</li>
                  <li>• Final approval before manufacturing</li>
                </ul>
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg text-gray-600 mb-6">
                Ready to see your custom design come to life?
              </p>
              <button
                onClick={() => onNavigate('contact')}
                className="bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
              >
                Start Your Project
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Can We Build For You?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From compact cafes to expansive office spaces, we bring your vision to reality
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 text-center">
              <h3 className="text-2xl font-bold text-orange-600 mb-2">20ft</h3>
              <p className="text-gray-700">Standard Container</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 text-center">
              <h3 className="text-2xl font-bold text-orange-600 mb-2">40ft</h3>
              <p className="text-gray-700">Extended Container</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 text-center">
              <h3 className="text-2xl font-bold text-orange-600 mb-2">Multi</h3>
              <p className="text-gray-700">Combined Units</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 text-center">
              <h3 className="text-2xl font-bold text-orange-600 mb-2">Custom</h3>
              <p className="text-gray-700">Any Size/Shape</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-orange-600 to-orange-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Let's Design Your Perfect Container Solution
          </h2>
          <p className="text-xl mb-8 text-orange-100">
            Schedule a free consultation to discuss your ideas and get a custom design proposal
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('contact')}
              className="bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Free Consultation
            </button>
            <button
              onClick={() => onNavigate('solutions')}
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-800 transition-colors"
            >
              View Solutions
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
