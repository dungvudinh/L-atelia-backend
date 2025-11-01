export const getQuickSuggestions = (placeholder) => {
    if (placeholder.includes('tính năng') || placeholder.includes('feature')) {
      return [
        '5 Bedrooms',
        '6 Bathrooms', 
        '510m2 Living Space',
        'Swimming Pool',
        'Garden',
        'Garage',
        'Smart Home'
      ];
    }
    
    if (placeholder.includes('thông số') || placeholder.includes('specification')) {
      return [
        'Heated Pool',
        'Solar Panels',
        'Smart Lighting',
        'Security System',
        'Central AC',
        'Hardwood Floors'
      ];
    }
    
    return [
      'Tính năng 1',
      'Tính năng 2',
      'Tính năng 3'
    ];
  };