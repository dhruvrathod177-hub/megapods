import { Coffee, Building2, DoorOpen, Box, CheckCircle, ArrowRight } from 'lucide-react';

interface SolutionsProps {
  onNavigate: (page: string) => void;
}

export default function Solutions({ onNavigate }: SolutionsProps) {
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
    <div>
      <section className="bg-gradient-to-br from-orange-50 to-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Our <span className="text-orange-600">Container Solutions</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover how our innovative container conversions can transform your business space and elevate your brand
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className={`mb-16 ${index !== solutions.length - 1 ? 'pb-16 border-b border-gray-200' : ''}`}
            >
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="bg-orange-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                    <solution.icon className="text-orange-600" size={32} />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">{solution.title}</h2>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    {solution.description}
                  </p>
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Features:</h3>
                    <ul className="space-y-3">
                      {solution.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle className="text-orange-600 flex-shrink-0 mt-1" size={20} />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Ideal For:</h4>
                    <p className="text-gray-700">{solution.idealFor}</p>
                  </div>
                  <button
                    onClick={() => onNavigate('contact')}
                    className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2"
                  >
                    Request Quote
                    <ArrowRight size={20} />
                  </button>
                </div>
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <img
                    src={
                      index === 0
                        ? '/img/img1.png'
                        : index === 1
                        ? '/img/img6.png'
                        : index === 2
                        ? '/img/img2.png'
                        : '/img/img8.jpg'
                    }
                    alt={solution.title}
                    className="
                    w-full
                    rounded-2xl
                    shadow-2xl
                    border-2 border-transparent
                    transition-all duration-300
                    hover:scale-105
                    hover:border-orange-500"

/>

                  
                  <p className="text-sm text-gray-500 mt-3 italic text-center">
                    *Design concept for illustration purposes. Final design will be customized to your requirements.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              What Makes Our Solutions Special?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-orange-600">100%</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Customizable</h3>
                <p className="text-gray-600">
                  Every project is tailored to your specific needs, brand identity, and budget requirements
                </p>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-orange-600">ISO</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Certified</h3>
                <p className="text-gray-600">
                  We use only premium, certified materials that meet international quality standards
                </p>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-orange-600">24/7</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Support</h3>
                <p className="text-gray-600">
                  Comprehensive after-sales support to ensure your container solution performs perfectly
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-orange-600 to-orange-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl mb-8 text-orange-100">
            Get a free consultation and custom quote for your container solution
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('contact')}
              className="bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Free Consultation
            </button>
            <button
              onClick={() => onNavigate('gallery')}
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-800 transition-colors"
            >
              View Gallery
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
