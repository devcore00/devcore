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
    page.innerHTML = '<section class="details-hero"><div class="container"><a href="index.html#products" class="details-breadcrumb"><i class="fa fa-arrow-right"></i> منتجاتنا</a><div class="row align-items-center g-5"><div class="col-lg-6"><div class="details-copy">' + productMark + '<span class="details-status"><span></span> متاح الآن</span><h1>' + product.nameAr + '<small>' + product.nameEn + '</small></h1><p class="details-tagline">' + product.tagline + '</p><p class="details-description">' + product.desc + '</p><div class="details-actions"><a href="' + demoUrl + '" target="_blank" rel="noopener" class="btn-primary-gold">اطلب عرضاً تجريبياً <i class="fa fa-arrow-left"></i></a><a href="' + whatsappUrl + '" target="_blank" rel="noopener" class="details-whatsapp"><i class="fab fa-whatsapp"></i> تحدث معنا</a></div></div></div><div class="col-lg-6"><div class="details-gallery"><div id="productGallery" class="carousel slide" data-bs-ride="false"><div class="carousel-inner">' + slides + '</div><button class="carousel-control-prev" type="button" data-bs-target="#productGallery" data-bs-slide="prev"><span class="carousel-control-prev-icon"></span><span class="visually-hidden">السابق</span></button><button class="carousel-control-next" type="button" data-bs-target="#productGallery" data-bs-slide="next"><span class="carousel-control-next-icon"></span><span class="visually-hidden">التالي</span></button><div class="carousel-indicators">' + indicators + '</div></div><div class="details-thumbnails">' + thumbnails + '</div></div></div></div></div></section><section class="details-features"><div class="container"><div class="section-title"><div class="hero-eyebrow"><span class="eyebrow-dot"></span> كل ما تحتاجه</div><h2>مميزات <span>' + product.nameAr + '</span></h2><p>أدوات عملية مصممة لتسهيل العمل وتحسين الأداء.</p></div><ul class="details-feature-grid">' + features + '</ul></div></section>';

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
