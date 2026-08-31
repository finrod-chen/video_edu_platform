import mysql from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var __mysqlPool: mysql.Pool | undefined;
}

function createPool() {
  const {
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_CONNECTION_LIMIT,
  } = process.env;

  if (!DB_HOST || !DB_USER || !DB_NAME) {
    throw new Error(
      "Missing MySQL connection env vars. Set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME (see .env.example)."
    );
  }

  return mysql.createPool({
    host: DB_HOST,
    port: DB_PORT ? Number(DB_PORT) : 3306,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: DB_CONNECTION_LIMIT ? Number(DB_CONNECTION_LIMIT) : 10,
    maxIdle: 5,
    idleTimeout: 60_000,
    dateStrings: true,
  });
}

// Lazy singleton: the pool is only created on first real use (first query),
// not at module import time. This matters because Next.js imports route/
// page modules during `next build` (page-data collection) even when no
// DB_* env vars are set yet (e.g. building a Docker image before the
// runtime .env is mounted) — eagerly connecting at import time would break
// the build. Reused across hot-reloads in dev via globalThis.
function getPool(): mysql.Pool {
  if (!global.__mysqlPool) {
    global.__mysqlPool = createPool();
  }
  return global.__mysqlPool;
}

export const db = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: (sql: string, params?: any[]) => getPool().query(sql, params),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: (sql: string, params?: any[]) => getPool().execute(sql, params),
  getConnection: () => getPool().getConnection(),
};
