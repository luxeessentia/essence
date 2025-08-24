// Basic UI behavior and carousels. Replace your Stripe publishable key before enabling payments.
document.querySelectorAll('.hamburger').forEach(h=>{
  h.addEventListener('click', ()=> {
    const sb = document.querySelector('.sidebar');
    if(sb) sb.classList.toggle('active');
  });
});

// set year
document.querySelectorAll('#year, #year2, #year3').forEach(el=>{ if(el) el.textContent = new Date().getFullYear(); });

// HERO slider
(function(){
  const track = document.querySelector('.hero-track');
  if(!track) return;
  const slides = track.children;
  let idx = 0;
  function show(i){ track.style.transform = 	ranslateX(-%); }
  let timer = setInterval(()=>{ idx = (idx+1)%slides.length; show(idx); }, 4500);
  const prev = document.getElementById('heroPrev');
  const next = document.getElementById('heroNext');
  if(prev) prev.addEventListener('click', ()=>{ idx = (idx-1+slides.length)%slides.length; show(idx); clearInterval(timer); timer = setInterval(()=>{ idx=(idx+1)%slides.length; show(idx); },4500); });
  if(next) next.addEventListener('click', ()=>{ idx=(idx+1)%slides.length; show(idx); clearInterval(timer); timer = setInterval(()=>{ idx=(idx+1)%slides.length; show(idx); },4500); });
})();

// One-item carousels
(function(){
  const carousels = document.querySelectorAll('.one-carousel');
  carousels.forEach(car => {
    const track = car.querySelector('.one-track');
    const items = track.children;
    let i = 0;
    function show(){ track.style.transform = 	ranslateX(-%); }
    // auto
    let t = setInterval(()=>{ i = (i+1)%items.length; show(); }, 4000);
    // arrows
    car.querySelectorAll('.arrow').forEach(btn=>{
      btn.addEventListener('click', (ev)=>{
        const action = btn.getAttribute('data-action');
        if(action === 'prev') i = (i-1+items.length)%items.length;
        else i = (i+1)%items.length;
        show();
        clearInterval(t);
        t = setInterval(()=>{ i = (i+1)%items.length; show(); }, 4000);
      });
    });
    // swipe
    let startX = 0;
    track.addEventListener('touchstart', e=> startX = e.touches[0].clientX);
    track.addEventListener('touchend', e=>{
      const dx = e.changedTouches[0].clientX - startX;
      if(Math.abs(dx) > 40){
        if(dx > 0) i = (i-1+items.length)%items.length; else i = (i+1)%items.length;
        show();
      }
    });
  });
})();

// Wishlist (localStorage)
const W_KEY = 'lx_wishlist';
function loadWishlist(){ try{ return JSON.parse(localStorage.getItem(W_KEY))||[] }catch(e){return []}}
function saveWishlist(arr){ localStorage.setItem(W_KEY, JSON.stringify(arr)) }

document.addEventListener('click', function(e){
  if(e.target.matches('.wishlist')){
    const card = e.target.closest('.product-card');
    if(!card) return;
    const sku = card.dataset.sku || card.querySelector('h3')?.textContent || card.dataset.id;
    let list = loadWishlist();
    if(list.includes(sku)){
      list = list.filter(x=>x!==sku); e.target.textContent = '♡';
    } else { list.push(sku); e.target.textContent = '♥'; }
    saveWishlist(list);
  }
  if(e.target.matches('.swatch')){
    const parent = e.target.closest('.swatches');
    parent.querySelectorAll('.swatch').forEach(s=>s.classList.remove('selected'));
    e.target.classList.add('selected');
  }
  if(e.target.matches('.buy-now')){
    const card = e.target.closest('.product-card');
    const price = card?.dataset.price || card?.dataset.sku || '0';
    const sku = card?.dataset.sku || '';
    const sw = card.querySelector('.swatch.selected');
    const color = sw ? sw.dataset.color : null;
    // Call serverless API to create Stripe session
    fetch('/api/create-checkout-session', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ priceId: price, sku, color })
    })
    .then(r=>r.json())
    .then(data=>{
      if(data.id){
        // Replace with your Stripe publishable key
        if(typeof Stripe === 'function'){
          const stripe = Stripe('pk_test_YOUR_PUBLISHABLE_KEY');
          stripe.redirectToCheckout({ sessionId: data.id });
        } else if(data.url){
          window.location = data.url;
        } else {
          alert('Checkout session created. Please integrate Stripe JS.');
        }
      } else {
        alert('Error creating checkout session');
      }
    }).catch(err=>{ console.error(err); alert('Checkout error'); });
  }
});

// Mark wishlist hearts on load
window.addEventListener('load', ()=>{
  const wl = loadWishlist();
  document.querySelectorAll('.product-card').forEach(card=>{
    const sku = card.dataset.sku || card.querySelector('h3')?.textContent;
    const heart = card.querySelector('.wishlist');
    if(sku && heart){
      if(wl.includes(sku)) heart.textContent = '♥'; else heart.textContent = '♡';
    }
  });
});

// Newsletter sample
const newsletterForm = document.getElementById('newsletterForm');
if(newsletterForm){
  newsletterForm.addEventListener('submit', e=>{
    e.preventDefault(); alert('Thanks! You signed up for the newsletter (demo).'); newsletterForm.reset();
  });
}
