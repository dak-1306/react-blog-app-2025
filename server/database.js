import mysql from "mysql2/promise";

// Database configuration
const dbConfig = {
  host: "localhost",
  user: "root",
    password: "", // Để trống nếu dùng XAMPP
    database: "blog_app_e4",
  port: 3306,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Helper function to execute queries
export const executeQuery = async (query, params = []) => {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
};

// Test database connection
export const testDatabaseConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to MySQL database successfully");
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    throw error;
  }
};

export default pool;
