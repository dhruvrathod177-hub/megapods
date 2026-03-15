"use client";

import { FaWhatsapp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function WhatsAppButton() {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Show after 30% scroll
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      const scrollPercent = (scrollTop / docHeight) * 100;

      if (scrollPercent >= 30) {
        setVisible(true);
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    const msg = encodeURIComponent(
      "Hello! I would like to know more about your container solutions."
    );
    window.open(`https://wa.me/919426951908?text=${msg}`, "_blank");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-6 right-6 z-[9999]"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          {/* Tooltip */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                className="
                  absolute right-16 top-1/2 -translate-y-1/2
                  bg-black text-white text-sm px-3 py-1 rounded
                  whitespace-nowrap
                "
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
              >
                Chat on WhatsApp
              </motion.div>
            )}
          </AnimatePresence>

          {/* Button */}
          <motion.button
            onClick={handleClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            aria-label="Chat on WhatsApp"
            className="
              bg-[#E15249] text-white
              p-4 rounded-full shadow-xl
            "
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaWhatsapp size={32} />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}