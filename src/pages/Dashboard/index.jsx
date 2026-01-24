// src/pages/admin/Dashboard.jsx
import { BarChart3, Users, DollarSign, ShoppingCart } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setLoading } from '../../redux/features/loadingSlice';
const Dashboard = () => {
  const dispatch = useDispatch();
  const stats = [
    {
      title: 'Total Revenue',
      value: '$45,231.89',
      change: '+20.1% from last month',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Users',
      value: '12,234',
      change: '+18.1% from last month',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Sales',
      value: '1,234',
      change: '+19% from last month',
      icon: ShoppingCart,
      color: 'bg-purple-500'
    },
    {
      title: 'Pending',
      value: '573',
      change: '+201 since last hour',
      icon: BarChart3,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Generate Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">{stat.change}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
          {/* Add your table or list here */}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h2>
          {/* Add your chart or list here */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;