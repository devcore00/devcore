(function () {
  var page = document.getElementById('productDetailsPage');
  var productId = new URLSearchParams(window.location.search).get('id');

  function isImagePath(value) {
    return typeof value === 'string' && /\.(png|jpe?g|svg|webp|gif)$/i.test(value);
  }

  function getGallery(product) {
    var gallery = Array.isArray(product.images) ? product.images.slice() : [];
    if (!gallery.length && isImagePath(product.cover || product.image)) {
      gallery.push(product.cover || product.image);
    }
    return gallery.filter(function (image, index, images) {
      return image && images.indexOf(image) === index;
    });
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function sectionTitle(eyebrow, title, subtitle) {
    return '<div class="section-title"><div class="hero-eyebrow"><span class="eyebrow-dot"></span> ' + esc(eyebrow) + '</div><h2>' + title + '</h2>' + (subtitle ? '<p>' + esc(subtitle) + '</p>' : '') + '</div>';
  }

  function renderPlatforms(product) {
    var platforms = product.platforms || [];
    var languages = product.languages || [];
    if (!platforms.length && !languages.length) return '';

    var cards = platforms.map(function (platform) {
      return '<div class="details-platform-card"><span class="details-feature-icon"><i class="' + esc(platform.icon) + '"></i></span><div><h3>' + esc(platform.name) + '</h3><p>' + esc(platform.desc) + '</p></div></div>';
    }).join('');

    var chips = languages.map(function (language) {
      return '<span class="details-chip"><i class="fa fa-language"></i> ' + esc(language) + '</span>';
    }).join('');
    if (product.desktopAvailable) {
      chips += '<span class="details-chip"><i class="fa fa-desktop"></i> نسخة ديسكتوب متاحة</span>';
    }

    return '<section class="details-platforms"><div class="container">' +
      sectionTitle('التوافق', 'يعمل على <span>كل أجهزتك</span>', 'استخدم المنتج من أي مكان وعلى أي جهاز.') +
      (cards ? '<div class="details-platform-grid">' + cards + '</div>' : '') +
      (chips ? '<div class="details-chips">' + chips + '</div>' : '') +
      '</div></section>';
  }

  function renderModules(product) {
    var modules = product.modules || [];
    if (!modules.length) return '';

    var cards = modules.map(function (module) {
      var items = (module.items || []).map(function (item) {
        return '<li><i class="fa fa-check"></i><span>' + esc(item) + '</span></li>';
      }).join('');
      return '<article class="details-module-card"><div class="details-module-head"><span class="details-feature-icon"><i class="' + esc(module.icon) + '"></i></span><h3>' + esc(module.title) + '</h3></div><ul>' + items + '</ul></article>';
    }).join('');

    return '<section class="details-modules"><div class="container">' +
      sectionTitle('الوحدات', 'وحدات <span>النظام بالتفصيل</span>', 'كل وحدة مصممة لتغطي جزءاً كاملاً من دورة العمل.') +
      '<div class="details-module-grid">' + cards + '</div></div></section>';
  }

  function renderEditions(product) {
    var editions = product.editions || [];
    if (!editions.length) return '';

    var cards = editions.map(function (edition) {
      var ideal = (edition.idealFor || []).map(function (item) {
        return '<span class="details-chip details-chip-sm">' + esc(item) + '</span>';
      }).join('');
      var highlights = (edition.highlights || []).map(function (item) {
        return '<li><i class="fa fa-circle-check"></i><span>' + esc(item) + '</span></li>';
      }).join('');
      return '<article class="details-edition-card"><div class="details-edition-head"><span class="details-feature-icon"><i class="' + esc(edition.icon) + '"></i></span><div><h3>' + esc(edition.nameAr) + ' <small>' + esc(edition.nameEn) + '</small></h3><span class="pcf-badge">' + esc(edition.badge) + '</span></div></div>' +
        '<p class="details-edition-desc">' + esc(edition.desc) + '</p>' +
        (ideal ? '<h4>مناسبة لـ</h4><div class="details-chips details-chips-start">' + ideal + '</div>' : '') +
        (highlights ? '<h4>أبرز ما تشمله</h4><ul class="details-edition-list">' + highlights + '</ul>' : '') +
        '</article>';
    }).join('');

    return '<section class="details-editions"><div class="container">' +
      sectionTitle('النسخ المتاحة', (editions.length > 1 ? 'اختر النسخة <span>المناسبة لك</span>' : 'نسخة <span>المنتج</span>'), '') +
      '<div class="details-edition-grid' + (editions.length === 1 ? ' is-single' : '') + '">' + cards + '</div></div></section>';
  }

  function comparisonCell(value) {
    if (value === true) return '<span class="details-cmp-yes"><i class="fa fa-check"></i></span>';
    if (value === false) return '<span class="details-cmp-no"><i class="fa fa-minus"></i></span>';
    return '<span class="details-cmp-text">' + esc(value) + '</span>';
  }

  function renderComparison(product) {
    var rows = product.comparison || [];
    var editions = product.editions || [];
    if (!rows.length || editions.length < 2) return '';

    var body = rows.map(function (row) {
      return '<tr><th scope="row">' + esc(row.feature) + '</th><td>' + comparisonCell(row.single) + '</td><td>' + comparisonCell(row.multi) + '</td></tr>';
    }).join('');

    return '<section class="details-comparison"><div class="container">' +
      sectionTitle('المقارنة', 'مقارنة <span>بين النسخ</span>', 'تعرف على الفروق بين النسختين قبل الاختيار.') +
      '<div class="details-table-wrap"><table class="details-table"><thead><tr><th>الميزة</th><th>' + esc(editions[0].nameAr) + '</th><th>' + esc(editions[1].nameAr) + '</th></tr></thead><tbody>' + body + '</tbody></table></div></div></section>';
  }

  function renderNotFound() {
    page.innerHTML = '<section class="details-not-found"><div class="container"><i class="fa fa-box-open"></i><h1>المنتج غير موجود</h1><p>تعذر العثور على المنتج المطلوب.</p><a href="index.html#products" class="btn-primary-gold">العودة إلى المنتجات <i class="fa fa-arrow-left"></i></a></div></section>';
  }

  function renderProduct(product) {
    var gallery = getGallery(product);
    var slides = gallery.map(function (image, index) {
      return '<div class="carousel-item ' + (index === 0 ? 'active' : '') + '"><img src="' + image + '" alt="' + product.nameAr + ' - صورة ' + (index + 1) + '"></div>';
    }).join('');
    var indicators = gallery.map(function (_, index) {
      return '<button type="button" data-bs-target="#productGallery" data-bs-slide-to="' + index + '" class="' + (index === 0 ? 'active' : '') + '" aria-label="الصورة ' + (index + 1) + '"></button>';
    }).join('');
    var thumbnails = gallery.map(function (image, index) {
      return '<button type="button" class="details-thumbnail ' + (index === 0 ? 'active' : '') + '" data-bs-target="#productGallery" data-bs-slide-to="' + index + '" aria-label="عرض الصورة ' + (index + 1) + '"><img src="' + image + '" alt=""></button>';
    }).join('');
    var features = (product.features || []).map(function (feature) {
      return '<li><span class="details-feature-icon"><i class="' + feature.icon + '"></i></span><span>' + feature.text + '</span></li>';
    }).join('');

    var productMark = isImagePath(product.icon)
      ? '<span class="details-product-mark"><img src="' + product.icon + '" alt="' + product.nameAr + '"></span>'
      : '<span class="details-product-mark"><i class="' + product.icon + '"></i></span>';
    var whatsappText = encodeURIComponent('مرحباً، أريد الاستفسار عن منتج ' + product.nameAr + ' (' + product.nameEn + ').');
    var whatsappUrl = 'https://wa.me/201558200078?text=' + whatsappText;
    var demoText = encodeURIComponent('مرحباً، أرغب في طلب عرض تجريبي لمنتج ' + product.nameAr + ' (' + product.nameEn + ').');
    var demoUrl = 'https://wa.me/201558200078?text=' + demoText;
    page.innerHTML = '<section class="details-hero"><div class="container"><a href="index.html#products" class="details-breadcrumb"><i class="fa fa-arrow-right"></i> منتجاتنا</a><div class="row align-items-center g-5"><div class="col-lg-6"><div class="details-copy">' + productMark + '<span class="details-status"><span></span> متاح الآن</span><h1>' + product.nameAr + '<small>' + product.nameEn + '</small></h1><p class="details-tagline">' + product.tagline + '</p><p class="details-description">' + product.desc + '</p><div class="details-actions"><a href="' + demoUrl + '" target="_blank" rel="noopener" class="btn-primary-gold">اطلب عرضاً تجريبياً <i class="fa fa-arrow-left"></i></a><a href="' + whatsappUrl + '" target="_blank" rel="noopener" class="details-whatsapp"><i class="fab fa-whatsapp"></i> تحدث معنا</a></div></div></div><div class="col-lg-6"><div class="details-gallery"><div id="productGallery" class="carousel slide" data-bs-ride="false"><div class="carousel-inner">' + slides + '</div><button class="carousel-control-prev" type="button" data-bs-target="#productGallery" data-bs-slide="prev"><span class="carousel-control-prev-icon"></span><span class="visually-hidden">السابق</span></button><button class="carousel-control-next" type="button" data-bs-target="#productGallery" data-bs-slide="next"><span class="carousel-control-next-icon"></span><span class="visually-hidden">التالي</span></button><div class="carousel-indicators">' + indicators + '</div></div><div class="details-thumbnails">' + thumbnails + '</div></div></div></div></div></section><section class="details-features"><div class="container"><div class="section-title"><div class="hero-eyebrow"><span class="eyebrow-dot"></span> كل ما تحتاجه</div><h2>مميزات <span>' + product.nameAr + '</span></h2><p>أدوات عملية مصممة لتسهيل العمل وتحسين الأداء.</p></div><ul class="details-feature-grid">' + features + '</ul></div></section>' + renderPlatforms(product) + renderModules(product) + renderEditions(product) + renderComparison(product);

    var carousel = document.getElementById('productGallery');
    carousel.addEventListener('slid.bs.carousel', function (event) {
      document.querySelectorAll('.details-thumbnail').forEach(function (thumbnail, index) {
        thumbnail.classList.toggle('active', index === event.to);
      });
    });
    document.title = product.nameAr + ' | Dev Core';
  }

  function initTheme() {
    var button = document.getElementById('themeToggle');
    button.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') || 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('devcore-theme', next);
    });
    document.getElementById('year').textContent = new Date().getFullYear();
  }

  initTheme();
  fetch('data/products.json')
    .then(function (response) {
      if (!response.ok) throw new Error('فشل تحميل المنتج');
      return response.json();
    })
    .then(function (products) {
      var product = products.find(function (item) { return String(item.id) === String(productId); });
      product ? renderProduct(product) : renderNotFound();
    })
    .catch(function () { renderNotFound(); });
})();
