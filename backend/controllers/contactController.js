import Contact from '../models/contactModel.js';
import mongoose from 'mongoose';
import { inMemoryStore } from '../models/inMemoryStore.js';

export const contactController = {
  getAllMessages: async (req, res, next) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        const contacts = inMemoryStore.findContacts();
        return res.status(200).json({
          success: true,
          count: contacts.length,
          data: contacts,
          source: 'in-memory-fallback'
        });
      }

      let contacts = await Contact.find().sort({ createdAt: -1 });

      if (contacts.length === 0) {
        const defaultMessages = [
          {
            name: 'Dr. Faculty Reviewer',
            email: 'faculty@charusat.ac.in',
            subject: 'ITUE301 Capstone Review',
            category: 'Course Feedback',
            message: 'Excellent architecture combining Practicals 1 to 13 into a single coherent full-stack application.',
            status: 'Resolved'
          }
        ];
        contacts = await Contact.insertMany(defaultMessages);
      }

      res.status(200).json({
        success: true,
        count: contacts.length,
        data: contacts
      });
    } catch (error) {
      next(error);
    }
  },

  submitMessage: async (req, res, next) => {
    try {
      const { name, email, subject, category, message } = req.body;

      if (!name || !email || !message) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Name, email, and message are required fields.'
        });
      }

      if (mongoose.connection.readyState !== 1) {
        const saved = inMemoryStore.createContact({
          name,
          email,
          subject: subject || 'General Feedback',
          category: category || 'Course Feedback',
          message
        });
        return res.status(201).json({
          success: true,
          message: 'Thank you! Your message has been received.',
          data: saved,
          source: 'in-memory-fallback'
        });
      }

      const newContact = await Contact.create({
        name,
        email,
        subject: subject || 'General Feedback',
        category: category || 'Course Feedback',
        message
      });

      res.status(201).json({
        success: true,
        message: 'Thank you! Your message has been received.',
        data: newContact
      });
    } catch (error) {
      next(error);
    }
  }
};
