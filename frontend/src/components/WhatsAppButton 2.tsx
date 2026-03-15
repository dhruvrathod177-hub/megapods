import { FaWhatsapp } from "react-icons/fa";

export default function WhatsAppButton() {
  const handleClick = () => {
    const msg = encodeURIComponent(
      "Hello! I would like to know more about your container solutions."
    );
    window.open(`https://wa.me/919426951908?text=${msg}`, "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] group">
      {/* Tooltip */}
      <div
        className="absolute right-16 top-1/2 -translate-y-1/2
                   bg-black text-white text-sm px-3 py-1 rounded
                   opacity-0 group-hover:opacity-100
                   transition-all duration-300 whitespace-nowrap"
      >
        Chat on WhatsApp
      </div>

      {/* Button */}
      <button
        onClick={handleClick}
        aria-label="WhatsApp"
        className="
          bg-green-500 text-white p-4 rounded-full
          shadow-lg
          transition-all duration-300
          hover:bg-green-600
          hover:scale-110
          hover:shadow-green-500/50
        "
      >
        <FaWhatsapp size={30} />
      </button>
    </div>
  );
}