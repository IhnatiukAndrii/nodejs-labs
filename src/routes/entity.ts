import { Router } from 'express';
import { entityStorage } from '../storage/entity';
import { createSchema, updateSchema, EntityFilters } from '../schemas/entity.schema';
import { validate } from '../middleware';

const router = Router();

router.get('/', (req, res) => {
    const { priority, maxPrice, name } = req.query;
    const filters: EntityFilters = {};
    if (typeof priority === 'string' && ['low', 'medium', 'high'].includes(priority)) {
        filters.priority = priority as 'low' | 'medium' | 'high';
    }
    if (typeof maxPrice === 'string' && !isNaN(Number(maxPrice))) {
        filters.maxPrice = Number(maxPrice);
    }
    if (typeof name === 'string') {
        filters.name = name;
    }
    res.status(200).json(entityStorage.findAll(filters));
});

router.get('/:id', (req, res, next) => {
    try {
        const item = entityStorage.findById(req.params.id as string);
        if (!item) {
            res.status(404).json({ error: 'Item not found' });
            return;
        }
        res.status(200).json(item);
    } catch (error) {
        next(error);
    }
});

router.post('/', validate(createSchema), (req, res, next) => {
    try {
        const newItem = entityStorage.create(req.body);
        res.status(201).json(newItem);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', validate(updateSchema), (req, res, next) => {
    try {
        const updated = entityStorage.update(req.params.id as string, req.body);
        if (!updated) {
            res.status(404).json({ error: 'Item not found' });
            return;
        }
        res.status(200).json(updated);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', (req, res, next) => {
    try {
        const success = entityStorage.delete(req.params.id as string);
        if (!success) {
            res.status(404).json({ error: 'Item not found' });
            return;
        }
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

export default router;
