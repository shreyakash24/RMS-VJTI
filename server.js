import express from "express";
import { createServer as createViteServer } from "vite";
import pkg from "pg";
import dotenv from "dotenv";
import path from "path";
import multer from "multer";
import fs from "fs";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const generateName = (email) => {
  if (!email) return "User";
  return email
    .split("@")[0]
    .split(".")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
};


const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });


async function startServer() {
  const app = express();

  app.use(express.json());
  app.use("/uploads", express.static("uploads"));


  app.post("/api/users", async (req, res) => {
    const { email, password } = req.body;

    try {
      const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const user = result.rows[0];

      if (user.password === password) {
        res.json({
          success: true,
          user: { ...user, name: generateName(user.email) },
        });
      } else {
        res
          .status(401)
          .json({ success: false, message: "Invalid password" });
      }
    } catch (err) {
      console.error("Login error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });


  app.get("/api/achievements", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT a.*, u.email AS user_email, u.role AS user_role
        FROM achievements a
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY a.date DESC
      `);

      const data = result.rows.map((row) => ({
        ...row,
        user_name: generateName(row.user_email),
      }));

      res.json(data);
    } catch (err) {
      console.error("GET achievements error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/achievements", upload.single("file"), async (req, res) => {
    const { user_id, title, description, date, status } = req.body;
    const url = req.file ? `/uploads/${req.file.filename}` : null;

    try {
      await pool.query(
        `INSERT INTO achievements 
         (user_id, title, description, date, status, document_url)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user_id, title, description, date, status || "Pending", url]
      );

      res.json({ success: true });
    } catch (err) {
      console.error("POST achievements error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/achievement-approvals", async (req, res) => {
    const { achievement_id, approver_id, status, remarks, date } = req.body;

    try {
      await pool.query(
        `INSERT INTO achievement_approvals 
         (achievement_id, approver_id, status, remarks, date)
         VALUES ($1, $2, $3, $4, $5)`,
        [achievement_id, approver_id, status, remarks, date]
      );

      await pool.query(
        `UPDATE achievements SET status = $1 WHERE id = $2`,
        [status, achievement_id]
      );

      res.json({ success: true });
    } catch (err) {
      console.error("Achievement approval error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });


  app.get("/api/achievement-approvals/:achievement_id", async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT aa.*, u.email AS approver_email
         FROM achievement_approvals aa
         JOIN users u ON aa.approver_id = u.id
         WHERE aa.achievement_id = $1
         ORDER BY aa.date DESC`,
        [req.params.achievement_id]
      );

      res.json(result.rows);
    } catch (err) {
      console.error("GET achievement approvals error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });


  app.get("/api/reimbursements", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT r.*, u.email AS applicant_email, u.role AS applicant_role
        FROM reimbursements r
        LEFT JOIN users u ON r.user_id = u.id
        ORDER BY r.date DESC
      `);

      const apps = result.rows.map((row) => ({
        id: row.id,
        applicantName: generateName(row.applicant_email),
        applicantEmail: row.applicant_email || "unknown@vjti.ac.in",
        role: row.applicant_role || "Student",
        date: row.date,
        category: row.category,
        amount: parseFloat(row.amount) || 0,
        status: row.status,
        remarks: row.remarks,
        documentName: row.document_url,
      }));

      res.json(apps);
    } catch (err) {
      console.error("GET reimbursements error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });


  app.post("/api/reimbursements", upload.single("file"), async (req, res) => {
    const { id, user_id, category, amount, status, date } = req.body;
    const url = req.file ? `/uploads/${req.file.filename}` : null;

    try {
      await pool.query(
        `INSERT INTO reimbursements 
         (id, user_id, category, amount, status, date, document_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, user_id, category, amount, status, date, url]
      );

      res.json({ success: true });
    } catch (err) {
      console.error("POST reimbursements error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });


  app.put("/api/reimbursements/:id", async (req, res) => {
    try {
      await pool.query(
        "UPDATE reimbursements SET status = $1 WHERE id = $2",
        [req.body.status, req.params.id]
      );

      res.json({ success: true });
    } catch (err) {
      console.error("PUT reimbursements error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });


  app.get("/api/reimbursement-approvals", async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT * FROM reimbursement_approvals ORDER BY date DESC"
      );
      res.json(result.rows);
    } catch (err) {
      console.error("GET reimbursement approvals error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/reimbursement-approvals", async (req, res) => {
    const { reimbursement_id, approver_id, status, remarks, date } = req.body;

    try {
      await pool.query(
        `INSERT INTO reimbursement_approvals 
         (reimbursement_id, approver_id, status, remarks, date)
         VALUES ($1, $2, $3, $4, $5)`,
        [reimbursement_id, approver_id, status, remarks, date]
      );

      await pool.query(
        "UPDATE reimbursements SET remarks = $1 WHERE id = $2",
        [remarks, reimbursement_id]
      );

      res.json({ success: true });
    } catch (err) {
      console.error("POST reimbursement approvals error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });


  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) =>
      res.sendFile(path.join(distPath, "index.html"))
    );
  }

  app.listen(3000, "0.0.0.0", () => {
    console.log("🚀 Server running on http://localhost:3000");
  });
}

startServer();