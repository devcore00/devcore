/* =============================================
   Dev Core - Main JavaScript
   ============================================= */

// ===== DOM Ready =====
document.addEventListener('DOMContentLoaded', function () {
  initScrollTop();
  initNavActiveLink();
  initSmoothScroll();
  loadProjects();
});

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
   ACTIVE NAV LINK ON SCROLL
============================================= */
function initNavActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

  window.addEventListener('scroll', function () {
    let current = '';

    sections.forEach(function (section) {
      const sectionTop = section.offsetTop - 90;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
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
      : 'images/placeholder.jpg';
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
    : ['images/placeholder.jpg'];

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