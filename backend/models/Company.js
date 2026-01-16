const pool = require('../config/database');

class Company {
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM companies WHERE 1=1';
    const params = [];

    if (filters.verified !== undefined) {
      query += ' AND verified = ?';
      params.push(filters.verified);
    }

    if (filters.featured !== undefined) {
      query += ' AND featured = ?';
      params.push(filters.featured);
    }

    if (filters.search) {
      query += ' AND (name LIKE ? OR industry LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM companies WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(data) {
    const {
      name, industry, location, size, employees, description, website,
      founded, rating, verified, featured, logo, email, phone
    } = data;

    const [result] = await pool.execute(
      `INSERT INTO companies (name, industry, location, size, employees, description, 
       website, founded, rating, verified, featured, logo, email, phone) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, industry, location, size, employees, description, website,
       founded, rating, verified, featured, logo, email, phone]
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
      `UPDATE companies SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id) {
    await pool.execute('DELETE FROM companies WHERE id = ?', [id]);
    return true;
  }
}

module.exports = Company;


