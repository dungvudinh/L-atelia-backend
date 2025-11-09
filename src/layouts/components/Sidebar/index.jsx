// src/components/admin/Sidebar.jsx
import { 
  Home, 
  Users, 
  Settings, 
  BarChart3, 
  Package, 
  ShoppingCart,
  FolderOpen,
  Plus,
  List,
  BookImage, 
  Warehouse,
  Calendar
} from 'lucide-react';
import logo from '../../../assets/images/logo.png';
const Sidebar = ({ isOpen, setIsOpen }) => {
  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/' },
    { 
      icon: FolderOpen, 
      label: 'Dự án', 
      href: '/projects',
      children: [
        { icon: List, label: 'Tất cả dự án', href: '/projects' },
        { icon: Plus, label: 'Thêm dự án', href: '/projects/create' },
      ]
    },
    { icon:BookImage, label:'Media', href:'/media'}, 
    {icon:Warehouse, label:'Dự án cho thuê',href:'/rent'}, 
    { icon: Users, label: 'Users', href: '/users' },
    {icon:Calendar, label:'Bookings', href:'/bookings'}, 
    { icon: ShoppingCart, label: 'Orders', href: '/orders' },
    { icon: Package, label: 'Products', href: '/products' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0
    `}>
      <div className="flex items-center justify-start h-16 px-4 bg-gray-900">
        <h1 className="text-xl  flex items-center font-subtitle text-[30px] text-bg-primary">
          <img src={logo} alt="" className='w-[60px]' />
          L'atelia
        </h1>
      </div>

      <nav className="mt-8">
        {menuItems.map((item, index) => (
          <div key={index}>
            <a
              href={item.href}
              className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${
                window.location.pathname === item.href ? 'bg-gray-700 text-white' : ''
              }`}
            >
              <item.icon size={20} className="mr-3" />
              {item.label}
            </a>
            
            {/* Submenu for Projects */}
            {item.children && window.location.pathname.includes('/admin/projects') && (
              <div className="ml-8 mt-1 space-y-1">
                {item.children.map((child, childIndex) => (
                  <a
                    key={childIndex}
                    href={child.href}
                    className={`flex items-center px-4 py-2 text-sm text-gray-400 hover:bg-gray-700 hover:text-white rounded transition-colors ${
                      window.location.pathname === child.href ? 'bg-gray-700 text-white' : ''
                    }`}
                  >
                    <child.icon size={16} className="mr-2" />
                    {child.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;