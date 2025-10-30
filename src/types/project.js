// src/types/project.js
export const projectSections = {
    hero: {
      title: 'Tiêu đề chính',
      description: 'Mô tả ngắn',
      image: ''
    },
    description: {
      content: 'Mô tả chi tiết về dự án...'
    },
    features: {
      title: 'TÍNH NĂNG BẤT ĐỘNG SẢN',
      items: []
    },
    specification: {
      title: 'THÔNG SỐ KỸ THUẬT', 
      items: []
    },
    outdoor: {
      title: 'KHÔNG GIAN NGOÀI TRỜI',
      content: 'Mô tả khu vực ngoài trời...',
      images: []
    },
    gallery: {
      images: []
    },
    pool: {
      title: 'HỒ BƠI',
      content: 'Mô tả hồ bơi...',
      image: ''
    }
  };
  
  export const initialProjectState = {
    id: null,
    title: '',
    slug: '',
    status: 'draft',
    category: 'residential',
    price: '',
    location: '',
    featuredImage: '',
    sections: projectSections
  };