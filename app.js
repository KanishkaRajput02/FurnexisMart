


// app.js — Vanilla JS interactivity & animations
document.addEventListener('DOMContentLoaded', () => {
  /* ---------- mobile menu ---------- */
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));

  /* ---------- HERO carousel (auto + controls) ---------- */
  const slides = Array.from(document.querySelectorAll('#heroCarousel .slide'));
  let slideIdx = 0;
  const showSlide = (i) => {
    slides.forEach((s, k) => {
      s.classList.toggle('hidden', k !== i);
      // subtle entrance animation
      if (k === i) {
        s.querySelectorAll('img, h3, p, button').forEach(el => {
          el.classList.add('opacity-0', 'translate-y-3');
          setTimeout(() => el.classList.remove('opacity-0','translate-y-3'), 60);
        });
      }
    });
  };
  showSlide(slideIdx);
  const nextSlide = () => { slideIdx = (slideIdx + 1) % slides.length; showSlide(slideIdx); };
  const prevSlide = () => { slideIdx = (slideIdx - 1 + slides.length) % slides.length; showSlide(slideIdx); };
  let heroTimer = setInterval(nextSlide, 5000);
  document.getElementById('heroNext').addEventListener('click', () => { nextSlide(); resetHeroTimer(); });
  document.getElementById('heroPrev').addEventListener('click', () => { prevSlide(); resetHeroTimer(); });
  function resetHeroTimer(){ clearInterval(heroTimer); heroTimer = setInterval(nextSlide, 5000); }

  /* ---------- testimonial slider ---------- */
  const testimonials = [
    {text: "Excellent quality and fast delivery — highly recommend!", author: "— Rohan"},
    {text: "Beautiful craftsmanship. Our living room looks amazing.", author: "— Meera"},
    {text: "Great customer service and packaging. Five stars!", author: "— Ankit"}
  ];
  let tIdx = 0;
  const testiText = document.getElementById('testiText');
  const testiAuthor = document.getElementById('testiAuthor');
  setInterval(() => {
    tIdx = (tIdx + 1) % testimonials.length;
    // fade out/in
    testiText.classList.add('opacity-0','translate-y-2');
    testiAuthor.classList.add('opacity-0','translate-y-2');
    setTimeout(() => {
      testiText.textContent = testimonials[tIdx].text;
      testiAuthor.textContent = testimonials[tIdx].author;
      testiText.classList.remove('opacity-0','translate-y-2');
      testiAuthor.classList.remove('opacity-0','translate-y-2');
    }, 400);
  }, 6000);

  /* ---------- CART state & UI ---------- */
  const cart = {}; // {id: {id,name,price,img,qty}}
  const cartCountEl = document.getElementById('cartCount');
  const cartBtn = document.getElementById('cartBtn');
  const cartModal = document.getElementById('cartModal');
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  const closeCart = document.getElementById('closeCart');
  const clearCartBtn = document.getElementById('clearCartBtn');
  const checkoutBtn = document.getElementById('checkoutBtn');

  function updateCartUI() {
    // count
    const totalQty = Object.values(cart).reduce((s, p) => s + p.qty, 0);
    cartCountEl.textContent = totalQty;
    // list
    cartItemsEl.innerHTML = '';
    let totalPrice = 0;
    Object.values(cart).forEach(p => {
      totalPrice += p.qty * p.price;
      const row = document.createElement('div');
      row.className = 'flex items-center gap-4 border-b pb-3';
      row.innerHTML = `
        <img src="${p.img}" class="w-16 h-12 object-cover rounded"/>
        <div class="flex-1">
          <div class="font-semibold">${p.name}</div>
          <div class="text-sm text-gray-500">₹${p.price} × ${p.qty}</div>
        </div>
        <div class="flex items-center gap-2">
          <button class="px-2 py-1 border rounded dec" data-id="${p.id}">-</button>
          <div>${p.qty}</div>
          <button class="px-2 py-1 border rounded inc" data-id="${p.id}">+</button>
        </div>
      `;
      cartItemsEl.appendChild(row);
    });
    cartTotalEl.textContent = `₹${totalPrice.toLocaleString()}`;
    // hooks for inc/dec
    cartItemsEl.querySelectorAll('.inc').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        cart[id].qty += 1; updateCartUI();
      });
    });
    cartItemsEl.querySelectorAll('.dec').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        cart[id].qty -= 1;
        if (cart[id].qty <= 0) delete cart[id];
        updateCartUI();
      });
    });
  }

  cartBtn.addEventListener('click', () => {
    cartModal.classList.remove('hidden');
    cartModal.classList.add('flex');
  });
  closeCart.addEventListener('click', () => { cartModal.classList.add('hidden'); cartModal.classList.remove('flex'); });
  clearCartBtn.addEventListener('click', () => { Object.keys(cart).forEach(k => delete cart[k]); updateCartUI(); });
  checkoutBtn.addEventListener('click', () => {
    if (Object.keys(cart).length === 0) alert('Your cart is empty.');
    else { alert('Checkout — Thank you!'); Object.keys(cart).forEach(k => delete cart[k]); updateCartUI(); cartModal.classList.add('hidden'); cartModal.classList.remove('flex'); }
  });

  /* ---------- add-to-cart animation: fly image to cart ---------- */
  const animLayer = document.getElementById('animLayer');
  function flyImageToCart(imgEl, onEnd) {
    const rect = imgEl.getBoundingClientRect();
    const cartRect = cartBtn.getBoundingClientRect();
    const clone = imgEl.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.left = `${rect.left}px`;
    clone.style.top = `${rect.top}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.transition = 'transform 700ms cubic-bezier(.2,.8,.2,1), opacity 700ms';
    clone.style.zIndex = 9999;
    animLayer.appendChild(clone);

    // compute translation
    const translateX = cartRect.left + cartRect.width/2 - (rect.left + rect.width/2);
    const translateY = cartRect.top + cartRect.height/2 - (rect.top + rect.height/2);

    // trigger transform
    requestAnimationFrame(() => {
      clone.style.transform = `translate(${translateX}px, ${translateY}px) scale(0.12) rotate(10deg)`;
      clone.style.opacity = '0.6';
    });

    setTimeout(() => {
      clone.remove();
      if (onEnd) onEnd();
    }, 800);
  }

  // attach add-to-cart handlers (buttons throughout the page)
  document.querySelectorAll('.addToCartBtn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const price = Number(btn.dataset.price || 0);
      const img = btn.dataset.img || (btn.closest('article') && btn.closest('article').querySelector('img')?.src) || '';

      // animate: find image element near button
      const imgEl = btn.closest('.slide') ? btn.closest('.slide').querySelector('img') : (btn.closest('article') && btn.closest('article').querySelector('img'));
      if (imgEl) {
        flyImageToCart(imgEl, () => {
          // update cart after animation
          if (!cart[id]) cart[id] = {id, name, price, img, qty:0};
          cart[id].qty += 1;
          updateCartUI();
        });
      } else {
        // fallback: just update cart
        if (!cart[id]) cart[id] = {id, name, price, img, qty:0};
        cart[id].qty += 1;
        updateCartUI();
      }
    });
  });

  /* ---------- newsletter validation ---------- */
  const newsletterForm = document.getElementById('newsletterForm');
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('newsletterEmail').value.trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      alert('Please enter a valid email.');
      return;
    }
    alert('Subscribed! Check your email for the coupon.');
    newsletterForm.reset();
  });

  /* ---------- small UX polish: highlight hero text gradient periodically ---------- */
  const heroHighlight = document.getElementById('heroHighlight');
  setInterval(() => {
    heroHighlight.classList.toggle('opacity-80');
    heroHighlight.classList.toggle('scale-105');
  }, 2200);

  /* ---------- accessible: close cart when clicking outside modal content ---------- */
  cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) { cartModal.classList.add('hidden'); cartModal.classList.remove('flex'); }
  });

  // initial cart UI
  updateCartUI();
});
