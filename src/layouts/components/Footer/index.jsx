// src/components/admin/Footer.jsx
const Footer = () => {
    return (
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              © 2024 Admin Panel. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    );
  };
  
  export default Footer;