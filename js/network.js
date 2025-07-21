// نمایش درخت باینری با lazy load: هر گره با کلیک expand می‌شود و فقط فرزندان همان گره نمایش داده می‌شوند

function shortAddress(addr) {
    if (!addr) return '-';
    return addr.slice(0, 3) + '...' + addr.slice(-2);
}

function showUserPopup(address, user) {
    // تابع کوتاه‌کننده آدرس
    function shortAddress(addr) {
        if (!addr) return '-';
        return addr.slice(0, 3) + '...' + addr.slice(-2);
    }
    
    // بررسی popup موجود
    let existingPopup = document.getElementById('user-popup');
    if (existingPopup) {
        // اگر popup وجود دارد، آن را حذف کن تا popup جدید با اطلاعات جدید نمایش داده شود
        existingPopup.remove();
    }
    
    // اطلاعات برای نمایش (فشرده و ترمینال) به فارسی
    const binaryPointsClaimed = user.binaryPointsClaimed ? Number(user.binaryPointsClaimed) : 0;
    const binaryPoints = user.binaryPoints ? Number(user.binaryPoints) : 0;
    const binaryPointsRemain = binaryPoints - binaryPointsClaimed;
    const infoLines = [
        `شناسه کاربر:  ${window.generateCPAId ? window.generateCPAId(user.index) : user.index}`,
        `امتیاز باینری:  ${user.binaryPoints}`,
        `امتیاز باینری دریافت‌شده:  ${binaryPointsClaimed}`,
        `امتیاز باینری مانده:  ${binaryPointsRemain}`,
        `سقف امتیاز:  ${user.binaryPointCap}`,
        `امتیاز چپ:  ${user.leftPoints}`,
        `امتیاز راست:  ${user.rightPoints}`,
        `پاداش رفرال:  ${user.refclimed ? Math.floor(Number(user.refclimed) / 1e18) : '0'}`,
        `موجودی CPA:  ${user.lvlBalance ? user.lvlBalance : '0'}`,
        `موجودی POL:  ${user.maticBalance ? user.maticBalance : '0'}`
    ];
    
    // ساخت popup ثابت و شناور در بالای صفحه
    const popup = document.createElement('div');
    popup.id = 'user-popup';
    popup.style = `
      position: fixed;
      z-index: 9999;
      top: 64px;
      left: 0;
      right: 0;
      width: 100vw;
      min-width: 100vw;
      max-width: 100vw;
      background: linear-gradient(90deg, rgba(10,13,26,0.98) 70%, rgba(0,255,136,0.08) 100%);
      box-shadow: 0 8px 32px rgba(0,255,136,0.10), 0 2px 8px rgba(0,0,0,0.18);
      border-radius: 0 0 18px 18px;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 0.7rem 1vw 0.7rem 1vw;
      box-sizing: border-box;
      backdrop-filter: blur(12px);
      transition: height 0.3s ease;
      cursor: pointer;
      border-bottom: 2px solid #00ff88;
      font-family: 'Montserrat', 'Noto Sans Arabic', monospace;
      font-size: 0.92rem;
    `;
    function formatDateTime(val) {
      if (!val || isNaN(Number(val)) || Number(val) === 0) return '-';
      const d = new Date(Number(val) * 1000);
      if (isNaN(d.getTime())) return '-';
      return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0') + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
    }
    let expanded = true;
    function renderPopupContent() {
      if (expanded) {
        popup.innerHTML = `
          <div style="width:100%;max-width:900px;display:grid;grid-template-columns:1fr 1fr;gap:1.2rem 2.2rem;align-items:start;justify-content:center;text-align:left;background:rgba(24,28,42,0.98);border-radius:16px;box-shadow:0 8px 32px rgba(0,255,136,0.10),0 2px 8px rgba(0,0,0,0.18);padding:1.5rem 2vw;margin:0 auto;">
            <div style='border-left:2px solid #222;padding-left:1rem;'><b>CPA ID:</b> <span>${window.generateCPAId ? window.generateCPAId(user.index) : user.index}</span></div>
            <div style='border-left:2px solid #222;padding-left:1rem;'><b>Binary Points:</b> <span>${user.binaryPoints}</span></div>
            <div style='border-left:2px solid #222;padding-left:1rem;'><b>Points Claimed:</b> <span>${user.binaryPointsClaimed}</span></div>
            <div style='border-left:2px solid #222;padding-left:1rem;'><b>Point Cap:</b> <span>${user.binaryPointCap}</span></div>
            <div style='border-left:2px solid #222;padding-left:1rem;'><b>Left Points:</b> <span>${user.leftPoints}</span></div>
            <div style='border-left:2px solid #222;padding-left:1rem;'><b>Right Points:</b> <span>${user.rightPoints}</span></div>
            <div style='border-left:2px solid #222;padding-left:1rem;'><b>Referral Rewards:</b> <span>${user.refclimed ? Math.floor(Number(user.refclimed) / 1e18) : '0'}</span></div>
            <div style='border-left:2px solid #222;padding-left:1rem;'><b>CPA Balance:</b> <span>${user.lvlBalance ? user.lvlBalance : '0'}</span></div>
            <div style='border-left:2px solid #222;padding-left:1rem;'><b>POL Balance:</b> <span>${user.maticBalance ? user.maticBalance : '0'}</span></div>
            <div style='border-left:2px solid #222;padding-left:1rem;'><b>USDC Balance:</b> <span>${user.usdcBalance ? user.usdcBalance : '0'}</span></div>
            <div style='border-left:2px solid #222;padding-left:1rem;'><b>Deposited Amount:</b> <span style='font-weight:bold;font-style:italic;'>${user.depositedAmount ? Math.floor(Number(user.depositedAmount) / 1e18) : '0'}</span></div>
            <div style='border-left:2px solid #222;padding-left:1rem;'><b>Total Monthly Rewarded:</b> <span>${user.totalMonthlyRewarded}</span></div>
            <div style='border-left:2px solid #222;padding-left:1rem;'><b>Total Purchased:</b> <span>${user.totalPurchasedKind}</span></div>
            <div style='border-left:2px solid #222;padding-left:1rem;'><b>Upgrade Time:</b> <span>${formatDateTime(user.upgradeTime)}</span></div>
            <div style='border-left:2px solid #222;padding-left:1rem;'><b>Last Claim:</b> <span>${formatDateTime(user.lastClaimTime)}</span></div>
            <div style='border-left:2px solid #222;padding-left:1rem;'><b>Last Monthly Claim:</b> <span>${formatDateTime(user.lastMonthlyClaim)}</span></div>
            <div style='border-left:2px solid #222;padding-left:1rem;'><b>Address:</b> <span style='font-family:monospace;color:#a786ff;'>${shortAddress(address)}</span></div>
          </div>
        `;
      } else {
        popup.innerHTML = `
          <div style="width:100%;max-width:900px;display:flex;gap:1.5rem;align-items:center;justify-content:flex-start;text-align:left;">
            <div><b>Left Points:</b> <span>${user.leftPoints}</span></div>
            <div style="border-left:1.5px solid #444;padding-left:0.7rem;"><b>Right Points:</b> <span>${user.rightPoints}</span></div>
            <div style="border-left:1.5px solid #444;padding-left:0.7rem;"><b>Address:</b> <span style='font-family:monospace;color:#a786ff;'>${shortAddress(address)}</span></div>
          </div>
        `;
      }
    }
    renderPopupContent();
    popup.onclick = function() {
      expanded = !expanded;
      renderPopupContent();
    };
    
    document.body.appendChild(popup);
    
    // Toggle functionality for header click
    const header = popup.querySelector('.popup-header');
    header.onclick = (e) => {
        if (e.target.id === 'close-user-popup') return; // Don't toggle if clicking close button
        
        const content = popup.querySelector('.popup-content');
        const isExpanded = content.style.display !== 'none';
        
        if (isExpanded) {
            // collapse
            content.style.display = 'none';
            popup.querySelector('.popup-header h3').textContent = `👤 USER INFO (${shortAddress(address)})`;
            popup.style.height = '40px';
            popup.style.background = 'rgba(0,0,0,0.95)';
        } else {
            // expand
            content.style.display = 'block';
            popup.querySelector('.popup-header h3').textContent = `👤 USER INFO (${shortAddress(address)}) - EXPANDED`;
            popup.style.height = 'auto';
            popup.style.background = 'rgba(0,0,0,0.98)';
        }
    };
    
    // Close button functionality
    const closeBtn = document.getElementById('close-user-popup');
    closeBtn.onclick = (e) => {
        e.stopPropagation(); // Prevent header click
        popup.remove();
    };
    
    // Close with Escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            popup.remove();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
    
    // Remove event listener when popup is removed
    popup.addEventListener('remove', () => {
        document.removeEventListener('keydown', handleEscape);
    });

    // افکت تایپ‌رایت
    function typeWriter(lines, el, lineIdx = 0, charIdx = 0) {
        if (lineIdx >= lines.length) return;
        if (charIdx === 0 && lineIdx > 0) el.textContent += '\n';
        if (charIdx < lines[lineIdx].length) {
            el.textContent += lines[lineIdx][charIdx];
            setTimeout(() => typeWriter(lines, el, lineIdx, charIdx + 1), 18);
        } else {
            setTimeout(() => typeWriter(lines, el, lineIdx + 1, 0), 120);
        }
    }
    const typewriterEl = popup.querySelector('#user-popup-typewriter');
    if (typewriterEl) {
        typewriterEl.textContent = '';
        typeWriter(infoLines, typewriterEl);
    }
}

async function renderNodeLazy(index, container) {
    try {
        const { contract } = await window.connectWallet();
        if (!contract) {
            throw new Error('No contract connection available');
        }
        
        let address = await contract.indexToAddress(index);
        if (!address || address === '0x0000000000000000000000000000000000000000') {
            renderEmptyNode(index, container);
            return;
        }
        
        let user = await contract.users(address);
        if (!user) {
            renderEmptyNode(index, container);
            return;
        }
        
        // ساخت گره ساده
        let nodeDiv = document.createElement('div');
        nodeDiv.style.display = 'flex';
        nodeDiv.style.flexDirection = 'column';
        nodeDiv.style.alignItems = 'center';
        nodeDiv.style.margin = '0.5em';
        nodeDiv.style.cursor = 'pointer';
        nodeDiv.style.position = 'relative';
        nodeDiv.style.background = 'transparent';
        nodeDiv.style.border = 'none';
        nodeDiv.style.padding = '0.5em';
        nodeDiv.style.transition = 'all 0.3s ease';
        
        // تولید CPA ID
        const cpaId = window.generateCPAId ? window.generateCPAId(user.index) : user.index;
        
        // فقط ادمک و ایندکس
        nodeDiv.innerHTML = `
            <div style='font-size:2.2em;'>👤</div>
            <div style='font-size:0.9em;color:#00ff88;'>${cpaId}</div>
        `;
        
        // دکمه expand/collapse
        let expandBtn = document.createElement('button');
        expandBtn.textContent = '+';
        expandBtn.style.marginTop = '0.3em';
        expandBtn.style.fontSize = '1em';
        expandBtn.style.background = '#232946';
        expandBtn.style.color = '#00ff88';
        expandBtn.style.border = 'none';
        expandBtn.style.borderRadius = '6px';
        expandBtn.style.cursor = 'pointer';
        expandBtn.style.padding = '0.3em 0.6em';
        expandBtn.style.transition = 'all 0.3s ease';
        nodeDiv.appendChild(expandBtn);
        
        // container برای فرزندان
        let childrenDiv = document.createElement('div');
        childrenDiv.style.display = 'none';
        childrenDiv.style.justifyContent = 'center';
        childrenDiv.style.gap = '2em';
        childrenDiv.style.marginTop = '1em';
        childrenDiv.style.flexDirection = 'row';
        childrenDiv.style.flexWrap = 'nowrap';
        
        // محاسبه margin افقی بر اساس سطح درخت
        const treeLevel = Math.floor(Math.log2(Number(index)));
        const horizontalMargin = Math.max(2, treeLevel * 1.5); // افزایش margin با عمق درخت
        childrenDiv.style.marginLeft = `${horizontalMargin}em`;
        childrenDiv.style.marginRight = `${horizontalMargin}em`;
        
        childrenDiv.setAttribute('data-index', index.toString());
        childrenDiv.setAttribute('data-level', treeLevel.toString());
        nodeDiv.appendChild(childrenDiv);
        
        // مدیریت expand/collapse
        let expanded = false;
        expandBtn.onclick = async function(e) {
            e.stopPropagation();
            if (!expanded) {
                expandBtn.textContent = '-';
                expandBtn.style.background = '#00ff88';
                expandBtn.style.color = '#232946';
                childrenDiv.style.display = 'flex';
                if (!childrenDiv.hasChildNodes()) {
                    try {
                        await renderNodeLazy(index * 2n, childrenDiv);
                        await renderNodeLazy(index * 2n + 1n, childrenDiv);
                    } catch (error) {
                        console.warn('Error rendering child nodes:', error);
                    }
                }
                expanded = true;
            } else {
                expandBtn.textContent = '+';
                expandBtn.style.background = '#232946';
                expandBtn.style.color = '#00ff88';
                childrenDiv.style.display = 'none';
                expanded = false;
            }
        };
        
        // نمایش popup struct با کلیک روی ادمک
        nodeDiv.querySelector('div').onclick = (e) => {
            e.stopPropagation();
            showUserPopup(address, user);
        };
        
        // hover effects ساده
        nodeDiv.onmouseover = function() {
            this.style.transform = 'scale(1.02)';
        };
        
        nodeDiv.onmouseout = function() {
            this.style.transform = 'scale(1)';
        };
        
        container.appendChild(nodeDiv);
        
    } catch (error) {
        console.warn('Error rendering node:', error);
        renderEmptyNode(index, container);
    }
}

// تابع رندر گره خالی (علامت سؤال)
function renderEmptyNode(index, container) {
    const emptyNode = document.createElement('div');
    emptyNode.className = 'empty-node';
    emptyNode.setAttribute('data-index', index);
    emptyNode.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 0.5em;
        cursor: pointer;
        background: transparent;
        border: none;
        padding: 0.5em;
        transition: all 0.3s ease;
        opacity: 0.7;
    `;
    emptyNode.innerHTML = `
        <div style="font-size:2.2em;opacity:0.5;pointer-events:none;">❓</div>
    `;
    emptyNode.title = 'ثبت‌نام زیرمجموعه جدید';
    
    // hover effects ساده
    emptyNode.onmouseover = function() {
        this.style.opacity = '1';
        this.style.transform = 'scale(1.02)';
    };
    
    emptyNode.onmouseout = function() {
        this.style.opacity = '0.7';
        this.style.transform = 'scale(1)';
    };
    
    // اضافه کردن کلیک برای نمایش فرم ثبت‌نام
    emptyNode.onclick = async function() {
        console.log('🖱️ Empty node clicked, index:', index);
        
        try {
            // بررسی اتصال کیف پول
            const { contract, address } = await window.connectWallet();
            if (!contract || !address) {
                alert('اتصال کیف پول در دسترس نیست!');
                return;
            }
            
            // دریافت آدرس معرف (parent)
            const parentIndex = Math.floor(Number(index) / 2);
            console.log('📊 Parent index calculated:', parentIndex);
            
            // بررسی معتبر بودن parentIndex
            if (parentIndex < 0 || !Number.isInteger(parentIndex)) {
                console.error('❌ Invalid parent index:', parentIndex);
                alert('خطا در محاسبه معرف!');
                return;
            }
            
            const parentAddress = await contract.indexToAddress(parentIndex);
            console.log('🔗 Parent address from contract:', parentAddress);
            
            if (!parentAddress || parentAddress === '0x0000000000000000000000000000000000000000') {
                console.error('❌ Invalid parent address:', parentAddress);
                alert('معرف معتبری پیدا نشد!');
                return;
            }
            
            // بررسی اینکه معرف فعال است
            try {
                const parentUser = await contract.users(parentAddress);
                if (!parentUser || !parentUser.activated) {
                    console.error('❌ Parent user not activated:', parentUser);
                    alert('معرف فعال نیست!');
                    return;
                }
            } catch (error) {
                console.error('❌ Error checking parent user:', error);
                alert('خطا در بررسی معرف!');
                return;
            }
            
            console.log('✅ Showing registration modal for index:', parentIndex, 'referrer:', parentAddress);
            
            // استفاده از سیستم ثبت‌نام موجود
            console.log('📝 Using existing registration system');
            
            // بررسی اتصال کیف پول
            if (!window.contractConfig || !window.contractConfig.contract) {
                alert('❌ ابتدا کیف پول را متصل کنید!');
                return;
            }
            
            // دریافت اطلاعات موجودی کاربر و شبکه
            let userBalance = 'در حال بارگذاری...';
            let registrationPrice = '100 CPA';
            let totalUsers = 'در حال بارگذاری...';
            let tokenPrice = 'در حال بارگذاری...';
            try {
                const { contract } = window.contractConfig;
                const balance = await contract.balanceOf(window.contractConfig.address);
                userBalance = window.ethers ? window.ethers.formatUnits(balance, 18) : balance.toString();
                
                // دریافت قیمت ثبت‌نام از قرارداد
                try {
                    let regPrice;
                    if (typeof contract.getRegPrice === 'function') {
                        regPrice = await contract.getRegPrice();
                    } else if (typeof contract.regPrice === 'function') {
                        regPrice = await contract.regPrice();
                    } else {
                        regPrice = window.ethers ? window.ethers.parseUnits('100', 18) : '100000000000000000000';
                    }
                    registrationPrice = window.ethers ? window.ethers.formatUnits(regPrice, 18) : regPrice.toString();
                } catch (e) {
                    console.log('Using default registration price');
                    registrationPrice = '100';
                }
                
                // دریافت تعداد کل کاربران
                try {
                    const wallets = await contract.wallets();
                    totalUsers = wallets.toString();
                } catch (e) {
                    console.log('Error getting total users:', e);
                }
                
                // دریافت قیمت توکن
                try {
                    const price = await contract.getTokenPrice();
                    tokenPrice = window.ethers ? window.ethers.formatUnits(price, 18) : price.toString();
                } catch (e) {
                    console.log('Error getting token price:', e);
                }
            } catch (e) {
                console.error('Error getting user balance:', e);
            }
            
            // نمایش modal ساده برای دریافت آدرس جدید
            const shortParentAddress = parentAddress.substring(0, 6) + '...' + parentAddress.substring(parentAddress.length - 4);
            const balanceStatus = parseFloat(userBalance) >= parseFloat(registrationPrice) ? '✅ کافی' : '❌ ناکافی';
            
            // بررسی کافی بودن موجودی
            if (parseFloat(userBalance) < parseFloat(registrationPrice)) {
                alert(`❌ موجودی ناکافی!\n\n💰 هزینه ثبت‌نام: ${registrationPrice} CPA\n💳 موجودی شما: ${userBalance} CPA\n\nلطفاً ابتدا توکن خریداری کنید.`);
                return;
            }
            
            // نمایش فرم زیبای ثبت‌نام
            const newAddress = await showBeautifulRegistrationForm(parentAddress, shortParentAddress, parentIndex, registrationPrice, userBalance, balanceStatus, tokenPrice, totalUsers);
            
            if (newAddress && /^0x[a-fA-F0-9]{40}$/.test(newAddress)) {
                try {
                    console.log('🔄 Starting registration for:', newAddress, 'with referrer:', parentAddress);
                    
                    // بررسی اینکه کاربر قبلاً ثبت‌نام نکرده باشد
                    const { contract } = window.contractConfig;
                    const existingUser = await contract.users(newAddress);
                    if (existingUser && existingUser.activated) {
                        alert('❌ این آدرس قبلاً ثبت‌نام کرده است!');
                        return;
                    }
                    
                    // بررسی اینکه آدرس جدید با آدرس فعلی متفاوت است
                    if (newAddress.toLowerCase() === window.contractConfig.address.toLowerCase()) {
                        alert('❌ نمی‌توانید خودتان را ثبت‌نام کنید!');
                        return;
                    }
                    
                    // استفاده از تابع ثبت‌نام موجود در config.js
                    if (typeof window.registerNewUserWithReferrer === 'function') {
                        console.log('🔄 Calling registerNewUserWithReferrer...');
                        
                        // ایجاد یک element موقت برای نمایش وضعیت
                        const tempStatus = document.createElement('div');
                        tempStatus.style.cssText = `
                            position: fixed;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            background: rgba(0,0,0,0.9);
                            color: #00ff88;
                            padding: 2rem;
                            border-radius: 12px;
                            z-index: 10000;
                            text-align: center;
                            font-weight: bold;
                        `;
                        document.body.appendChild(tempStatus);
                        
                        try {
                            const success = await window.registerNewUserWithReferrer(parentAddress, newAddress, tempStatus);
                            
                            if (success) {
                                alert('✅ ثبت‌نام با موفقیت انجام شد!');
                                
                                // منتظر تایید MetaMask و سپس بروزرسانی درخت
                                console.log('⏳ Waiting for MetaMask confirmation...');
                                
                                let checkCount = 0;
                                const maxChecks = 30; // حداکثر 60 ثانیه (30 بار × 2 ثانیه)
                                
                                // بررسی وضعیت تراکنش هر 2 ثانیه
                                const checkTransaction = async () => {
                                    checkCount++;
                                    
                                    try {
                                        const { contract } = window.contractConfig;
                                        const newUser = await contract.users(newAddress);
                                        
                                        if (newUser && newUser.activated) {
                                            console.log('✅ New user confirmed on blockchain');
                                            
                                            // بروزرسانی درخت شبکه بدون رفرش
                                            if (typeof window.renderSimpleBinaryTree === 'function') {
                                                console.log('🔄 Refreshing network tree...');
                                                await window.renderSimpleBinaryTree();
                                                
                                                // منتظر بروزرسانی کامل درخت
                                                setTimeout(() => {
                                                    console.log('✅ Tree refresh completed');
                                                }, 1000);
                                            }
                                            
                                            // Expand کردن گره جدید
                                            setTimeout(async () => {
                                                try {
                                                    console.log('🔄 Expanding new node...');
                                                    
                                                    // پیدا کردن گره parent و expand کردن آن
                                                    const parentIndex = Math.floor(Number(index) / 2);
                                                    const parentNode = document.querySelector(`[data-index="${parentIndex}"]`);
                                                    
                                                    if (parentNode) {
                                                        // پیدا کردن دکمه expand در گره parent
                                                        const expandBtn = parentNode.querySelector('button');
                                                        if (expandBtn) {
                                                            // اگر دکمه بسته است، آن را باز کن
                                                            if (expandBtn.textContent === '+') {
                                                                console.log('🔄 Clicking expand button for parent node...');
                                                                expandBtn.click();
                                                            }
                                                            
                                                            // منتظر رندر شدن فرزندان
                                                            setTimeout(() => {
                                                                // پیدا کردن گره جدید و highlight کردن آن
                                                                const newNode = document.querySelector(`[data-index="${index}"]`);
                                                                if (newNode) {
                                                                    console.log('✅ New node found and highlighted');
                                                                    newNode.style.animation = 'pulse 2s ease-in-out';
                                                                    newNode.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.8)';
                                                                    
                                                                    // اسکرول به گره جدید
                                                                    newNode.scrollIntoView({ 
                                                                        behavior: 'smooth', 
                                                                        block: 'center' 
                                                                    });
                                                                    
                                                                    // حذف highlight بعد از 3 ثانیه
                                                                    setTimeout(() => {
                                                                        newNode.style.animation = '';
                                                                        newNode.style.boxShadow = '';
                                                                    }, 3000);
                                                                } else {
                                                                    console.log('⚠️ New node not found, trying again...');
                                                                    // اگر گره پیدا نشد، دوباره تلاش کن
                                                                    setTimeout(() => {
                                                                        const retryNode = document.querySelector(`[data-index="${index}"]`);
                                                                        if (retryNode) {
                                                                            console.log('✅ New node found on retry');
                                                                            retryNode.style.animation = 'pulse 2s ease-in-out';
                                                                            retryNode.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.8)';
                                                                            retryNode.scrollIntoView({ 
                                                                                behavior: 'smooth', 
                                                                                block: 'center' 
                                                                            });
                                                                            setTimeout(() => {
                                                                                retryNode.style.animation = '';
                                                                                retryNode.style.boxShadow = '';
                                                                            }, 3000);
                                                                        } else {
                                                                            console.log('⚠️ New node still not found after retry');
                                                                        }
                                                                    }, 2000);
                                                                }
                                                            }, 1000);
                                                        } else {
                                                            console.log('⚠️ Expand button not found in parent node');
                                                        }
                                                    } else {
                                                        console.log('⚠️ Parent node not found');
                                                    }
                                                } catch (error) {
                                                    console.error('❌ Error expanding new node:', error);
                                                }
                                            }, 2000);
                                            
                                            // نمایش پیام موفقیت
                                            alert('🎉 کاربر جدید با موفقیت به درخت اضافه شد!');
                                        } else if (checkCount >= maxChecks) {
                                            console.log('⏰ Timeout reached, forcing refresh...');
                                            alert('⏰ زمان انتظار به پایان رسید. درخت در حال بروزرسانی...');
                                            
                                            // بروزرسانی اجباری درخت
                                            if (typeof window.renderSimpleBinaryTree === 'function') {
                                                await window.renderSimpleBinaryTree();
                                            }
                                        } else {
                                            console.log(`⏳ Transaction still pending... (${checkCount}/${maxChecks})`);
                                            // ادامه بررسی بعد از 2 ثانیه
                                            setTimeout(checkTransaction, 2000);
                                        }
                                    } catch (error) {
                                        console.error('❌ Error checking transaction:', error);
                                        
                                        if (checkCount >= maxChecks) {
                                            console.log('⏰ Timeout reached due to errors...');
                                            alert('⏰ خطا در بررسی تراکنش. درخت در حال بروزرسانی...');
                                            
                                            // بروزرسانی اجباری درخت
                                            if (typeof window.renderSimpleBinaryTree === 'function') {
                                                await window.renderSimpleBinaryTree();
                                            }
                                        } else {
                                            // در صورت خطا، بعد از 5 ثانیه دوباره بررسی کن
                                            setTimeout(checkTransaction, 5000);
                                        }
                                    }
                                };
                                
                                // شروع بررسی بعد از 3 ثانیه
                                setTimeout(checkTransaction, 3000);
                                
                                // نمایش اطلاعات تراکنش
                                console.log('📋 Transaction submitted successfully');
                                console.log('⏳ Waiting for blockchain confirmation...');
                                
                            } else {
                                alert('❌ ثبت‌نام ناموفق بود!');
                            }
                        } finally {
                            // حذف element موقت
                            if (tempStatus.parentNode) {
                                tempStatus.parentNode.removeChild(tempStatus);
                            }
                        }
                    } else {
                        alert('❌ تابع ثبت‌نام در دسترس نیست!');
                    }
                } catch (error) {
                    console.error('❌ Registration error:', error);
                    alert(`❌ خطا در ثبت‌نام: ${error.message}`);
                }
            } else if (newAddress) {
                alert('❌ آدرس کیف پول معتبر نیست!');
            }
            
        } catch (error) {
            console.error('❌ Error showing registration modal:', error);
            alert(`خطا: ${error.message}`);
        }
    };
    
    container.appendChild(emptyNode);
}

// تابع نمایش فرم زیبای ثبت‌نام
function showBeautifulRegistrationForm(parentAddress, shortParentAddress, parentIndex, registrationPrice, userBalance, balanceStatus, tokenPrice, totalUsers) {
    return new Promise((resolve) => {
        // حذف modal قبلی
        let oldModal = document.getElementById('beautiful-registration-modal');
        if (oldModal) oldModal.remove();
        
        // ساخت modal زیبا
        const modal = document.createElement('div');
        modal.id = 'beautiful-registration-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(10px);
        `;
        
        modal.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
                border: 2px solid #00ff88;
                border-radius: 20px;
                padding: 2rem;
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
                box-shadow: 0 20px 40px rgba(0, 255, 136, 0.3);
                direction: rtl;
            ">
                <!-- Header -->
                <div style="
                    text-align: center;
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid #00ff88;
                ">
                    <h2 style="
                        color: #00ff88;
                        margin: 0;
                        font-size: 1.5rem;
                        font-weight: bold;
                        text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
                    ">🌳 ثبت‌نام زیرمجموعه جدید</h2>
                    <p style="color: #ccc; margin: 0.5rem 0 0 0;">اطلاعات کامل ثبت‌نام</p>
                </div>
                
                <!-- Referrer Info -->
                <div style="
                    background: rgba(0, 255, 136, 0.1);
                    border: 1px solid #00ff88;
                    border-radius: 12px;
                    padding: 1rem;
                    margin-bottom: 1.5rem;
                ">
                    <h3 style="color: #00ff88; margin: 0 0 0.5rem 0; font-size: 1.1rem;">👤 اطلاعات معرف</h3>
                    <div style="display: grid; gap: 0.5rem; color: #fff;">
                        <div style="display: flex; justify-content: space-between;">
                            <span>آدرس:</span>
                            <span style="font-family: monospace; color: #00ff88;">${shortParentAddress}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Index:</span>
                            <span style="color: #00ff88; font-weight: bold;">${parentIndex}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Registration Info -->
                <div style="
                    background: rgba(255, 107, 107, 0.1);
                    border: 1px solid #ff6b6b;
                    border-radius: 12px;
                    padding: 1rem;
                    margin-bottom: 1.5rem;
                ">
                    <h3 style="color: #ff6b6b; margin: 0 0 0.5rem 0; font-size: 1.1rem;">💰 اطلاعات ثبت‌نام</h3>
                    <div style="display: grid; gap: 0.5rem; color: #fff;">
                        <div style="display: flex; justify-content: space-between;">
                            <span>هزینه:</span>
                            <span style="color: #ff6b6b; font-weight: bold;">${registrationPrice} CPA</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>موجودی شما:</span>
                            <span style="color: ${balanceStatus.includes('✅') ? '#00ff88' : '#ff6b6b'}; font-weight: bold;">${userBalance} CPA ${balanceStatus}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>قیمت توکن:</span>
                            <span style="color: #00ff88;">${tokenPrice} USDC</span>
                        </div>
                    </div>
                </div>
                
                <!-- Network Info -->
                <div style="
                    background: rgba(167, 134, 255, 0.1);
                    border: 1px solid #a786ff;
                    border-radius: 12px;
                    padding: 1rem;
                    margin-bottom: 1.5rem;
                ">
                    <h3 style="color: #a786ff; margin: 0 0 0.5rem 0; font-size: 1.1rem;">🌐 اطلاعات شبکه</h3>
                    <div style="display: grid; gap: 0.5rem; color: #fff;">
                        <div style="display: flex; justify-content: space-between;">
                            <span>تعداد کل کاربران:</span>
                            <span style="color: #a786ff; font-weight: bold;">${totalUsers}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>زمان تقریبی:</span>
                            <span style="color: #a786ff;">30-60 ثانیه</span>
                        </div>
                    </div>
                </div>
                
                <!-- New Address Input -->
                <div style="margin-bottom: 1.5rem;">
                    <label for="new-user-address" style="
                        display: block;
                        color: #fff;
                        font-weight: bold;
                        margin-bottom: 0.5rem;
                        font-size: 1.1rem;
                    ">🔑 آدرس کیف پول جدید</label>
                    <input id="new-user-address" 
                        type="text" 
                        placeholder="0x..." 
                        style="
                            width: 100%;
                            padding: 1rem;
                            border-radius: 12px;
                            border: 2px solid #a786ff;
                            background: rgba(0,0,0,0.3);
                            color: #fff;
                            font-family: monospace;
                            font-size: 1rem;
                            direction: ltr;
                            text-align: left;
                            box-sizing: border-box;
                            transition: all 0.3s;
                        "
                        onfocus="this.style.borderColor='#00ff88'; this.style.boxShadow='0 0 10px rgba(0,255,136,0.3)'"
                        onblur="this.style.borderColor='#a786ff'; this.style.boxShadow='none'"
                    />
                    <small style="color: #ccc; font-size: 0.9rem; display: block; margin-top: 0.5rem;">
                        آدرس باید با 0x شروع شود و 42 کاراکتر باشد
                    </small>
                </div>
                
                <!-- Action Buttons -->
                <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                    <button id="register-submit-btn" style="
                        flex: 1;
                        background: linear-gradient(135deg, #00ff88, #00cc66);
                        color: #1a1a2e;
                        font-weight: bold;
                        padding: 1rem;
                        border: none;
                        border-radius: 12px;
                        font-size: 1.1rem;
                        cursor: pointer;
                        transition: all 0.3s;
                        box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
                    " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px rgba(0,255,136,0.4)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 15px rgba(0,255,136,0.3)'">
                        ✅ ثبت‌نام
                    </button>
                    <button id="register-cancel-btn" style="
                        flex: 1;
                        background: linear-gradient(135deg, #ff6b6b, #ff4444);
                        color: #fff;
                        font-weight: bold;
                        padding: 1rem;
                        border: none;
                        border-radius: 12px;
                        font-size: 1.1rem;
                        cursor: pointer;
                        transition: all 0.3s;
                        box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
                    " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px rgba(255,107,107,0.4)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 15px rgba(255,107,107,0.3)'">
                        ❌ انصراف
                    </button>
                </div>
                
                <!-- Status Message -->
                <div id="registration-status" style="
                    padding: 1rem;
                    border-radius: 8px;
                    text-align: center;
                    font-weight: bold;
                    min-height: 20px;
                    display: none;
                "></div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        const submitBtn = document.getElementById('register-submit-btn');
        const cancelBtn = document.getElementById('register-cancel-btn');
        const addressInput = document.getElementById('new-user-address');
        const statusDiv = document.getElementById('registration-status');
        
        // Submit button
        submitBtn.onclick = () => {
            const address = addressInput.value.trim();
            if (!address) {
                showStatus('لطفاً آدرس کیف پول را وارد کنید', 'error');
                return;
            }
            if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
                showStatus('آدرس کیف پول معتبر نیست', 'error');
                return;
            }
            resolve(address);
            modal.remove();
        };
        
        // Cancel button
        cancelBtn.onclick = () => {
            resolve(null);
            modal.remove();
        };
        
        // Close on background click
        modal.onclick = (e) => {
            if (e.target === modal) {
                resolve(null);
                modal.remove();
            }
        };
        
        // Enter key on input
        addressInput.onkeyup = (e) => {
            if (e.key === 'Enter') {
                submitBtn.click();
            }
        };
        
        // Focus on input
        setTimeout(() => addressInput.focus(), 100);
        
        function showStatus(message, type) {
            statusDiv.style.display = 'block';
            statusDiv.style.color = type === 'error' ? '#ff6b6b' : '#00ff88';
            statusDiv.textContent = message;
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 3000);
        }
    });
}

// متغیر برای جلوگیری از رندر همزمان
let isRenderingTree = false;
let lastRenderedIndex = null;
let lastRenderedTime = 0;

window.renderSimpleBinaryTree = async function() {
    const container = document.getElementById('network-tree');
    if (!container) {
        console.error('❌ Network tree container not found');
        return;
    }
    
    // تنظیم container برای پیمایش افقی
    container.style.overflowX = 'auto';
    container.style.overflowY = 'hidden';
    container.style.whiteSpace = 'nowrap';
    container.style.padding = '2rem';
    container.style.minWidth = 'fit-content';
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'flex-start';
    container.style.width = '100%';
    container.style.maxWidth = 'none';
    
    // جلوگیری از رندر همزمان
    if (isRenderingTree) {
        console.log('⏳ Tree rendering already in progress, skipping...');
        return;
    }
    
    try {
        isRenderingTree = true;
        console.log('🔄 Starting network tree render...');
        
        // بررسی اتصال کیف پول
        const { contract, address } = await window.connectWallet();
        if (!contract || !address) {
            throw new Error('اتصال کیف پول در دسترس نیست');
        }
        
        console.log('✅ Wallet connected:', address);
        
        // بررسی کاربر
        const user = await contract.users(address);
        if (!user || !user.index) {
            throw new Error('کاربر پیدا نشد یا ثبت‌نام نشده است');
        }
        
        console.log('✅ User found, index:', user.index);
        
        // نمایش وضعیت بارگذاری
        container.innerHTML = '<div style="color:#00ccff;text-align:center;padding:2rem;">🔄 در حال بارگذاری درخت شبکه...</div>';
        
        // پاک کردن container
        container.innerHTML = '';
        
        // رندر کردن گره اصلی
        await renderNodeLazy(BigInt(user.index), container);
        
        // تنظیم عرض container بر اساس محتوا
        setTimeout(() => {
            const treeContent = container.querySelector('[data-index]');
            if (treeContent) {
                const contentWidth = treeContent.scrollWidth;
                const containerWidth = container.clientWidth;
                if (contentWidth > containerWidth) {
                    container.style.minWidth = `${contentWidth + 100}px`;
                }
            }
        }, 100);
        
        // ذخیره index رندر شده
        lastRenderedIndex = user.index;
        lastRenderedTime = Date.now();
        
        console.log('✅ Network tree rendered successfully');
        
    } catch (error) {
        console.error('❌ Error rendering binary tree:', error);
        container.innerHTML = `
            <div style="color:#ff4444;text-align:center;padding:2rem;">
                ❌ خطا در بارگذاری درخت شبکه<br>
                <small style="color:#ccc;">${error.message}</small>
                <br><br>
                <button onclick="window.renderSimpleBinaryTree()" style="
                    background: linear-gradient(135deg, #00ff88, #00cc66);
                    color: #232946;
                    border: none;
                    padding: 0.8rem 1.5rem;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-top: 1rem;
                ">🔄 تلاش مجدد</button>
            </div>
        `;
    } finally {
        isRenderingTree = false;
    }
};

// حذف event listener اضافی که باعث رندر مکرر می‌شود
// این بخش حذف شد چون در tabs.js و main.js event listener های مناسب وجود دارد

// اطمینان از اتصال توابع به window برای نمایش شبکه
if (typeof renderSimpleBinaryTree === 'function') {
    window.renderSimpleBinaryTree = renderSimpleBinaryTree;
}

// اضافه کردن event listener برای تب network
document.addEventListener('DOMContentLoaded', function() {
    // بررسی اینکه آیا در تب network هستیم
    const networkTab = document.getElementById('tab-network-btn');
    if (networkTab) {
        networkTab.addEventListener('click', function() {
            console.log('🔄 Network tab clicked, initializing...');
            setTimeout(() => {
                if (typeof window.initializeNetworkTab === 'function') {
                    window.initializeNetworkTab();
                }
            }, 500);
        });
    }
    
    // بررسی اینکه آیا در تب network هستیم و شبکه رندر نشده
    const networkSection = document.getElementById('main-network');
    if (networkSection && networkSection.style.display !== 'none') {
        console.log('🔄 Network section visible on load, initializing...');
        setTimeout(() => {
            if (typeof window.initializeNetworkTab === 'function') {
                window.initializeNetworkTab();
            }
        }, 1000);
    }
    
    // اضافه کردن event listener برای تغییر visibility
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const visibleNetworkSection = document.getElementById('main-network');
                if (visibleNetworkSection && visibleNetworkSection.style.display !== 'none') {
                    console.log('🔄 Network section became visible, initializing...');
                    setTimeout(() => {
                        if (typeof window.initializeNetworkTab === 'function') {
                            window.initializeNetworkTab();
                        }
                    }, 500);
                }
            }
        });
    });
    
    // observe کردن تغییرات در main-network
    if (networkSection) {
        observer.observe(networkSection, { attributes: true, attributeFilter: ['style'] });
    }
});

// تابع رفرش درخت باینری بعد از تایید متامسک
window.refreshBinaryTreeAfterMetaMask = async function() {
    try {
        // پاک کردن کامل درخت و reset متغیرها
        if (typeof window.clearBinaryTree === 'function') {
            window.clearBinaryTree();
        }
        
        // کمی صبر کن تا اتصال برقرار شود
        setTimeout(async () => {
            try {
                if (typeof window.renderSimpleBinaryTree === 'function') {
                    // force render با reset کردن متغیرها
                    lastRenderedIndex = null;
                    lastRenderedTime = 0;
                    await window.renderSimpleBinaryTree();
                }
            } catch (error) {
                console.warn('Error refreshing binary tree after MetaMask approval:', error);
            }
        }, 2000);
        
    } catch (error) {
        console.warn('Error in refreshBinaryTreeAfterMetaMask:', error);
    }
};

// تابع پاک کردن کامل درخت
window.clearBinaryTree = function() {
    const container = document.getElementById('network-tree');
    if (container) {
        container.innerHTML = '';
    }
    lastRenderedIndex = null;
    isRenderingTree = false;
    lastRenderedTime = 0;
};

window.initializeNetworkTab = async function() {
    console.log('🔄 Initializing network tab...');
    
    // پاک کردن درخت قبل از رندر جدید
    window.clearBinaryTree();
    
    // بررسی وجود container
    const container = document.getElementById('network-tree');
    if (!container) {
        console.error('❌ Network tree container not found');
        return;
    }
    
    console.log('✅ Network tree container found');
    
    // نمایش وضعیت بارگذاری
    container.innerHTML = '<div style="color:#00ccff;text-align:center;padding:2rem;">🔄 در حال بارگذاری درخت شبکه...</div>';
    
    // retry logic
    let retryCount = 0;
    const maxRetries = 3;
    
    const tryRender = async () => {
        try {
            if (typeof window.renderSimpleBinaryTree === 'function') {
                console.log(`🔄 Attempt ${retryCount + 1} to render network tree...`);
                await window.renderSimpleBinaryTree();
            } else {
                console.error('❌ renderSimpleBinaryTree function not found');
                container.innerHTML = '<div style="color:#ff4444;text-align:center;padding:2rem;">❌ تابع رندر شبکه پیدا نشد</div>';
            }
        } catch (error) {
            console.error(`❌ Error initializing network tab (attempt ${retryCount + 1}):`, error);
            retryCount++;
            
            if (retryCount < maxRetries) {
                console.log(`🔄 Retrying in 2 seconds... (${retryCount}/${maxRetries})`);
                setTimeout(tryRender, 2000);
            } else {
                container.innerHTML = `
                    <div style="color:#ff4444;text-align:center;padding:2rem;">
                        ❌ خطا در بارگذاری درخت شبکه<br>
                        <small style="color:#ccc;">${error.message}</small>
                        <br><br>
                        <button onclick="window.initializeNetworkTab()" style="
                            background: linear-gradient(135deg, #00ff88, #00cc66);
                            color: #232946;
                            border: none;
                            padding: 0.8rem 1.5rem;
                            border-radius: 8px;
                            font-weight: bold;
                            cursor: pointer;
                            margin-top: 1rem;
                        ">🔄 تلاش مجدد</button>
                    </div>
                `;
            }
        }
    };
    
    // کمی صبر کن تا UI کاملاً لود شود
    setTimeout(tryRender, 1000);
};

function getReferrerFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const referrer = urlParams.get('ref') || urlParams.get('referrer') || urlParams.get('r');
  if (referrer && /^0x[a-fA-F0-9]{40}$/.test(referrer)) {
    return referrer;
  }
  return null;
}

// تابع گرفتن معرف نهایی (کد رفرال یا دیپلویر)
async function getFinalReferrer(contract) {
  // ابتدا از URL بررسی کن
  const urlReferrer = getReferrerFromURL();
  if (urlReferrer) {
    try {
      const user = await contract.users(urlReferrer);
      if (user && user.activated) {
        return urlReferrer;
      }
    } catch (e) {
      console.warn('URL referrer not valid:', e);
    }
  }
  
  // اگر URL معرف نداشت، از آدرس فعلی استفاده کن
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const currentAddress = accounts[0];
    const user = await contract.users(currentAddress);
    if (user && user.activated) {
      return currentAddress;
    }
  } catch (e) {
    console.error('Error getting current address as referrer:', e);
  }
  
  // اگر هیچ‌کدام نبود، دیپلویر را برگردان
  try {
    return await contract.deployer();
  } catch (e) {
    console.error('Error getting deployer:', e);
    return null;
  }
}



 

// فرض: بعد از ثبت‌نام موفق یا عملیات نیازمند رفرش
window.refreshNetworkTab = function() {
  localStorage.setItem('activeTab', 'network');
  // window.location.reload(); // حذف شد: دیگر رفرش انجام نمی‌شود
}; 

// حذف توابع تست و دکمه‌های تست
// (تابع testNetworkContainer، testNetworkRender، testNetworkFromConsole و فراخوانی‌های آن‌ها حذف شد) 

// تابع force render برای رندر اجباری شبکه
window.forceRenderNetwork = async function() {
    console.log('🔄 Force rendering network tree...');
    
    // reset کردن متغیرها
    isRenderingTree = false;
    lastRenderedIndex = null;
    lastRenderedTime = 0;
    
    // پاک کردن container
    const container = document.getElementById('network-tree');
    if (container) {
        container.innerHTML = '';
    }
    
    // تلاش برای رندر
    if (typeof window.renderSimpleBinaryTree === 'function') {
        await window.renderSimpleBinaryTree();
    }
}; 

// تابع نمایش اطلاعات struct کاربر به صورت تایپ‌رایتر (فارسی)
window.showUserStructTypewriter = function(address, user) {
  const infoLines = [
    `CPA ID:  ${window.generateCPAId ? window.generateCPAId(user.index) : user.index}`,
    `امتیاز باینری:  ${user.binaryPoints}`,
    `امتیاز باینری دریافت‌شده:  ${user.binaryPointsClaimed}`,
    `امتیاز باینری مانده:  ${user.binaryPoints && user.binaryPointsClaimed ? (Number(user.binaryPoints) - Number(user.binaryPointsClaimed)) : '0'}`,
    `سقف امتیاز:  ${user.binaryPointCap}`,
    `امتیاز چپ:  ${user.leftPoints}`,
    `امتیاز راست:  ${user.rightPoints}`,
    `پاداش رفرال:  ${user.refclimed ? Math.floor(Number(user.refclimed) / 1e18) : '0'}`,
    `موجودی CPA:  ${user.lvlBalance ? user.lvlBalance : '0'}`,
    `موجودی POL:  ${user.maticBalance ? user.maticBalance : '0'}`,
    `موجودی USDC:  ${user.usdcBalance ? user.usdcBalance : '0'}`
  ];
  const popup = document.createElement('div');
  popup.id = 'user-popup';
  popup.style.position = 'fixed';
  popup.style.top = '50%';
  popup.style.left = '50%';
  popup.style.transform = 'translate(-50%,-50%)';
  popup.style.zIndex = 9999;
  popup.innerHTML = `
    <div style="background: #181c2a; padding: 0.2rem; width: 100%; max-width: 500px; overflow: hidden; direction: rtl; position: relative; font-family: 'Courier New', monospace;">
      <div class=\"popup-header\" style=\"display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem; padding-bottom: 0.1rem; border-bottom: none; cursor: pointer;\">
        <h3 style=\"color: #00ff88; margin: 0; font-size: 0.9rem; font-weight: bold; text-align: center; flex: 1; cursor: pointer; font-family: 'Courier New', monospace;\">👤 USER INFO (${shortAddress(address)})</h3>
        <button id=\"close-user-popup\" style=\"background: #ff6b6b; color: white; border: none; border-radius: 0; width: 20px; height: 20px; cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; font-family: 'Courier New', monospace;\" onmouseover=\"this.style.background='#ff4444'\" onmouseout=\"this.style.background='#ff6b6b'\">×</button>
      </div>
      <pre id=\"user-popup-typewriter\" style=\"background:#181c2a;padding:0.2rem;color:#00ff88;font-size:0.9rem;line-height:1.7;font-family:'Courier New',monospace;min-width:300px;direction:rtl;text-align:right;min-height:120px;max-height:320px;overflow-y:auto;border:none;box-shadow:none;display:block;\"></pre>
    </div>
  `;
  document.body.appendChild(popup);
  document.getElementById('close-user-popup').onclick = () => popup.remove();
  function typeWriter(lines, el, lineIdx = 0, charIdx = 0) {
    if (lineIdx >= lines.length) return;
    if (charIdx === 0 && lineIdx > 0) el.textContent += '\n';
    if (charIdx < lines[lineIdx].length) {
      el.textContent += lines[lineIdx][charIdx];
      setTimeout(() => typeWriter(lines, el, lineIdx, charIdx + 1), 18);
    } else {
      setTimeout(() => typeWriter(lines, el, lineIdx + 1, 0), 120);
    }
  }
  const typewriterEl = popup.querySelector('#user-popup-typewriter');
  if (typewriterEl) {
    typewriterEl.textContent = '';
    typeWriter(infoLines, typewriterEl);
  }
}; 