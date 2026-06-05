import { WishlistItem } from '../models/entity.model';

export const seedDatabase = async (): Promise<void> => {
    try {
        const count = await WishlistItem.countDocuments();
        if (count === 0) {
            console.log('Database is empty. Seeding dummy wishlist items...');
            await WishlistItem.create([
                {
                    name: 'PlayStation 5',
                    description: 'Next-gen gaming console',
                    price: 499.99,
                    priority: 'high',
                    url: 'https://sony.com/ps5'
                },
                {
                    name: 'Book: Clean Code',
                    description: 'A Handbook of Agile Software Craftsmanship by Robert C. Martin',
                    price: 29.99,
                    priority: 'low',
                    url: 'https://amazon.com'
                },
                {
                    name: 'Apple MacBook Pro M3',
                    description: 'High-performance laptop for development',
                    price: 1999.00,
                    priority: 'high',
                    url: 'https://apple.com'
                },
                {
                    name: 'Sony WH-1000XM5 Headphones',
                    description: 'Wireless noise-canceling headphones',
                    price: 349.99,
                    priority: 'medium',
                    url: 'https://sony.com'
                },
                {
                    name: 'Mechanical Keyboard',
                    description: 'Hot-swappable custom mechanical keyboard',
                    price: 89.99,
                    priority: 'medium',
                    url: 'https://keychron.com'
                }
            ]);
            console.log('Database successfully seeded!');
        } else {
            console.log(`Database already has ${count} items. Skipping seeding.`);
        }
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};
