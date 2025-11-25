/**
 * Footer Component
 *
 * Simple footer with copyright and optional links
 */

import { APP_NAME, APP_VERSION } from '@config/constants';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-gray-600">
            &copy; {currentYear} {APP_NAME}. All rights reserved.
          </p>

          {/* Version */}
          <p className="text-xs text-gray-500">
            Version {APP_VERSION}
          </p>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              Help
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
