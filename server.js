const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Database setup
const db = new sqlite3.Database('./mahasetu.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initializeDatabase();
  }
});

// Initialize database with tables and sample data
function initializeDatabase() {
  db.serialize(() => {
    // Departments table
    db.run(`CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL
    )`);

    // Systems table
    db.run(`CREATE TABLE IF NOT EXISTS systems (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      dept TEXT NOT NULL,
      latency INTEGER NOT NULL,
      FOREIGN KEY (dept) REFERENCES departments(id)
    )`);

    // Citizens table
    db.run(`CREATE TABLE IF NOT EXISTS citizens (
      citizenId TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      identity_full_name TEXT,
      identity_dob TEXT,
      identity_aadhaar_masked TEXT,
      identity_gender TEXT,
      residential_name TEXT,
      residential_district TEXT,
      residential_pincode TEXT,
      residential_state TEXT,
      income_applicant_name TEXT,
      income_annual_income INTEGER,
      income_financial_year TEXT,
      education_student_name TEXT,
      education_date_of_birth TEXT,
      education_institution TEXT,
      education_level TEXT,
      education_status TEXT,
      benefits_name TEXT,
      benefits_previous_scholarship BOOLEAN,
      benefits_active_schemes TEXT
    )`);

    // Documents table (separate for normalization)
    db.run(`CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      citizenId TEXT NOT NULL,
      type TEXT NOT NULL,
      issuer TEXT NOT NULL,
      issued DATE NOT NULL,
      expires DATE,
      verified BOOLEAN NOT NULL,
      FOREIGN KEY (citizenId) REFERENCES citizens(citizenId)
    )`);

    // Schemes table
    db.run(`CREATE TABLE IF NOT EXISTS schemes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      dept TEXT NOT NULL,
      eligibility TEXT NOT NULL, -- JSON string
      requires TEXT NOT NULL -- JSON string
    )`);

    // Consents table
    db.run(`CREATE TABLE IF NOT EXISTS consents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      citizenId TEXT NOT NULL,
      dept TEXT NOT NULL,
      purpose TEXT NOT NULL,
      scopes TEXT NOT NULL, -- JSON string
      granted DATE NOT NULL,
      expires DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'Active',
      FOREIGN KEY (citizenId) REFERENCES citizens(citizenId)
    )`);

    // Applications table
    db.run(`CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      citizenId TEXT NOT NULL,
      scheme TEXT NOT NULL,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      timeline TEXT NOT NULL, -- JSON string
      FOREIGN KEY (citizenId) REFERENCES citizens(citizenId)
    )`);

    // Audit log table
    db.run(`CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      who TEXT NOT NULL,
      what TEXT NOT NULL,
      why TEXT NOT NULL,
      data TEXT NOT NULL,
      consent TEXT NOT NULL,
      result TEXT NOT NULL,
      timestamp TEXT NOT NULL
    )`);

    // API call log table
    db.run(`CREATE TABLE IF NOT EXISTS api_call_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts TEXT NOT NULL,
      system TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      method TEXT NOT NULL DEFAULT 'GET',
      status INTEGER NOT NULL,
      latency INTEGER NOT NULL,
      reqId TEXT NOT NULL
    )`);

    // Insert sample data
    insertSampleData();
  });
}

function insertSampleData() {
  // Clear existing data (for development)
  const tables = ['departments', 'systems', 'citizens', 'documents', 'schemes', 'consents', 'applications', 'audit_log', 'api_call_log'];
  tables.forEach(table => {
    db.run(`DELETE FROM ${table}`, err => {
      if (err) console.error(`Error clearing ${table}:`, err.message);
    });
  });

  // Insert departments
  const departments = [
    { id: 'revenue', name: 'Revenue Department', code: 'REV' },
    { id: 'social', name: 'Social Justice Department', code: 'SJD' },
    { id: 'education', name: 'Education Department', code: 'EDU' },
    { id: 'rural', name: 'Rural Development Department', code: 'RDD' }
  ];

  departments.forEach(dept => {
    db.run(
      'INSERT INTO departments (id, name, code) VALUES (?, ?, ?)',
      [dept.id, dept.name, dept.code],
      err => {
        if (err) console.error('Error inserting department:', err.message);
      }
    );
  });

  // Insert systems
  const systems = [
    { id: 'identity', name: 'Maharashtra Identity Registry', dept: 'revenue', latency: 82 },
    { id: 'residence', name: 'Revenue & Residence Registry', dept: 'revenue', latency: 106 },
    { id: 'income', name: 'Income Verification System', dept: 'revenue', latency: 94 },
    { id: 'education', name: 'Education Records System', dept: 'education', latency: 118 },
    { id: 'benefits', name: 'Benefits Registry', dept: 'social', latency: 101 },
    { id: 'documents', name: 'Document Vault', dept: 'rural', latency: 73 }
  ];

  systems.forEach(sys => {
    db.run(
      'INSERT INTO systems (id, name, dept, latency) VALUES (?, ?, ?, ?)',
      [sys.id, sys.name, sys.dept, sys.latency],
      err => {
        if (err) console.error('Error inserting system:', err.message);
      }
    );
  });

  // Insert citizens
  const citizens = [
    {
      citizenId: 'MH-CIT-99999',
      name: 'Takshil Sangle',
      email: 'takshils2007@gmail.com',
      identity: { full_name: 'Takshil Sangle', dob: '2005-07-15', aadhaar_masked: 'MASKED-ID-8842', gender: 'Male' },
      residence: { name: 'Takshil Sangle', residentialDistrict: 'Pune', pincode: '411001', state: 'Maharashtra' },
      income: { applicantName: 'Takshil Sangle', annual_income: 180000, financial_year: '2025-26' },
      education: { student_name: 'Takshil Sangle', date_of_birth: '2005-07-15', institution: 'Fergusson College, Pune', level: 'Undergraduate', status: 'Enrolled' },
      benefits: { name: 'Takshil Sangle', previous_scholarship: false, active_schemes: [] },
      documents: [
        { type: 'Residence Certificate', issuer: 'Revenue Department', issued: '2025-03-11', expires: '2027-03-11', verified: true },
        { type: 'Income Certificate', issuer: 'Revenue Department', issued: '2025-04-02', expires: '2026-04-02', verified: true },
        { type: 'Student ID', issuer: 'Education Department', issued: '2025-06-01', expires: '2026-06-01', verified: true },
        { type: 'Marksheet (HSC)', issuer: 'Education Department', issued: '2023-05-20', expires: null, verified: true }
      ]
    },
    {
      citizenId: 'MH-CIT-20917',
      name: 'Sneha Kulkarni',
      email: 'sneha@example.com',
      identity: { full_name: 'Sneha Kulkarni', dob: '2004-11-02', aadhaar_masked: 'MASKED-ID-2291', gender: 'Female' },
      residence: { name: 'Sneha Kulkarni', residentialDistrict: 'Nashik', pincode: '422001', state: 'Maharashtra' },
      income: { applicantName: 'Sneha Kulkarni', annual_income: 340000, financial_year: '2025-26' },
      education: { student_name: 'Sneha Kulkarni', date_of_birth: '2004-11-02', institution: 'BYK College, Nashik', level: 'Undergraduate', status: 'Enrolled' },
      benefits: { name: 'Sneha Kulkarni', previous_scholarship: false, active_schemes: [] },
      documents: [
        { type: 'Residence Certificate', issuer: 'Revenue Department', issued: '2025-01-18', expires: '2027-01-18', verified: true },
        { type: 'Income Certificate', issuer: 'Revenue Department', issued: '2025-02-09', expires: '2026-02-09', verified: true }
      ]
    }
  ];

  citizens.forEach(citizen => {
    db.run(
      `INSERT INTO citizens (
        citizenId, name, email,
        identity_full_name, identity_dob, identity_aadhaar_masked, identity_gender,
        residential_name, residential_district, residential_pincode, residential_state,
        income_applicant_name, income_annual_income, income_financial_year,
        education_student_name, education_date_of_birth, education_institution, education_level, education_status,
        benefits_name, benefits_previous_scholarship, benefits_active_schemes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        citizen.citizenId, citizen.name, citizen.email,
        citizen.identity.full_name, citizen.identity.dob, citizen.identity.aadhaar_masked, citizen.identity.gender,
        citizen.residence.name, citizen.residence.residentialDistrict, citizen.residence.pincode, citizen.residence.state,
        citizen.income.applicantName, citizen.income.annual_income, citizen.income.financial_year,
        citizen.education.student_name, citizen.education.date_of_birth, citizen.education.institution, citizen.education.level, citizen.education.status,
        citizen.benefits.name, citizen.benefits.previous_scholarship, JSON.stringify(citizen.benefits.active_schemes)
      ],
      err => {
        if (err) console.error('Error inserting citizen:', err.message);
      }
    );

    // Insert documents for this citizen
    if (citizen.documents) {
      citizen.documents.forEach(doc => {
        db.run(
          'INSERT INTO documents (citizenId, type, issuer, issued, expires, verified) VALUES (?, ?, ?, ?, ?, ?)',
          [citizen.citizenId, doc.type, doc.issuer, doc.issued, doc.expires || null, doc.verified],
          err => {
            if (err) console.error('Error inserting document:', err.message);
          }
        );
      });
    }
  });

  // Insert scheme
  const scheme = {
    id: 'scholarship',
    name: 'Maharashtra Student Scholarship',
    dept: 'Education Department',
    eligibility: JSON.stringify([
      'Maharashtra resident',
      'Enrolled student',
      'Annual family income below ₹2,50,000',
      'No previous scholarship received',
      'Required documents available'
    ]),
    requires: JSON.stringify(['identity', 'residence', 'income', 'education', 'benefits', 'documents'])
  };

  db.run(
    'INSERT INTO schemes (id, name, dept, eligibility, requires) VALUES (?, ?, ?, ?, ?)',
    [scheme.id, scheme.name, scheme.dept, scheme.eligibility, scheme.requires],
    err => {
      if (err) console.error('Error inserting scheme:', err.message);
    }
  );

  console.log('Sample data inserted successfully.');
}

// API Routes
// Mock API endpoints that match what the frontend expects in logApiCall
function logApiCall(system, endpoint, status, latency) {
  const reqId = 'REQ-' + Math.floor(90000 + Math.random() * 9000);
  const ts = new Date().toLocaleTimeString('en-IN', { hour12: false });
  db.run(
    'INSERT INTO api_call_log (ts, system, endpoint, method, status, latency, reqId) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [ts, system, endpoint, 'GET', status, latency, reqId],
    err => {
      if (err) console.error('Error logging API call:', err.message);
    }
  );
}

app.get('/mock/:system/:citizenId', (req, res) => {
  const { system, citizenId } = req.params;

  // Get citizen data
  db.get('SELECT * FROM citizens WHERE citizenId = ?', [citizenId], (err, citizen) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!citizen) {
      return res.status(404).json({ error: 'Citizen not found' });
    }

    // Return data based on system type
    let result = {};
    switch (system) {
      case 'identity':
        result = {
          full_name: citizen.identity_full_name,
          dob: citizen.identity_dob,
          aadhaar_masked: citizen.identity_aadhaar_masked,
          gender: citizen.identity_gender
        };
        break;
      case 'residence':
        result = {
          name: citizen.residential_name,
          residentialDistrict: citizen.residential_district,
          pincode: citizen.residential_pincode,
          state: citizen.residential_state
        };
        break;
      case 'income':
        result = {
          applicantName: citizen.income_applicant_name,
          annual_income: citizen.income_annual_income,
          financial_year: citizen.income_financial_year
        };
        break;
      case 'education':
        result = {
          student_name: citizen.education_student_name,
          date_of_birth: citizen.education_date_of_birth,
          institution: citizen.education_institution,
          level: citizen.education_level,
          status: citizen.education_status
        };
        break;
      case 'benefits':
        result = {
          name: citizen.benefits_name,
          previous_scholarship: citizen.benefits_previous_scholarship,
          active_schemes: JSON.parse(citizen.benefits_active_schemes || '[]')
        };
        break;
      case 'documents':
        db.all(
          'SELECT * FROM documents WHERE citizenId = ?',
          [citizenId],
          (err, docs) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            result = docs.map(doc => ({
              type: doc.type,
              issuer: doc.issuer,
              issued: doc.issued,
              expires: doc.expires,
              verified: doc.verified
            }));
            res.json(result);

            // Log the API call
            logApiCall(system, `/mock/${system}/${citizenId}`, 200, 70 + Math.random()*30); // Base latency + random variation
          }
        );
        return; // Early return since we're handling the response in the callback
      default:
        return res.status(400).json({ error: 'Invalid system' });
    }

    // For non-documents systems, send the result directly and log the call
    if (system !== 'documents') {
      res.json(result);

      // Log the API call with system-specific latency
      let baseLatency = 80; // Default
      switch(system) {
        case 'identity': baseLatency = 82; break;
        case 'residence': baseLatency = 106; break;
        case 'income': baseLatency = 94; break;
        case 'education': baseLatency = 118; break;
        case 'benefits': baseLatency = 101; break;
      }
      logApiCall(system, `/mock/${system}/${citizenId}`, 200, baseLatency + Math.floor(Math.random()*20));
    }
  });
});

// Additional API endpoints for frontend functionality
app.get('/api/departments', (req, res) => {
  db.all('SELECT * FROM departments', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.get('/api/schemes', (req, res) => {
  db.all('SELECT * FROM schemes', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    // Parse JSON fields
    const schemes = rows.map(scheme => ({
      ...scheme,
      eligibility: JSON.parse(scheme.eligibility),
      requires: JSON.parse(scheme.requires)
    }));
    res.json(schemes);
  });
});

app.get('/api/consents/:citizenId', (req, res) => {
  const { citizenId } = req.params;
  db.all(
    'SELECT * FROM consents WHERE citizenId = ? ORDER BY granted DESC',
    [citizenId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      // Parse JSON fields
      const consents = rows.map(consent => ({
        ...consent,
        scopes: JSON.parse(consent.scopes)
      }));
      res.json(consents);
    }
  );
});

app.post('/api/consents', (req, res) => {
  const { citizenId, dept, purpose, scopes, granted, expires } = req.body;
  db.run(
    'INSERT INTO consents (citizenId, dept, purpose, scopes, granted, expires) VALUES (?, ?, ?, ?, ?, ?)',
    [citizenId, dept, purpose, JSON.stringify(scopes), granted, expires],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID });
    }
  );
});

app.get('/api/applications/:citizenId', (req, res) => {
  const { citizenId } = req.params;
  db.all(
    'SELECT * FROM applications WHERE citizenId = ? ORDER BY createdAt DESC',
    [citizenId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      // Parse JSON fields
      const applications = rows.map(app => ({
        ...app,
        timeline: JSON.parse(app.timeline)
      }));
      res.json(applications);
    }
  );
});

app.post('/api/applications', (req, res) => {
  const { citizenId, scheme, status, createdAt, timeline } = req.body;
  db.run(
    'INSERT INTO applications (citizenId, scheme, status, createdAt, timeline) VALUES (?, ?, ?, ?, ?)',
    [citizenId, scheme, status, createdAt, JSON.stringify(timeline)],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID });
    }
  );
});

app.get('/api/audit-log', (req, res) => {
  db.all(
    'SELECT * FROM audit_log ORDER BY timestamp DESC',
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    }
  );
});

app.post('/api/audit-log', (req, res) => {
  const { who, what, why, data, consent, result, timestamp } = req.body;
  db.run(
    'INSERT INTO audit_log (who, what, why, data, consent, result, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [who, what, why, data, consent, result, timestamp],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID });
    }
  );
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;