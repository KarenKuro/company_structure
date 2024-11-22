import * as path from 'path';

import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

const envModeProduction: boolean = process.env.NODE_ENV === 'production';

const envFile = path.resolve(
  __dirname,
  envModeProduction ? '.env.production' : '.env.development',
);

dotenv.config({ path: envFile });

const dbConfig: PostgresConnectionOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [__dirname + '/**/**/entities/**.entity.ts'],
  migrationsTableName: 'app_migrations',
  migrations: [__dirname + '**/**/migrations/*.ts'],
  synchronize: true,
};

export const dataSource = new DataSource(dbConfig);
