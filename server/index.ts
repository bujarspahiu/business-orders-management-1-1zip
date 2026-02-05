import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production' || !process.env.NODE_ENV) {
  app.use(express.static(path.join(__dirname, '../dist')));
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Users endpoints
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, role, business_name, business_number, phone, whatsapp, viber, contact_person, logo_url, is_active, created_at, updated_at FROM users ORDER BY created_at DESC');
    res.json({ data: result.rows, error: null });
  } catch (error: any) {
    res.json({ data: null, error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { email, password, role, business_name, business_number, phone, whatsapp, viber, contact_person, logo_url, is_active } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role, business_name, business_number, phone, whatsapp, viber, contact_person, logo_url, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id, email, role, business_name, business_number, phone, whatsapp, viber, contact_person, logo_url, is_active, created_at, updated_at`,
      [email, password_hash, role || 'user', business_name, business_number, phone, whatsapp, viber, contact_person, logo_url, is_active !== false]
    );
    res.json({ data: result.rows[0], error: null });
  } catch (error: any) {
    res.json({ data: null, error: error.message });
  }
});

app.patch('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const fields = Object.keys(updates).filter(k => k !== 'id' && k !== 'password');
    const values = fields.map(k => updates[k]);
    
    if (updates.password) {
      fields.push('password_hash');
      values.push(await bcrypt.hash(updates.password, 10));
    }
    
    fields.push('updated_at');
    values.push(new Date());
    
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    values.push(id);
    
    const result = await pool.query(
      `UPDATE users SET ${setClause} WHERE id = $${values.length} RETURNING id, email, role, business_name, business_number, phone, whatsapp, viber, contact_person, logo_url, is_active, created_at, updated_at`,
      values
    );
    res.json({ data: result.rows[0], error: null });
  } catch (error: any) {
    res.json({ data: null, error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ data: { success: true }, error: null });
  } catch (error: any) {
    res.json({ data: null, error: error.message });
  }
});

// Auth endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.json({ data: null, error: 'Invalid credentials' });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.json({ data: null, error: 'Invalid credentials' });
    }
    if (!user.is_active) {
      return res.json({ data: null, error: 'Account is inactive' });
    }
    const { password_hash, ...userData } = user;
    res.json({ data: userData, error: null });
  } catch (error: any) {
    res.json({ data: null, error: error.message });
  }
});

// Products endpoints
app.get('/api/products', async (req, res) => {
  try {
    const { is_active } = req.query;
    let query = 'SELECT * FROM products';
    const params: any[] = [];
    if (is_active !== undefined) {
      query += ' WHERE is_active = $1';
      params.push(is_active === 'true');
    }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json({ data: result.rows, error: null });
  } catch (error: any) {
    res.json({ data: null, error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { product_code, brand, name, width, aspect_ratio, rim_diameter, dimensions, tire_type, season, stock_quantity, price, description, image_url, is_active } = req.body;
    const result = await pool.query(
      `INSERT INTO products (product_code, brand, name, width, aspect_ratio, rim_diameter, dimensions, tire_type, season, stock_quantity, price, description, image_url, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [product_code, brand, name, width, aspect_ratio, rim_diameter, dimensions, tire_type, season, stock_quantity || 0, price, description, image_url, is_active !== false]
    );
    res.json({ data: result.rows[0], error: null });
  } catch (error: any) {
    res.json({ data: null, error: error.message });
  }
});

app.post('/api/products/bulk', async (req, res) => {
  try {
    const { products } = req.body;
    const results: any[] = [];
    for (const p of products) {
      const result = await pool.query(
        `INSERT INTO products (product_code, brand, name, width, aspect_ratio, rim_diameter, dimensions, tire_type, season, stock_quantity, price, description, image_url, is_active) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
         ON CONFLICT (product_code) DO UPDATE SET 
           brand = EXCLUDED.brand, name = EXCLUDED.name, width = EXCLUDED.width, aspect_ratio = EXCLUDED.aspect_ratio, 
           rim_diameter = EXCLUDED.rim_diameter, dimensions = EXCLUDED.dimensions, tire_type = EXCLUDED.tire_type, 
           season = EXCLUDED.season, stock_quantity = EXCLUDED.stock_quantity, price = EXCLUDED.price, 
           description = EXCLUDED.description, image_url = EXCLUDED.image_url, is_active = EXCLUDED.is_active, updated_at = NOW()
         RETURNING *`,
        [p.product_code, p.brand, p.name, p.width, p.aspect_ratio, p.rim_diameter, p.dimensions, p.tire_type, p.season, p.stock_quantity || 0, p.price, p.description, p.image_url, p.is_active !== false]
      );
      results.push(result.rows[0]);
    }
    res.json({ data: results, error: null });
  } catch (error: any) {
    res.json({ data: null, error: error.message });
  }
});

app.patch('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const fields = Object.keys(updates).filter(k => k !== 'id');
    const values = fields.map(k => updates[k]);
    fields.push('updated_at');
    values.push(new Date());
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    values.push(id);
    const result = await pool.query(
      `UPDATE products SET ${setClause} WHERE id = $${values.length} RETURNING *`,
      values
    );
    res.json({ data: result.rows[0], error: null });
  } catch (error: any) {
    res.json({ data: null, error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ data: { success: true }, error: null });
  } catch (error: any) {
    res.json({ data: null, error: error.message });
  }
});

// Orders endpoints
app.get('/api/orders', async (req, res) => {
  try {
    const { user_id } = req.query;
    let query = `
      SELECT o.*, 
        json_agg(DISTINCT jsonb_build_object('id', oi.id, 'order_id', oi.order_id, 'product_id', oi.product_id, 'product_code', oi.product_code, 'product_name', oi.product_name, 'quantity', oi.quantity, 'unit_price', oi.unit_price, 'total_price', oi.total_price, 'created_at', oi.created_at)) FILTER (WHERE oi.id IS NOT NULL) as items,
        jsonb_build_object('id', u.id, 'email', u.email, 'business_name', u.business_name, 'business_number', u.business_number, 'contact_person', u.contact_person, 'phone', u.phone, 'logo_url', u.logo_url) as user
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN users u ON o.user_id = u.id
    `;
    const params: any[] = [];
    if (user_id) {
      query += ' WHERE o.user_id = $1';
      params.push(user_id);
    }
    query += ' GROUP BY o.id, u.id ORDER BY o.created_at DESC';
    const result = await pool.query(query, params);
    res.json({ data: result.rows, error: null });
  } catch (error: any) {
    res.json({ data: null, error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { order_number, user_id, status, total_amount, notes, items } = req.body;
    
    const orderResult = await client.query(
      `INSERT INTO orders (order_number, user_id, status, total_amount, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [order_number, user_id, status || 'pending', total_amount, notes]
    );
    const order = orderResult.rows[0];
    
    const orderItems: any[] = [];
    for (const item of items) {
      const itemResult = await client.query(
        `INSERT INTO order_items (order_id, product_id, product_code, product_name, quantity, unit_price, total_price) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [order.id, item.product_id, item.product_code, item.product_name, item.quantity, item.unit_price, item.total_price]
      );
      orderItems.push(itemResult.rows[0]);
      
      await client.query(
        'UPDATE products SET stock_quantity = stock_quantity - $1, updated_at = NOW() WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }
    
    await client.query('COMMIT');
    res.json({ data: { ...order, items: orderItems }, error: null });
  } catch (error: any) {
    await client.query('ROLLBACK');
    res.json({ data: null, error: error.message });
  } finally {
    client.release();
  }
});

app.patch('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const result = await pool.query(
      `UPDATE orders SET status = COALESCE($1, status), notes = COALESCE($2, notes), updated_at = NOW() WHERE id = $3 RETURNING *`,
      [status, notes, id]
    );
    res.json({ data: result.rows[0], error: null });
  } catch (error: any) {
    res.json({ data: null, error: error.message });
  }
});

// Notification recipients endpoints
app.get('/api/notification_recipients', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM notification_recipients ORDER BY created_at DESC');
    res.json({ data: result.rows, error: null });
  } catch (error: any) {
    res.json({ data: null, error: error.message });
  }
});

app.post('/api/notification_recipients', async (req, res) => {
  try {
    const { email, name, role, is_active } = req.body;
    const result = await pool.query(
      `INSERT INTO notification_recipients (email, name, role, is_active) VALUES ($1, $2, $3, $4) RETURNING *`,
      [email, name, role, is_active !== false]
    );
    res.json({ data: result.rows[0], error: null });
  } catch (error: any) {
    res.json({ data: null, error: error.message });
  }
});

app.patch('/api/notification_recipients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, role, is_active } = req.body;
    const result = await pool.query(
      `UPDATE notification_recipients SET email = COALESCE($1, email), name = COALESCE($2, name), role = COALESCE($3, role), is_active = COALESCE($4, is_active) WHERE id = $5 RETURNING *`,
      [email, name, role, is_active, id]
    );
    res.json({ data: result.rows[0], error: null });
  } catch (error: any) {
    res.json({ data: null, error: error.message });
  }
});

app.delete('/api/notification_recipients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM notification_recipients WHERE id = $1', [id]);
    res.json({ data: { success: true }, error: null });
  } catch (error: any) {
    res.json({ data: null, error: error.message });
  }
});

// Serve frontend for all non-API routes in production
if (process.env.NODE_ENV === 'production' || !process.env.NODE_ENV) {
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api') && req.method === 'GET') {
      res.sendFile(path.join(__dirname, '../dist/index.html'));
    } else {
      next();
    }
  });
}

const isDev = process.env.NODE_ENV === 'development';
const PORT = parseInt(process.env.PORT || (isDev ? '3001' : '5000'), 10);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
