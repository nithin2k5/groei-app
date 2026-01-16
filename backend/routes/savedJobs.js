const express = require('express');
const router = express.Router();
const SavedJob = require('../models/SavedJob');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  try {
    const savedJobs = await SavedJob.findAll({ user_id: req.user.id });
    res.json(savedJobs);
  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { job_id } = req.body;

    if (!job_id) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    const isAlreadySaved = await SavedJob.isSaved(req.user.id, job_id);
    if (isAlreadySaved) {
      return res.status(400).json({ error: 'Job already saved' });
    }

    const savedJob = await SavedJob.create({
      user_id: req.user.id,
      job_id
    });

    res.status(201).json({ message: 'Job saved successfully', savedJob });
  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:job_id', authenticate, async (req, res) => {
  try {
    await SavedJob.delete(req.user.id, req.params.job_id);
    res.json({ message: 'Job removed from saved list' });
  } catch (error) {
    console.error('Delete saved job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/check/:job_id', authenticate, async (req, res) => {
  try {
    const isSaved = await SavedJob.isSaved(req.user.id, req.params.job_id);
    res.json({ isSaved });
  } catch (error) {
    console.error('Check saved job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


