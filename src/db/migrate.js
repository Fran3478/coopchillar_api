import 'dotenv/config';
import { Umzug, SequelizeStorage } from 'umzug';
import { sequelize } from './sequelize.js';

const migrator = new Umzug({
  migrations: { glob: 'src/db/migrations/*.js' },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize, modelName: 'migrations_meta' }),
  logger: console
});

const dir = process.argv[2];
if (!['up','down'].includes(dir)) {
  console.error('Usage: node src/db/migrate.js up|down');
  process.exit(1);
}
try {
  if (dir === 'up') await migrator.up();
  else await migrator.down();
  process.exit(0);
} catch (e) {
  console.error(e);
  process.exit(1);
}
