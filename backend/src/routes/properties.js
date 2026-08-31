const express = require('express');
const router = express.Router();
const pool = require('../db/mysql');

function validateListingId(id) {
    if (!id || id.trim() === '') {
        return { valid: false, error: 'Listing ID is required' };
    }
    if (id.length > 50) {
        return { valid: false, error: 'Listing ID is too long' };
    }
    if (!/^[a-zA-Z0-9]+$/.test(id)) {
        return { valid: false, error: 'Listing ID contains invalid characters' };
    }
    return { valid: true };
}

router.get('/:id/openhouses', async (req, res) => {
    try {
        const { id } = req.params;
        
        const validation = validateListingId(id);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }

        const [propertyCheck] = await pool.query(
            'SELECT L_ListingID FROM rets_property WHERE L_ListingID = ?',
            [id]
        );
        if (propertyCheck.length === 0) {
            return res.status(404).json({
            error: 'Property not found',
            message: `No property exists with ID: ${id}`
        });
    }
    
    const [openhouses] = await pool.query(
        'SELECT * FROM rets_openhouse WHERE L_ListingID = ? ORDER BY OpenHouseDate, OH_StartTime',
        [id]
        );
 
    res.json({
        propertyId: id,
        count: openhouses.length,
        openhouses
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch open houses' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const validation = validateListingId(id);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }

        const [results] = await pool.query(
            'SELECT * FROM rets_property WHERE L_ListingID = ?',
            [id]
        );
    
    if (results.length === 0) {
        return res.status(404).json({
        error: 'Property not found',
        message: `No property exists with ID: ${id}`
        });
    }
 
    res.json(results[0]);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch property details' });
    }
});

router.get('/', async (req, res) => {
 try {
    const rawLimit = req.query.limit;
    const limit = rawLimit === undefined ? 20 : parseInt(rawLimit);
    const rawOffset = req.query.offset;
    const offset = rawOffset === undefined ? 0 : parseInt(rawOffset);
    
    const { city, zipcode, minPrice, maxPrice, beds, baths, sortBy, sortOrder } = req.query;
    
    if (minPrice && isNaN(minPrice)) {
        return res.status(400).json({ error: 'minPrice must be a number' });
    }
    if (maxPrice && isNaN(maxPrice)) {
        return res.status(400).json({ error: 'maxPrice must be a number' });
    }
    if (beds && isNaN(beds)) {
        return res.status(400).json({ error: 'beds must be a number' });
    }
    if (baths && isNaN(baths)) {
        return res.status(400).json({ error: 'baths must be a number' });
    }
    if (isNaN(limit) || limit < 1 || limit > 100) {
        return res.status(400).json({ error: 'limit must be between 1 and 100' });
    }
    if (isNaN(offset) || offset < 0) {
        return res.status(400).json({ error: 'offset cannot be negative' });
    }
    
    // Whitelist the sortable columns. ORDER BY can't use parameterized placeholders,
    // so the column name is concatenated into the query — validating against a fixed
    // list is what prevents SQL injection here.
    const validSortFields = ['L_SystemPrice', 'ListingContractDate', 'LM_Int2_3', 'L_Keyword2'];
    const validOrders = ['ASC', 'DESC'];
    if (sortBy && !validSortFields.includes(sortBy)) {
        return res.status(400).json({ error: `Invalid sortBy value: ${sortBy}` });
    }

    // Build the WHERE clause dynamically: only add a condition for filters the user
    // actually provided. Values go into a parameterized array (never string-concatenated)
    // to prevent SQL injection.
    const conditions = [];
    const values = [];
    
    // City casing is inconsistent in the data ("portland", "Portland", "PORTLAND"),
    // so compare both sides lowercased and trimmed.
    if (city) {
        conditions.push('LOWER(TRIM(L_City)) = LOWER(TRIM(?))');
        values.push(city);
    }
    if (zipcode) {
        conditions.push('L_Zip = ?');
        values.push(zipcode);
    }
    if (minPrice) {
        conditions.push('L_SystemPrice >= ?');
        values.push(parseFloat(minPrice));
    }
    if (maxPrice) {
        conditions.push('L_SystemPrice <= ?');
        values.push(parseFloat(maxPrice));
    }
    if (beds) {
        conditions.push('L_Keyword2 >= ?');
        values.push(parseInt(beds));
    }
    if (baths) {
        conditions.push('LM_Dec_3 >= ?');
        values.push(parseInt(baths));
    }

    const whereClause = conditions.length > 0
        ? 'WHERE ' + conditions.join(' AND ')
        : '';

    let orderClause = '';
    if (sortBy) {
        const order = validOrders.includes(sortOrder?.toUpperCase())
            ? sortOrder.toUpperCase()
            : 'ASC';
        orderClause = `ORDER BY ${sortBy} ${order}`;
    }

    const countQuery = `SELECT COUNT(*) as total FROM rets_property ${whereClause}`;
    const [countResult] = await pool.query(countQuery, values);
    const total = countResult[0].total;
    const dataQuery = `SELECT * FROM rets_property ${whereClause} ${orderClause} LIMIT ? OFFSET ?`;
    const [results] = await pool.query(dataQuery, [...values, limit, offset]);
    res.json({ total, limit, offset, results });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch properties' });
    }
});

module.exports = router;