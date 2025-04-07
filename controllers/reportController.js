const Event = require('../models/Event');
const { Ticket, TicketType } = require('../models/Ticket');
const Payment = require('../models/Payment');
const { Referral } = require('../models/Referral');
const User = require('../models/User');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

module.exports = {
  // Get dashboard stats
  getDashboardStats: async (req, res) => {
    try {
      let stats = {};
      const userId = req.user.id;
      const now = new Date();
      
      if (req.user.role === 'super_admin') {
        // Admin dashboard stats
        const [
          totalEvents,
          activeEvents,
          totalUsers,
          totalTickets,
          totalRevenue
        ] = await Promise.all([
          Event.count(),
          Event.count({ where: { 
            status: { [Op.in]: ['upcoming', 'ongoing'] },
            startDate: { [Op.gte]: now }
          }}),
          User.count(),
          Ticket.count(),
          Payment.sum('amount', { where: { status: 'completed' } })
        ]);
        
        stats = {
          totalEvents,
          activeEvents,
          totalUsers,
          totalTickets,
          totalRevenue: totalRevenue || 0
        };
      } else if (req.user.role === 'organizer') {
        // Organizer dashboard stats
        const [
          myEvents,
          activeEvents,
          totalTickets,
          totalRevenue
        ] = await Promise.all([
          Event.count({ where: { organizerId: userId } }),
          Event.count({ where: { 
            organizerId: userId,
            status: { [Op.in]: ['upcoming', 'ongoing'] },
            startDate: { [Op.gte]: now }
          }}),
          Ticket.count({
            include: [{
              model: Event,
              where: { organizerId: userId }
            }]
          }),
          Payment.sum('amount', { 
            where: { status: 'completed' },
            include: [{
              model: Ticket,
              include: [{
                model: Event,
                where: { organizerId: userId }
              }]
            }]
          })
        ]);
        
        stats = {
          myEvents,
          activeEvents,
          totalTickets,
          totalRevenue: totalRevenue || 0
        };
      } else {
        // Attendee dashboard stats
        const [
          myTickets,
          upcomingEvents,
          totalSpent,
          referralEarnings
        ] = await Promise.all([
          Ticket.count({ where: { userId } }),
          Ticket.count({ 
            where: { 
              userId,
              status: { [Op.ne]: 'cancelled' }
            },
            include: [{
              model: Event,
              where: { 
                startDate: { [Op.gte]: now }
              }
            }]
          }),
          Payment.sum('amount', { where: { userId, status: 'completed' } }),
          Referral.sum('commissionAmount', { 
            where: { 
              referrerId: userId,
              status: 'completed'
            }
          })
        ]);
        
        stats = {
          myTickets,
          upcomingEvents,
          totalSpent: totalSpent || 0,
          referralEarnings: referralEarnings || 0
        };
      }

      res.json(stats);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      res.status(500).json({ error: 'Error fetching dashboard statistics' });
    }
  },

  // Get sales report
  getSalesReport: async (req, res) => {
    try {
      const { startDate, endDate, eventId } = req.query;
      let whereClause = {};
      
      // Filter by date range if provided
      if (startDate && endDate) {
        whereClause.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }
      
      // Filter by status
      whereClause.status = 'completed';
      
      // If user is an organizer, only show their events
      const eventFilter = {};
      if (req.user.role === 'organizer') {
        eventFilter.organizerId = req.user.id;
      }
      
      // Filter by specific event if provided
      if (eventId) {
        eventFilter.id = eventId;
      }
      
      // Query payments
      const payments = await Payment.findAll({
        where: whereClause,
        include: [
          {
            model: Ticket,
            include: [
              {
                model: Event,
                where: eventFilter,
                attributes: ['id', 'title', 'organizerId']
              },
              {
                model: TicketType,
                attributes: ['name', 'type', 'price']
              },
              {
                model: User,
                as: 'attendee',
                attributes: ['id', 'name', 'email']
              }
            ]
          },
          {
            model: User,
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      // Calculate totals
      const totalRevenue = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
      const ticketCount = payments.length;
      
      // Group by event
      const eventSales = {};
      payments.forEach(payment => {
        const eventId = payment.ticket?.event?.id;
        if (eventId) {
          if (!eventSales[eventId]) {
            eventSales[eventId] = {
              eventId,
              eventTitle: payment.ticket.event.title,
              count: 0,
              revenue: 0
            };
          }
          eventSales[eventId].count++;
          eventSales[eventId].revenue += parseFloat(payment.amount);
        }
      });
      
      res.render('reports/sales', {
        title: 'Sales Report',
        payments,
        totalRevenue,
        ticketCount,
        eventSales: Object.values(eventSales),
        query: {
          startDate,
          endDate,
          eventId
        }
      });
    } catch (err) {
      console.error('Error generating sales report:', err);
      req.flash('error_msg', 'Error generating sales report');
      res.redirect('/dashboard');
    }
  },

  // Get referral report
  getReferralReport: async (req, res) => {
    try {
      let whereClause = {};
      
      // If user is not an admin, only show their referrals
      if (req.user.role !== 'super_admin') {
        whereClause.referrerId = req.user.id;
      }
      
      // Query referrals with related data
      const referrals = await Referral.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'referrer',
            attributes: ['id', 'name', 'email', 'referralCode']
          },
          {
            model: User,
            as: 'referredUser',
            attributes: ['id', 'name', 'email', 'createdAt']
          },
          {
            model: Ticket,
            include: [
              {
                model: Event,
                attributes: ['id', 'title', 'organizerId']
              }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      // Calculate totals
      const totalCommission = referrals.reduce((sum, ref) => {
        return sum + (ref.status === 'completed' ? parseFloat(ref.commissionAmount) : 0);
      }, 0);
      
      const pendingCommission = referrals.reduce((sum, ref) => {
        return sum + (ref.status === 'pending' ? parseFloat(ref.commissionAmount) : 0);
      }, 0);
      
      // Group by referrer if admin
      let referrerStats = [];
      if (req.user.role === 'super_admin') {
        const referrerMap = {};
        referrals.forEach(ref => {
          const referrerId = ref.referrerId;
          if (!referrerMap[referrerId]) {
            referrerMap[referrerId] = {
              referrerId,
              referrerName: ref.referrer.name,
              referrerEmail: ref.referrer.email,
              count: 0,
              completedCount: 0,
              totalCommission: 0,
              pendingCommission: 0
            };
          }
          referrerMap[referrerId].count++;
          if (ref.status === 'completed') {
            referrerMap[referrerId].completedCount++;
            referrerMap[referrerId].totalCommission += parseFloat(ref.commissionAmount);
          } else if (ref.status === 'pending') {
            referrerMap[referrerId].pendingCommission += parseFloat(ref.commissionAmount);
          }
        });
        referrerStats = Object.values(referrerMap);
      }
      
      res.render('reports/referrals', {
        title: 'Referral Report',
        referrals,
        totalCommission,
        pendingCommission,
        referralCount: referrals.length,
        referrerStats,
        isAdmin: req.user.role === 'super_admin'
      });
    } catch (err) {
      console.error('Error generating referral report:', err);
      req.flash('error_msg', 'Error generating referral report');
      res.redirect('/dashboard');
    }
  },

  // Get check-in report
  getCheckInReport: async (req, res) => {
    try {
      const { eventId } = req.params;
      
      // Verify event and access rights
      const event = await Event.findByPk(eventId);
      
      if (!event) {
        req.flash('error_msg', 'Event not found');
        return res.redirect('/dashboard');
      }
      
      if (req.user.role !== 'super_admin' && event.organizerId !== req.user.id) {
        req.flash('error_msg', 'You do not have permission to view this report');
        return res.redirect('/dashboard');
      }
      
      // Query check-ins
      const CheckIn = require('../models/CheckIn');
      const checkIns = await CheckIn.findAll({
        where: { eventId },
        include: [
          {
            model: Ticket,
            include: [
              {
                model: TicketType,
                attributes: ['name', 'type']
              }
            ]
          },
          {
            model: User,
            as: 'attendee',
            attributes: ['id', 'name', 'email', 'phone']
          },
          {
            model: User,
            as: 'staff',
            attributes: ['id', 'name']
          }
        ],
        order: [['checkInTime', 'DESC']]
      });
      
      // Get ticket stats
      const [totalTickets, checkedInCount] = await Promise.all([
        Ticket.count({
          where: { 
            eventId,
            status: { [Op.in]: ['confirmed', 'used'] }
          }
        }),
        Ticket.count({
          where: { 
            eventId,
            isCheckedIn: true
          }
        })
      ]);
      
      // Group by hour for check-in rate chart
      const hourlyCheckIns = {};
      checkIns.forEach(checkIn => {
        const hour = new Date(checkIn.checkInTime).getHours();
        if (!hourlyCheckIns[hour]) {
          hourlyCheckIns[hour] = 0;
        }
        hourlyCheckIns[hour]++;
      });
      
      const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        count: hourlyCheckIns[i] || 0
      }));
      
      res.render('reports/check-ins', {
        title: 'Check-In Report',
        event,
        checkIns,
        totalTickets,
        checkedInCount,
        checkInRate: totalTickets ? (checkedInCount / totalTickets * 100).toFixed(1) : 0,
        hourlyData
      });
    } catch (err) {
      console.error('Error generating check-in report:', err);
      req.flash('error_msg', 'Error generating check-in report');
      res.redirect('/dashboard');
    }
  }
};