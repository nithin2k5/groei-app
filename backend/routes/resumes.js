const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  try {
    const filters = { ...req.query, user_id: req.user.id };
    const resumes = await Resume.findAll(filters);
    res.json(resumes);
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    if (resume.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(resume);
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { file_name, file_url, file_size, version, is_active } = req.body;

    if (!file_name || !file_url) {
      return res.status(400).json({ error: 'File name and URL are required' });
    }

    const resume = await Resume.create({
      user_id: req.user.id,
      file_name,
      file_url,
      file_size,
      version,
      is_active
    });

    res.status(201).json({ message: 'Resume uploaded successfully', resume });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/active', authenticate, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    if (resume.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updated = await Resume.setActive(req.user.id, req.params.id);
    res.json({ message: 'Resume set as active', resume: updated });
  } catch (error) {
    console.error('Set active resume error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    if (resume.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Resume.delete(req.params.id);
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


