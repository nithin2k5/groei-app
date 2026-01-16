const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  try {
    const filters = { ...req.query, user_id: req.user.id };
    const applications = await Application.findAll(filters);
    res.json(applications);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    if (application.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(application);
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { job_id, company_id, status, match_score, resume_url, cover_letter, notes } = req.body;

    if (!job_id || !company_id) {
      return res.status(400).json({ error: 'Job ID and Company ID are required' });
    }

    const existing = await Application.findByUserAndJob(req.user.id, job_id);
    if (existing) {
      return res.status(400).json({ error: 'Application already exists' });
    }

    const application = await Application.create({
      user_id: req.user.id,
      job_id,
      company_id,
      status,
      match_score,
      resume_url,
      cover_letter,
      notes
    });

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    if (application.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updated = await Application.update(req.params.id, req.body);
    res.json({ message: 'Application updated successfully', application: updated });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


