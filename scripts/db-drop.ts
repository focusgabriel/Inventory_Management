import "dotenv/config";
import { Client } from "pg";

async function dropAllTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try{
    await client.connect();
    //  find all tables in the public schema

  const { rows } = await client.query(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public';
   `);

  if(rows.length === 0){
    console.log("No tables found");
    return;
  }

  // Drop every tables
  for(const {tablename} of rows) {
    console.log(`Dropping table: ${tablename}`)
  
  await client.query(
    `DROP TABLE IF EXISTS "${tablename}" CASCADE;`
  );
}
console.log("All tables dropped successfully");

} catch(error) {
  console.error(" Failed to drop tables", error);
  process.exit(1);
} finally {
  await client.end();
}
}

dropAllTables();