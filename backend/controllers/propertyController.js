const db = require('../config/db');

exports.getProperties = async (req, res) => {
  try {
    const { city, type, minRent, maxRent, gender, page = 1, limit = 12 } = req.query;
    let query = `SELECT p.*, u.name as provider_name, u.phone as provider_phone,
      (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
      (SELECT AVG(rating) FROM reviews WHERE property_id = p.id) as avg_rating,
      (SELECT COUNT(*) FROM reviews WHERE property_id = p.id) as review_count
      FROM properties p JOIN users u ON p.provider_id = u.id WHERE p.status = 'approved'`;
    const params = [];
    if (city) { query += ' AND p.city LIKE ?'; params.push(`%${city}%`); }
    if (type) { query += ' AND p.property_type = ?'; params.push(type); }
    if (minRent) { query += ' AND p.rent_amount >= ?'; params.push(minRent); }
    if (maxRent) { query += ' AND p.rent_amount <= ?'; params.push(maxRent); }
    if (gender) { query += ' AND p.gender_preference = ?'; params.push(gender); }
    query += ' ORDER BY p.created_at DESC';
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    const [rows] = await db.query(query, params);
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM properties p WHERE p.status = 'approved'${city ? ' AND p.city LIKE ?' : ''}`,
      city ? [`%${city}%`] : []
    );
    res.json({ success: true, data: rows, total: countResult[0].total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, u.name as provider_name, u.phone as provider_phone, u.email as provider_email, u.is_verified as provider_verified
       FROM properties p JOIN users u ON p.provider_id = u.id WHERE p.id = ? AND p.status = 'approved'`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Property not found' });
    const [images] = await db.query('SELECT * FROM property_images WHERE property_id = ?', [req.params.id]);
    const [amenities] = await db.query('SELECT amenity FROM property_amenities WHERE property_id = ?', [req.params.id]);
    const [reviews] = await db.query(
      'SELECT r.*, u.name as reviewer_name FROM reviews r JOIN users u ON r.reviewer_id = u.id WHERE r.property_id = ?',
      [req.params.id]
    );
    res.json({ success: true, data: { ...rows[0], images, amenities: amenities.map(a => a.amenity), reviews } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createProperty = async (req, res) => {
  try {
    const { title, description, address, city, area, rent_amount, property_type, floor_number, total_rooms, bathrooms, available_from, gender_preference, max_occupants, amenities } = req.body;
    const [result] = await db.query(
      `INSERT INTO properties (provider_id, title, description, address, city, area, rent_amount, property_type, floor_number, total_rooms, bathrooms, available_from, gender_preference, max_occupants)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, title, description, address, city, area, rent_amount, property_type, floor_number, total_rooms, bathrooms, available_from, gender_preference || 'any', max_occupants || 1]
    );
    const propId = result.insertId;
    if (req.files && req.files.length) {
      for (let i = 0; i < req.files.length; i++) {
        await db.query('INSERT INTO property_images (property_id, image_url, is_primary) VALUES (?, ?, ?)', [propId, `/uploads/${req.files[i].filename}`, i === 0 ? 1 : 0]);
      }
    }
    if (amenities) {
      const ams = Array.isArray(amenities) ? amenities : [amenities];
      for (const a of ams) await db.query('INSERT INTO property_amenities (property_id, amenity) VALUES (?, ?)', [propId, a]);
    }
    res.status(201).json({ success: true, message: 'Property submitted for approval', id: propId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT provider_id FROM properties WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Property not found' });
    if (rows[0].provider_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized' });
    const { title, description, address, city, area, rent_amount, property_type, available_from, gender_preference, max_occupants } = req.body;
    await db.query(
      `UPDATE properties SET title=?, description=?, address=?, city=?, area=?, rent_amount=?, property_type=?, available_from=?, gender_preference=?, max_occupants=?, status='pending' WHERE id=?`,
      [title, description, address, city, area, rent_amount, property_type, available_from, gender_preference, max_occupants, req.params.id]
    );
    res.json({ success: true, message: 'Property updated and resubmitted for approval' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT provider_id FROM properties WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Property not found' });
    if (rows[0].provider_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized' });
    await db.query('DELETE FROM properties WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Property deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyProperties = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
       (SELECT COUNT(*) FROM inquiries WHERE property_id = p.id) as inquiry_count
       FROM properties p WHERE p.provider_id = ? ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sendInquiry = async (req, res) => {
  try {
    const { message } = req.body;
    const [prop] = await db.query('SELECT provider_id FROM properties WHERE id = ?', [req.params.id]);
    if (!prop.length) return res.status(404).json({ success: false, message: 'Property not found' });
    await db.query('INSERT INTO inquiries (property_id, tenant_id, provider_id, message) VALUES (?, ?, ?, ?)', [req.params.id, req.user.id, prop[0].provider_id, message]);
    res.status(201).json({ success: true, message: 'Inquiry sent successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.saveProperty = async (req, res) => {
  try {
    await db.query('INSERT IGNORE INTO saved_properties (user_id, property_id) VALUES (?, ?)', [req.user.id, req.params.id]);
    res.json({ success: true, message: 'Property saved' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSavedProperties = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
       FROM saved_properties sp JOIN properties p ON sp.property_id = p.id WHERE sp.user_id = ? ORDER BY sp.saved_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
