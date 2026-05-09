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

app.post("/users", async (req, res) => {
  try {
    const { name, email, password } = req.body;

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
    if (err.code === "23505") {
      return res.status(409).json({
        error: "Email already exists",
      });
    }

    res.status(500).json({
      error: "Failed to create user",
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

app.get("/job-applications", async (req, res) => {
  try {
    const result = await client.query(
      "SELECT * FROM job_applications"
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch job applications",
    });
  }
});
app.get("/job-applications/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await client.query(
      "SELECT * FROM job_applications WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Job application not found",
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch job application",
    });
  }
});
app.post("/job-applications", async (req, res) => {
  try {
    const {
      company_name,
      job_title,
      location,
      job_type,
      status,
      applied_date,
      job_link,
      notes,
    } = req.body;

    if (!company_name || !job_title || !status) {
      return res.status(400).json({
        error: "Company name, job title, and status are required",
      });
    }

    const result = await client.query(
      `INSERT INTO job_applications 
      (company_name, job_title, location, job_type, status, applied_date, job_link, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        company_name,
        job_title,
        location,
        job_type,
        status,
        applied_date,
        job_link,
        notes,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({
      error: "Failed to create job application",
    });
  }
});
app.put("/job-applications/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      company_name,
      job_title,
      location,
      job_type,
      status,
      applied_date,
      job_link,
      notes,
    } = req.body;

    const result = await client.query(
      `UPDATE job_applications
       SET company_name = $1,
           job_title = $2,
           location = $3,
           job_type = $4,
           status = $5,
           applied_date = $6,
           job_link = $7,
           notes = $8
       WHERE id = $9
       RETURNING *`,
      [
        company_name,
        job_title,
        location,
        job_type,
        status,
        applied_date,
        job_link,
        notes,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Job application not found",
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({
      error: "Failed to update job application",
    });
  }
});
app.delete("/job-applications/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await client.query(
      "DELETE FROM job_applications WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Job application not found",
      });
    }

    res.json({
      message: "Job application deleted successfully",
      deletedJobApplication: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to delete job application",
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});