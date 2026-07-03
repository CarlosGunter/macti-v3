import Database from "better-sqlite3";

export const initSQLite = () => {
  const dbPath = process.env.DATABASE_URL || "@/../data/auth.sqlite";

  return new Database(dbPath);
};
