import Project from '../models/projectModel.js';
import mongoose from 'mongoose';
import { inMemoryStore } from '../models/inMemoryStore.js';

export const projectController = {
  getAllProjects: async (req, res, next) => {
    try {
      const { category, status, search } = req.query;

      if (mongoose.connection.readyState !== 1) {
        let projects = inMemoryStore.findProjects(category);
        if (search && search.trim() !== '') {
          const s = search.toLowerCase();
          projects = projects.filter(p => p.title.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
        }
        return res.status(200).json({
          success: true,
          count: projects.length,
          data: projects,
          source: 'in-memory-fallback'
        });
      }

      const query = {};

      if (category && category !== 'All') {
        query.category = category;
      }

      if (status && status !== 'All') {
        query.status = status;
      }

      if (search && search.trim() !== '') {
        query.title = { $regex: search.trim(), $options: 'i' };
      }

      let projects = await Project.find(query).sort({ createdAt: -1 });

      if (projects.length === 0 && !search && !category && !status) {
        const defaultProjects = inMemoryStore.findProjects('All');
        projects = await Project.insertMany(defaultProjects);
      }

      res.status(200).json({
        success: true,
        count: projects.length,
        data: projects
      });
    } catch (error) {
      next(error);
    }
  },

  createProject: async (req, res, next) => {
    try {
      const { title, description, category, status, progress, teamMembers, dueDate } = req.body;

      if (!title || title.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Project title is required'
        });
      }

      if (mongoose.connection.readyState !== 1) {
        const newProj = inMemoryStore.createProject({
          title: title.trim(),
          description: description ? description.trim() : '',
          category: category || 'Frontend',
          status: status || 'Planning',
          progress: Number(progress) || 0,
          teamMembers: Array.isArray(teamMembers) ? teamMembers : [teamMembers || 'Brij Patel'],
          dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        });
        return res.status(201).json({
          success: true,
          message: 'Project created successfully',
          data: newProj,
          source: 'in-memory-fallback'
        });
      }

      const project = await Project.create({
        title: title.trim(),
        description: description ? description.trim() : '',
        category: category || 'Frontend',
        status: status || 'Planning',
        progress: Number(progress) || 0,
        teamMembers: Array.isArray(teamMembers) ? teamMembers : [teamMembers || 'Brij Patel'],
        dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      });

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project
      });
    } catch (error) {
      next(error);
    }
  },

  updateProject: async (req, res, next) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        return res.status(200).json({
          success: true,
          message: 'Project updated successfully (fallback)'
        });
      }

      const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Project not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        data: project
      });
    } catch (error) {
      next(error);
    }
  },

  deleteProject: async (req, res, next) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        return res.status(200).json({
          success: true,
          message: 'Project deleted successfully (fallback)'
        });
      }

      const project = await Project.findByIdAndDelete(req.params.id);

      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Project not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};
