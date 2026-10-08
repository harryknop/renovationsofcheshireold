document.querySelectorAll('[data-slider]').forEach((slider) => {
  const track = slider.querySelector('.slider-track');
  const slides = Array.from(track.querySelectorAll('figure'));
  const current = slider.querySelector('.slider-current');
  const prev = slider.querySelector('.slider-prev');
  const next = slider.querySelector('.slider-next');
  if (!track || slides.length < 2) return;

  let timer;
  let paused = false;

  function currentIndex() {
    const left = track.scrollLeft;
    let index = 0;
    let best = Infinity;
    slides.forEach((slide, i) => {
      const d = Math.abs(slide.offsetLeft - left);
      if (d < best) { best = d; index = i; }
    });
    return index;
  }

  function update() {
    current.textContent = String(currentIndex() + 1).padStart(2, '0');
  }

  function goTo(index) {
    const target = slides[(index + slides.length) % slides.length];
    track.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
  }

  function advance() {
    if (!paused) goTo(currentIndex() + 1);
  }

  function start() {
    clearInterval(timer);
    timer = setInterval(advance, 3000);
  }

  function pause() {
    paused = true;
    clearInterval(timer);
  }

  function resume() {
    paused = false;
    start();
  }

  prev.addEventListener('click', () => { goTo(currentIndex() - 1); start(); });
  next.addEventListener('click', () => { goTo(currentIndex() + 1); start(); });
  track.addEventListener('scroll', update, { passive: true });
  track.addEventListener('mouseenter', pause);
  track.addEventListener('mouseleave', resume);
  track.addEventListener('touchstart', pause, { passive: true });
  track.addEventListener('touchend', resume, { passive: true });
  update();
  start();
});


// Client review carousel — automatically advances every 5 seconds.
document.querySelectorAll('[data-testimonials]').forEach((carousel) => {
  const reviews = Array.from(carousel.querySelectorAll('.testimonial'));
  const dots = Array.from(carousel.parentElement.querySelectorAll('.testimonial-dots button'));
  const prev = carousel.parentElement.querySelector('.testimonial-prev');
  const next = carousel.parentElement.querySelector('.testimonial-next');
  let index = 0;
  let timer;
  let paused = false;

  function show(nextIndex) {
    index = (nextIndex + reviews.length) % reviews.length;
    reviews.forEach((review, i) => review.classList.toggle('is-active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  }
  function start() { clearInterval(timer); timer = setInterval(() => { if (!paused) show(index + 1); }, 5000); }
  function pause() { paused = true; }
  function resume() { paused = false; start(); }

  prev.addEventListener('click', () => { show(index - 1); start(); });
  next.addEventListener('click', () => { show(index + 1); start(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); start(); }));
  carousel.addEventListener('mouseenter', pause);
  carousel.addEventListener('mouseleave', resume);
  carousel.addEventListener('touchstart', pause, {passive:true});
  carousel.addEventListener('touchend', resume, {passive:true});
  show(0);
  start();
});


(() => {
  const root = document.querySelector('[data-review-carousel]');
  if (!root) return;

  const track = root.querySelector('.reviews-track');
  const cards = [...root.querySelectorAll('.review-card')];
  const prev = document.querySelector('.reviews-prev');
  const next = document.querySelector('.reviews-next');
  const dotsWrap = document.querySelector('.reviews-dots');

  let index = 0;
  let timer;
  const gap = 20;

  function visibleCards() {
    return window.innerWidth >= 900 ? 3 : 1;
  }

  function cardWidth() {
    return cards[0] ? cards[0].getBoundingClientRect().width + gap : 0;
  }

  function maxIndex() {
    return Math.max(0, cards.length - visibleCards());
  }

  function buildDots() {
    if (!dotsWrap) return;
    const count = maxIndex() + 1;
    dotsWrap.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Show review position ${i + 1}`);
      dot.addEventListener('click', () => {
        index = i;
        render();
        start();
      });
      dotsWrap.appendChild(dot);
    }
  }

  function render() {
    index = Math.max(0, Math.min(index, maxIndex()));
    track.style.transform = `translateX(-${index * cardWidth()}px)`;
    [...(dotsWrap?.children || [])].forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  function go(delta) {
    const max = maxIndex();
    index += delta;
    if (index > max) index = 0;
    if (index < 0) index = max;
    render();
  }

  function start() {
    clearInterval(timer);
    timer = setInterval(() => go(1), 5000);
  }

  next?.addEventListener('click', () => { go(1); start(); });
  prev?.addEventListener('click', () => { go(-1); start(); });

  root.addEventListener('mouseenter', () => clearInterval(timer));
  root.addEventListener('mouseleave', start);
  root.addEventListener('touchstart', () => clearInterval(timer), { passive: true });
  root.addEventListener('touchend', start, { passive: true });

  function refresh() {
    buildDots();
    render();
  }

  window.addEventListener('resize', refresh);
  refresh();
  start();
})();


/* Contact form: WhatsApp + email options */
(() => {
  const form = document.querySelector('form');
  const whatsappButton = document.querySelector('[data-contact-whatsapp]');
  const emailButton = document.querySelector('[data-contact-email]');
  if (!form || (!whatsappButton && !emailButton)) return;

  // IMPORTANT: replace this with the business WhatsApp number in international
  // format, digits only, e.g. 447123456789.
  const BUSINESS_WHATSAPP = '447443500376';
  const BUSINESS_EMAIL = 'Renovationsofcheshire@yahoo.com';

  function field(label, selectors) {
    for (const selector of selectors) {
      const el = form.querySelector(selector);
      if (el && el.value.trim()) return `${label}: ${el.value.trim()}`;
    }
    return `${label}: Not provided`;
  }

  function enquiryText() {
    return [
      'New enquiry from the Renovations of Cheshire website',
      '',
      field('Name', ['[name="name"]', '[name="full-name"]', '#name']),
      field('Phone', ['[name="phone"]', '[name="telephone"]', '#phone']),
      field('Email', ['[name="email"]', '#email']),
      field('Project', ['[name="project"]', '[name="service"]', '[name="project-type"]', '#project']),
      '',
      field('Message', ['[name="message"]', 'textarea'])
    ].join('\n');
  }

  whatsappButton?.addEventListener('click', () => {
    if (BUSINESS_WHATSAPP.includes('X')) {
      alert('The business WhatsApp number needs to be added to the website first.');
      return;
    }
    const url = `https://wa.me/${BUSINESS_WHATSAPP}?text=${encodeURIComponent(enquiryText())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  emailButton?.addEventListener('click', () => {
    const subject = encodeURIComponent('New website enquiry - Renovations of Cheshire');
    const body = encodeURIComponent(enquiryText());
    window.location.href = `mailto:${BUSINESS_EMAIL}?subject=${subject}&body=${body}`;
  });
})();
