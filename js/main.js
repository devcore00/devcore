/* =============================================
   Dev Core - Main JavaScript
   ============================================= */

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
   SERVICE MODAL
============================================= */
const servicesData = [
  {
    icon: 'fa fa-mobile-screen',
    title: 'تطبيقات الموبايل',
    desc: 'نطور تطبيقات موبايل احترافية تعمل على نظامي Android وiOS باستخدام Flutter وأحدث التقنيات. نحرص على أن يكون كل تطبيق سريعاً وسهل الاستخدام وذا تصميم احترافي يعكس هوية علامتك التجارية ويوفر تجربة مستخدم استثنائية.',
    goals: ['Flutter & Dart', 'تصميم UI/UX متميز', 'Android & iOS بتطبيق واحد', 'أداء عالي وسرعة استجابة', 'تكامل مع APIs والخدمات الخارجية', 'نشر على Google Play & App Store']
  },
  {
    icon: 'fa fa-globe',
    title: 'تطبيقات الويب',
    desc: 'نبني مواقع ومنصات ويب متكاملة قابلة للتوسع وذات أداء عالٍ باستخدام أحدث تقنيات التطوير. من التصميم إلى التنفيذ، نحرص على تقديم تجربة رقمية استثنائية لمستخدميك وتحقيق أهدافك التجارية.',
    goals: ['Laravel & PHP', 'HTML5, CSS3, JavaScript', 'لوحة تحكم متكاملة', 'Responsive Design', 'تحسين محركات البحث (SEO)', 'تطوير تجارة إلكترونية']
  },
  {
    icon: 'fa fa-pen-nib',
    title: 'Graphic Design',
    desc: 'نصمم هوية بصرية احترافية وتصاميم إبداعية تعكس علامتك التجارية وتجعلها لا تُنسى. من الشعار إلى المطبوعات، كل تصميم يُعبّر عن جوهر مشروعك ويترك انطباعاً دائماً.',
    goals: ['تصميم شعارات احترافية', 'هوية بصرية متكاملة', 'مطبوعات ودعاية وإعلان', 'تصاميم بروشورات وكتالوجات', 'تصميم واجهات المستخدم UI', 'تصاميم إبداعية مخصصة']
  },
  {
    icon: 'fa fa-share-nodes',
    title: 'Social Media Design',
    desc: 'نصمم محتوى سوشيال ميديا جذاباً ومؤثراً يزيد من تفاعلك وحضورك الرقمي على جميع منصات التواصل الاجتماعي. تصاميم تتحدث عن علامتك التجارية بصوت بصري قوي ومتناسق.',
    goals: ['بوستات وستوريز احترافية', 'تصاميم موشن جرافيك', 'كفرات وبروفايل للصفحات', 'تصاميم إعلانات مدفوعة', 'محتوى بصري متناسق', 'خطة محتوى شهرية']
  },
  {
    icon: 'fa fa-headset',
    title: 'استشارة تقنية',
    desc: 'نقدم استشارات تقنية متخصصة لمساعدتك في اختيار الحلول التكنولوجية المناسبة لمشروعك، وتحقيق أهدافك الرقمية بكفاءة وفاعلية من خلال خبرائنا المتخصصين.',
    goals: ['تحليل متطلبات المشروع', 'اختيار التقنيات المناسبة', 'وضع خارطة طريق واضحة', 'تقييم التكاليف والجدول الزمني', 'استشارة أولى مجانية', 'متابعة ما بعد التنفيذ']
  },
  {
    icon: 'fa fa-bullhorn',
    title: 'التسويق الرقمي',
    desc: 'نضع لك استراتيجيات تسويقية رقمية فعّالة تزيد من ظهورك الإلكتروني وتستهدف جمهورك المثالي لتحقيق نمو حقيقي وملموس لعملك ومبيعاتك.',
    goals: ['استراتيجية تسويق متكاملة', 'إدارة إعلانات Google & Meta', 'تحسين محركات البحث SEO', 'تحليل البيانات والتقارير', 'إدارة منصات التواصل الاجتماعي', 'تسويق بالمحتوى']
  }
];

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