import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, ChevronDown, ChevronUp } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  });

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
    <div>
      <section className="bg-gradient-to-br from-orange-50 to-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Get in <span className="text-orange-600">Touch</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Ready to transform your business with innovative container solutions? Contact us for a free consultation
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
              <p className="text-gray-600 mb-8">
                Fill out the form below and we'll get back to you within 24 hours with a detailed response.
              </p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div>
                  <label htmlFor="service" className="block text-sm font-semibold text-gray-700 mb-2">
                    Service Interested In *
                  </label>
                  <select
                    id="service"
                    required
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select a service</option>
                    <option value="Container Cafe">Container Cafe</option>
                    <option value="Container Office">Container Office</option>
                    <option value="Public Toilet">Public Toilet</option>
                    <option value="Custom Solution">Custom Solution</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Project Details *
                  </label>
                  <textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Tell us about your project requirements, timeline, and budget..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-orange-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  Send Message via WhatsApp
                </button>
                <p className="text-sm text-gray-500 text-center">
                  By submitting this form, you agree to be contacted by Megapodsindia regarding your inquiry.
                </p>
              </form>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4 bg-gray-50 p-6 rounded-lg">
                  <Phone className="text-orange-600 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Phone Numbers</h3>
                    <a href="tel:+9187581 76693" className="text-gray-600 hover:text-orange-600 transition-colors block">
                      +91 87581 76693
                    </a>
                    <a href="tel:+919265380907" className="text-gray-600 hover:text-orange-600 transition-colors block">
                      +91 92653 90907
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-gray-50 p-6 rounded-lg">
                  <Mail className="text-orange-600 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                    <a
                      href="mailto:megapodsindia@gmail.com"
                      className="text-gray-600 hover:text-orange-600 transition-colors"
                    >
                      megapodsindia@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-gray-50 p-6 rounded-lg">
                  <MapPin className="text-orange-600 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                    <p className="text-gray-600">Surat, Gujarat, India</p>
                    <a
                      href="https://share.google/nx4gFYYdioqxu0HND"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:text-orange-700 transition-colors text-sm mt-2 inline-block"
                    >
                      View on Google Maps →
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-gray-50 p-6 rounded-lg">
                  <Clock className="text-orange-600 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Business Hours</h3>
                    <p className="text-gray-600">Monday - Saturday: 9:00 AM - 7:00 PM</p>
                    <p className="text-gray-600">Sunday: By Appointment</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-5 border rounded-xl bg-orange-50">
  <h3 className="text-lg font-semibold text-gray-900 mb-1">
    Download Our Catalog
  </h3>

  <p className="text-sm text-gray-600 mb-4">
    Click below to download our complete container solutions catalog.
  </p>

  <a
    href="Megapodsindia.pdf.pdf"
    download
    target="_blank"
    rel="noopener noreferrer"
    className="
      inline-flex items-center gap-2
      bg-orange-600 hover:bg-orange-700
      text-white px-6 py-2 rounded-full
      font-medium transition-all
    "
  >
    📥 Download Catalog
  </a>
</div>
             
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Find answers to common questions about our container solutions
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="text-orange-600 flex-shrink-0" size={24} />
                  ) : (
                    <ChevronDown className="text-gray-400 flex-shrink-0" size={24} />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <a
              href="https://wa.me/918758176693?text=Hello!%20I%20have%20a%20question%20about%20your%20container%20solutions."
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 font-semibold hover:text-orange-700 transition-colors"
            >
              Contact us directly →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
