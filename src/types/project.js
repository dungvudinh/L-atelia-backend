// src/types/project.js
export const initialProjectState = {
  id: null,
  title: 'Patiki Townhouse',
  subtitle: 'Mediterranean Townhouse', 
  status: 'for sale',
  category: 'townhouse',
  price: '',
  location: 'Sóller old town',
  featuredImage: '',
  
  sections: {
    hero: {
      badge: 'for sale',
      title: 'Patiki Townhouse',
      subtitle: 'Mediterranean Townhouse',
      description: 'An architectural gem immaculately restored and modernized from its 1896 creation with no compromise on luxury. The mission in reforming the historic mansion was to create a home with an uncompromised year round living experience, while ensuring the heritage not only lived on but enhanced its lavish style.',
      image: ''
    },
    
    // THÊM SECTION description
    description: {
      title: 'Mô tả chi tiết',
      content: 'Mô tả chi tiết về dự án...'
    },
    
    features: {
      title: 'PROPERTY FEATURES',
      items: [
        '5 Bedrooms | 6 Bathrooms',
        '510m2 Living Space', 
        'Spectacular Architecture'
      ]
    },
    
    specification: {
      title: 'SPECIFICATION',
      items: [
        'Heated Pool',
        'Immaculate Reformation',
        'Roof terrace'
      ]
    },
    
    location_spec: {
      title: 'SPECIFICATION',
      items: [
        'UNESCO world heritage mountain range',
        'Port de Sóller Beach 3km', 
        'In Sóller old town'
      ]
    },
    
    outdoor: {
      title: 'EXPANSIVE OUTDOORS',
      content: 'The imposing building presides over an oasis like garden with a state-of-the-art swimming pool, private dining area, and plentiful sunbathing spaces. The vast roof terrace on the upper level adds a whole new dimension to this one-of-a kind urban home.',
      images: []
    },
    
    pool: {
      title: 'SALT WATER EXCHANGE SWIMMING POOL',
      content: 'RESTORED ORIGINAL WELL',
      image: ''
    },
    
    architecture: {
      title: 'SPECTACULAR ARCHITECTURE',
      content: 'Designed by Parisian architects in the late 19th century this property exudes french charm with an air of grandeur and opulence rarely seen anywhere else on the island.'
    },
    
    history: {
      title: 'THE HISTORY',
      content: 'When scientists discovered the health benefits of vitamin C in the late 18th century Sóller\'s citrus trade boomed and the town saw a massive influx of wealth.',
      readMoreLink: 'READ MORE'
    },
    
    details: {
      title: 'IMMACULATE DETAILS',
      content: 'The extensive reformation saw all the historic sections painstakingly restored to their original glory while adding modern comforts and luxuries throughout.'
    },
    
    progress: {
      title: 'Tiến độ dự án',
      contactText: 'Liên hệ với chúng tôi',
      brochureText: 'Brochure',
      nameField: 'Tên *',
      viewMoreText: 'XEM THÊM'
    },
    
    construction_progress: {
      title: 'Tiến độ thi công', 
      viewMoreText: 'XEM THÊM'
    },
    
    design_images: {
      title: 'Hình ảnh thiết kế',
      viewMoreText: 'XEM THÊM',
      images: []
    },
    
    gallery: {
      images: []
    }
  }
};