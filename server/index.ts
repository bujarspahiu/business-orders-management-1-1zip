import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({
  origin: [
    'https://localhost',
    'capacitor://localhost',
    'http://localhost',
    'http://localhost:5000',
    'https://business-orders-management-1-1-zip.replit.app',
    'https://lassaks.online',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production' || !process.env.NODE_ENV) {
  app.use(express.static(path.join(__dirname, '../dist')));
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendOrderNotification(order: any, orderItems: any[], customer: any) {
  try {
    const recipientsResult = await pool.query('SELECT * FROM notification_recipients WHERE is_active = true');
    const recipients = recipientsResult.rows;
    if (recipients.length === 0) return;

    const toEmails = recipients.map((r: any) => r.email).join(', ');
    const itemsHtml = orderItems.map((item: any) =>
      `<tr><td style="padding:8px;border:1px solid #e5e7eb">${item.product_code}</td><td style="padding:8px;border:1px solid #e5e7eb">${item.product_name}</td><td style="padding:8px;border:1px solid #e5e7eb;text-align:center">${item.quantity}</td><td style="padding:8px;border:1px solid #e5e7eb;text-align:right">&euro;${Number(item.unit_price).toFixed(2)}</td><td style="padding:8px;border:1px solid #e5e7eb;text-align:right">&euro;${Number(item.total_price).toFixed(2)}</td></tr>`
    ).join('');

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#ea580c;padding:20px;text-align:center">
          <h1 style="color:#fff;margin:0">Lassa Tyres</h1>
          <p style="color:#fed7aa;margin:5px 0 0">Porosi e Re / New Order</p>
        </div>
        <div style="padding:20px;background:#f9fafb">
          <h2 style="color:#1f2937">Porosi #${order.order_number}</h2>
          <div style="background:#fff;padding:15px;border-radius:8px;margin-bottom:15px">
            <h3 style="color:#ea580c;margin-top:0">Klienti / Customer</h3>
            <p><strong>Biznesi:</strong> ${customer?.business_name || 'N/A'}</p>
            <p><strong>Nr. Biznesit:</strong> ${customer?.business_number || 'N/A'}</p>
            <p><strong>Kontakti:</strong> ${customer?.contact_person || 'N/A'}</p>
            <p><strong>Telefon:</strong> ${customer?.phone || 'N/A'}</p>
          </div>
          <div style="background:#fff;padding:15px;border-radius:8px;margin-bottom:15px">
            <h3 style="color:#ea580c;margin-top:0">Artikujt / Items</h3>
            <table style="width:100%;border-collapse:collapse">
              <thead><tr style="background:#f3f4f6">
                <th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Kodi</th>
                <th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Produkti</th>
                <th style="padding:8px;border:1px solid #e5e7eb;text-align:center">Sasia</th>
                <th style="padding:8px;border:1px solid #e5e7eb;text-align:right">Cmimi</th>
                <th style="padding:8px;border:1px solid #e5e7eb;text-align:right">Totali</th>
              </tr></thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            <div style="text-align:right;margin-top:10px;padding-top:10px;border-top:2px solid #ea580c">
              <strong style="font-size:18px;color:#ea580c">Totali: &euro;${Number(order.total_amount).toFixed(2)}</strong>
            </div>
          </div>
          ${order.notes ? `<div style="background:#fff;padding:15px;border-radius:8px"><h3 style="color:#ea580c;margin-top:0">Shenime / Notes</h3><p>${order.notes}</p></div>` : ''}
        </div>
        <div style="background:#1f2937;padding:15px;text-align:center">
          <p style="color:#9ca3af;margin:0;font-size:12px">Lassa Tyres B2B - Together in Every Mile</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Lassa Tyres B2B" <${process.env.GMAIL_USER}>`,
      to: toEmails,
      subject: `Porosi e Re #${order.order_number} - ${customer?.business_name || 'N/A'}`,
      html,
    });
    console.log(`Email notification sent for order ${order.order_number} to ${toEmails}`);
  } catch (error) {
    console.error('Failed to send email notification:', error);
  }
}

async function runMigrations() {
  try {
    await pool.query('ALTER TABLE users ALTER COLUMN email DROP NOT NULL');
  } catch (e) {
  }
}

async function ensureAdminExists() {
  try {
    const result = await pool.query("SELECT id FROM users WHERE role = 'admin'");
    if (result.rows.length === 0) {
      const { v4: uuidv4 } = await import('uuid');
      const passwordHash = await bcrypt.hash('Admin', 10);
      await pool.query(
        `INSERT INTO users (id, username, email, password_hash, role, is_active) VALUES ($1, 'Admin', 'Admin', $2, 'admin', true)`,
        [uuidv4(), passwordHash]
      );
      console.log('Default admin created (Admin/Admin)');
    }
  } catch (error) {
    console.error('Error ensuring admin exists:', error);
  }
}

runMigrations().then(() => ensureAdminExists());

// Users endpoints
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, email, role, business_name, business_number, phone, whatsapp, viber, contact_person, logo_url, is_active, created_at, updated_at FROM users ORDER BY created_at DESC');
    res.json({ data: result.rows, error: null });
  } catch (error: any) {
    res.json({ data: null, error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { username, email, password, role, business_name, business_number, phone, whatsapp, viber, contact_person, logo_url, is_active } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, role, business_name, business_number, phone, whatsapp, viber, contact_person, logo_url, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id, username, email, role, business_name, business_number, phone, whatsapp, viber, contact_person, logo_url, is_active, created_at, updated_at`,
      [username, email || null, password_hash, role || 'user', business_name || null, business_number || null, phone || null, whatsapp || null, viber || null, contact_person || null, logo_url || null, is_active !== false]
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
      `UPDATE users SET ${setClause} WHERE id = $${values.length} RETURNING id, username, email, role, business_name, business_number, phone, whatsapp, viber, contact_person, logo_url, is_active, created_at, updated_at`,
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
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
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

app.post('/api/auth/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.json({ data: null, error: 'User not found' });
    }
    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!valid) {
      return res.json({ data: null, error: 'Current password is incorrect' });
    }
    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, userId]);
    res.json({ data: { success: true }, error: null });
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
        jsonb_build_object('id', u.id, 'username', u.username, 'email', u.email, 'business_name', u.business_name, 'business_number', u.business_number, 'contact_person', u.contact_person, 'phone', u.phone, 'logo_url', u.logo_url) as user
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

    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [user_id]);
    const customer = userResult.rows[0] || null;
    sendOrderNotification(order, orderItems, customer);

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

// Reports endpoint
app.get('/api/reports', async (req, res) => {
  try {
    const { user_id, start_date, end_date } = req.query;
    const params: any[] = [];
    let whereClause = '';
    const conditions: string[] = [];
    
    if (user_id) {
      params.push(user_id);
      conditions.push(`o.user_id = $${params.length}`);
    }
    if (start_date) {
      params.push(start_date);
      conditions.push(`o.created_at >= $${params.length}::timestamp`);
    }
    if (end_date) {
      params.push(end_date);
      conditions.push(`o.created_at <= $${params.length}::timestamp`);
    }
    
    if (conditions.length > 0) {
      whereClause = ' WHERE ' + conditions.join(' AND ');
    }
    
    const query = `
      SELECT o.*, 
        json_agg(DISTINCT jsonb_build_object('id', oi.id, 'order_id', oi.order_id, 'product_id', oi.product_id, 'product_code', oi.product_code, 'product_name', oi.product_name, 'quantity', oi.quantity, 'unit_price', oi.unit_price, 'total_price', oi.total_price)) FILTER (WHERE oi.id IS NOT NULL) as items,
        jsonb_build_object('id', u.id, 'username', u.username, 'email', u.email, 'business_name', u.business_name, 'business_number', u.business_number, 'contact_person', u.contact_person, 'phone', u.phone) as user
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN users u ON o.user_id = u.id
      ${whereClause}
      GROUP BY o.id, u.id
      ORDER BY o.created_at DESC
    `;
    
    const result = await pool.query(query, params);
    const orders = result.rows;
    
    const totalOrders = orders.length;
    const totalItems = orders.reduce((sum: number, o: any) => {
      const items = o.items || [];
      return sum + items.reduce((iSum: number, i: any) => iSum + (Number(i.quantity) || 0), 0);
    }, 0);
    const totalRevenue = orders.reduce((sum: number, o: any) => sum + (Number(o.total_amount) || 0), 0);
    
    res.json({ 
      data: { 
        orders, 
        summary: { totalOrders, totalItems, totalRevenue } 
      }, 
      error: null 
    });
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
