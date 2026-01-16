const pool = require('../config/database');

class Application {
  static async findAll(filters = {}) {
    let query = `SELECT a.*, j.title as job_title, j.location as job_location,
                 c.name as company_name, c.logo as company_logo
                 FROM applications a
                 JOIN jobs j ON a.job_id = j.id
                 JOIN companies c ON a.company_id = c.id
                 WHERE 1=1`;
    const params = [];

    if (filters.user_id) {
      query += ' AND a.user_id = ?';
      params.push(filters.user_id);
    }

    if (filters.job_id) {
      query += ' AND a.job_id = ?';
      params.push(filters.job_id);
    }

    if (filters.company_id) {
      query += ' AND a.company_id = ?';
      params.push(filters.company_id);
    }

    if (filters.status) {
      query += ' AND a.status = ?';
      params.push(filters.status);
    }

    query += ' ORDER BY a.applied_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT a.*, j.title as job_title, j.location as job_location, j.description as job_description,
              c.name as company_name, c.logo as company_logo
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN companies c ON a.company_id = c.id
       WHERE a.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async create(data) {
    const {
      user_id, job_id, company_id, status, match_score,
      resume_url, cover_letter, notes, interview_date
    } = data;

    const [result] = await pool.execute(
      `INSERT INTO applications (user_id, job_id, company_id, status, match_score,
       resume_url, cover_letter, notes, interview_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, job_id, company_id, status || 'Application Sent', match_score || 0,
       resume_url, cover_letter, notes, interview_date]
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
      `UPDATE applications SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id) {
    await pool.execute('DELETE FROM applications WHERE id = ?', [id]);
    return true;
  }

  static async findByUserAndJob(user_id, job_id) {
    const [rows] = await pool.execute(
      'SELECT * FROM applications WHERE user_id = ? AND job_id = ?',
      [user_id, job_id]
    );
    return rows[0];
  }
}

module.exports = Application;


