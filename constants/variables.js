const COLLECTIONS = {
    user: 'users',
    chat: 'chatbot_conversation',
    restaurants: 'admin_users',
    market_request: 'market_request',
    ingredients: 'inventory',
    ingredients_history: 'ingredients_history',
    sale_items: 'sale_items',
    menu: 'menu_dish',
    wishlist: 'wishlist',
    recommendation: 'recommendations',
    notification: 'notifications'
}

const ROLES = {
    customer: 'customer',
    staff: 'staff'
}

const CATEGORIES = [
    'Meat',
    'Seafood',
    'Fruits',
    'Vegetable',
    'Dairy and Alternative',
    'Grains and Cereals',
    'Herbs and Spices',
    'Nuts and Seeds',
    'Condiments and Sauces',
    'Beverages',
    'Sweeteners'
]

const MENU_CATEGORIES = [
    'Main Dish',
    'Appetizer',
    'Breakfast Food',
    'Dessert',
    'Restaurant Specials',
    'Kiddy Meals',
    'Drinks and Beverages',
    'Salads'
]

const INGREDIENT_CLASSIFICATIONS = [
    {
        name: 'Main Ingredient',
        required: true
    },
    {
        name: 'Base Ingredient',
        required: true
    },
    {
        name: 'Secondary Ingredient',
        required: false
    },
    {
        name: 'Seasonings',
        required: false
    },
    {
        name: 'Accompaniments',
        required: false
    },
    {
        name: 'Binding Agents',
        required: false
    },
    {
        name: 'Aromatics',
        required: false
    },
    {
        name: 'Fats',
        required: false
    }
]

const SPOONACULAR_API_KEY = '90b1f90baf2342999d50c25df448d02f';
const GOOGLE_MAP_API_KEY = 'AIzaSyBINKACTJD2RU_j309GL6J2a6RLjs97flw';
const GOOGLE_MAP_CONFIG = {
    allow: false,
    default: {
        latitude: 10.338579882805925,
        longitude: 123.91177132549021
    }
}

export { COLLECTIONS, ROLES, CATEGORIES, MENU_CATEGORIES, INGREDIENT_CLASSIFICATIONS, GOOGLE_MAP_API_KEY, GOOGLE_MAP_CONFIG, SPOONACULAR_API_KEY };