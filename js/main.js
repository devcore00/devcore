/* =============================================
   Dev Core - Main JavaScript
   ============================================= */

// Prevent the browser from restoring a scrolled position on refresh
// (it would land the fixed navbar over the middle of a section)
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// ===== DOM Ready =====
// Apply saved theme immediately (before DOM ready to avoid flash)
(function () {
  var saved = localStorage.getItem('devcore-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
})();

document.addEventListener('DOMContentLoaded', function () {
  initScrollTop();
  initNavActiveLink();
  initSmoothScroll();
  initFloatingNavbar();
  initThemeToggle();
  initHeroTypewriter();
  loadServices();
  loadProducts();
  loadProjects();
});

/* =============================================
   HERO TITLE + DESCRIPTION TYPEWRITER
============================================= */
function typeElement(el, speed, callback) {
  var originalNodes = Array.prototype.slice.call(el.childNodes);

  // Normalize whitespace so source-file indentation isn't typed out literally
  originalNodes.forEach(function (node, i) {
    if (node.nodeType !== Node.TEXT_NODE) return;
    var normalized = node.textContent.replace(/\s+/g, ' ');
    if (i === 0) normalized = normalized.replace(/^\s+/, '');
    if (i === originalNodes.length - 1) normalized = normalized.replace(/\s+$/, '');
    node.textContent = normalized;
  });

  el.textContent = '';
  el.style.opacity = '1';

  var nodeIndex = 0;
  var charIndex = 0;
  var currentTarget = el;

  function typeNext() {
    if (nodeIndex >= originalNodes.length) {
      if (callback) callback();
      return;
    }

    var node = originalNodes[nodeIndex];

    if (node.nodeType === Node.TEXT_NODE) {
      var text = node.textContent;
      if (text.length === 0) {
        nodeIndex++;
        setTimeout(typeNext, 0);
        return;
      }
      if (charIndex < text.length) {
        currentTarget.appendChild(document.createTextNode(text.charAt(charIndex)));
        charIndex++;
        setTimeout(typeNext, speed);
      } else {
        nodeIndex++;
        charIndex = 0;
        currentTarget = el;
        setTimeout(typeNext, speed);
      }
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === 'BR') {
        el.appendChild(document.createElement('br'));
        nodeIndex++;
        setTimeout(typeNext, speed);
        return;
      }

      if (currentTarget === el) {
        var clone = node.cloneNode(false);
        el.appendChild(clone);
        currentTarget = clone;
      }

      var elText = node.textContent;
      if (charIndex < elText.length) {
        currentTarget.appendChild(document.createTextNode(elText.charAt(charIndex)));
        charIndex++;
        setTimeout(typeNext, speed);
      } else {
        nodeIndex++;
        charIndex = 0;
        currentTarget = el;
        setTimeout(typeNext, speed);
      }
    }
  }

  typeNext();
}

function initHeroTypewriter() {
  var titleEl = document.querySelector('.hero-title');
  var descEl = document.querySelector('.hero-desc');
  if (!titleEl) return;

  typeElement(titleEl, 55, function () {
    if (descEl) {
      setTimeout(function () {
        typeElement(descEl, 18);
      }, 200);
    }
  });
}

/* =============================================
   SCROLL TO TOP
============================================= */
function initScrollTop() {
  const btn = document.getElementById('scrollTop');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 300) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* =============================================
   FLOATING NAVBAR ON SCROLL
============================================= */
function initFloatingNavbar() {
  var nav = document.getElementById('mainNav');
  if (!nav) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 80) {
      nav.classList.add('nav-scrolled');
    } else {
      nav.classList.remove('nav-scrolled');
    }
  });
}

/* =============================================
   ACTIVE NAV LINK ON SCROLL
============================================= */
function initNavActiveLink() {
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

  // Only track sections that actually have a nav link pointing to them,
  // so sections like #engage don't clear the active state as you scroll past.
  const linkedIds = Array.prototype.map.call(navLinks, function (link) {
    return (link.getAttribute('href') || '').replace('#', '');
  });
  const sections = Array.prototype.filter.call(
    document.querySelectorAll('section[id]'),
    function (section) { return linkedIds.indexOf(section.getAttribute('id')) !== -1; }
  );

  // While a nav click is smooth-scrolling, don't let the scroll handler
  // fight the clicked link for the "active" state.
  let lockUntil = 0;

  function setActive(id) {
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + id);
    });
  }

  function updateActive() {
    if (Date.now() < lockUntil) return;

    let current = '';
    sections.forEach(function (section) {
      if (window.scrollY >= section.offsetTop - 110) {
        current = section.getAttribute('id');
      }
    });

    // Near the bottom of the page the last sections can't reach the top,
    // so force the last section active once we're at the end.
    const scrollBottom = window.scrollY + window.innerHeight;
    if (scrollBottom >= document.documentElement.scrollHeight - 2 && sections.length) {
      current = sections[sections.length - 1].getAttribute('id');
    }

    if (current) setActive(current);
  }

  window.addEventListener('scroll', updateActive);
  updateActive();

  // Mark the clicked link immediately instead of waiting for the scroll to land.
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      const href = link.getAttribute('href') || '';
      if (href.charAt(0) !== '#' || href === '#') return;
      setActive(href.slice(1));
      lockUntil = Date.now() + 900;
    });
  });
}

/* =============================================
   SMOOTH SCROLL
============================================= */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Close mobile menu
        const navCollapse = document.getElementById('navMenu');
        if (navCollapse && navCollapse.classList.contains('show')) {
          const bsCollapse = bootstrap.Collapse.getOrCreateInstance(navCollapse);
          bsCollapse.hide();
        }
      }
    });
  });
}

/* =============================================
   PROJECTS - Load from JSON
============================================= */

// Category badge classes
const categoryBadge = {
  mobile:  { class: 'badge-mobile',  label: 'موبايل' },
  web:     { class: 'badge-web',     label: 'ويب' },
  graphic: { class: 'badge-graphic', label: 'جرافيك' },
  social:  { class: 'badge-social',  label: 'سوشيال ميديا' }
};

let allProjects = [];

function loadProjects() {
  fetch('data/projects.json')
    .then(function (res) {
      if (!res.ok) throw new Error('فشل تحميل المشاريع');
      return res.json();
    })
    .then(function (data) {
      allProjects = data.projects || [];
      renderProjects(allProjects);
      initFilterButtons();
    })
    .catch(function (err) {
      console.error(err);
      document.getElementById('projectsGrid').innerHTML =
        '<div class="col-12"><div class="no-projects">' +
        '<i class="fa fa-folder-open"></i>' +
        '<p>تعذّر تحميل المشاريع، يرجى المحاولة لاحقًا.</p>' +
        '</div></div>';
    });
}

function renderProjects(projects) {
  const grid = document.getElementById('projectsGrid');

  if (!projects || projects.length === 0) {
    grid.innerHTML =
      '<div class="col-12"><div class="no-projects">' +
      '<i class="fa fa-folder-open"></i>' +
      '<p>لا توجد مشاريع في هذا القسم حاليًا.</p>' +
      '</div></div>';
    return;
  }

  let html = '';

  projects.forEach(function (project, index) {
    const badge = categoryBadge[project.category] || { class: '', label: '' };
    const firstImage = project.images && project.images.length > 0
      ? project.images[0]
      : 'public/placeholder.jpg';
    const imgCount = project.images ? project.images.length : 1;

    html += `
      <div class="col-md-6 col-lg-4 project-item" data-category="${project.category}">
        <div class="project-card" onclick="openProjectModal(${index})">
          <div class="project-thumb">
            <img src="${firstImage}" alt="${project.title}" loading="lazy"/>
            <div class="project-overlay">
              <button class="project-overlay-btn">
                <i class="fa fa-eye"></i> عرض التفاصيل
              </button>
            </div>
            ${imgCount > 1
              ? `<span class="project-img-count"><i class="fa fa-images"></i> ${imgCount} صور</span>`
              : ''}
            <span class="project-category-badge ${badge.class}">${badge.label}</span>
          </div>
          <div class="project-info">
            <h5>${project.title}</h5>
            <p>${project.description}</p>
            ${project.link
              ? `<a href="${project.link}" target="_blank" class="project-link" onclick="event.stopPropagation()">
                  <i class="fa fa-external-link"></i> عرض المشروع
                </a>`
              : ''}
          </div>
        </div>
      </div>
    `;
  });

  grid.innerHTML = html;
}

/* =============================================
   FILTER BUTTONS
============================================= */
function initFilterButtons() {
  const buttons = document.querySelectorAll('.filter-btn');

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      // Toggle active class
      buttons.forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');

      const filter = this.getAttribute('data-filter');

      let filtered;
      if (filter === 'all') {
        filtered = allProjects;
      } else {
        filtered = allProjects.filter(function (p) {
          return p.category === filter;
        });
      }

      renderProjects(filtered);
    });
  });
}

/* =============================================
   PROJECT MODAL
============================================= */
function openProjectModal(index) {
  const project = allProjects[index];
  if (!project) return;

  // Set title
  document.getElementById('modalTitle').textContent = project.title;

  // Set description
  document.getElementById('modalDescription').textContent = project.description;

  // Set tags
  const tagsContainer = document.getElementById('modalTags');
  tagsContainer.innerHTML = '';
  if (project.tags && project.tags.length > 0) {
    project.tags.forEach(function (tag) {
      const span = document.createElement('span');
      span.className = 'modal-tag';
      span.textContent = tag;
      tagsContainer.appendChild(span);
    });
  }

  // Set link
  const linkEl = document.getElementById('modalLink');
  if (project.link) {
    linkEl.href = project.link;
    linkEl.style.display = 'inline-flex';
  } else {
    linkEl.style.display = 'none';
  }

  // Build carousel
  const indicators = document.getElementById('carouselIndicators');
  const inner = document.getElementById('carouselInner');
  indicators.innerHTML = '';
  inner.innerHTML = '';

  const images = project.images && project.images.length > 0
    ? project.images
    : ['public/placeholder.jpg'];

  images.forEach(function (imgSrc, i) {
    // Indicator
    const indicator = document.createElement('button');
    indicator.type = 'button';
    indicator.setAttribute('data-bs-target', '#projectCarousel');
    indicator.setAttribute('data-bs-slide-to', i.toString());
    if (i === 0) indicator.classList.add('active');
    indicators.appendChild(indicator);

    // Slide
    const slide = document.createElement('div');
    slide.className = 'carousel-item' + (i === 0 ? ' active' : '');
    slide.innerHTML = `<img src="${imgSrc}" alt="${project.title} - صورة ${i + 1}" class="d-block w-100"/>`;
    inner.appendChild(slide);
  });

  // Reset carousel to first slide
  const carouselEl = document.getElementById('projectCarousel');
  const carousel = bootstrap.Carousel.getOrCreateInstance(carouselEl);
  carousel.to(0);

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('projectModal'));
  modal.show();
}




/* =============================================
   SERVICES - Load from JSON
============================================= */
let servicesData = [];

function loadServices() {
  var grid = document.getElementById('servicesGrid');
  if (!grid) return;

  fetch('data/services.json')
    .then(function (res) {
      if (!res.ok) throw new Error('فشل تحميل الخدمات');
      return res.json();
    })
    .then(function (data) {
      servicesData = data.services || [];
      renderServices(servicesData);
    })
    .catch(function (err) {
      console.error(err);
      grid.innerHTML =
        '<div class="no-projects"><i class="fa fa-folder-open"></i>' +
        '<p>تعذّر تحميل الخدمات، يرجى المحاولة لاحقًا.</p></div>';
    });
}

function renderServices(services) {
  var grid = document.getElementById('servicesGrid');
  if (!grid) return;

  grid.innerHTML = services.map(function (svc, index) {
    var num = ('0' + (index + 1)).slice(-2);
    return (
      '<div class="service-cell" role="button" tabindex="0">' +
        '<div class="sc-corner">' + num + '</div>' +
        '<div class="sc-icon-ring"><i class="' + svc.icon + '"></i></div>' +
        '<h4>' + svc.title + '</h4>' +
        '<p>' + (svc.short || svc.desc) + '</p>' +
        '<span class="sc-read-more">عرض المزيد <i class="fa fa-arrow-left"></i></span>' +
      '</div>'
    );
  }).join('');

  Array.prototype.forEach.call(grid.children, function (cell, index) {
    cell.addEventListener('click', function () {
      openServiceModal(index);
    });
    cell.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openServiceModal(index);
      }
    });
  });
}

/* =============================================
   SERVICE MODAL
============================================= */
function openServiceModal(index) {
  var svc = servicesData[index];
  if (!svc) return;

  document.getElementById('svcIcon').className = svc.icon;
  document.getElementById('svcTitle').textContent = svc.title;
  document.getElementById('svcDesc').textContent = svc.desc;

  var goalsList = document.getElementById('svcGoals');
  goalsList.innerHTML = '';
  svc.goals.forEach(function (goal) {
    var li = document.createElement('li');
    li.textContent = goal;
    goalsList.appendChild(li);
  });

  var modal = new bootstrap.Modal(document.getElementById('serviceModal'));
  modal.show();
}

/* =============================================
   PRODUCTS - Load from JSON
============================================= */
let productsData = [];

function loadProducts() {
  fetch('data/products.json')
    .then(function (res) {
      if (!res.ok) throw new Error('فشل تحميل المنتجات');
      return res.json();
    })
    .then(function (data) {
      productsData = data.products || [];
      renderProducts(productsData);
    })
    .catch(function (err) {
      console.error(err);
      var grid = document.getElementById('productsGrid');
      if (grid) {
        grid.innerHTML = '<div class="no-projects"><i class="fa fa-folder-open"></i><p>تعذّر تحميل المنتجات، يرجى المحاولة لاحقًا.</p></div>';
      }
    });
}

function renderProducts(products) {
  var grid = document.getElementById('productsGrid');
  if (!grid) return;

  var html = products.map(function (p, index) {
    var featuresHtml = p.features.map(function (f) {
      return '<div class="pcf-feature"><i class="' + f.icon + '"></i>' + f.text + '</div>';
    }).join('');

    return (
      '<div class="product-card-featured">' +
        '<div class="pcf-inner">' +
          '<div class="pcf-content">' +
            '<div class="pcf-top">' +
              '<div class="pcf-icon-wrap"><i class="' + p.icon + '"></i></div>' +
              '<div class="pcf-badge-wrap">' +
                '<span class="pcf-badge">' + p.badge + '</span>' +
                '<span class="pcf-badge pcf-badge-live"><span class="pcf-live-dot"></span>متاح الآن</span>' +
              '</div>' +
            '</div>' +
            '<h3 class="pcf-name">' + p.nameAr + ' <span>' + p.nameEn + '</span></h3>' +
            '<p class="pcf-tagline">' + p.tagline + '</p>' +
            '<p class="pcf-desc">' + p.desc + '</p>' +
            '<div class="pcf-actions">' +
              '<a href="#contact" class="btn-primary-gold">اطلب عرضاً تجريبياً<i class="fa fa-arrow-left ms-2"></i></a>' +
              '<a href="#contact" class="pcf-btn-ghost">تواصل معنا</a>' +
              '<button type="button" class="pcf-btn-details" onclick="openProductModal(' + index + ')"><i class="fa fa-circle-info"></i>عرض التفاصيل</button>' +
            '</div>' +
          '</div>' +
          '<div class="pcf-visual">' +
            '<img src="' + p.image + '" alt="' + p.imageAlt + '" class="pcf-img-preview" />' +
            '<div class="pcf-float-card">' +
              '<i class="fa fa-star"></i>' +
              '<div><strong>' + p.floatTitle + '</strong><span>' + p.floatSub + '</span></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }).join('');

  grid.innerHTML = html;
}

function openProductModal(index) {
  var prod = productsData[index];
  if (!prod) return;

  document.getElementById('prodIcon').className = prod.icon;
  document.getElementById('prodTitle').textContent = prod.nameAr + ' — ' + prod.nameEn;
  document.getElementById('prodTagline').textContent = prod.tagline;
  document.getElementById('prodDesc').textContent = prod.desc;

  var img = document.getElementById('prodImage');
  img.src = prod.image;
  img.alt = prod.nameAr;

  var featuresList = document.getElementById('prodFeatures');
  featuresList.innerHTML = '';
  prod.features.forEach(function (feature) {
    var li = document.createElement('li');
    var icon = document.createElement('i');
    icon.className = feature.icon;
    li.appendChild(icon);
    li.appendChild(document.createTextNode(feature.text));
    featuresList.appendChild(li);
  });

  var modal = new bootstrap.Modal(document.getElementById('productDetailsModal'));
  modal.show();
}

var spanYear=document.getElementById("year");
var currentYear=new Date().getFullYear();
spanYear.textContent=currentYear;

/* =============================================
   THEME TOGGLE
============================================= */
function initThemeToggle() {
  var btns = document.querySelectorAll('.theme-toggle');
  if (!btns.length) return;

  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') || 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('devcore-theme', next);
    });
  });
}