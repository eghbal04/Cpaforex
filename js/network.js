// نمایش درخت باینری با lazy load: هر گره با کلیک expand می‌شود و فقط فرزندان همان گره نمایش داده می‌شوند

function shortAddress(addr) {
    if (!addr) return '-';
    return addr.slice(0, 5) + '...' + addr.slice(-4);
}

function showUserPopup(address, user) {
    // تابع کوتاه‌کننده آدرس
    function shortAddress(addr) {
        if (!addr) return '-';
        return addr.slice(0, 6) + '...' + addr.slice(-4);
    }
    
    // حذف popup قبلی اگر وجود دارد
    let oldPopup = document.getElementById('user-popup');
    if (oldPopup) oldPopup.remove();
    
    // اطلاعات برای نمایش
    const infoLines = [
        `🔗 Address:   ${address}`,
        `📋 Index:     ${user.index}`,
        `🆔 CPA ID:    ${window.generateCPAId ? window.generateCPAId(user.index) : user.index}`,
        `✅ Activated: ${user.activated ? 'بله' : 'خیر'}`,
        `🎯 BinaryPoints: ${user.binaryPoints}`,
        `📈 Cap:      ${user.binaryPointCap}`,
        `⬅️ Left:     ${user.leftPoints}`,
        `➡️ Right:    ${user.rightPoints}`,
        `💰 Refclimed:${user.refclimed}`,
        '',
        '--- Financial Info ---',
        `🏆 Binary Claimed: ${user.binaryPointsClaimed}`,
        `🗓️ Monthly Withdrawn: ${user.totalMonthlyRewarded}`,
        `💳 Total Deposited: ${user.depositedAmount}`,
        `🛒 Total Purchased: ${user.totalPurchasedKind}`
    ];
    
    // ساخت popup بهینه‌سازی شده برای موبایل
    const popup = document.createElement('div');
    popup.id = 'user-popup';
    popup.style = `
      position: fixed;
      z-index: 9999;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      box-sizing: border-box;
    `;
    
    popup.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #181c2a, #232946);
        padding: 1.5rem;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        width: 100%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        direction: rtl;
        position: relative;
        border: 2px solid #a786ff;
      ">
        <!-- Header -->
        <div style="
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #a786ff;
        ">
          <h3 style="
            color: #00ff88;
            margin: 0;
            font-size: 1.3rem;
            font-weight: bold;
            text-align: center;
          ">👤 اطلاعات کاربر</h3>
        </div>
        <pre id="user-popup-typewriter" style="background:rgba(0,0,0,0.2);border:1.5px solid #333;padding:1.2rem 1.5rem;border-radius:12px;color:#00ff88;font-size:1.05rem;line-height:2;font-family:monospace;overflow-x:auto;margin-bottom:0;box-shadow:0 2px 12px #00ff8840;min-width:180px;direction:ltr;text-align:left;white-space:pre-wrap;min-height:220px;"></pre>
      </div>
    `;
    
    document.body.appendChild(popup);
    
    // Close when clicking anywhere outside the content area
    popup.onclick = (e) => {
        // Check if click is on the popup background or outside the content div
        if (e.target === popup || !e.target.closest('div[style*="background: linear-gradient"]')) {
            popup.remove();
        }
    };

    // Typewriter effect
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
    const typewriterEl = document.getElementById('user-popup-typewriter');
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
        childrenDiv.setAttribute('data-index', index.toString());
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
    
    container.appendChild(emptyNode);
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
  return urlParams.get('ref') || urlParams.get('referrer');
}

// تابع گرفتن معرف نهایی (کد رفرال یا دیپلویر)
async function getFinalReferrer(contract) {
  let ref = getReferrerFromURL();
  if (ref && /^0x[a-fA-F0-9]{40}$/.test(ref)) return ref;
  // اگر کد رفرال نبود، دیپلویر را بگیر
  try {
    return await contract.deployer();
  } catch (e) {
    return null;
  }
}

// نمایش modal ثبت‌نام برای گره خالی - بهینه‌سازی شده برای موبایل
function showRegisterModal(parentIndex, parentAddress) {
    // ابتدا modal قبلی را حذف کن
    let old = document.getElementById('register-modal');
    if (old) old.remove();
    
    // ساخت modal
    const modal = document.createElement('div');
    modal.id = 'register-modal';
    modal.style = `
      position: fixed;
      z-index: 3000;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      box-sizing: border-box;
    `;
    
    modal.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #232946, #181c2a);
        padding: 1.5rem;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        width: 100%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        direction: rtl;
        position: relative;
        border: 2px solid #a786ff;
      ">
        <!-- Header -->
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #a786ff;
        ">
          <h3 style="
            color: #00ff88;
            margin: 0;
            font-size: 1.3rem;
            font-weight: bold;
            text-align: center;
            flex: 1;
          ">🌳 ثبت‌نام زیرمجموعه</h3>
          <button id="register-modal-close" style="
            background: none;
            border: none;
            color: #fff;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.3s;
          " onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='none'">×</button>
        </div>

        <!-- Referrer Info -->
        <div style="
          background: rgba(167, 134, 255, 0.1);
          border: 1px solid #a786ff;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        ">
          <div style="color: #a786ff; font-weight: bold; margin-bottom: 0.8rem;">👤 اطلاعات معرف:</div>
          <div style="display: grid; gap: 0.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #fff;">📊 Index:</span>
              <span style="color: #00ff88; font-weight: bold;">${parentIndex}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #fff;">🔗 Address:</span>
              <span style="
                color: #00ff88;
                font-family: monospace;
                font-size: 0.9rem;
                word-break: break-all;
                max-width: 60%;
                text-align: left;
              ">${parentAddress}</span>
            </div>
          </div>
        </div>

        <!-- New Address Input -->
        <div style="margin-bottom: 1.5rem;">
          <label for="register-new-address" style="
            display: block;
            color: #fff;
            font-weight: bold;
            margin-bottom: 0.5rem;
          ">🔑 آدرس ولت جدید:</label>
          <input id="register-new-address" 
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
              transition: border-color 0.3s;
            "
            onfocus="this.style.borderColor='#00ff88'"
            onblur="this.style.borderColor='#a786ff'"
          />
        </div>

        <!-- Fee Info -->
        <div id="register-fee-info" style="
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid #ff6b6b;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1rem;
          color: #ff6b6b;
          font-weight: bold;
          text-align: center;
        ">در حال بارگذاری اطلاعات هزینه...</div>

        <!-- MATIC Info -->
        <div id="register-matic-info" style="
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid #00ff88;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          color: #00ff88;
          font-weight: bold;
          text-align: center;
        ">در حال بارگذاری موجودی MATIC...</div>

        <!-- Action Button -->
        <button id="register-submit-btn" style="
          background: linear-gradient(135deg, #00ff88, #00cc66);
          color: #232946;
          font-weight: bold;
          padding: 1rem;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
          width: 100%;
        " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px rgba(0,255,136,0.4)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 15px rgba(0,255,136,0.3)'">
          ✅ ثبت‌نام زیرمجموعه
        </button>

        <!-- Status Message -->
        <div id="register-modal-status" style="
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          font-weight: bold;
          min-height: 20px;
        "></div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // بستن modal
    document.getElementById('register-modal-close').onclick = () => modal.remove();
    
    // Close on background click
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
    // گرفتن اطلاعات هزینه ثبت‌نام و موجودی متیک
    (async function() {
      try {
        const { contract, address, provider } = await window.connectWallet();
        // مقدار توکن مورد نیاز (فرض: contract.registrationFee())
        let fee = '-';
        try {
          if (contract.registrationFee) {
            const feeVal = await contract.registrationFee();
            fee = window.ethers ? window.ethers.formatUnits(feeVal, 18) : feeVal.toString();
          } else {
            fee = '---';
          }
        } catch (e) { fee = '---'; }
        document.getElementById('register-fee-info').textContent = `Registration Fee: ${fee} CPA`;
        // موجودی متیک
        let matic = '-';
        try {
          if (provider && address) {
            const bal = await provider.getBalance(address);
            matic = window.ethers ? window.ethers.formatUnits(bal, 18) : bal.toString();
          }
        } catch (e) { matic = '---'; }
        document.getElementById('register-matic-info').textContent = `Your MATIC Balance: ${matic}`;
      } catch (e) {
        document.getElementById('register-fee-info').textContent = 'Error loading fee info';
        document.getElementById('register-matic-info').textContent = 'Error loading MATIC balance';
      }
    })();
    // ثبت‌نام
    document.getElementById('register-submit-btn').onclick = async function() {
      const status = document.getElementById('register-modal-status');
      status.textContent = '';
      const newAddr = document.getElementById('register-new-address').value.trim();
      if (!/^0x[a-fA-F0-9]{40}$/.test(newAddr)) {
        status.textContent = 'آدرس ولت جدید معتبر نیست!';
        return;
      }
      // استفاده از منطق ثبت‌نام اصلی پروژه
      if (window.registerNewUserWithReferrer) {
        const referrerAddress = await getFinalReferrer(contract);
        if (!referrerAddress) {
          status.textContent = 'معرف معتبری پیدا نشد. لطفاً به صفحه قبلی بروید یا یک کد رفرال در URL ارسال کنید.';
          return;
        }
        await window.registerNewUserWithReferrer(referrerAddress, newAddr, status);
        // بعد از موفقیت، درخت شبکه را رفرش کن
        setTimeout(() => { modal.remove(); window.renderSimpleBinaryTree && window.renderSimpleBinaryTree(); }, 1500);
      } else {
        status.textContent = 'تابع ثبت‌نام اصلی پیدا نشد!';
      }
    };
}

// هندل کلیک روی علامت سؤال (گره خالی)
document.addEventListener('click', function(e) {
  // بررسی کلیک روی خود عنصر یا فرزندان آن
  let targetElement = e.target;
  while (targetElement && !targetElement.classList.contains('empty-node')) {
    targetElement = targetElement.parentElement;
  }
  
  if (targetElement && targetElement.classList.contains('empty-node')) {
    console.log('Empty node clicked:', targetElement);
    const parentIndex = targetElement.getAttribute('data-index');
    console.log('Parent index:', parentIndex);
    
    (async function() {
      try {
        const { contract } = await window.connectWallet();
        // اگر parentIndex صفر است، معرف وجود ندارد (ریشه)
        if (parentIndex === 0) {
          alert('ثبت‌نام زیر ریشه مجاز نیست!');
          return;
        }
        const referrerAddress = await contract.indexToAddress(BigInt(parentIndex));
        if (!referrerAddress || referrerAddress === '0x0000000000000000000000000000000000000000') {
          // فقط اگر آدرس صفر بود، ثبت‌نام مجاز نیست
          return;
        }
        console.log('Showing register modal for index:', parentIndex, 'referrer:', referrerAddress);
        showRegisterModal(parentIndex, referrerAddress); // معرف = آدرس گره والد واقعی
      } catch (e) {
        console.error('Error handling empty node click:', e);
        alert('خطا در دریافت آدرس معرف: ' + (e && e.message ? e.message : e));
      }
    })();
  }
}); 

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