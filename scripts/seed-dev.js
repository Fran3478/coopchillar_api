import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { sequelize } from '../src/db/sequelize.js';
import { initModels, User } from '../src/db/index.js';

(async () => {
  try {
    await sequelize.authenticate();
    await initModels();

    const hash = await bcrypt.hash('123456', 10);
    await User.create({
      tenantId: 1,
      email: 'admin@demo.com',
      passwordHash: hash,
      role: 'owner',
      status: 'active'
    });

    console.log('✓ Usuario seed: admin@demo.com / 123456 (tenantId=1)');
    process.exit(0);
  } catch (e) {
    console.error('Seed FAIL', e);
    process.exit(1);
  }
})();
