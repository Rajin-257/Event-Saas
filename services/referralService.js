/**
 * Referral service
 */
const db = require('../models');
const security = require('../utils/security');
const logger = require('../utils/logger');

// Models
const Referral = db.Referral;
const User = db.User;
const Event = db.Event;
const Commission = db.Commission;

class ReferralService {
  /**
   * Generate a referral code for a user
   * @param {number} userId - User ID
   * @param {number} [eventId=null] - Event ID (optional)
   * @returns {Promise<object>} - Referral object
   */
  async generateReferralCode(userId, eventId = null) {
    try {
      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Generate unique code
      const referralCode = this.generateUniqueCode();
      
      // Create referral record
      const referral = await Referral.create({
        referrer_id: userId,
        referral_code: referralCode,
        event_id: eventId,
        status: 'active'
      });
      
      return referral;
    } catch (error) {
      logger.error(`Error generating referral code: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get referral by code
   * @param {string} code - Referral code
   * @returns {Promise<object>} - Referral object
   */
  async getReferralByCode(code) {
    try {
      return await Referral.findOne({
        where: {
          referral_code: code,
          status: 'active'
        },
        include: [
          {
            model: User,
            as: 'Referrer',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: Event,
            attributes: ['id', 'title', 'start_date', 'end_date']
          }
        ]
      });
    } catch (error) {
      logger.error(`Error getting referral by code: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get user's referrals
   * @param {number} userId - User ID
   * @returns {Promise<Array>} - Referrals
   */
  async getUserReferrals(userId) {
    try {
      return await Referral.findAll({
        where: {
          referrer_id: userId
        },
        include: [
          {
            model: User,
            as: 'Referred',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: Event,
            attributes: ['id', 'title', 'start_date', 'end_date']
          },
          {
            model: Commission
          }
        ],
        order: [['created_at', 'DESC']]
      });
    } catch (error) {
      logger.error(`Error getting user referrals: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get referral statistics for a user
   * @param {number} userId - User ID
   * @returns {Promise<object>} - Statistics
   */
  async getReferralStats(userId) {
    try {
      // Get all user's referrals
      const referrals = await this.getUserReferrals(userId);
      
      // Calculate total commissions
      const commissions = referrals.reduce((acc, ref) => {
        return acc.concat(ref.Commissions || []);
      }, []);
      
      const totalCommissions = commissions.reduce((sum, commission) => {
        if (commission.status !== 'cancelled') {
          return sum + parseFloat(commission.amount);
        }
        return sum;
      }, 0);
      
      // Calculate statistics
      const stats = {
        totalReferrals: referrals.length,
        activeReferrals: referrals.filter(ref => ref.status === 'active').length,
        usedReferrals: referrals.filter(ref => ref.status === 'used').length,
        totalCommissions: totalCommissions,
        pendingCommissions: commissions.filter(com => com.status === 'pending').length,
        paidCommissions: commissions.filter(com => com.status === 'paid').length
      };
      
      return stats;
    } catch (error) {
      logger.error(`Error getting referral statistics: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Apply a referral to a ticket
   * @param {string} referralCode - Referral code
   * @param {object} ticketData - Ticket data
   * @returns {Promise<object>} - Updated ticket data
   */
  async applyReferral(referralCode, ticketData) {
    try {
      // Get referral
      const referral = await this.getReferralByCode(referralCode);
      
      if (!referral) {
        throw new Error('Referral code not found or inactive');
      }
      
      // Check if referral is for a specific event
      if (referral.event_id && referral.event_id !== ticketData.event_id) {
        throw new Error('Referral code is not valid for this event');
      }
      
      // Update ticket data with referral ID
      return {
        ...ticketData,
        referral_id: referral.id
      };
    } catch (error) {
      logger.error(`Error applying referral: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Generate a unique referral code
   * @param {number} [length=8] - Code length
   * @returns {string} - Unique code
   */
  generateUniqueCode(length = 8) {
    // Generate alphanumeric code
    return security.generateSecureString(length).toUpperCase();
  }
}

// Export singleton instance
module.exports = new ReferralService();