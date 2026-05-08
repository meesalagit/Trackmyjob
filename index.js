require("dotenv").config();

const express = require("express");
const { Client } = require("pg");

const app = express();

app.use(express.json());

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

client.connect()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.log("Database connection error", err);
  });

app.get("/", (req, res) => {
  res.send("TrackMyJob backend is running");
});

app.get("/users", async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM "Users"');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});
app.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await client.query(
      'SELECT * FROM "Users" WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch user",
    });
  }
});
app.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const result = await client.query(
      'UPDATE "Users" SET name = $1, email = $2, password = $3 WHERE id = $4 RETURNING *',
      [name, email, password, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({
      error: "Failed to update user",
    });
  }
});

app.post("/users", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    const result = await client.query(
      'INSERT INTO "Users" (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, password]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {

    // Duplicate email error
    if (err.code === "23505") {
      return res.status(409).json({
        error: "Email already exists",
      });
    }

    // General server error
    res.status(500).json({
      error: "Failed to create user",
    });
  }
});
app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await client.query(
      'DELETE FROM "Users" WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json({
      message: "User deleted successfully",
      deletedUser: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to delete user",
    });
  }
});

app.listen(5001, () => {
  console.log("Server is running on port 5001");
});