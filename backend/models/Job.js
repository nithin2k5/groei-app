const pool = require('../config/database');

class Job {
  static async findAll(filters = {}) {
    let query = `SELECT j.*, c.name as company_name, c.logo as company_logo, c.verified as company_verified
                 FROM jobs j
                 JOIN companies c ON j.company_id = c.id
                 WHERE 1=1`;
    const params = [];

    if (filters.status) {
      query += ' AND j.status = ?';
      params.push(filters.status);
    }

    if (filters.company_id) {
      query += ' AND j.company_id = ?';
      params.push(filters.company_id);
    }

    if (filters.type) {
      query += ' AND j.type = ?';
      params.push(filters.type);
    }

    if (filters.location) {
      query += ' AND j.location LIKE ?';
      params.push(`%${filters.location}%`);
    }

    if (filters.search) {
      query += ' AND MATCH(j.title, j.description, j.location) AGAINST(? IN NATURAL LANGUAGE MODE)';
      params.push(filters.search);
    }

    query += ' ORDER BY j.created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT j.*, c.name as company_name, c.logo as company_logo, c.verified as company_verified,
              c.location as company_location, c.website as company_website
       FROM jobs j
       JOIN companies c ON j.company_id = c.id
       WHERE j.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async create(data) {
    const {
      company_id, title, description, location, salary_min, salary_max,
      salary_currency, type, experience_level, skills_required, status, posted_by
    } = data;

    const [result] = await pool.execute(
      `INSERT INTO jobs (company_id, title, description, location, salary_min, salary_max,
       salary_currency, type, experience_level, skills_required, status, posted_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [company_id, title, description, location, salary_min, salary_max,
       salary_currency || 'INR', type || 'Full-time', experience_level,
       skills_required, status || 'active', posted_by]
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
      `UPDATE jobs SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id) {
    await pool.execute('DELETE FROM jobs WHERE id = ?', [id]);
    return true;
  }
}

module.exports = Job;


