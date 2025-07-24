// Injects a responsive navbar at the top of the page
(function() {
  const style = document.createElement('style');
  style.textContent = `
    .cpa-navbar {
      width: 100vw;
      background: linear-gradient(90deg, #181c2a 60%, #00ff88 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.3rem 0.5rem;
      box-shadow: 0 2px 16px rgba(0,255,136,0.08);
      position: fixed;
      top: 0;
      left: 0;
      z-index: 10000;
      font-family: 'Montserrat', 'Noto Sans Arabic', sans-serif;
      min-height: 48px;
    }
    .cpa-navbar-logo {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      font-weight: bold;
      font-size: 1.2rem;
      color: #00ff88;
      text-decoration: none;
    }
    .cpa-navbar-logo img {
      height: 36px;
      width: 36px;
      border-radius: 50%;
      box-shadow: 0 2px 8px #00ff8840;
      object-fit: cover;
      background: #181c2a;
    }
    .cpa-navbar-links {
      display: flex;
      align-items: center;
      gap: 0;
      justify-content: center;
      width: 100%;
      padding: 0 1.2rem;
      box-sizing: border-box;
      overflow-x: auto;
      white-space: nowrap;
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE 10+ */
    }
    .cpa-navbar-links::-webkit-scrollbar {
      display: none;
    }
    .cpa-navbar-link {
      color: #fff;
      text-decoration: none;
      font-size: 0.92rem;
      font-weight: 600;
      padding: 0.22rem 0.7rem;
      border: none;
      background: none;
      transition: color 0.2s;
      position: relative;
      display: flex;
      align-items: center;
      height: 100%;
      min-width: 0;
      flex-shrink: 1;
    }
    .cpa-navbar-link:first-child {
      margin-right: 0.5rem;
    }
    .cpa-navbar-link:last-child {
      margin-left: 0.5rem;
    }
    .cpa-navbar-link:not(:last-child)::after {
      content: '';
      display: inline-block;
      width: 1px;
      height: 1.4em;
      background: rgba(255,255,255,0.25);
      margin-right: 0.1rem;
      margin-left: 0.1rem;
      align-self: center;
    }
    .cpa-navbar-link:hover {
      color: #00ff88;
    }
    /* Dropdown styles */
    .cpa-navbar-dropdown {
      position: relative;
      display: inline-block;
    }
    .cpa-navbar-dropdown-content {
      display: none;
      position: absolute;
      right: 0;
      background: #232946;
      min-width: 180px;
      box-shadow: 0 8px 24px rgba(0,255,136,0.10);
      border-radius: 8px;
      z-index: 10001;
      padding: 0.5rem 0;
      margin-top: 0.5rem;
    }
    .cpa-navbar-dropdown-content a {
      color: #fff;
      padding: 0.6rem 1.2rem;
      text-decoration: none;
      display: block;
      font-size: 1rem;
      border-radius: 6px;
      transition: background 0.2s, color 0.2s;
    }
    .cpa-navbar-dropdown-content a:hover {
      background: rgba(0,255,136,0.13);
      color: #00ff88;
    }
    .cpa-navbar-dropdown:hover .cpa-navbar-dropdown-content,
    .cpa-navbar-dropdown:focus-within .cpa-navbar-dropdown-content {
      display: block;
    }
    .cpa-navbar-dropdown-btn {
      background: none;
      border: none;
      color: #fff;
      font-size: 1rem;
      font-weight: 500;
      padding: 0.3rem 0.9rem;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }
    .cpa-navbar-dropdown-btn:hover {
      background: rgba(0,255,136,0.13);
      color: #00ff88;
    }
    @media (max-width: 700px) {
      .cpa-navbar {
        flex-direction: row;
        justify-content: center;
        padding: 0.2rem 0.1rem;
        min-height: 44px;
      }
      .cpa-navbar-links {
        justify-content: center;
      }
      .cpa-navbar-link {
        font-size: 0.86rem;
        padding: 0.13rem 0.45rem;
      }
      .cpa-navbar-link:not(:last-child)::after {
        height: 1.1em;
      }
      .cpa-navbar-dropdown-content { right: auto; left: 0; }
    }
    /* --- Mobile Hamburger Navbar --- */
    .cpa-navbar-hamburger {
      display: none;
      background: none;
      border: none;
      color: #00ff88;
      font-size: 2.6rem;
      margin-right: 0.7rem;
      margin-left: 0;
      cursor: pointer;
      z-index: 10002;
      transition: color 0.2s;
      width: 54px;
      height: 54px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px #00ff8840;
      position: absolute;
      top: 8px;
      right: 12px;
      left: auto;
      transform: none;
    }
    .cpa-navbar-hamburger:active, .cpa-navbar-hamburger:hover {
      color: #a786ff;
    }
    .cpa-navbar-mobile-menu {
      display: none;
      flex-direction: column;
      position: fixed;
      top: 0;
      right: 0;
      left: auto;
      width: 100vw;
      min-height: 100vh;
      background: linear-gradient(135deg, #232946 90%, #181c2a 100%);
      box-shadow: 0 8px 32px #00000033;
      z-index: 10001;
      padding: 4.5rem 0.7rem 2.2rem 0.7rem;
      border-radius: 0 0 18px 18px;
      animation: slideDownNav 0.3s;
      overflow-y: auto;
      max-height: 100vh;
      align-items: flex-end;
      direction: rtl;
      text-align: right;
    }
    .cpa-navbar-mobile-menu .cpa-navbar-link {
      font-size: 1.25rem;
      padding: 1.1rem 0.7rem;
      color: #fff;
      border-radius: 12px;
      margin: 0.2rem 0;
      text-align: right;
      flex-direction: row-reverse;
      justify-content: flex-start;
      border: none;
      background: none;
      width: 100%;
      transition: background 0.2s, color 0.2s;
    }
    .cpa-navbar-mobile-menu .cpa-navbar-link:hover {
      background: rgba(0,255,136,0.13);
      color: #00ff88;
    }
    .cpa-navbar-hamburger {
      display: none;
      background: none;
      border: none;
      color: #00ff88;
      font-size: 2.6rem;
      margin-right: 0.7rem;
      cursor: pointer;
      z-index: 10002;
      transition: color 0.2s;
      width: 54px;
      height: 54px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px #00ff8840;
    }
    .cpa-navbar-hamburger:active, .cpa-navbar-hamburger:hover {
      color: #a786ff;
      background: rgba(0,255,136,0.08);
    }
    @media (max-width: 700px) {
      .cpa-navbar-links {
        display: none !important;
      }
      .cpa-navbar-hamburger {
        display: flex !important;
        position: fixed;
        top: 16px;
        right: 16px;
        left: auto;
        transform: none;
        margin: 0;
      }
      .cpa-navbar-mobile-menu {
        display: none;
        flex-direction: column;
        position: fixed;
        top: 0;
        right: 0;
        left: auto;
        width: 100vw;
        min-height: 100vh;
        background: linear-gradient(135deg, #232946 90%, #181c2a 100%);
        box-shadow: 0 8px 32px #00000033;
        z-index: 10001;
        padding: 4.5rem 0.7rem 2.2rem 0.7rem;
        border-radius: 0 0 18px 18px;
        animation: slideDownNav 0.3s;
        overflow-y: auto;
        max-height: 100vh;
        align-items: flex-end;
        direction: rtl;
        text-align: right;
      }
    }
    @keyframes slideDownNav {
      from { transform: translateY(-40px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  const navbar = document.createElement('nav');
  navbar.className = 'cpa-navbar';
  navbar.innerHTML = `
    <button class="cpa-navbar-hamburger" id="navbar-hamburger" aria-label="باز کردن منو">☰</button>
    <div class="cpa-navbar-links">
      <a href="index.html#main-dashboard" class="cpa-navbar-link">خانه</a>
      <a href="shop.html" class="cpa-navbar-link">آموزشگاه</a>
      <a href="news.html" class="cpa-navbar-link">اخبار</a>
      <a href="learning.html" class="cpa-navbar-link">آموزش</a>
      <a href="professional-tree.html" class="cpa-navbar-link">شبکه</a>
      <a href="about.html" class="cpa-navbar-link">درباره ما</a>
      <a href="#" class="cpa-navbar-link" id="navbar-swap-link">🔄 تبدیل ارز</a>
      <a href="#" class="cpa-navbar-link" id="navbar-transfer-link">💸 ترانسفر</a>
      <a href="register.html" class="cpa-navbar-link">📝 ثبت‌نام</a>
      <a href="reports.html" class="cpa-navbar-link">📊 گزارش</a>
      <a href="profile.html" class="cpa-navbar-link"><span style="font-size:1.1em;vertical-align:middle;">👤</span> پروفایل</a>
      <a href="transfer-ownership.html" class="cpa-navbar-link">�� انتقال مالکیت</a>
    </div>
    <div class="cpa-navbar-mobile-menu" id="navbar-mobile-menu" style="display:none;">
      <a href="index.html#main-dashboard" class="cpa-navbar-link">خانه</a>
      <a href="shop.html" class="cpa-navbar-link">آموزشگاه</a>
      <a href="news.html" class="cpa-navbar-link">اخبار</a>
      <a href="learning.html" class="cpa-navbar-link">آموزش</a>
      <a href="professional-tree.html" class="cpa-navbar-link">شبکه</a>
      <a href="about.html" class="cpa-navbar-link">درباره ما</a>
      <a href="#" class="cpa-navbar-link" id="navbar-swap-link-mobile">🔄 تبدیل ارز</a>
      <a href="#" class="cpa-navbar-link" id="navbar-transfer-link-mobile">💸 ترانسفر</a>
      <a href="register.html" class="cpa-navbar-link">📝 ثبت‌نام</a>
      <a href="reports.html" class="cpa-navbar-link">📊 گزارش</a>
      <a href="profile.html" class="cpa-navbar-link"><span style="font-size:1.1em;vertical-align:middle;">👤</span> پروفایل</a>
      <a href="transfer-ownership.html" class="cpa-navbar-link">�� انتقال مالکیت</a>
    </div>
  `;
  // Insert at the top of the body
  document.addEventListener('DOMContentLoaded', function() {
    document.body.insertBefore(navbar, document.body.firstChild);
    // Add margin to body for fixed navbar
    document.body.style.marginTop = '64px';
  });

  // افزودن یا اصلاح لینک پروفایل در نوار بالا
  window.addEventListener('DOMContentLoaded', function() {
    // اگر دکمه پروفایل وجود دارد، href آن را اصلاح کن
    var navProfile = document.querySelector('.cpa-navbar-link.profile, .cpa-navbar-link[data-profile], .cpa-navbar-link[href*="profile"]');
    if (navProfile) {
      navProfile.setAttribute('href', 'profile.html');
      navProfile.setAttribute('target', '_self');
    } else {
      // اگر وجود ندارد، اضافه کن
      var navLinks = document.querySelector('.cpa-navbar-links');
      if (navLinks) {
        var a = document.createElement('a');
        a.className = 'cpa-navbar-link profile';
        a.href = 'profile.html';
        a.target = '_self';
        a.innerHTML = '👤 پروفایل';
        navLinks.appendChild(a);
      }
    }
  });

  // اسکریپت باز و بسته شدن منوی موبایل (بهبود یافته: بستن منو با کلیک روی هر آیتم منو یا بیرون)
  document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('navbar-hamburger');
    const mobileMenu = document.getElementById('navbar-mobile-menu');
    let menuOpen = false;
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', function(e) {
        e.stopPropagation();
        menuOpen = !menuOpen;
        mobileMenu.style.display = menuOpen ? 'flex' : 'none';
        hamburger.style.color = menuOpen ? '#a786ff' : '#00ff88';
      });
      // بستن منو با کلیک بیرون
      document.addEventListener('click', function(e) {
        if (menuOpen && !mobileMenu.contains(e.target) && e.target !== hamburger) {
          mobileMenu.style.display = 'none';
          hamburger.style.color = '#00ff88';
          menuOpen = false;
        }
      });
      // بستن منو با کلیک روی هر آیتم منو
      mobileMenu.querySelectorAll('.cpa-navbar-link').forEach(function(link) {
        link.addEventListener('click', function() {
          mobileMenu.style.display = 'none';
          hamburger.style.color = '#00ff88';
          menuOpen = false;
        });
      });
    }
  });

  // رویداد کلیک برای دکمه‌های تبدیل ارز و ترانسفر (اصلاح شده)
  document.addEventListener('DOMContentLoaded', function() {
    function goToSection(section) {
      const isIndex = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '';
      if (isIndex) {
        if (typeof showMainSection === 'function') showMainSection(section);
        // اسکرول نرم
        const target = document.getElementById(section);
        if (target) setTimeout(() => target.scrollIntoView({behavior:'smooth',block:'start'}), 100);
      } else {
        window.location.href = `index.html#${section}`;
      }
    }
    const swapLink = document.getElementById('navbar-swap-link');
    const transferLink = document.getElementById('navbar-transfer-link');
    if (swapLink) swapLink.onclick = function(e){e.preventDefault();goToSection('main-swap');};
    if (transferLink) transferLink.onclick = function(e){e.preventDefault();goToSection('main-transfer');};
    const swapLinkMobile = document.getElementById('navbar-swap-link-mobile');
    const transferLinkMobile = document.getElementById('navbar-transfer-link-mobile');
    if (swapLinkMobile) swapLinkMobile.onclick = function(e){e.preventDefault();goToSection('main-swap');closeMobileMenu();};
    if (transferLinkMobile) transferLinkMobile.onclick = function(e){e.preventDefault();goToSection('main-transfer');closeMobileMenu();};
  });

  // Only add the floating bottom bar on index.html
  // Helper for bottom bar navigation (only on index.html)
  if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
    window.showMainSection = function(sectionId) {
      const ids = ['main-swap','main-transfer','main-profile','main-reports','main-register'];
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = (id === sectionId) ? '' : 'none';
      });
      // اسکرول نرم به بخش انتخاب شده
      const target = document.getElementById(sectionId);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({behavior:'smooth',block:'start'});
        }, 100);
      }
    };
  }

  // در index.html اگر هشی وجود دارد، بخش مربوطه را نمایش بده
  if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
    document.addEventListener('DOMContentLoaded', function() {
      const hash = window.location.hash;
      if (hash === '#main-swap' || hash === '#main-transfer') {
        if (typeof showMainSection === 'function') showMainSection(hash.replace('#',''));
        // اسکرول نرم
        const target = document.getElementById(hash.replace('#',''));
        if (target) setTimeout(() => target.scrollIntoView({behavior:'smooth',block:'start'}), 100);
      }
    });
  }
})(); 