const db = require('../config/db');

exports.getJobs = async (req, res) => {
  try {
    const { category, type, location, minSalary, page = 1, limit = 12 } = req.query;
    let query = `SELECT j.*, u.name as employer_name, u.is_verified as employer_verified
      FROM jobs j JOIN users u ON j.employer_id = u.id WHERE j.status = 'approved'`;
    const params = [];
    if (category) { query += ' AND j.category = ?'; params.push(category); }
    if (type) { query += ' AND j.job_type = ?'; params.push(type); }
    if (location) { query += ' AND j.location LIKE ?'; params.push(`%${location}%`); }
    if (minSalary) { query += ' AND j.salary_min >= ?'; params.push(minSalary); }
    query += ' ORDER BY j.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), (page - 1) * Number(limit));
    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT j.*, u.name as employer_name, u.email as employer_email, u.is_verified as employer_verified
       FROM jobs j JOIN users u ON j.employer_id = u.id WHERE j.id = ? AND j.status = 'approved'`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Job not found' });
    const [appCount] = await db.query('SELECT COUNT(*) as count FROM job_applications WHERE job_id = ?', [req.params.id]);
    res.json({ success: true, data: { ...rows[0], applications: appCount[0].count } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createJob = async (req, res) => {
  try {
    const { title, description, company_name, job_type, category, location, salary_min, salary_max, salary_type, hours_per_week, skills_required, experience_required, application_deadline } = req.body;
    const [result] = await db.query(
      `INSERT INTO jobs (employer_id, title, description, company_name, job_type, category, location, salary_min, salary_max, salary_type, hours_per_week, skills_required, experience_required, application_deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, title, description, company_name, job_type, category, location, salary_min, salary_max, salary_type, hours_per_week, skills_required, experience_required, application_deadline]
    );
    res.status(201).json({ success: true, message: 'Job submitted for approval', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.applyForJob = async (req, res) => {
  try {
    const { cover_letter } = req.body;
    const resume_url = req.file ? `/uploads/${req.file.filename}` : null;
    const [existing] = await db.query('SELECT id FROM job_applications WHERE job_id = ? AND applicant_id = ?', [req.params.id, req.user.id]);
    if (existing.length) return res.status(409).json({ success: false, message: 'Already applied for this job' });
    await db.query('INSERT INTO job_applications (job_id, applicant_id, cover_letter, resume_url) VALUES (?, ?, ?, ?)', [req.params.id, req.user.id, cover_letter, resume_url]);
    res.status(201).json({ success: true, message: 'Application submitted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ja.*, j.title, j.company_name, j.job_type, j.location, u.name as employer_name
       FROM job_applications ja JOIN jobs j ON ja.job_id = j.id JOIN users u ON j.employer_id = u.id
       WHERE ja.applicant_id = ? ORDER BY ja.applied_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyJobs = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT j.*, (SELECT COUNT(*) FROM job_applications WHERE job_id = j.id) as application_count
       FROM jobs j WHERE j.employer_id = ? ORDER BY j.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getJobApplications = async (req, res) => {
  try {
    const [job] = await db.query('SELECT employer_id FROM jobs WHERE id = ?', [req.params.id]);
    if (!job.length || job[0].employer_id !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
    const [rows] = await db.query(
      `SELECT ja.*, u.name as applicant_name, u.email as applicant_email, u.phone as applicant_phone
       FROM job_applications ja JOIN users u ON ja.applicant_id = u.id WHERE ja.job_id = ? ORDER BY ja.applied_at DESC`,
      [req.params.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE job_applications SET status = ? WHERE id = ?', [status, req.params.appId]);
    res.json({ success: true, message: 'Application status updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
