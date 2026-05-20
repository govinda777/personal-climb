import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia' as any,
});

export class StripeService {
  /**
   * Creates a Stripe Billing Portal session for a customer to manage their subscription.
   * @param customerId The Stripe Customer ID
   * @param returnUrl The URL to return the customer to after they exit the portal
   * @returns The URL for the billing portal session
   */
  async createBillingPortalSession(customerId: string, returnUrl: string): Promise<string> {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return session.url;
    } catch (error) {
      console.error('Error creating Stripe Billing Portal session:', error);
      throw error;
    }
  }
}
