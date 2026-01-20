const express = require('express');
const router = express.Router();
const { ListToolsProject } = require('../models');

/**
 * GET /api/tools
 * Get all available tools/frameworks
 */
router.get('/', async (req, res) => {
  try {
    const tools = await ListToolsProject.findAll({
      order: [['name', 'ASC']]
    });
    
    res.json({
      success: true,
      data: tools
    });
  } catch (error) {
    console.error('Error fetching tools:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/tools/:id
 * Get a specific tool by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const tool = await ListToolsProject.findByPk(req.params.id);
    
    if (!tool) {
      return res.status(404).json({
        success: false,
        error: 'Tool not found'
      });
    }
    
    res.json({
      success: true,
      data: tool
    });
  } catch (error) {
    console.error('Error fetching tool:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/tools
 * Create a new tool (admin only)
 */
router.post('/', async (req, res) => {
  try {
    const { name, version, buildCommand } = req.body;
    
    if (!name || !version || !buildCommand) {
      return res.status(400).json({
        success: false,
        error: 'Name, version, and buildCommand are required'
      });
    }
    
    const tool = await ListToolsProject.create({
      name,
      version,
      buildCommand
    });
    
    res.status(201).json({
      success: true,
      data: tool
    });
  } catch (error) {
    console.error('Error creating tool:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/tools/:id
 * Update a tool (admin only)
 */
router.put('/:id', async (req, res) => {
  try {
    const tool = await ListToolsProject.findByPk(req.params.id);
    
    if (!tool) {
      return res.status(404).json({
        success: false,
        error: 'Tool not found'
      });
    }
    
    const { name, version, buildCommand } = req.body;
    
    await tool.update({
      ...(name && { name }),
      ...(version && { version }),
      ...(buildCommand && { buildCommand })
    });
    
    res.json({
      success: true,
      data: tool
    });
  } catch (error) {
    console.error('Error updating tool:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/tools/:id
 * Delete a tool (admin only)
 */
router.delete('/:id', async (req, res) => {
  try {
    const tool = await ListToolsProject.findByPk(req.params.id);
    
    if (!tool) {
      return res.status(404).json({
        success: false,
        error: 'Tool not found'
      });
    }
    
    await tool.destroy();
    
    res.json({
      success: true,
      message: 'Tool deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tool:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
