const pool = require('../config/database');

class Interview {
  static async findAll(filters = {}) {
    let query = `SELECT i.*, a.user_id, a.job_id, j.title as job_title,
                 c.name as company_name, c.logo as company_logo
                 FROM interviews i
                 JOIN applications a ON i.application_id = a.id
                 JOIN jobs j ON a.job_id = j.id
                 JOIN companies c ON a.company_id = c.id
                 WHERE 1=1`;
    const params = [];

    if (filters.application_id) {
      query += ' AND i.application_id = ?';
      params.push(filters.application_id);
    }

    if (filters.user_id) {
      query += ' AND a.user_id = ?';
      params.push(filters.user_id);
    }

    if (filters.status) {
      query += ' AND i.status = ?';
      params.push(filters.status);
    }

    query += ' ORDER BY i.scheduled_at ASC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT i.*, a.user_id, a.job_id, j.title as job_title,
              c.name as company_name, c.logo as company_logo
       FROM interviews i
       JOIN applications a ON i.application_id = a.id
       JOIN jobs j ON a.job_id = j.id
       JOIN companies c ON a.company_id = c.id
       WHERE i.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async create(data) {
    const {
      application_id, scheduled_at, type, location, meeting_link, notes, status
    } = data;

    const [result] = await pool.execute(
      `INSERT INTO interviews (application_id, scheduled_at, type, location, meeting_link, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [application_id, scheduled_at, type || 'Video', location, meeting_link, notes, status || 'scheduled']
    );

    return this.findById(result.insertId);
  }

  static async update(id, data) {
    const fields = [];
    const values = [];

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    });

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await pool.execute(
      `UPDATE interviews SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id) {
    await pool.execute('DELETE FROM interviews WHERE id = ?', [id]);
    return true;
  }
}

module.exports = Interview;


