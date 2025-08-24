// api/create-checkout-session.js
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  try{
    const { priceId, sku, color } = req.body;
    let line_items = [];
    if(priceId && priceId.toString().match(/^\d+(\.\d+)?$/)){
      line_items = [{
        price_data: {
          currency: 'usd',
          product_data: { name: sku || 'Product' },
          unit_amount: Math.round(parseFloat(priceId) * 100)
        },
        quantity: 1
      }];
    } else {
      line_items = [{ price: priceId, quantity: 1 }];
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      shipping_address_collection: { allowed_countries: ['US'] },
      metadata: { sku: sku || '', color: color || '' },
      success_url: \\/success.html?session_id={CHECKOUT_SESSION_ID}\,
      cancel_url: \\/cancel.html\,
    });

    res.status(200).json({ id: session.id });
  }catch(err){
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}
