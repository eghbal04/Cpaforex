// reports.js - بخش گزارشات و فعالیت‌ها
let isReportsLoading = false;

// حذف کد تستی و logها

async function waitForWalletConnection() {
    try {
        // Reports section loaded, waiting for wallet connection...
        // بررسی اتصال کیف پول
        const connection = await checkConnection();
        if (!connection.connected) {
            showReportsError("لطفا ابتدا کیف پول خود را متصل کنید");
        return;
    }
    
        // بارگذاری گزارشات
        await loadReports(connection.address);

        // راه‌اندازی فیلترها
        // setupFilters(); // حذف شد

        // به‌روزرسانی خودکار هر 5 دقیقه
        // setInterval(loadReports, 300000); // حذف شد

    } catch (error) {
        showReportsError("خطا در بارگذاری گزارشات");
    }
}

// تابع اتصال به کیف پول با انتظار
async function connectWallet() {
    try {
        // بررسی اتصال موجود
        if (window.contractConfig && window.contractConfig.contract) {
            return window.contractConfig;
        }
        
        // بررسی اتصال MetaMask موجود
        if (typeof window.ethereum !== 'undefined') {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
                try {
                    await initializeWeb3();
                    return window.contractConfig;
                } catch (error) {
                    throw new Error('خطا در راه‌اندازی Web3');
                }
            }
        }
        
        throw new Error('لطفاً ابتدا کیف پول خود را متصل کنید');
        
    } catch (error) {
        showReportsError('خطا در اتصال به کیف پول');
        throw error;
    }
}

// تابع فرمت کردن آدرس
function shortenAddress(address) {
    if (!address) return '-';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// تابع فرمت کردن هش تراکنش
function shortenTransactionHash(hash) {
    if (!hash) return '-';
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

// تابع فرمت تاریخ بهبود یافته
    function formatDate(timestamp) {
    try {
        // بررسی اعتبار timestamp
        if (!timestamp || isNaN(timestamp)) {
            return "تاریخ نامعتبر";
        }
        
        // تبدیل timestamp به تاریخ
        let date;
        if (timestamp < 1000000000000) {
            // اگر timestamp در ثانیه است، به میلی‌ثانیه تبدیل کن
            date = new Date(timestamp * 1000);
        } else {
            // اگر timestamp در میلی‌ثانیه است
            date = new Date(timestamp);
        }
        
        // بررسی اعتبار تاریخ
        if (isNaN(date.getTime())) {
            return "تاریخ نامعتبر";
        }
        
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        // اگر کمتر از 1 دقیقه
        if (diffInSeconds < 60) {
            return `${diffInSeconds} ثانیه پیش`;
        }
        
        // اگر کمتر از 1 ساعت
        if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} دقیقه پیش`;
        }
        
        // اگر کمتر از 1 روز
        if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} ساعت پیش`;
        }
        
        // اگر کمتر از 7 روز
        if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} روز پیش`;
        }
        
        // برای تاریخ‌های قدیمی، نمایش تاریخ کامل
        const persianMonths = [
            'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
            'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
        ];
        
        const persianDays = [
            'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'
        ];
        
        // تبدیل به تاریخ شمسی (تقریبی)
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        
        // تبدیل تقریبی به شمسی (سال شمسی = سال میلادی - 621)
        const persianYear = year - 621;
        const persianMonth = persianMonths[month];
        
        return `${day} ${persianMonth} ${persianYear} - ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
    } catch (error) {
        return "خطا در نمایش تاریخ";
    }
    }
    
    // تابع فرمت کردن اعداد
    function formatNumber(value, decimals = 18) {
        try {
            if (!value || value.toString() === '0') return '0';
            const formatted = ethers.formatUnits(value, decimals);
            const num = parseFloat(formatted);
            if (num < 0.000001) {
                return num.toExponential(2);
            }
            return num.toLocaleString('en-US', { maximumFractionDigits: 6 });
        } catch (error) {
            return '0';
        }
    }
    
    // تابع دریافت گزارشات از قرارداد
    async function fetchReports() {
        try {
            const { contract, address } = await connectWallet();
            const provider = contract.runner && contract.runner.provider ? contract.runner.provider : contract.provider;
            const reports = [];
            
            // استفاده از retry برای دریافت block number
            const currentBlock = await window.retryRpcOperation(async () => {
                return await contract.runner.provider.getBlockNumber();
            });
            
            const fromBlock = Math.max(0, currentBlock - 50000);
            // Activated
            let activatedEvents = [];
            try {
                activatedEvents = await window.safeQueryEvents(contract, contract.filters.Activated(), fromBlock, currentBlock);
            } catch (e) {
                console.warn('Failed to fetch Activated events:', e);
                activatedEvents = [];
            }
            activatedEvents.forEach(event => {
                if (event.args.user.toLowerCase() === address.toLowerCase()) {
                    reports.push({
                        type: 'registration',
                        title: 'ثبت‌نام',
                        amount: formatNumber(event.args.amountLvl || event.args.amountlvl, 18) + ' CPA',
                        timestamp: event.blockNumber,
                        transactionHash: event.transactionHash,
                        blockNumber: event.blockNumber,
                        address: event.args.user,
                        logIndex: event.logIndex
                    });
                }
            });
            // PurchaseKind
            let purchaseEvents = [];
            try {
                purchaseEvents = await window.safeQueryEvents(contract, contract.filters.PurchaseKind(), fromBlock, currentBlock);
            } catch (e) {
                console.warn('Failed to fetch PurchaseKind events:', e);
                purchaseEvents = [];
            }
                purchaseEvents.forEach(event => {
                if (event.args.user.toLowerCase() === address.toLowerCase()) {
                    reports.push({
                        type: 'purchase',
                        title: 'خرید با USDC',
                        amount: formatNumber(event.args.amountLvl || event.args.amountlvl, 18) + ' CPA',
                        timestamp: event.blockNumber,
                        transactionHash: event.transactionHash,
                        blockNumber: event.blockNumber,
                        address: event.args.user,
                        logIndex: event.logIndex
                    });
                }
                });
            // TokensBought
            let buyEvents = [];
            try {
                buyEvents = await window.safeQueryEvents(contract, contract.filters.TokensBought(), fromBlock, currentBlock);
            } catch (e) {}
                buyEvents.forEach(event => {
                if (event.args.buyer.toLowerCase() === address.toLowerCase()) {
                    reports.push({
                        type: 'trading',
                        title: 'خرید با USDC',
                        amount: `${formatNumber(event.args.maticAmount, 18)} POL → ${formatNumber(event.args.tokenAmount, 18)} CPA`,
                        timestamp: event.blockNumber,
                        transactionHash: event.transactionHash,
                        blockNumber: event.blockNumber,
                        address: event.args.buyer,
                        logIndex: event.logIndex
                    });
                }
                });
            // TokensSold
            let sellEvents = [];
            try {
                sellEvents = await window.safeQueryEvents(contract, contract.filters.TokensSold(), fromBlock, currentBlock);
            } catch (e) {}
                sellEvents.forEach(event => {
                if (event.args.seller.toLowerCase() === address.toLowerCase()) {
                    reports.push({
                        type: 'trading',
                        title: 'فروش توکن',
                        amount: `${formatNumber(event.args.tokenAmount, 18)} CPA → ${formatNumber(event.args.maticAmount, 18)} POL`,
                        timestamp: event.blockNumber,
                        transactionHash: event.transactionHash,
                        blockNumber: event.blockNumber,
                        address: event.args.seller,
                        logIndex: event.logIndex
                    });
                }
                });
            // BinaryPointsUpdated
            let binaryEvents = [];
            try {
                binaryEvents = await window.safeQueryEvents(contract, contract.filters.BinaryPointsUpdated(), fromBlock, currentBlock);
            } catch (e) {}
                binaryEvents.forEach(event => {
                if (event.args.user.toLowerCase() === address.toLowerCase()) {
                    reports.push({
                        type: 'binary',
                        title: 'به‌روزرسانی امتیاز باینری',
                        amount: `${formatNumber(event.args.newPoints, 18)} امتیاز (سقف: ${formatNumber(event.args.newCap, 18)})`,
                        timestamp: event.blockNumber,
                        transactionHash: event.transactionHash,
                        blockNumber: event.blockNumber,
                        address: event.args.user,
                        logIndex: event.logIndex
                    });
                }
            });
            // BinaryRewardDistributed
            let binaryRewardEvents = [];
            try {
                binaryRewardEvents = await window.safeQueryEvents(contract, contract.filters.BinaryRewardDistributed(), fromBlock, currentBlock);
            } catch (e) {}
            binaryRewardEvents.forEach(event => {
                if (event.args.claimer.toLowerCase() === address.toLowerCase()) {
                    reports.push({
                        type: 'binary',
                        title: 'دریافت پاداش باینری',
                        amount: `${formatNumber(event.args.claimerReward, 18)} CPA`,
                        timestamp: event.blockNumber,
                        transactionHash: event.transactionHash,
                        blockNumber: event.blockNumber,
                        address: event.args.claimer,
                        logIndex: event.logIndex
                    });
                }
            });
            // TreeStructureUpdated
            let treeEvents = [];
            try {
                treeEvents = await window.safeQueryEvents(contract, contract.filters.TreeStructureUpdated(), fromBlock, currentBlock);
            } catch (e) {}
            treeEvents.forEach(event => {
                if ([event.args.user, event.args.parent, event.args.referrer].map(a=>a.toLowerCase()).includes(address.toLowerCase())) {
                    let posLabel = '';
                    if (event.args.position == 0) posLabel = 'فرزند سمت چپ ثبت شد';
                    else if (event.args.position == 1) posLabel = 'فرزند سمت راست ثبت شد';
                    else posLabel = `موقعیت: ${event.args.position}`;
                    reports.push({
                        type: 'network',
                        title: 'تغییر ساختار شبکه',
                        amount: posLabel,
                        timestamp: event.blockNumber,
                        transactionHash: event.transactionHash,
                        blockNumber: event.blockNumber,
                        address: event.args.user,
                        logIndex: event.logIndex
                    });
                }
            });
            // Transfer
            let transferEvents = [];
            try {
                transferEvents = await contract.queryFilter(contract.filters.Transfer(), fromBlock, currentBlock);
            } catch (e) {}
            transferEvents.forEach(event => {
                if ([event.args.from, event.args.to].map(a=>a.toLowerCase()).includes(address.toLowerCase())) {
                    reports.push({
                        type: 'transfer',
                        title: 'انتقال توکن',
                        amount: `${formatNumber(event.args.value, 18)} CPA`,
                        timestamp: event.blockNumber,
                        transactionHash: event.transactionHash,
                        blockNumber: event.blockNumber,
                        address: event.args.from === address ? event.args.to : event.args.from,
                        logIndex: event.logIndex
                    });
                }
            });
            // Approval
            let approvalEvents = [];
            try {
                approvalEvents = await contract.queryFilter(contract.filters.Approval(), fromBlock, currentBlock);
            } catch (e) {}
            approvalEvents.forEach(event => {
                if ([event.args.owner, event.args.spender].map(a=>a.toLowerCase()).includes(address.toLowerCase())) {
                    reports.push({
                        type: 'approval',
                        title: 'تأییدیه انتقال',
                        amount: `${formatNumber(event.args.value, 18)} CPA`,
                        timestamp: event.blockNumber,
                        transactionHash: event.transactionHash,
                        blockNumber: event.blockNumber,
                        address: event.args.owner === address ? event.args.spender : event.args.owner,
                        logIndex: event.logIndex
                    });
                }
            });
            // DirectMATICReceived
            let directMaticEvents = [];
            try {
                directMaticEvents = await contract.queryFilter(contract.filters.DirectMATICReceived(), fromBlock, currentBlock);
            } catch (e) {}
            directMaticEvents.forEach(event => {
                if (event.args.sender.toLowerCase() === address.toLowerCase()) {
                    reports.push({
                        type: 'deposit',
                        title: 'واریز مستقیم MATIC',
                        amount: `${formatNumber(event.args.amount, 18)} MATIC`,
                        timestamp: event.blockNumber,
                        transactionHash: event.transactionHash,
                        blockNumber: event.blockNumber,
                        address: event.args.sender,
                        logIndex: event.logIndex
                    });
                }
                });
            // After collecting all events into reports array, fetch timestamps for each unique blockNumber
            const blockNumbers = [...new Set(reports.map(r => r.blockNumber))];
            const blockTimestamps = {};
            for (const bn of blockNumbers) {
                try {
                    const block = await provider.getBlock(bn);
                    blockTimestamps[bn] = block.timestamp;
                } catch (e) {
                    blockTimestamps[bn] = null;
                }
            }
            // Assign real timestamp to each report
            reports.forEach(r => {
                r.timestamp = blockTimestamps[r.blockNumber] ? blockTimestamps[r.blockNumber] * 1000 : null;
            });
            // مرتب‌سازی بر اساس تاریخ (جدیدترین اول)
            reports.sort((a, b) => b.blockNumber - a.blockNumber);
            return reports;
        } catch (error) {
            console.error('Error fetching reports:', error);
            // در صورت خطا، گزارش خالی برگردان
            return [];
        }
    }
    
    // تابع نمایش گزارشات
    function displayReports(reports) {
        const reportsContainer = document.getElementById('reports-container');
        if (!reportsContainer) {
            console.error('❌ reports-container پیدا نشد!');
            return;
        }
        
        // نمایش همه گزارشات بدون فیلتر
        if (reports.length === 0) {
            reportsContainer.innerHTML = `
                <div class="no-reports">
                    <p>هیچ گزارشی یافت نشد.</p>
                    <p>برای مشاهده گزارشات، ابتدا فعالیتی در پلتفرم انجام دهید.</p>
                </div>
            `;
            return;
        }
    
        const reportsHTML = reports.map(report => {
            const { type, title, amount, timestamp, blockNumber, address, usdcAmount, desc, token, date, referrer } = report;
            return `
                <div class="report-item">
                    <div class="report-header">
                        <div class="report-type">${getReportIcon(type)} ${desc || title || type}</div>
                        <div class="report-time" style="font-size:0.95em;color:#a786ff;">${date || formatDate(timestamp)}</div>
                    </div>
                    <div class="report-details">
                        ${address ? `<div class="report-details-row"><span class="report-details-label">آدرس:</span><span class="report-details-value"><a href="https://polygonscan.com/address/${address}" target="_blank" style="color:#a786ff;text-decoration:underline;">${shortenAddress(address)}</a></span></div>` : ''}
                        ${referrer ? `<div class="report-details-row"><span class="report-details-label">معرف:</span><span class="report-details-value">${shortenAddress(referrer)}</span></div>` : ''}
                        <div class="report-details-row"><span class="report-details-label">مقدار:</span><span class="report-details-value">${amount} ${token || ''}</span></div>
                        ${usdcAmount ? `<div class="report-details-row"><span class="report-details-label">USDC:</span><span class="report-details-value">${Number(usdcAmount).toLocaleString('en-US', {maximumFractionDigits: 2})} USDC</span></div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        reportsContainer.innerHTML = reportsHTML;
    }

    // تابع دریافت آیکون برای نوع گزارش
    function getReportIcon(type) {
        const icons = {
        'purchase': '🛒',
        'registration': '📝',
        'activation': '✅',
        'trading': '💱',
        'binary': '📊'
        };
    return icons[type] || '📄';
    }
    
    // تابع بارگذاری گزارشات
    async function loadReports(address) {
    if (isReportsLoading) {
        return;
    }
    
    isReportsLoading = true;
    
    try {
        const reports = await window.getAllReports(address);
        displayReports(reports);
        
        // تنظیم فیلترها
        // setupFilters(); // حذف شد
            
        } catch (error) {
        showReportsError("خطا در بارگذاری گزارشات");
    } finally {
        isReportsLoading = false;
    }
}

// فراخوانی هنگام لود صفحه یا اتصال کیف پول:
window.loadReports = loadReports;

// تابع بررسی اتصال کیف پول
async function checkConnection() {
    try {
        const { provider, address } = await connectWallet();
        const network = await provider.getNetwork();
        
        return {
            connected: true,
            address,
            network: network.name,
            chainId: network.chainId
        };
    } catch (error) {
        return {
            connected: false,
            error: error.message
        };
    }
}

// تابع نمایش پیغام خطا در صفحه گزارشات
function showReportsError(message) {
    const reportsContainer = document.getElementById('reports-container');
    if (reportsContainer) {
            reportsContainer.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
                </div>
            `;
            }
        }
    
// تابع راه‌اندازی فیلترها حذف شد - همه گزارشات نمایش داده می‌شوند 

// تبدیل تابع fetchReports به window.fetchReports
window.fetchReports = async function(address) {
    try {
        const { contract, address: userAddress } = await connectWallet();
        const provider = contract.runner && contract.runner.provider ? contract.runner.provider : contract.provider;
        const reports = [];
        const currentBlock = await window.retryRpcOperation(async () => {
            return await contract.runner.provider.getBlockNumber();
        });
        // تعیین بازه جستجو بر اساس نوع دستگاه
        const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent);
        const blockWindow = isMobile ? 15000 : 30000;
        const fromBlock = Math.max(0, currentBlock - blockWindow);
        // Activated
        let activatedEvents = [];
        try {
            activatedEvents = await window.safeQueryEvents(contract, contract.filters.Activated(), fromBlock, currentBlock);
        } catch (e) {
            console.warn('Failed to fetch Activated events:', e);
            activatedEvents = [];
        }
        activatedEvents.forEach(event => {
            if (event.args.user.toLowerCase() === userAddress.toLowerCase()) {
                reports.push({
                    type: 'registration',
                    title: 'ثبت‌نام',
                    amount: formatNumber(event.args.amountLvl || event.args.amountlvl, 18) + ' CPA',
                    timestamp: event.blockNumber,
                    transactionHash: event.transactionHash,
                    blockNumber: event.blockNumber,
                    address: event.args.user,
                    logIndex: event.logIndex
                });
            }
        });
        // PurchaseKind
        let purchaseEvents = [];
        try {
            purchaseEvents = await window.safeQueryEvents(contract, contract.filters.PurchaseKind(), fromBlock, currentBlock);
        } catch (e) {
            console.warn('Failed to fetch PurchaseKind events:', e);
            purchaseEvents = [];
        }
            purchaseEvents.forEach(event => {
            if (event.args.user.toLowerCase() === userAddress.toLowerCase()) {
                reports.push({
                    type: 'purchase',
                    title: 'خرید با USDC',
                    amount: formatNumber(event.args.amountLvl || event.args.amountlvl, 18) + ' CPA',
                    timestamp: event.blockNumber,
                    transactionHash: event.transactionHash,
                    blockNumber: event.blockNumber,
                    address: event.args.user,
                    logIndex: event.logIndex
                });
            }
            });
        // TokensBought
        let buyEvents = [];
        try {
            buyEvents = await window.safeQueryEvents(contract, contract.filters.TokensBought(), fromBlock, currentBlock);
        } catch (e) {}
            buyEvents.forEach(event => {
            if (event.args.buyer.toLowerCase() === userAddress.toLowerCase()) {
                reports.push({
                    type: 'trading',
                    title: 'خرید با USDC',
                    amount: `${formatNumber(event.args.maticAmount, 18)} POL → ${formatNumber(event.args.tokenAmount, 18)} CPA`,
                    timestamp: event.blockNumber,
                    transactionHash: event.transactionHash,
                    blockNumber: event.blockNumber,
                    address: event.args.buyer,
                    logIndex: event.logIndex
                });
            }
            });
        // TokensSold
        let sellEvents = [];
        try {
            sellEvents = await window.safeQueryEvents(contract, contract.filters.TokensSold(), fromBlock, currentBlock);
        } catch (e) {}
            sellEvents.forEach(event => {
            if (event.args.seller.toLowerCase() === userAddress.toLowerCase()) {
                reports.push({
                    type: 'trading',
                    title: 'فروش توکن',
                    amount: `${formatNumber(event.args.tokenAmount, 18)} CPA → ${formatNumber(event.args.maticAmount, 18)} POL`,
                    timestamp: event.blockNumber,
                    transactionHash: event.transactionHash,
                    blockNumber: event.blockNumber,
                    address: event.args.seller,
                    logIndex: event.logIndex
                });
            }
            });
        // BinaryPointsUpdated
        let binaryEvents = [];
        try {
            binaryEvents = await window.safeQueryEvents(contract, contract.filters.BinaryPointsUpdated(), fromBlock, currentBlock);
        } catch (e) {}
            binaryEvents.forEach(event => {
            if (event.args.user.toLowerCase() === userAddress.toLowerCase()) {
                reports.push({
                    type: 'binary',
                    title: 'به‌روزرسانی امتیاز باینری',
                    amount: `${formatNumber(event.args.newPoints, 18)} امتیاز (سقف: ${formatNumber(event.args.newCap, 18)})`,
                    timestamp: event.blockNumber,
                    transactionHash: event.transactionHash,
                    blockNumber: event.blockNumber,
                    address: event.args.user,
                    logIndex: event.logIndex
                });
            }
        });
        // BinaryRewardDistributed
        let binaryRewardEvents = [];
        try {
            binaryRewardEvents = await window.safeQueryEvents(contract, contract.filters.BinaryRewardDistributed(), fromBlock, currentBlock);
        } catch (e) {}
        binaryRewardEvents.forEach(event => {
            if (event.args.claimer.toLowerCase() === userAddress.toLowerCase()) {
                reports.push({
                    type: 'binary',
                    title: 'دریافت پاداش باینری',
                    amount: `${formatNumber(event.args.claimerReward, 18)} CPA`,
                    timestamp: event.blockNumber,
                    transactionHash: event.transactionHash,
                    blockNumber: event.blockNumber,
                    address: event.args.claimer,
                    logIndex: event.logIndex
                });
            }
        });
        // TreeStructureUpdated
        let treeEvents = [];
        try {
            treeEvents = await window.safeQueryEvents(contract, contract.filters.TreeStructureUpdated(), fromBlock, currentBlock);
        } catch (e) {}
        treeEvents.forEach(event => {
            if ([event.args.user, event.args.parent, event.args.referrer].map(a=>a.toLowerCase()).includes(userAddress.toLowerCase())) {
                let posLabel = '';
                if (event.args.position == 0) posLabel = 'فرزند سمت چپ ثبت شد';
                else if (event.args.position == 1) posLabel = 'فرزند سمت راست ثبت شد';
                else posLabel = `موقعیت: ${event.args.position}`;
                reports.push({
                    type: 'network',
                    title: 'تغییر ساختار شبکه',
                    amount: posLabel,
                    timestamp: event.blockNumber,
                    transactionHash: event.transactionHash,
                    blockNumber: event.blockNumber,
                    address: event.args.user,
                    logIndex: event.logIndex
                });
            }
        });
        // Transfer
        let transferEvents = [];
        try {
            transferEvents = await contract.queryFilter(contract.filters.Transfer(), fromBlock, currentBlock);
        } catch (e) {}
        transferEvents.forEach(event => {
            if ([event.args.from, event.args.to].map(a=>a.toLowerCase()).includes(userAddress.toLowerCase())) {
                reports.push({
                    type: 'transfer',
                    title: 'انتقال توکن',
                    amount: `${formatNumber(event.args.value, 18)} CPA`,
                    timestamp: event.blockNumber,
                    transactionHash: event.transactionHash,
                    blockNumber: event.blockNumber,
                    address: event.args.from === userAddress ? event.args.to : event.args.from,
                    logIndex: event.logIndex
                });
            }
        });
        // Approval
        let approvalEvents = [];
        try {
            approvalEvents = await contract.queryFilter(contract.filters.Approval(), fromBlock, currentBlock);
        } catch (e) {}
        approvalEvents.forEach(event => {
            if ([event.args.owner, event.args.spender].map(a=>a.toLowerCase()).includes(userAddress.toLowerCase())) {
                reports.push({
                    type: 'approval',
                    title: 'تأییدیه انتقال',
                    amount: `${formatNumber(event.args.value, 18)} CPA`,
                    timestamp: event.blockNumber,
                    transactionHash: event.transactionHash,
                    blockNumber: event.blockNumber,
                    address: event.args.owner === userAddress ? event.args.spender : event.args.owner,
                    logIndex: event.logIndex
                });
            }
        });
        // DirectMATICReceived
        let directMaticEvents = [];
        try {
            directMaticEvents = await contract.queryFilter(contract.filters.DirectMATICReceived(), fromBlock, currentBlock);
        } catch (e) {}
        directMaticEvents.forEach(event => {
            if (event.args.sender.toLowerCase() === userAddress.toLowerCase()) {
                reports.push({
                    type: 'deposit',
                    title: 'واریز مستقیم MATIC',
                    amount: `${formatNumber(event.args.amount, 18)} MATIC`,
                    timestamp: event.blockNumber,
                    transactionHash: event.transactionHash,
                    blockNumber: event.blockNumber,
                    address: event.args.sender,
                    logIndex: event.logIndex
                });
            }
            });
        // MonthlyRewardClaimed
        let monthlyClaimedEvents = [];
        try {
            monthlyClaimedEvents = await window.safeQueryEvents(contract, contract.filters.MonthlyRewardClaimed(), fromBlock, currentBlock);
        } catch (e) {}
        monthlyClaimedEvents.forEach(event => {
            if (event.args.user.toLowerCase() === userAddress.toLowerCase()) {
                reports.push({
                    type: 'reward',
                    title: 'دریافت پاداش ماهانه',
                    amount: `${formatNumber(event.args.reward, 18)} CPA (${event.args.monthsPassed} ماه)` ,
                    timestamp: event.args.timestamp ? Number(event.args.timestamp) * 1000 : null,
                    transactionHash: event.transactionHash,
                    blockNumber: event.blockNumber,
                    address: event.args.user,
                    logIndex: event.logIndex
                });
            }
        });
        // MonthlyRewardFailed
        let monthlyFailedEvents = [];
        try {
            monthlyFailedEvents = await window.safeQueryEvents(contract, contract.filters.MonthlyRewardFailed(), fromBlock, currentBlock);
        } catch (e) {}
        monthlyFailedEvents.forEach(event => {
            if (event.args.user.toLowerCase() === userAddress.toLowerCase()) {
                reports.push({
                    type: 'reward',
                    title: 'عدم موفقیت پاداش ماهانه',
                    amount: event.args.reason,
                    timestamp: event.args.timestamp ? Number(event.args.timestamp) * 1000 : null,
                    transactionHash: event.transactionHash,
                    blockNumber: event.blockNumber,
                    address: event.args.user,
                    logIndex: event.logIndex
                });
            }
        });
        // BinaryPoolUpdated
        let binaryPoolEvents = [];
        try {
            binaryPoolEvents = await window.safeQueryEvents(contract, contract.filters.BinaryPoolUpdated(), fromBlock, currentBlock);
        } catch (e) {}
        binaryPoolEvents.forEach(event => {
            reports.push({
                type: 'binary',
                title: 'به‌روزرسانی استخر باینری',
                amount: `${formatNumber(event.args.addedAmount, 18)} CPA به استخر افزوده شد (سایز جدید: ${formatNumber(event.args.newPoolSize, 18)})`,
                timestamp: event.args.timestamp ? Number(event.args.timestamp) * 1000 : null,
                transactionHash: event.transactionHash,
                blockNumber: event.blockNumber,
                address: null,
                logIndex: event.logIndex
            });
        });
        // IndexTransferred
        let indexTransferredEvents = [];
        try {
            indexTransferredEvents = await window.safeQueryEvents(contract, contract.filters.IndexTransferred(), fromBlock, currentBlock);
        } catch (e) {}
        indexTransferredEvents.forEach(event => {
            if ([event.args.previousOwner, event.args.newOwner].map(a=>a.toLowerCase()).includes(userAddress.toLowerCase())) {
                reports.push({
                    type: 'transfer',
                    title: 'انتقال ایندکس',
                    amount: `از ${shortenAddress(event.args.previousOwner)} به ${shortenAddress(event.args.newOwner)} (ایندکس: ${event.args.index})`,
                    timestamp: event.args.timestamp ? Number(event.args.timestamp) * 1000 : null,
                    transactionHash: event.transactionHash,
                    blockNumber: event.blockNumber,
                    address: event.args.previousOwner === userAddress ? event.args.newOwner : event.args.previousOwner,
                    logIndex: event.logIndex
                });
            }
        });
        // After collecting all events into reports array, fetch timestamps for each unique blockNumber
        const blockNumbers = [...new Set(reports.map(r => r.blockNumber))];
        const blockTimestamps = {};
        // گرفتن timestamp هر بلاک به صورت موازی (به جای حلقه for)
        await Promise.all(blockNumbers.map(async (bn) => {
            try {
                const block = await provider.getBlock(bn);
                blockTimestamps[bn] = block.timestamp;
            } catch (e) {
                blockTimestamps[bn] = null;
            }
        }));
        // Assign real timestamp to each report
        reports.forEach(r => {
            r.timestamp = blockTimestamps[r.blockNumber] ? blockTimestamps[r.blockNumber] * 1000 : null;
        });
        // مرتب‌سازی بر اساس تاریخ (جدیدترین اول)
        reports.sort((a, b) => b.blockNumber - a.blockNumber);
        return reports;
    } catch (e) {
        console.error('خطا در دریافت گزارشات:', e);
        return [];
    }
} 