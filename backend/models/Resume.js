const pool = require('../config/database');

class Resume {
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM resumes WHERE 1=1';
    const params = [];

    if (filters.user_id) {
      query += ' AND user_id = ?';
      params.push(filters.user_id);
    }

    if (filters.is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(filters.is_active);
    }

    query += ' ORDER BY uploaded_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM resumes WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(data) {
    const { user_id, file_name, file_url, file_size, version, is_active } = data;

    const [result] = await pool.execute(
      `INSERT INTO resumes (user_id, file_name, file_url, file_size, version, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, file_name, file_url, file_size, version || 1, is_active !== undefined ? is_active : true]
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
      `UPDATE resumes SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id) {
    await pool.execute('DELETE FROM resumes WHERE id = ?', [id]);
    return true;
  }

  static async setActive(user_id, resume_id) {
    await pool.execute('UPDATE resumes SET is_active = FALSE WHERE user_id = ?', [user_id]);
    await pool.execute('UPDATE resumes SET is_active = TRUE WHERE id = ?', [resume_id]);
    return this.findById(resume_id);
  }
}

module.exports = Resume;


