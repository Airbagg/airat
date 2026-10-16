(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  // Тонкая линия под шапкой, когда страницу прокрутили
  var top = document.querySelector('.top');
  function onScroll() { top.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Появление при прокрутке
  var items = document.querySelectorAll('.reveal');
  if (!hasIO || reduce) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -4% 0px', threshold: 0.05 });
    items.forEach(function (el) { ro.observe(el); });
  }

  // Видео грузятся, только когда до них доскроллили, и стоят на паузе вне экрана
  var videos = document.querySelectorAll('video[data-src]:not([data-hero])');
  var hero = document.querySelector('video[data-hero]');
  function load(v) {
    if (v.src) return;
    v.src = v.dataset.src;
    v.addEventListener('playing', function () { v.classList.add('on'); }, { once: true });
  }
  function play(v) {
    var p = v.play();
    if (p && p.catch) p.catch(function () { /* браузер не дал запустить, остается постер */ });
  }
  // Видео в первом экране: после загрузки страницы, чтобы не мешать тексту и шрифту
  if (hero && !reduce) {
    var startHero = function () { load(hero); play(hero); };
    if (document.readyState === 'complete') startHero(); else window.addEventListener('load', startHero, { once: true });
    if (hasIO) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (!hero.src) return; if (e.isIntersecting) play(hero); else hero.pause(); });
      }).observe(hero);
    }
  }
  if (reduce) {
    // Без автозапуска: постер и кнопки управления
    videos.forEach(function (v) {
      v.controls = true;
      v.preload = 'none';
      v.src = v.dataset.src;
      v.addEventListener('play', function () { v.classList.add('on'); });
    });
    return;
  }
  if (!hasIO) {
    videos.forEach(function (v) { load(v); play(v); });
    return;
  }
  var near = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { load(e.target); near.unobserve(e.target); }
    });
  }, { rootMargin: '200px 0px' });
  var vis = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { load(e.target); play(e.target); } else { e.target.pause(); }
    });
  }, { threshold: 0.2 });
  videos.forEach(function (v) { near.observe(v); vis.observe(v); });
})();

// Точки под листаемыми работами на телефоне
(function () {
  document.querySelectorAll('.stage').forEach(function (stage) {
    var devs = stage.querySelectorAll('.device');
    if (devs.length < 2) return;
    var dots = document.createElement('div');
    dots.className = 'dots';
    dots.setAttribute('aria-hidden', 'true');
    var order = Array.prototype.slice.call(devs).sort(function (a, b) {
      return (parseInt(getComputedStyle(a).order) || 0) - (parseInt(getComputedStyle(b).order) || 0);
    });
    order.forEach(function (_, i) { var d = document.createElement('i'); if (!i) d.className = 'on'; dots.appendChild(d); });
    stage.after(dots);
    var raf = 0;
    stage.addEventListener('scroll', function () {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        var mid = stage.scrollLeft + stage.clientWidth / 2, best = 0, bd = 1e9;
        order.forEach(function (d, i) { var c = d.offsetLeft + d.offsetWidth / 2, dd = Math.abs(c - mid); if (dd < bd) { bd = dd; best = i; } });
        dots.querySelectorAll('i').forEach(function (el, i) { el.classList.toggle('on', i === best); });
      });
    }, { passive: true });
  });
})();
