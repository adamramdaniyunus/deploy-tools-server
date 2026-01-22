const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authGuard  = require('../middlewares/authGuard');

// Project CRUD
router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

// Actions
router.post('/:id/deploy', projectController.deployProject);
router.get('/:id/history', projectController.getHistoryDeploy);
router.post('/:id/terminal-check', projectController.getSystemInfo);
router.post('/:id/command', projectController.executeCommand);

module.exports = router;
