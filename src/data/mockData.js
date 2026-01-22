const mockData = {
  categories: [
    { id: 1, name: 'Salads', display_order: 1 },
    { id: 2, name: 'Soups', display_order: 2 },
    { id: 3, name: 'Hot Dishes', display_order: 3 },
    { id: 4, name: 'Desserts', display_order: 4 },
    { id: 5, name: 'Beverages', display_order: 5 },
    { id: 6, name: 'Appetizers', display_order: 6 },
  ],
  dishes: [
    // Salads
    {
      id: 1,
      category_id: 1,
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with caesar dressing, croutons, and parmesan cheese',
      price: 2500,
      weight: 250,
      image_url: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=400&fit=crop'
    },
    {
      id: 2,
      category_id: 1,
      name: 'Greek Salad',
      description: 'Tomatoes, cucumbers, olives, feta cheese with olive oil dressing',
      price: 2200,
      weight: 300,
      image_url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=400&fit=crop'
    },
    {
      id: 3,
      category_id: 1,
      name: 'Caprese Salad',
      description: 'Fresh mozzarella, tomatoes, basil with balsamic glaze',
      price: 2800,
      weight: 200,
      image_url: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=400&h=400&fit=crop'
    },
    
    // Soups
    {
      id: 4,
      category_id: 2,
      name: 'Tomato Soup',
      description: 'Creamy tomato soup with fresh basil and garlic bread',
      price: 1800,
      weight: 350,
      image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=400&fit=crop'
    },
    {
      id: 5,
      category_id: 2,
      name: 'Mushroom Cream Soup',
      description: 'Rich and creamy soup with forest mushrooms',
      price: 2100,
      weight: 350,
      image_url: 'https://images.unsplash.com/photo-1562113530-57ba467cea38?w=400&h=400&fit=crop'
    },
    {
      id: 6,
      category_id: 2,
      name: 'Chicken Noodle Soup',
      description: 'Traditional chicken soup with vegetables and noodles',
      price: 1900,
      weight: 400,
      image_url: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=400&h=400&fit=crop'
    },
    
    // Hot Dishes
    {
      id: 7,
      category_id: 3,
      name: 'Grilled Salmon',
      description: 'Atlantic salmon with lemon butter sauce and vegetables',
      price: 5500,
      weight: 300,
      image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=400&fit=crop'
    },
    {
      id: 8,
      category_id: 3,
      name: 'Beef Steak',
      description: 'Tender beef steak with mushroom sauce and mashed potatoes',
      price: 6200,
      weight: 350,
      image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop'
    },
    {
      id: 9,
      category_id: 3,
      name: 'Chicken Breast',
      description: 'Grilled chicken breast with herbs and roasted vegetables',
      price: 3800,
      weight: 320,
      image_url: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=400&fit=crop'
    },
    
    // Desserts
    {
      id: 10,
      category_id: 4,
      name: 'Chocolate Cake',
      description: 'Rich chocolate cake with dark chocolate ganache',
      price: 1800,
      weight: 150,
      image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop'
    },
    {
      id: 11,
      category_id: 4,
      name: 'Tiramisu',
      description: 'Classic Italian dessert with coffee and mascarpone',
      price: 2200,
      weight: 180,
      image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=400&fit=crop'
    },
    {
      id: 12,
      category_id: 4,
      name: 'Cheesecake',
      description: 'New York style cheesecake with berry sauce',
      price: 2000,
      weight: 170,
      image_url: 'https://images.unsplash.com/photo-1533134242066-d0f3b594c527?w=400&h=400&fit=crop'
    },
    
    // Beverages
    {
      id: 13,
      category_id: 5,
      name: 'Cappuccino',
      description: 'Classic Italian coffee with steamed milk foam',
      price: 1200,
      weight: 200,
      image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop'
    },
    {
      id: 14,
      category_id: 5,
      name: 'Fresh Orange Juice',
      description: 'Freshly squeezed orange juice',
      price: 1500,
      weight: 300,
      image_url: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop'
    },
    {
      id: 15,
      category_id: 5,
      name: 'Green Tea',
      description: 'Premium green tea with jasmine',
      price: 800,
      weight: 250,
      image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop'
    },
    
    // Appetizers
    {
      id: 16,
      category_id: 6,
      name: 'Bruschetta',
      description: 'Toasted bread with tomatoes, garlic, and basil',
      price: 1600,
      weight: 180,
      image_url: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=400&fit=crop'
    },
    {
      id: 17,
      category_id: 6,
      name: 'Spring Rolls',
      description: 'Crispy vegetable spring rolls with sweet chili sauce',
      price: 1400,
      weight: 150,
      image_url: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=400&h=400&fit=crop'
    },
    {
      id: 18,
      category_id: 6,
      name: 'Cheese Platter',
      description: 'Selection of fine cheeses with crackers and grapes',
      price: 3200,
      weight: 250,
      image_url: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400&h=400&fit=crop'
    },
    
    // Pasta
    {
      id: 19,
      category_id: 7,
      name: 'Spaghetti Carbonara',
      description: 'Classic Italian pasta with bacon, egg, and parmesan',
      price: 2800,
      weight: 350,
      image_url: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=400&fit=crop'
    },
    {
      id: 20,
      category_id: 7,
      name: 'Penne Arrabbiata',
      description: 'Penne pasta with spicy tomato sauce',
      price: 2400,
      weight: 320,
      image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop'
    },
    {
      id: 21,
      category_id: 7,
      name: 'Fettuccine Alfredo',
      description: 'Creamy pasta with parmesan and butter sauce',
      price: 2600,
      weight: 330,
      image_url: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=400&h=400&fit=crop'
    }
  ]
};

export default mockData;
