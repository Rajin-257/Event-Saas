const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const transporter = require('../config/mail');
const logger = require('../utils/logger');

// Subscribe to newsletter
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if already subscribed
    const existingSubscriber = await NewsletterSubscriber.findOne({
      where: { email }
    });
    
    if (existingSubscriber) {
      if (!existingSubscriber.isActive) {
        existingSubscriber.isActive = true;
        await existingSubscriber.save();
        req.flash('success', 'Your subscription has been reactivated!');
      } else {
        req.flash('info', 'You are already subscribed to our newsletter');
      }
    } else {
      // Add new subscriber
      await NewsletterSubscriber.create({ email });
      
      // Send confirmation email
      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'Newsletter Subscription Confirmation',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Thank you for subscribing!</h2>
            <p>You have successfully subscribed to our newsletter. You'll now receive updates on our latest events and offers.</p>
            <p>If you didn't subscribe or want to unsubscribe, please <a href="${process.env.BASE_URL}/newsletter/unsubscribe?email=${encodeURIComponent(email)}">click here</a>.</p>
          </div>
        `
      });
      
      req.flash('success', 'Thank you for subscribing to our newsletter!');
    }
    
    // Redirect back
    if (req.headers.referer) {
      return res.redirect(req.headers.referer);
    } else {
      return res.redirect('/');
    }
  } catch (error) {
    logger.error('Newsletter subscription error', { error: error.message });
    req.flash('error', 'Failed to subscribe to newsletter');
    
    // Redirect back
    if (req.headers.referer) {
      return res.redirect(req.headers.referer);
    } else {
      return res.redirect('/');
    }
  }
};

// Unsubscribe from newsletter
exports.unsubscribe = async (req, res) => {
  try {
    const { email } = req.query;
    
    const subscriber = await NewsletterSubscriber.findOne({
      where: { email }
    });
    
    if (subscriber) {
      subscriber.isActive = false;
      await subscriber.save();
      
      res.render('public/unsubscribe', {
        title: 'Unsubscribed',
        message: 'You have been successfully unsubscribed from our newsletter.',
        user: req.user || null
      });
    } else {
      res.render('public/unsubscribe', {
        title: 'Unsubscribe',
        message: 'Email address not found in our subscription list.',
        user: req.user || null
      });
    }
  } catch (error) {
    logger.error('Newsletter unsubscribe error', { error: error.message });
    res.render('public/unsubscribe', {
      title: 'Unsubscribe Error',
      message: 'An error occurred while processing your unsubscribe request. Please try again later.',
      user: req.user || null
    });
  }
};