const express = require('express');
const router = express.Router();
const { Organization } = require('../models');

/**
 * GET /api/organizations
 * Get all organizations
 */
router.get('/', async (req, res) => {
  try {
    const organizations = await Organization.findAll({
      order: [['name', 'ASC']]
    });
    
    res.json({
      success: true,
      data: organizations
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/organizations/:id
 * Get a specific organization by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const organization = await Organization.findByPk(req.params.id, {
      include: ['members', 'projects']
    });
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }
    
    res.json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/organizations
 * Create a new organization
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
    
    const organization = await Organization.create({ name });
    
    res.status(201).json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/organizations/:id
 * Update an organization
 */
router.put('/:id', async (req, res) => {
  try {
    const organization = await Organization.findByPk(req.params.id);
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }
    
    const { name } = req.body;
    
    if (name) {
      await organization.update({ name });
    }
    
    res.json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/organizations/:id
 * Delete an organization
 */
router.delete('/:id', async (req, res) => {
  try {
    const organization = await Organization.findByPk(req.params.id);
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }
    
    await organization.destroy();
    
    res.json({
      success: true,
      message: 'Organization deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
