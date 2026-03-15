import { Target, Eye, Lightbulb, Shield, Zap, Heart, ArrowRight } from 'lucide-react';

interface AboutProps {
  onNavigate: (page: string) => void;
}

export default function About({ onNavigate }: AboutProps) {
  const values = [
    {
      icon: Shield,
      title: 'Quality First',
      description: 'We use only premium materials and follow stringent quality standards in every project.',
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Constantly evolving our designs and techniques to deliver cutting-edge solutions.',
    },
    {
      icon: Heart,
      title: 'Customer Focus',
      description: 'Your satisfaction is our priority. We listen, adapt, and deliver exactly what you need.',
    },
    {
      icon: Lightbulb,
      title: 'Sustainability',
      description: 'Eco-friendly container conversions that reduce waste and promote sustainable building.',
    },
  ];

  return (
    <div>
      <section className="bg-gradient-to-br from-orange-50 to-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              About <span className="text-orange-600">Megapodsindia</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We are pioneers in the container conversion industry, bringing innovative modular solutions to businesses across India.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="/img/img7.jpg"
                alt="Megapods India Container Solutions"
                className="
                w-full
                rounded-2xl
                shadow-2xl
                border-2 border-transparent
                transition-all duration-300
                hover:scale-105
                hover:border-orange-500"

                    

              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Transforming Containers into Possibilities
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Megapods India is a leading provider of premium container conversion solutions based in Surat, Gujarat. We specialize in transforming standard shipping containers into functional, aesthetically pleasing spaces that serve diverse business needs.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our expertise spans across container cafes, offices, public toilets, and custom modular structures. Each project is approached with meticulous attention to detail, combining structural integrity with modern design principles.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                As a new company, we bring fresh perspectives and innovative approaches to the container conversion industry. Our team comprises experienced professionals who understand the nuances of modular construction and are committed to delivering excellence in every project.
              </p>
              <button
                onClick={() => onNavigate('solutions')}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2"
              >
                Explore Our Solutions
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Target className="text-orange-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                To revolutionize the way businesses think about space by providing high-quality, cost-effective, and sustainable container solutions that empower entrepreneurs and organizations to achieve their goals. We aim to be the most trusted name in modular construction across India.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Eye className="text-orange-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-gray-600 leading-relaxed">
                To become India's leading provider of innovative container conversion solutions, setting new standards in quality, design, and customer satisfaction. We envision a future where modular construction is the preferred choice for businesses seeking flexibility, sustainability, and excellence.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide every decision we make and every project we deliver
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="bg-orange-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                  <value.icon className="text-orange-600" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Why Container Solutions?
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Cost-Effective</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Container conversions are significantly more affordable than traditional construction, reducing your capital investment while maintaining high quality.
                </p>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Fast Deployment</h3>
                <p className="text-gray-600 leading-relaxed">
                  Pre-fabricated construction means faster turnaround times. Get your business space ready in weeks, not months.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Portable & Scalable</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Container structures can be relocated as your business grows or changes. Scale up by adding more units with ease.
                </p>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Environmentally Friendly</h3>
                <p className="text-gray-600 leading-relaxed">
                  Repurposing shipping containers reduces waste and promotes sustainable building practices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-orange-600 to-orange-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Let's Build Something Amazing Together
          </h2>
          <p className="text-xl mb-8 text-orange-100">
            Partner with Megapods India and bring your vision to life
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
