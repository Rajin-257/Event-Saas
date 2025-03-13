/**
 * Payment service
 */
const db = require('../models');
const helpers = require('../utils/helpers');
const logger = require('../utils/logger');

// Models
const Payment = db.Payment;
const Ticket = db.Ticket;
const Transaction = db.Transaction;
const PaymentMethod = db.PaymentMethod;

class PaymentService {
  /**
   * Process a payment
   * @param {object} paymentData - Payment data
   * @returns {Promise<object>} - Payment result
   */
  async processPayment(paymentData) {
    const transaction = await db.sequelize.transaction();
    
    try {
      // Get ticket information
      const ticket = await Ticket.findByPk(paymentData.ticket_id);
      
      if (!ticket) {
        throw new Error('Ticket not found');
      }
      
      // Check if payment amount matches ticket amount
      if (parseFloat(paymentData.amount) !== parseFloat(ticket.total_amount)) {
        throw new Error('Payment amount does not match ticket amount');
      }
      
      // Create payment record
      const payment = await Payment.create({
        ticket_id: paymentData.ticket_id,
        user_id: paymentData.user_id,
        payment_method_id: paymentData.payment_method_id,
        amount: paymentData.amount,
        status: 'completed',
        payment_date: new Date(),
        transaction_reference: paymentData.transaction_reference || this.generateTransactionReference(),
        payment_details: paymentData.payment_details || {},
      }, { transaction });
      
      // Update ticket payment status
      await ticket.update({
        payment_status: 'completed',
        status: 'confirmed'
      }, { transaction });
      
      // Create transaction record
      await Transaction.create({
        user_id: paymentData.user_id,
        related_id: payment.id,
        related_type: 'payment',
        amount: paymentData.amount,
        type: 'debit',
        description: `Payment for ticket #${ticket.ticket_code}`,
        reference: payment.transaction_reference
      }, { transaction });
      
      // Process referral commission if applicable
      if (ticket.referral_id) {
        await this.processReferralCommission(ticket, transaction);
      }
      
      // Commit transaction
      await transaction.commit();
      
      // Return payment details
      return payment;
    } catch (error) {
      // Rollback transaction
      await transaction.rollback();
      
      logger.error(`Error processing payment: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Process referral commission
   * @param {object} ticket - Ticket object
   * @param {object} transaction - Sequelize transaction
   * @returns {Promise<object>} - Commission result
   */
  async processReferralCommission(ticket, transaction) {
    try {
      // Get referral information
      const referral = await db.Referral.findByPk(ticket.referral_id);
      
      if (!referral) {
        throw new Error('Referral not found');
      }
      
      // Calculate commission (10% by default)
      const commissionRate = 0.1; // 10%
      const commissionAmount = parseFloat(ticket.total_amount) * commissionRate;
      
      // Create commission record
      const commission = await db.Commission.create({
        referral_id: referral.id,
        ticket_id: ticket.id,
        amount: commissionAmount,
        percentage: commissionRate * 100,
        status: 'pending'
      }, { transaction });
      
      // Create transaction record for commission
      await Transaction.create({
        user_id: referral.referrer_id,
        related_id: commission.id,
        related_type: 'commission',
        amount: commissionAmount,
        type: 'credit',
        description: `Commission for ticket #${ticket.ticket_code}`,
        reference: `COM-${commission.id}`
      }, { transaction });
      
      // Update referral status if this is the first use
      if (referral.status === 'active') {
        await referral.update({
          status: 'used',
          referred_id: ticket.user_id
        }, { transaction });
      }
      
      return commission;
    } catch (error) {
      logger.error(`Error processing referral commission: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Process a refund
   * @param {object} paymentData - Payment data
   * @param {string} reason - Refund reason
   * @returns {Promise<object>} - Refund result
   */
  async processRefund(paymentData, reason) {
    const transaction = await db.sequelize.transaction();
    
    try {
      // Get payment information
      const payment = await Payment.findByPk(paymentData.payment_id);
      
      if (!payment) {
        throw new Error('Payment not found');
      }
      
      // Check if payment is already refunded
      if (payment.status === 'refunded') {
        throw new Error('Payment has already been refunded');
      }
      
      // Get ticket information
      const ticket = await Ticket.findByPk(payment.ticket_id);
      
      if (!ticket) {
        throw new Error('Ticket not found');
      }
      
      // Update payment status
      await payment.update({
        status: 'refunded',
        refund_date: new Date(),
        refund_reason: reason
      }, { transaction });
      
      // Update ticket status
      await ticket.update({
        payment_status: 'refunded',
        status: 'cancelled'
      }, { transaction });
      
      // Create transaction record for refund
      await Transaction.create({
        user_id: payment.user_id,
        related_id: payment.id,
        related_type: 'refund',
        amount: payment.amount,
        type: 'credit',
        description: `Refund for ticket #${ticket.ticket_code}: ${reason}`,
        reference: `REF-${payment.id}`
      }, { transaction });
      
      // Cancel commission if applicable
      if (ticket.referral_id) {
        await this.cancelReferralCommission(ticket, transaction);
      }
      
      // Commit transaction
      await transaction.commit();
      
      // Return updated payment
      return payment;
    } catch (error) {
      // Rollback transaction
      await transaction.rollback();
      
      logger.error(`Error processing refund: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Cancel referral commission
   * @param {object} ticket - Ticket object
   * @param {object} transaction - Sequelize transaction
   * @returns {Promise<object>} - Result
   */
  async cancelReferralCommission(ticket, transaction) {
    try {
      // Find commission
      const commission = await db.Commission.findOne({
        where: {
          ticket_id: ticket.id
        },
        include: [{
          model: db.Referral
        }]
      });
      
      if (!commission) {
        return null;
      }
      
      // Update commission status
      await commission.update({
        status: 'cancelled'
      }, { transaction });
      
      // Create transaction record to reverse commission
      await Transaction.create({
        user_id: commission.Referral.referrer_id,
        related_id: commission.id,
        related_type: 'commission',
        amount: commission.amount,
        type: 'debit',
        description: `Commission reversed for ticket #${ticket.ticket_code}`,
        reference: `COMREV-${commission.id}`
      }, { transaction });
      
      return commission;
    } catch (error) {
      logger.error(`Error cancelling referral commission: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get available payment methods
   * @param {boolean} [activeOnly=true] - Only return active methods
   * @returns {Promise<Array>} - Payment methods
   */
  async getPaymentMethods(activeOnly = true) {
    try {
      const where = activeOnly ? { is_active: true } : {};
      
      return await PaymentMethod.findAll({
        where,
        order: [['name', 'ASC']]
      });
    } catch (error) {
      logger.error(`Error getting payment methods: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Generate a unique transaction reference
   * @returns {string} - Transaction reference
   */
  generateTransactionReference() {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TXN-${timestamp}-${random}`;
  }
}

// Export singleton instance
module.exports = new PaymentService();