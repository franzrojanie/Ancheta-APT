const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const countResult = await client.query('SELECT COUNT(*) as count FROM users');
    if (parseInt(countResult.rows[0].count) > 0) {
      console.log('⚠️  Database already has data. Skipping seed.');
      await client.query('ROLLBACK');
      return;
    }

    const units = [
      { unit_number: '101', floor: 1, building: 'Building A', type: 'Studio', rent_amount: 5000, bedrooms: 0, bathrooms: 1, area_sqft: 250 },
      { unit_number: '102', floor: 1, building: 'Building A', type: '1BR', rent_amount: 7000, bedrooms: 1, bathrooms: 1, area_sqft: 350 },
      { unit_number: '201', floor: 2, building: 'Building A', type: '2BR', rent_amount: 10000, bedrooms: 2, bathrooms: 2, area_sqft: 500 },
      { unit_number: '202', floor: 2, building: 'Building A', type: '2BR', rent_amount: 10000, bedrooms: 2, bathrooms: 2, area_sqft: 500 },
      { unit_number: '301', floor: 3, building: 'Building A', type: '3BR', rent_amount: 15000, bedrooms: 3, bathrooms: 2, area_sqft: 750 },
    ];

    const unitIds = [];
    for (const unit of units) {
      const result = await client.query(
        `INSERT INTO units (unit_number, floor, building, type, rent_amount, bedrooms, bathrooms, area_sqft, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [unit.unit_number, unit.floor, unit.building, unit.type, unit.rent_amount, unit.bedrooms, unit.bathrooms, unit.area_sqft, 'available']
      );
      unitIds.push(result.rows[0].id);
    }

    const hashedPassword = await bcrypt.hash('password123', 10);

    const managerResult = await client.query(
      `INSERT INTO users (email, password, name, role, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      ['manager@ancheta.com', hashedPassword, 'John Manager', 'manager', '09123456789']
    );
    const managerId = managerResult.rows[0].id;

    const staffResult = await client.query(
      `INSERT INTO users (email, password, name, role, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      ['staff@ancheta.com', hashedPassword, 'Jane Staff', 'staff', '09123456790']
    );
    const staffId = staffResult.rows[0].id;

    const tenant1Result = await client.query(
      `INSERT INTO users (email, password, name, role, phone, address, unit_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      ['tenant@ancheta.com', hashedPassword, 'Maria Tenant', 'tenant', '09123456791', 'Unit 101, Building A, Ancheta Apartments', unitIds[0]]
    );
    const tenant1Id = tenant1Result.rows[0].id;

    await client.query('UPDATE units SET status = $1 WHERE id = $2', ['occupied', unitIds[0]]);

    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    const dueDate = nextMonth.toISOString().split('T')[0];

    await client.query(
      `INSERT INTO maintenance_requests (tenant_id, title, description, priority, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [tenant1Id, 'Leaky faucet', 'The kitchen faucet is leaking', 'medium', 'pending']
    );

    await client.query('COMMIT');
    console.log('✅ Seed data created successfully');
    console.log('\n📋 Default Login Credentials:');
    console.log('Manager: manager@ancheta.com / password123');
    console.log('Staff: staff@ancheta.com / password123');
    console.log('Tenant: tenant@ancheta.com / password123');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seed error:', error);
    throw error;
  } finally {
    client.release();
  }
};

seedData()
  .then(() => {
    console.log('\nSeed completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
