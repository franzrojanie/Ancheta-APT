const { pool } = require('../config/database');

const createTables = async () => {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        phone VARCHAR(50),
        address TEXT,
        unit_id INT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Units table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS units (
        id SERIAL PRIMARY KEY,
        unit_number VARCHAR(50) NOT NULL,
        floor INT NOT NULL,
        building VARCHAR(100) NOT NULL,
        type VARCHAR(50),
        rent_amount DECIMAL(10, 2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'available',
        maintenance_status VARCHAR(50) DEFAULT 'none',
        bedrooms INT DEFAULT 0,
        bathrooms INT DEFAULT 0,
        area_sqft DECIMAL(10,2) DEFAULT 0,
        description TEXT,
        amenities TEXT,
        images TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE (unit_number, building)
      )
    `);

    // Bills table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bills (
        id SERIAL PRIMARY KEY,
        tenant_id INT NOT NULL,
        type VARCHAR(100) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT,
        due_date DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'unpaid',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Payments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        bill_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'gcash',
        transaction_id VARCHAR(255),
        gcash_reference VARCHAR(255),
        paymongo_link_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
      )
    `);

    // Maintenance requests table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS maintenance_requests (
        id SERIAL PRIMARY KEY,
        tenant_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        priority VARCHAR(50) DEFAULT 'medium',
        status VARCHAR(50) DEFAULT 'pending',
        staff_notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Add foreign key for users.unit_id (after units exists)
    try {
      await pool.query(`
        ALTER TABLE users
        ADD CONSTRAINT fk_users_unit
        FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL
      `);
    } catch (e) {
      if (!e.message.includes('already exists')) {
        console.warn('Foreign key constraint warning:', e.message);
      }
    }

    // Create indexes for performance
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)').catch(() => {});
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)').catch(() => {});
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_unit_id ON users(unit_id)').catch(() => {});
    await pool.query('CREATE INDEX IF NOT EXISTS idx_bills_tenant_id ON bills(tenant_id)').catch(() => {});
    await pool.query('CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status)').catch(() => {});
    await pool.query('CREATE INDEX IF NOT EXISTS idx_payments_bill_id ON payments(bill_id)').catch(() => {});
    await pool.query('CREATE INDEX IF NOT EXISTS idx_maintenance_tenant_id ON maintenance_requests(tenant_id)').catch(() => {});

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
};

createTables()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
