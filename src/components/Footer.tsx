import React from "react";

const Footer: React.FC = () => {
  return (
     <footer className="fixed bottom-0 left-0 z-20 w-full p-4 bg-black border-t border-gray-600 shadow-sm md:flex md:items-center md:justify-between md:p-6">
            <span className="text-sm text-gray-400 sm:text-center">
                © 2025 Resepverse™. All Rights Reserved.
            </span>
            <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-400 sm:mt-0">
                <li>
                    <a href="#about-us" className="hover:underline me-4 md:me-6">
                        About
                    </a>
                </li>
                <li>
                    <a href="#privacy-policy" className="hover:underline me-4 md:me-6">
                        Privacy Policy
                    </a>
                </li>
                <li>
                    <a href="#licensing" className="hover:underline me-4 md:me-6">
                        Licensing
                    </a>
                </li>
                <li>
                    <a href="#contact" className="hover:underline me-4 md:me-6">
                        Contact
                    </a>
                </li>
                <li>
                    <a href="#products" className="hover:underline me-4 md:me-6">
                        Product
                    </a>
                </li>
            </ul>
        </footer>
  );
};

export default Footer;
