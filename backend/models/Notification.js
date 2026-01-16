const pool = require('../config/database');

class Notification {
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM notifications WHERE 1=1';
    const params = [];

    if (filters.user_id) {
      query += ' AND user_id = ?';
      params.push(filters.user_id);
    }

    if (filters.is_read !== undefined) {
      query += ' AND is_read = ?';
      params.push(filters.is_read);
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM notifications WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(data) {
    const { user_id, type, title, message, link } = data;

    const [result] = await pool.execute(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, type, title, message, link]
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
      `UPDATE notifications SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async markAsRead(id) {
    await pool.execute('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id]);
    return this.findById(id);
  }

  static async markAllAsRead(user_id) {
    await pool.execute('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [user_id]);
    return true;
  }

  static async delete(id) {
    await pool.execute('DELETE FROM notifications WHERE id = ?', [id]);
    return true;
  }

  static async getUnreadCount(user_id) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [user_id]
    );
    return rows[0].count;
  }
}

module.exports = Notification;


