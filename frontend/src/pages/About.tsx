import { Target, Eye, Lightbulb, Shield, Zap, Heart, ArrowRight } from 'lucide-react';
import { useRef } from 'react';

type HTMLTag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';

interface Heading3DProps {
  children: React.ReactNode;
  className?: string;
  tag?: HTMLTag;
}

function Heading3D({ children, className = '', tag: Tag = 'h2' }: Heading3DProps) {
  const ref = useRef<HTMLElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -10;
    const rotateY = ((x - cx) / cx) * 14;
    el.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
    el.style.textShadow = `${-rotateY * 0.6}px ${rotateX * 0.6}px 18px rgba(234,88,12,0.22), 0 2px 32px rgba(0,0,0,0.10)`;
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
    el.style.textShadow = 'none';
  };

  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className={`heading-3d ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </Tag>
  );
}

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

  const hover3D =
    "transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:drop-shadow-[0_8px_8px_rgba(0,0,0,0.25)]";

  return (
    <div>

      {/* HERO */}

      <section className="bg-gradient-to-br from-orange-50 to-white py-16 lg:py-24">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-12">

            <Heading3D tag="h1" className={`text-4xl sm:text-5xl font-bold text-gray-900 mb-6 ${hover3D}`}>
              About <span className="text-orange-600">Megapodsindia</span>
            </Heading3D>

            <Heading3D tag="p" className={`text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed ${hover3D}`}>
              We are pioneers in the container conversion industry, bringing innovative modular solutions to businesses across India.
            </Heading3D>

          </div>

        </div>

      </section>


      {/* ABOUT IMAGE */}

      <section className="py-16 bg-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid lg:grid-cols-2 gap-12 items-center">

            <div>

              <img
                src="/img/img7.jpg"
                alt="Megapods India Container Solutions"
                className="w-full rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:border-orange-500 border-2 border-transparent"
              />

            </div>

            <div>

              <Heading3D tag="h2" className={`text-3xl font-bold text-gray-900 mb-6 ${hover3D}`}>
                Transforming Containers into Possibilities
              </Heading3D>

              <Heading3D tag="p" className={`text-gray-600 leading-relaxed mb-4 ${hover3D}`}>
                Megapods India is a leading provider of premium container conversion solutions based in Surat, Gujarat.
              </Heading3D>

              <Heading3D tag="p" className={`text-gray-600 leading-relaxed mb-4 ${hover3D}`}>
                Our expertise spans across container cafes, offices, public toilets, and custom modular structures.
              </Heading3D>

              <Heading3D tag="p" className={`text-gray-600 leading-relaxed mb-6 ${hover3D}`}>
                Our team comprises experienced professionals who understand the nuances of modular construction.
              </Heading3D>

              <button
                onClick={() => onNavigate('solutions')}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition flex items-center gap-2"
              >
                Explore Our Solutions
                <ArrowRight size={20} />
              </button>

            </div>

          </div>

        </div>

      </section>


      {/* MISSION & VISION */}

      <section className="py-16 bg-gray-50">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid lg:grid-cols-2 gap-12">

            <div className="bg-white rounded-2xl p-8 shadow-lg">

              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Target className="text-orange-600" size={32} />
              </div>

              <Heading3D tag="h2" className={`text-2xl font-bold text-gray-900 mb-4 ${hover3D}`}>
                Our Mission
              </Heading3D>

              <Heading3D tag="p" className={`text-gray-600 leading-relaxed ${hover3D}`}>
                To revolutionize the way businesses think about space by providing high-quality container solutions.
              </Heading3D>

            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">

              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Eye className="text-orange-600" size={32} />
              </div>

              <Heading3D tag="h2" className={`text-2xl font-bold text-gray-900 mb-4 ${hover3D}`}>
                Our Vision
              </Heading3D>

              <Heading3D tag="p" className={`text-gray-600 leading-relaxed ${hover3D}`}>
                To become India's leading provider of innovative container conversion solutions.
              </Heading3D>

            </div>

          </div>

        </div>

      </section>


      {/* VALUES */}

      <section className="py-16 bg-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-12">

            <Heading3D tag="h2" className={`text-3xl sm:text-4xl font-bold text-gray-900 mb-4 ${hover3D}`}>
              Our Core Values
            </Heading3D>

            <Heading3D tag="p" className={`text-lg text-gray-600 max-w-2xl mx-auto ${hover3D}`}>
              The principles that guide every decision we make
            </Heading3D>

          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">

            {values.map((value, index) => (

              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-xl transition">

                <div className="bg-orange-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                  <value.icon className="text-orange-600" size={28} />
                </div>

                <Heading3D tag="h3" className={`text-xl font-bold text-gray-900 mb-3 ${hover3D}`}>
                  {value.title}
                </Heading3D>

                <Heading3D tag="p" className={`text-gray-600 leading-relaxed ${hover3D}`}>
                  {value.description}
                </Heading3D>

              </div>

            ))}

          </div>

        </div>

      </section>

    </div>
  );
}