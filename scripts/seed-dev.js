import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { sequelize } from '../src/db/sequelize.js';
import { initModels } from '../src/db/models/index.js';
import { env } from '../src/config/env.js';

(async () => {
  try {
    await sequelize.authenticate();
    await initModels();

    const hash = await bcrypt.hash(env.admin.pass, 10);
    await sequelize.models.User.create({
      tenantId: env.admin.tenant,
      email: env.admin.user,
      passwordHash: hash,
      role: 'owner',
      status: 'active'
    });

    console.log(`✓ Usuario seed: ${env.admin.user} / ${env.admin.pass} (tenantId=env.admin.tenant)`);
    process.exit(0);
  } catch (e) {
    console.error('Seed FAIL', e);
    process.exit(1);
  }
})();
