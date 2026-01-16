const pool = require('../config/database');

class SavedJob {
  static async findAll(filters = {}) {
    let query = `SELECT sj.*, j.title as job_title, j.location as job_location,
                 j.type as job_type, j.salary_min, j.salary_max, j.salary_currency,
                 c.name as company_name, c.logo as company_logo
                 FROM saved_jobs sj
                 JOIN jobs j ON sj.job_id = j.id
                 JOIN companies c ON j.company_id = c.id
                 WHERE 1=1`;
    const params = [];

    if (filters.user_id) {
      query += ' AND sj.user_id = ?';
      params.push(filters.user_id);
    }

    query += ' ORDER BY sj.saved_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT sj.*, j.*, c.name as company_name, c.logo as company_logo
       FROM saved_jobs sj
       JOIN jobs j ON sj.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       WHERE sj.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async create(data) {
    const { user_id, job_id } = data;

    const [result] = await pool.execute(
      'INSERT INTO saved_jobs (user_id, job_id) VALUES (?, ?)',
      [user_id, job_id]
    );

    return this.findById(result.insertId);
  }

  static async delete(user_id, job_id) {
    await pool.execute('DELETE FROM saved_jobs WHERE user_id = ? AND job_id = ?', [user_id, job_id]);
    return true;
  }

  static async isSaved(user_id, job_id) {
    const [rows] = await pool.execute(
      'SELECT * FROM saved_jobs WHERE user_id = ? AND job_id = ?',
      [user_id, job_id]
    );
    return rows.length > 0;
  }
}

module.exports = SavedJob;


