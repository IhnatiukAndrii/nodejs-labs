import request from 'supertest';
import app from '../src/app';
import { entityStorage } from '../src/storage/entity';
import { WishlistItem } from '../src/models/entity.model';
import { connectDB } from '../src/config/database';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables for testing
dotenv.config();

beforeAll(async () => {
    await connectDB();
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Wishlist API Integration Tests', () => {
    beforeEach(async () => {
        await WishlistItem.deleteMany({});
    });

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
        expect(res.body).toEqual([]);
    });

    it('GET /entities/:id should return 404 for non-existent ID', async () => {
        const res = await request(app).get('/entities/non-existent-uuid');
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

    it('PUT /entities/:id should return 404 if updating non-existent item', async () => {
        const res = await request(app).put('/entities/non-existent-uuid').send({ name: 'New Name' });
        expect(res.status).toBe(404);
    });

    it('DELETE /entities/:id should delete item and return 204', async () => {
        const created = await entityStorage.create(validItem);
        const delRes = await request(app).delete(`/entities/${created.id}`);
        expect(delRes.status).toBe(204);

        const getRes = await request(app).get(`/entities/${created.id}`);
        expect(getRes.status).toBe(404);
    });

    it('DELETE /entities/:id should return 404 if deleting non-existent item', async () => {
        const res = await request(app).delete('/entities/non-existent-uuid');
        expect(res.status).toBe(404);
    });

    it('GET /entities?priority=high should return only high-priority items', async () => {
        await entityStorage.create({ ...validItem, name: 'Item 1', priority: 'high' });
        await entityStorage.create({ ...validItem, name: 'Item 2', priority: 'low' });
        await entityStorage.create({ ...validItem, name: 'Item 3', priority: 'high' });

        const res = await request(app).get('/entities?priority=high');
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body.every((item: any) => item.priority === 'high')).toBe(true);
    });

    it('GET /entities?maxPrice=100 should return only items with price <= 100', async () => {
        await entityStorage.create({ ...validItem, name: 'Cheap 1', price: 50 });
        await entityStorage.create({ ...validItem, name: 'Expensive', price: 150 });
        await entityStorage.create({ ...validItem, name: 'Cheap 2', price: 100 });

        const res = await request(app).get('/entities?maxPrice=100');
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body.every((item: any) => item.price <= 100)).toBe(true);
    });

    it('GET /entities?name=Play should return only items with matching names (case-insensitive)', async () => {
        await entityStorage.create({ ...validItem, name: 'PlayStation 5' });
        await entityStorage.create({ ...validItem, name: 'Xbox Series X' });
        await entityStorage.create({ ...validItem, name: 'Nintendo Switch' });

        const res = await request(app).get('/entities?name=play');
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].name).toBe('PlayStation 5');
    });

    it('GET /entities with multiple filters should return only matching items', async () => {
        await entityStorage.create({ ...validItem, name: 'Low Cheap', priority: 'low', price: 50 });
        await entityStorage.create({ ...validItem, name: 'Low Expensive', priority: 'low', price: 150 });
        await entityStorage.create({ ...validItem, name: 'High Cheap', priority: 'high', price: 50 });

        const res = await request(app).get('/entities?priority=low&maxPrice=100');
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].name).toBe('Low Cheap');
    });
});
