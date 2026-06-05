import request from 'supertest';
import app from '../src/app';
import { entityStorage } from '../src/storage/entity';
import { WishlistItem } from '../src/models/entity.model';
import { connect, closeDatabase, clearDatabase } from './setup';
import { errorHandler } from '../src/middleware';

beforeAll(async () => {
    await connect();
});

afterAll(async () => {
    await closeDatabase();
});

afterEach(async () => {
    await clearDatabase();
});

describe('Wishlist API Integration Tests', () => {

    const validItem = {
        name: 'PlayStation 5',
        description: 'Next-gen gaming console',
        price: 499.99,
        priority: 'high' as const,
        url: 'https://sony.com/ps5'
    };

    it('GET /entities should return an empty array initially', async () => {
        const res = await request(app).get('/entities');
        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
        expect(res.body.pagination).toBeDefined();
        expect(res.body.pagination.total).toBe(0);
    });

    it('GET /entities/:id should return 400 for invalid ID format', async () => {
        const res = await request(app).get('/entities/non-existent-uuid');
        expect(res.status).toBe(400);
    });

    it('GET /entities/:id should return 404 for valid format but non-existent ID', async () => {
        const res = await request(app).get('/entities/507f1f77bcf86cd799439011');
        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: 'Item not found' });
    });

    it('POST /entities should create a wishlist item and return 201', async () => {
        const res = await request(app).post('/entities').send(validItem);
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('createdAt');
        expect(res.body).toHaveProperty('updatedAt');
        expect(res.body.name).toBe(validItem.name);
        expect(res.body.description).toBe(validItem.description);
        expect(res.body.price).toBe(validItem.price);
        expect(res.body.priority).toBe(validItem.priority);
        expect(res.body.url).toBe(validItem.url);
    });

    it('POST /entities should return 400 if name is empty', async () => {
        const res = await request(app).post('/entities').send({ ...validItem, name: '' });
        expect(res.status).toBe(400);
        expect(res.body.status).toBe('error');
        expect(res.body.message).toBe('Validation error');
    });

    it('POST /entities should return 400 if name exceeds 100 characters', async () => {
        const longName = 'a'.repeat(101);
        const res = await request(app).post('/entities').send({ ...validItem, name: longName });
        expect(res.status).toBe(400);
        expect(res.body.status).toBe('error');
    });

    it('POST /entities should return 400 if description exceeds 500 characters', async () => {
        const longDesc = 'a'.repeat(501);
        const res = await request(app).post('/entities').send({ ...validItem, description: longDesc });
        expect(res.status).toBe(400);
    });

    it('POST /entities should return 400 if price is negative', async () => {
        const res = await request(app).post('/entities').send({ ...validItem, price: -10 });
        expect(res.status).toBe(400);
    });

    it('POST /entities should return 400 if priority is invalid', async () => {
        const res = await request(app).post('/entities').send({ ...validItem, priority: 'critical' });
        expect(res.status).toBe(400);
    });

    it('POST /entities should return 400 if url is invalid URL format', async () => {
        const res = await request(app).post('/entities').send({ ...validItem, url: 'not-a-valid-url' });
        expect(res.status).toBe(400);
    });

    it('GET /entities/:id should return the item if it exists', async () => {
        const created = await entityStorage.create(validItem);
        const res = await request(app).get(`/entities/${created.id}`);
        expect(res.status).toBe(200);
        expect(res.body.id).toBe(created.id);
        expect(res.body.name).toBe(validItem.name);
    });

    it('PUT /entities/:id should update wishlist item and return 200', async () => {
        const created = await entityStorage.create(validItem);
        const updateData = { name: 'PlayStation 5 Slim', price: 449.99 };
        const res = await request(app).put(`/entities/${created.id}`).send(updateData);
        expect(res.status).toBe(200);
        expect(res.body.id).toBe(created.id);
        expect(res.body.name).toBe(updateData.name);
        expect(res.body.price).toBe(updateData.price);
        expect(res.body.priority).toBe(validItem.priority);
    });

    it('PUT /entities/:id should return 400 if updating invalid ID format', async () => {
        const res = await request(app).put('/entities/non-existent-uuid').send({ name: 'New Name' });
        expect(res.status).toBe(400);
    });

    it('PUT /entities/:id should return 404 if updating valid format but non-existent ID', async () => {
        const res = await request(app).put('/entities/507f1f77bcf86cd799439011').send({ name: 'New Name' });
        expect(res.status).toBe(404);
    });

    it('DELETE /entities/:id should delete item and return 204', async () => {
        const created = await entityStorage.create(validItem);
        const delRes = await request(app).delete(`/entities/${created.id}`);
        expect(delRes.status).toBe(204);

        const getRes = await request(app).get(`/entities/${created.id}`);
        expect(getRes.status).toBe(404);
    });

    it('DELETE /entities/:id should return 400 if deleting invalid ID format', async () => {
        const res = await request(app).delete('/entities/non-existent-uuid');
        expect(res.status).toBe(400);
    });

    it('DELETE /entities/:id should return 404 if deleting valid format but non-existent ID', async () => {
        const res = await request(app).delete('/entities/507f1f77bcf86cd799439011');
        expect(res.status).toBe(404);
    });

    it('GET /entities?priority=high should return only high-priority items', async () => {
        await entityStorage.create({ ...validItem, name: 'Item 1', priority: 'high' });
        await entityStorage.create({ ...validItem, name: 'Item 2', priority: 'low' });
        await entityStorage.create({ ...validItem, name: 'Item 3', priority: 'high' });

        const res = await request(app).get('/entities?priority=high');
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(2);
        expect(res.body.data.every((item: any) => item.priority === 'high')).toBe(true);
    });

    it('GET /entities?maxPrice=100 should return only items with price <= 100', async () => {
        await entityStorage.create({ ...validItem, name: 'Cheap 1', price: 50 });
        await entityStorage.create({ ...validItem, name: 'Expensive', price: 150 });
        await entityStorage.create({ ...validItem, name: 'Cheap 2', price: 100 });

        const res = await request(app).get('/entities?maxPrice=100');
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(2);
        expect(res.body.data.every((item: any) => item.price <= 100)).toBe(true);
    });

    it('GET /entities?name=Play should return only items with matching names (case-insensitive)', async () => {
        await entityStorage.create({ ...validItem, name: 'PlayStation 5' });
        await entityStorage.create({ ...validItem, name: 'Xbox Series X' });
        await entityStorage.create({ ...validItem, name: 'Nintendo Switch' });

        const res = await request(app).get('/entities?name=play');
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].name).toBe('PlayStation 5');
    });

    it('GET /entities with multiple filters should return only matching items', async () => {
        await entityStorage.create({ ...validItem, name: 'Low Cheap', priority: 'low', price: 50 });
        await entityStorage.create({ ...validItem, name: 'Low Expensive', priority: 'low', price: 150 });
        await entityStorage.create({ ...validItem, name: 'High Cheap', priority: 'high', price: 50 });

        const res = await request(app).get('/entities?priority=low&maxPrice=100');
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].name).toBe('Low Cheap');
    });

    it('GET /entities pagination should return paginated list of items', async () => {
        for (let i = 1; i <= 15; i++) {
            await entityStorage.create({ ...validItem, name: `Item ${i}`, price: i * 10 });
        }

        const res = await request(app).get('/entities?page=2&limit=5');
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(5);
        expect(res.body.pagination.page).toBe(2);
        expect(res.body.pagination.limit).toBe(5);
        expect(res.body.pagination.total).toBe(15);
        expect(res.body.pagination.pages).toBe(3);
    });

    it('GET /entities sort should return sorted list of items', async () => {
        await entityStorage.create({ ...validItem, name: 'Item A', price: 300 });
        await entityStorage.create({ ...validItem, name: 'Item B', price: 100 });
        await entityStorage.create({ ...validItem, name: 'Item C', price: 200 });

        // Sort ascending by price
        const resAsc = await request(app).get('/entities?sort=price');
        expect(resAsc.status).toBe(200);
        expect(resAsc.body.data[0].price).toBe(100);
        expect(resAsc.body.data[1].price).toBe(200);
        expect(resAsc.body.data[2].price).toBe(300);

        // Sort descending by price
        const resDesc = await request(app).get('/entities?sort=-price');
        expect(resDesc.status).toBe(200);
        expect(resDesc.body.data[0].price).toBe(300);
        expect(resDesc.body.data[1].price).toBe(200);
        expect(resDesc.body.data[2].price).toBe(100);
    });

    it('GET /entities/expensive should return items with price > 100', async () => {
        await entityStorage.create({ ...validItem, name: 'Cheap', price: 50 });
        await entityStorage.create({ ...validItem, name: 'Threshold', price: 100 });
        await entityStorage.create({ ...validItem, name: 'Expensive 1', price: 150 });
        await entityStorage.create({ ...validItem, name: 'Expensive 2', price: 300 });

        const res = await request(app).get('/entities/expensive');
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body.some((item: any) => item.name === 'Expensive 1')).toBe(true);
        expect(res.body.some((item: any) => item.name === 'Expensive 2')).toBe(true);
    });
});

describe('WishlistItem Model Unit Tests', () => {
    const validData = {
        name: 'Nintendo Switch',
        description: 'Hybrid console',
        price: 299.99,
        priority: 'medium' as const,
        url: 'https://nintendo.com/switch'
    };

    it('should create a valid model with all fields', async () => {
        const item = new WishlistItem(validData);
        await item.validate();
        expect(item.name).toBe(validData.name);
        expect(item.description).toBe(validData.description);
        expect(item.price).toBe(validData.price);
        expect(item.priority).toBe(validData.priority);
        expect(item.url).toBe(validData.url);
    });

    it('should set default priority to medium if not provided', async () => {
        const item = new WishlistItem({
            name: 'Book',
            price: 15.99
        });
        expect(item.priority).toBe('medium');
    });

    it('should fail validation if name is empty', async () => {
        const item = new WishlistItem({ ...validData, name: '' });
        await expect(item.validate()).rejects.toThrow();
    });

    it('should fail validation if name is longer than 100 characters', async () => {
        const item = new WishlistItem({ ...validData, name: 'a'.repeat(101) });
        await expect(item.validate()).rejects.toThrow();
    });

    it('should fail validation if description is longer than 500 characters', async () => {
        const item = new WishlistItem({ ...validData, description: 'a'.repeat(501) });
        await expect(item.validate()).rejects.toThrow();
    });

    it('should fail validation if price is less than 0.01', async () => {
        const item = new WishlistItem({ ...validData, price: 0 });
        await expect(item.validate()).rejects.toThrow();
    });

    it('should fail validation if priority is invalid', async () => {
        const item = new WishlistItem({ ...validData, priority: 'critical' as any });
        await expect(item.validate()).rejects.toThrow();
    });

    it('should fail validation if URL format is invalid', async () => {
        const item = new WishlistItem({ ...validData, url: 'invalid-url' });
        await expect(item.validate()).rejects.toThrow();
    });

    it('should successfully validate empty URL (optional field)', async () => {
        const item = new WishlistItem({
            name: 'Self-improvement book',
            price: 19.99
        });
        await expect(item.validate()).resolves.not.toThrow();
    });

    it('should check virtual isExpensive property (true if price > 100)', async () => {
        const expensiveItem = new WishlistItem({ ...validData, price: 100.01 }) as any;
        expect(expensiveItem.isExpensive).toBe(true);

        const cheapItem = new WishlistItem({ ...validData, price: 100.00 }) as any;
        expect(cheapItem.isExpensive).toBe(false);
    });

    it('should automatically set createdAt and updatedAt timestamps upon save', async () => {
        const item = new WishlistItem(validData);
        const saved = await item.save() as any;
        expect(saved.createdAt).toBeDefined();
        expect(saved.updatedAt).toBeDefined();
        expect(saved.createdAt).toBeInstanceOf(Date);
        expect(saved.updatedAt).toBeInstanceOf(Date);
    });

    it('should validate empty/blank URL properly', async () => {
        const item = new WishlistItem({
            name: 'Item with empty string url',
            price: 15.00,
            url: ''
        });
        await expect(item.validate()).resolves.not.toThrow();
    });
});

describe('errorHandler middleware unit tests', () => {
    let mockRequest: any;
    let mockResponse: any;
    let mockNext: any;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        mockNext = jest.fn();
    });

    it('should handle Mongoose ValidationError', () => {
        const err = {
            name: 'ValidationError',
            errors: {
                name: { path: 'name', message: 'Name is required' }
            }
        };
        errorHandler(err, mockRequest, mockResponse, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Validation error',
            errors: [{ path: 'name', message: 'Name is required' }]
        });
    });

    it('should handle duplicate key error (11000)', () => {
        const err = {
            code: 11000,
            keyValue: { name: 'PlayStation 5' }
        };
        errorHandler(err, mockRequest, mockResponse, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Duplicate key error',
            keyValue: { name: 'PlayStation 5' }
        });
    });

    it('should handle fallback 500 error', () => {
        const err = new Error('Test unhandled error');
        errorHandler(err, mockRequest, mockResponse, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Test unhandled error'
        });
    });
});

describe('Route catch blocks', () => {
    it('GET /entities should handle errors and call next', async () => {
        const spy = jest.spyOn(entityStorage, 'findAll').mockRejectedValue(new Error('DB Error'));
        const res = await request(app).get('/entities');
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('DB Error');
        spy.mockRestore();
    });

    it('GET /entities/expensive should handle errors and call next', async () => {
        const spy = jest.spyOn(entityStorage, 'findExpensive').mockRejectedValue(new Error('DB Error'));
        const res = await request(app).get('/entities/expensive');
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('DB Error');
        spy.mockRestore();
    });

    it('GET /entities/:id should handle errors and call next', async () => {
        const spy = jest.spyOn(entityStorage, 'findById').mockRejectedValue(new Error('DB Error'));
        const res = await request(app).get('/entities/507f1f77bcf86cd799439011');
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('DB Error');
        spy.mockRestore();
    });

    it('POST /entities should handle errors and call next', async () => {
        const spy = jest.spyOn(entityStorage, 'create').mockRejectedValue(new Error('DB Error'));
        const res = await request(app).post('/entities').send({
            name: 'Test item',
            price: 10,
            priority: 'medium'
        });
        expect(res.status).toBe(500);
        spy.mockRestore();
    });

    it('PUT /entities/:id should handle errors and call next', async () => {
        const spy = jest.spyOn(entityStorage, 'update').mockRejectedValue(new Error('DB Error'));
        const res = await request(app).put('/entities/507f1f77bcf86cd799439011').send({ name: 'New Name' });
        expect(res.status).toBe(500);
        spy.mockRestore();
    });

    it('DELETE /entities/:id should handle errors and call next', async () => {
        const spy = jest.spyOn(entityStorage, 'delete').mockRejectedValue(new Error('DB Error'));
        const res = await request(app).delete('/entities/507f1f77bcf86cd799439011');
        expect(res.status).toBe(500);
        spy.mockRestore();
    });
});

describe('Storage edge cases', () => {
    it('findAll should work without any options', async () => {
        const result = await entityStorage.findAll();
        expect(result.data).toEqual([]);
    });

    it('findAll with invalid sort field should use default sort', async () => {
        await entityStorage.create({
            name: 'Item A',
            price: 10,
            priority: 'medium'
        });
        const result = await entityStorage.findAll({ sort: 'invalidField' });
        expect(result.data.length).toBe(1);
    });
});

