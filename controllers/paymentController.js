const Payment = require('../models/Payment');
const { Ticket } = require('../models/Ticket');
const User = require('../models/User');
const Event = require('../models/Event');
const { Referral, CommissionPayout } = require('../models/Referral');
const { validationResult } = require('express-validator');
const sequelize = require('../config/db');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  // View payment history (admin/organizer)
  getPaymentHistory: async (req, res) => {
    try {
      let payments;
      
      if (req.user.role === 'super_admin') {
        // Admin sees all payments
        payments = await Payment.findAll({
          include: [
            {
              model: Ticket,
              include: [{ model: Event }]
            },
            {
              model: User,
              attributes: ['id', 'name', 'email']
            }
          ],
          order: [['createdAt', 'DESC']]
        });
      } else if (req.user.role === 'organizer') {
        // Organizer sees payments for their events
        payments = await Payment.findAll({
          include: [
            {
              model: Ticket,
              include: [
                { 
                  model: Event,
                  where: { organizerId: req.user.id }
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
      } else {
        // Regular users can only see their own payments
        payments = await Payment.findAll({
          where: { userId: req.user.id },
          include: [
            {
              model: Ticket,
              include: [{ model: Event }]
            }
          ],
          order: [['createdAt', 'DESC']]
        });
      }

      res.render('payments/history', {
        title: 'Payment History',
        payments
      });
    } catch (err) {
      console.error('Error fetching payment history:', err);
      req.flash('error_msg', 'Error loading payment history');
      res.redirect('/dashboard');
    }
  },

  // View invoice
  getInvoice: async (req, res) => {
    try {
      const invoiceNumber = req.params.invoiceNumber;
      
      const payment = await Payment.findOne({
        where: { invoiceNumber },
        include: [
          {
            model: Ticket,
            include: [
              { model: Event },
              { model: User, as: 'attendee', attributes: ['name', 'email'] }
            ]
          },
          {
            model: User,
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      if (!payment) {
        req.flash('error_msg', 'Invoice not found');
        return res.redirect('/payments/history');
      }

      // Regular users can only view their own invoices
      if (req.user.role === 'attendee' && payment.userId !== req.user.id) {
        req.flash('error_msg', 'You do not have permission to view this invoice');
        return res.redirect('/payments/history');
      }

      // Organizers can only view invoices for their events
      if (req.user.role === 'organizer' && payment.ticket?.event?.organizerId !== req.user.id) {
        req.flash('error_msg', 'You do not have permission to view this invoice');
        return res.redirect('/payments/history');
      }

      res.render('payments/invoice', {
        title: 'Invoice',
        payment
      });
    } catch (err) {
      console.error('Error fetching invoice:', err);
      req.flash('error_msg', 'Error loading invoice');
      res.redirect('/payments/history');
    }
  },

  // Mark manual payment as completed (admin/organizer)
  confirmManualPayment: async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
      const paymentId = req.params.id;
      
      const payment = await Payment.findByPk(paymentId, {
        include: [
          {
            model: Ticket,
            include: [{ model: Event }]
          }
        ],
        transaction
      });

      if (!payment) {
        await transaction.rollback();
        req.flash('error_msg', 'Payment not found');
        return res.redirect('/payments/history');
      }

      // Only admin or event organizer can confirm payments
      if (req.user.role !== 'super_admin' && payment.ticket?.event?.organizerId !== req.user.id) {
        await transaction.rollback();
        req.flash('error_msg', 'You do not have permission to confirm this payment');
        return res.redirect('/payments/history');
      }

      // Update payment status
      await payment.update({
        status: 'completed',
        paymentDate: new Date()
      }, { transaction });

      // Update ticket status
      await Ticket.update({
        status: 'confirmed',
        paymentStatus: 'completed'
      }, {
        where: { id: payment.ticketId },
        transaction
      });

      // Handle referral commission if applicable
      const ticket = await Ticket.findByPk(payment.ticketId, { transaction });
      
      if (ticket && ticket.referrerId) {
        // Get referral record
        const referral = await Referral.findOne({
          where: {
            ticketId: ticket.id,
            referrerId: ticket.referrerId
          },
          transaction
        });
        
        if (referral) {
          // Mark referral as completed
          await referral.update({
            status: 'completed',
            completedAt: new Date()
          }, { transaction });
          
          // Add commission to referrer's wallet
          const referrer = await User.findByPk(ticket.referrerId, { transaction });
          await referrer.update({
            walletBalance: parseFloat(referrer.walletBalance) + parseFloat(referral.commissionAmount)
          }, { transaction });
        }
      }

      await transaction.commit();

      req.flash('success_msg', 'Payment confirmed successfully');
      res.redirect('/payments/history');
    } catch (err) {
      await transaction.rollback();
      console.error('Error confirming payment:', err);
      req.flash('error_msg', 'Error confirming payment');
      res.redirect('/payments/history');
    }
  },

  // Process refund
  processRefund: async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
      const paymentId = req.params.id;
      const { refundReason, refundAmount } = req.body;
      
      const payment = await Payment.findByPk(paymentId, {
        include: [
          {
            model: Ticket,
            include: [{ model: Event }]
          }
        ],
        transaction
      });

      if (!payment) {
        await transaction.rollback();
        req.flash('error_msg', 'Payment not found');
        return res.redirect('/payments/history');
      }

      // Only admin or event organizer can process refunds
      if (req.user.role !== 'super_admin' && payment.ticket?.event?.organizerId !== req.user.id) {
        await transaction.rollback();
        req.flash('error_msg', 'You do not have permission to process refunds');
        return res.redirect('/payments/history');
      }

      // Validate refund amount
      const maxRefundAmount = payment.amount;
      const refundAmountValue = parseFloat(refundAmount);
      
      if (isNaN(refundAmountValue) || refundAmountValue <= 0 || refundAmountValue > maxRefundAmount) {
        await transaction.rollback();
        req.flash('error_msg', 'Invalid refund amount');
        return res.redirect(`/payments/${paymentId}/refund`);
      }

      // Update payment status
      await payment.update({
        status: 'refunded',
        refundAmount: refundAmountValue,
        refundDate: new Date(),
        refundReason
      }, { transaction });

      // Update ticket status
      await Ticket.update({
        status: 'refunded',
        paymentStatus: 'refunded'
      }, {
        where: { id: payment.ticketId },
        transaction
      });

      // Handle referral commission refund if applicable
      const ticket = await Ticket.findByPk(payment.ticketId, { transaction });
      
      if (ticket && ticket.referrerId) {
        // Get referral record
        const referral = await Referral.findOne({
          where: {
            ticketId: ticket.id,
            referrerId: ticket.referrerId
          },
          transaction
        });
        
        if (referral && referral.status === 'completed') {
          // Calculate refund proportion
          const refundProportion = refundAmountValue / payment.amount;
          const commissionRefund = referral.commissionAmount * refundProportion;
          
          // Deduct commission from referrer's wallet
          const referrer = await User.findByPk(ticket.referrerId, { transaction });
          const newBalance = Math.max(0, parseFloat(referrer.walletBalance) - commissionRefund);
          
          await referrer.update({
            walletBalance: newBalance
          }, { transaction });
          
          // Update referral status
          await referral.update({
            status: 'cancelled'
          }, { transaction });
        }
      }

      await transaction.commit();

      req.flash('success_msg', 'Refund processed successfully');
      res.redirect('/payments/history');
    } catch (err) {
      await transaction.rollback();
      console.error('Error processing refund:', err);
      req.flash('error_msg', 'Error processing refund');
      res.redirect('/payments/history');
    }
  },

  // Get wallet and transactions for logged in user
  getUserWallet: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id);
      
      // Get referrals for user
      const referrals = await Referral.findAll({
        where: { referrerId: req.user.id },
        include: [
          {
            model: Ticket,
            include: [
              { model: Event, attributes: ['title'] },
              { model: User, as: 'attendee', attributes: ['name', 'email'] }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Get commission payouts
      const payouts = await CommissionPayout.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']]
      });

      res.render('payments/wallet', {
        title: 'My Wallet',
        user,
        referrals,
        payouts,
        walletBalance: user.walletBalance
      });
    } catch (err) {
      console.error('Error fetching wallet:', err);
      req.flash('error_msg', 'Error loading wallet information');
      res.redirect('/dashboard');
    }
  },

  // Request commission payout
  requestPayout: async (req, res) => {
    try {
      const { amount, paymentMethod, accountDetails } = req.body;
      
      // Get user
      const user = await User.findByPk(req.user.id);
      
      if (!user) {
        req.flash('error_msg', 'User not found');
        return res.redirect('/payments/wallet');
      }

      // Validate amount
      const requestedAmount = parseFloat(amount);
      
      if (isNaN(requestedAmount) || requestedAmount <= 0 || requestedAmount > user.walletBalance) {
        req.flash('error_msg', 'Invalid payout amount');
        return res.redirect('/payments/wallet');
      }

      // Create payout request
      await CommissionPayout.create({
        userId: user.id,
        amount: requestedAmount,
        paymentMethod,
        status: 'pending',
        notes: accountDetails,
        requestedAt: new Date()
      });

      // Update wallet balance
      await user.update({
        walletBalance: parseFloat(user.walletBalance) - requestedAmount
      });

      req.flash('success_msg', 'Payout request submitted successfully');
      res.redirect('/payments/wallet');
    } catch (err) {
      console.error('Error requesting payout:', err);
      req.flash('error_msg', 'Error processing payout request');
      res.redirect('/payments/wallet');
    }
  },

  // Process payout requests (admin only)
  getPayoutRequests: async (req, res) => {
    try {
      // Get all pending payout requests
      const payouts = await CommissionPayout.findAll({
        where: { status: 'pending' },
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['requestedAt', 'ASC']]
      });

      res.render('admin/payouts', {
        title: 'Payout Requests',
        payouts
      });
    } catch (err) {
      console.error('Error fetching payout requests:', err);
      req.flash('error_msg', 'Error loading payout requests');
      res.redirect('/admin/dashboard');
    }
  },

  // Process payout (admin only)
  processPayout: async (req, res) => {
    try {
      const payoutId = req.params.id;
      const { transactionId, notes } = req.body;
      
      const payout = await CommissionPayout.findByPk(payoutId, {
        include: [{ model: User }]
      });

      if (!payout) {
        req.flash('error_msg', 'Payout request not found');
        return res.redirect('/admin/payouts');
      }

      // Update payout status
      await payout.update({
        status: 'processed',
        transactionId,
        notes: notes || payout.notes,
        processedAt: new Date()
      });

      req.flash('success_msg', 'Payout marked as processed');
      res.redirect('/admin/payouts');
    } catch (err) {
      console.error('Error processing payout:', err);
      req.flash('error_msg', 'Error processing payout request');
      res.redirect('/admin/payouts');
    }
  },

  // Get payment methods configuration
  getPaymentConfig: async (req, res) => {
    // This would typically fetch from a database table for payment settings
    // Simplified version here
    res.render('admin/payment-config', {
      title: 'Payment Configuration',
      config: {
        bkash: {
          enabled: true,
          merchantId: process.env.BKASH_MERCHANT_ID || '',
          apiKey: process.env.BKASH_APP_KEY || ''
        },
        nagad: {
          enabled: true,
          merchantId: process.env.NAGAD_MERCHANT_ID || ''
        },
        card: {
          enabled: true
        },
        manual: {
          enabled: true,
          instructions: 'Please transfer the amount to our bank account and provide transaction details.'
        }
      }
    });
  },

  // Update payment methods configuration (admin only)
  updatePaymentConfig: async (req, res) => {
    try {
      const { 
        bkashEnabled, bkashMerchantId, bkashApiKey,
        nagadEnabled, nagadMerchantId,
        cardEnabled,
        manualEnabled, manualInstructions
      } = req.body;

      // This would typically update a database table for payment settings
      // Simplified version - just update environment variables in memory
      // In a real app, this would persist to a database

      process.env.BKASH_ENABLED = bkashEnabled === 'on' ? 'true' : 'false';
      if (bkashMerchantId) process.env.BKASH_MERCHANT_ID = bkashMerchantId;
      if (bkashApiKey) process.env.BKASH_APP_KEY = bkashApiKey;

      process.env.NAGAD_ENABLED = nagadEnabled === 'on' ? 'true' : 'false';
      if (nagadMerchantId) process.env.NAGAD_MERCHANT_ID = nagadMerchantId;

      process.env.CARD_ENABLED = cardEnabled === 'on' ? 'true' : 'false';
      
      process.env.MANUAL_ENABLED = manualEnabled === 'on' ? 'true' : 'false';
      if (manualInstructions) process.env.MANUAL_INSTRUCTIONS = manualInstructions;

      req.flash('success_msg', 'Payment configuration updated successfully');
      res.redirect('/admin/payment-config');
    } catch (err) {
      console.error('Error updating payment config:', err);
      req.flash('error_msg', 'Error updating payment configuration');
      res.redirect('/admin/payment-config');
    }
  }
};