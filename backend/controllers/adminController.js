const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
  try {
    const [[users]] = await db.query('SELECT COUNT(*) as count FROM users WHERE role != "admin"');
    const [[properties]] = await db.query('SELECT COUNT(*) as count FROM properties');
    const [[pendingProps]] = await db.query('SELECT COUNT(*) as count FROM properties WHERE status = "pending"');
    const [[jobs]] = await db.query('SELECT COUNT(*) as count FROM jobs');
    const [[pendingJobs]] = await db.query('SELECT COUNT(*) as count FROM jobs WHERE status = "pending"');
    const [[applications]] = await db.query('SELECT COUNT(*) as count FROM job_applications');
    const [[inquiries]] = await db.query('SELECT COUNT(*) as count FROM inquiries');
    res.json({ success: true, data: { users: users.count, properties: properties.count, pendingProperties: pendingProps.count, jobs: jobs.count, pendingJobs: pendingJobs.count, applications: applications.count, inquiries: inquiries.count } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { role, status, page = 1, limit = 20 } = req.query;
    let query = 'SELECT id, name, email, phone, role, is_verified, is_active, created_at FROM users WHERE role != "admin"';
    const params = [];
    if (role) { query += ' AND role = ?'; params.push(role); }
    if (status === 'active') { query += ' AND is_active = 1'; }
    if (status === 'inactive') { query += ' AND is_active = 0'; }
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), (page - 1) * Number(limit));
    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyUser = async (req, res) => {
  try {
    await db.query('UPDATE users SET is_verified = ? WHERE id = ?', [req.body.verified, req.params.id]);
    res.json({ success: true, message: `User ${req.body.verified ? 'verified' : 'unverified'} successfully` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT is_active FROM users WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'User not found' });
    const newStatus = !rows[0].is_active;
    await db.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, req.params.id]);
    res.json({ success: true, message: `User ${newStatus ? 'activated' : 'deactivated'} successfully` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPendingListings = async (req, res) => {
  try {
    const [properties] = await db.query(
      `SELECT p.*, u.name as provider_name, u.email as provider_email,
       (SELECT image_url FROM property_images WHERE property_id = p.id LIMIT 1) as image
       FROM properties p JOIN users u ON p.provider_id = u.id WHERE p.status = 'pending' ORDER BY p.created_at ASC`
    );
    const [jobs] = await db.query(
      `SELECT j.*, u.name as employer_name, u.email as employer_email
       FROM jobs j JOIN users u ON j.employer_id = u.id WHERE j.status = 'pending' ORDER BY j.created_at ASC`
    );
    res.json({ success: true, data: { properties, jobs } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePropertyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
    await db.query('UPDATE properties SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: `Property ${status} successfully` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
    await db.query('UPDATE jobs SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: `Job ${status} successfully` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteContent = async (req, res) => {
  try {
    const { type, id } = req.params;
    if (type === 'property') await db.query('DELETE FROM properties WHERE id = ?', [id]);
    else if (type === 'job') await db.query('DELETE FROM jobs WHERE id = ?', [id]);
    else return res.status(400).json({ success: false, message: 'Invalid type' });
    res.json({ success: true, message: 'Content deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllInquiries = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT i.*, p.title as property_title, t.name as tenant_name, pr.name as provider_name
       FROM inquiries i JOIN properties p ON i.property_id = p.id
       JOIN users t ON i.tenant_id = t.id JOIN users pr ON i.provider_id = pr.id ORDER BY i.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
