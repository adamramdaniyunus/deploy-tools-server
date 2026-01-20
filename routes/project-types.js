const express = require('express');
const router = express.Router();
const { ListTypeProject } = require('../models');

/**
 * GET /api/project-types
 * Get all available project types
 */
router.get('/', async (req, res) => {
  try {
    const types = await ListTypeProject.findAll({
      order: [['name', 'ASC']]
    });
    
    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    console.error('Error fetching project types:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/project-types/:id
 * Get a specific project type by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const type = await ListTypeProject.findByPk(req.params.id);
    
    if (!type) {
      return res.status(404).json({
        success: false,
        error: 'Project type not found'
      });
    }
    
    res.json({
      success: true,
      data: type
    });
  } catch (error) {
    console.error('Error fetching project type:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/project-types
 * Create a new project type (admin only)
 */
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }
    
    const type = await ListTypeProject.create({ name });
    
    res.status(201).json({
      success: true,
      data: type
    });
  } catch (error) {
    console.error('Error creating project type:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/project-types/:id
 * Update a project type (admin only)
 */
router.put('/:id', async (req, res) => {
  try {
    const type = await ListTypeProject.findByPk(req.params.id);
    
    if (!type) {
      return res.status(404).json({
        success: false,
        error: 'Project type not found'
      });
    }
    
    const { name } = req.body;
    
    if (name) {
      await type.update({ name });
    }
    
    res.json({
      success: true,
      data: type
    });
  } catch (error) {
    console.error('Error updating project type:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/project-types/:id
 * Delete a project type (admin only)
 */
router.delete('/:id', async (req, res) => {
  try {
    const type = await ListTypeProject.findByPk(req.params.id);
    
    if (!type) {
      return res.status(404).json({
        success: false,
        error: 'Project type not found'
      });
    }
    
    await type.destroy();
    
    res.json({
      success: true,
      message: 'Project type deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project type:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
