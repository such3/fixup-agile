import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'db.json');

const app = express({ limit: '50mb' }); // Allow large base64 image payloads
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Helper function to read database safely
async function readDB() {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading db.json:', error);
    throw new Error('Database read error');
  }
}

// Helper function to write database safely
async function writeDB(data) {
  try {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing db.json:', error);
    throw new Error('Database write error');
  }
}

// ==========================================
// USERS ENDPOINT (RBAC SEED DATA)
// ==========================================
app.get('/api/users', async (req, res) => {
  try {
    const db = await readDB();
    res.json(db.users || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// SETTINGS ENDPOINTS
// ==========================================
app.get('/api/settings', async (req, res) => {
  try {
    const db = await readDB();
    res.json(db.settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const db = await readDB();
    db.settings = { ...db.settings, ...req.body };
    await writeDB(db);
    res.json(db.settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// DEPARTMENTS ENDPOINTS
// ==========================================
app.get('/api/departments', async (req, res) => {
  try {
    const db = await readDB();
    res.json(db.departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/departments', async (req, res) => {
  try {
    const db = await readDB();
    const newDept = {
      id: `dept-${Date.now()}`,
      name: req.body.name,
      code: req.body.code || 'DEPT',
      head: req.body.head || 'HOD / Coordinator'
    };
    db.departments.push(newDept);
    await writeDB(db);
    res.status(201).json(newDept);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/departments/:id', async (req, res) => {
  try {
    const db = await readDB();
    db.departments = db.departments.filter(d => d.id !== req.params.id);
    await writeDB(db);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// CATEGORIES ENDPOINTS
// ==========================================
app.get('/api/categories', async (req, res) => {
  try {
    const db = await readDB();
    res.json(db.categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const db = await readDB();
    const newCat = {
      id: `cat-${Date.now()}`,
      name: req.body.name,
      description: req.body.description || ''
    };
    db.categories.push(newCat);
    await writeDB(db);
    res.status(201).json(newCat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const db = await readDB();
    db.categories = db.categories.filter(c => c.id !== req.params.id);
    await writeDB(db);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// TECHNICIANS ENDPOINTS
// ==========================================
app.get('/api/technicians', async (req, res) => {
  try {
    const db = await readDB();
    res.json(db.technicians || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/technicians', async (req, res) => {
  try {
    const db = await readDB();
    if (!db.technicians) db.technicians = [];
    const newTech = {
      id: `tech-${Date.now()}`,
      name: req.body.name,
      specialization: req.body.specialization || 'General'
    };
    db.technicians.push(newTech);
    await writeDB(db);
    res.status(201).json(newTech);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/technicians/:id', async (req, res) => {
  try {
    const db = await readDB();
    if (!db.technicians) db.technicians = [];
    db.technicians = db.technicians.filter(t => t.id !== req.params.id);
    await writeDB(db);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// DOCKETS ENDPOINTS
// ==========================================
app.get('/api/dockets', async (req, res) => {
  try {
    const db = await readDB();
    res.json(db.dockets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/dockets', async (req, res) => {
  try {
    const db = await readDB();
    
    // Generate Docket ID CME/YYYY/XXXX
    const currentYear = new Date().getFullYear();
    const docketsThisYear = db.dockets.filter(d => d.id.startsWith(`CME/${currentYear}/`));
    const nextNumber = docketsThisYear.length + 1;
    const paddedNumber = String(nextNumber).padStart(4, '0');
    const newId = `CME/${currentYear}/${paddedNumber}`;

    const newDocket = {
      id: newId,
      complaintGivenBy: req.body.complaintGivenBy || 'Anonymous',
      department: req.body.department || 'General',
      category: req.body.category || 'General Maintenance',
      description: req.body.description || '',
      location: req.body.location || '',
      priority: req.body.priority || 'Low',
      imageUrl: req.body.imageUrl || '',
      status: 'Submitted', // Initial status
      createdAt: new Date().toISOString(),
      receivedBy: '',
      receivedAt: null,
      issuedTo: '',
      issuedAt: null,
      rectifiedBy: '',
      rectifiedAt: null,
      rectificationDetails: '',
      userRemarks: '',
      userName: '',
      siteEngineer: '',
      closedAt: null
    };

    db.dockets.unshift(newDocket); // Add to beginning of array
    await writeDB(db);
    res.status(201).json(newDocket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/dockets/:id (for encoded IDs like CME%2F2026%2F0001)
app.put('/api/dockets/:id', async (req, res) => {
  try {
    const db = await readDB();
    const index = db.dockets.findIndex(d => d.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Docket not found' });
    
    db.dockets[index] = { ...db.dockets[index], ...req.body };
    await writeDB(db);
    res.json(db.dockets[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/dockets/:p1/:p2/:p3 (for unencoded IDs like CME/2026/0001)
app.put('/api/dockets/:p1/:p2/:p3', async (req, res) => {
  try {
    const id = `${req.params.p1}/${req.params.p2}/${req.params.p3}`;
    const db = await readDB();
    const index = db.dockets.findIndex(d => d.id === id);
    if (index === -1) return res.status(404).json({ error: 'Docket not found' });
    
    db.dockets[index] = { ...db.dockets[index], ...req.body };
    await writeDB(db);
    res.json(db.dockets[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/dockets/:id (for encoded IDs)
app.delete('/api/dockets/:id', async (req, res) => {
  try {
    const db = await readDB();
    db.dockets = db.dockets.filter(d => d.id !== req.params.id);
    await writeDB(db);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/dockets/:p1/:p2/:p3 (for unencoded IDs)
app.delete('/api/dockets/:p1/:p2/:p3', async (req, res) => {
  try {
    const id = `${req.params.p1}/${req.params.p2}/${req.params.p3}`;
    const db = await readDB();
    db.dockets = db.dockets.filter(d => d.id !== id);
    await writeDB(db);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
