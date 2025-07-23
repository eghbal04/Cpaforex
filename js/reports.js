// reports.js - گزارشات کامل و دسته‌بندی شده بر اساس ABI قرارداد CPA

// ابزارهای کمکی
function shortenAddress(address) {
    if (!address) return '-';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
// ابزار جدید: گرفتن ایندکس کاربر از آدرس (در شبکه)
async function getIndexByAddress(address, contract) {
    try {
        if (!address || !contract) return null;
        // جستجو در mapping indexToAddress (تا 10000 کاربر)
        for (let i = 1; i < 10000; i++) {
            let addr = await contract.indexToAddress(i);
            if (addr && addr.toLowerCase() === address.toLowerCase()) return i;
        }
        return null;
    } catch { return null; }
}
// ابزار جدید: نمایش آدرس یا ایندکس یا قرارداد
async function displayAddress(addr, contract, contractAddress) {
    if (!addr) return '-';
    if (addr.toLowerCase() === contractAddress.toLowerCase()) return 'قرارداد';
    const idx = await getIndexByAddress(addr, contract);
    if (idx) return `CPA${idx.toString().padStart(5, '0')}`;
    return shortenAddress(addr);
}
function formatDate(timestamp) {
    if (!timestamp || isNaN(timestamp)) return 'تاریخ نامعتبر';
    const date = new Date(Number(timestamp));
    return date.toLocaleString('fa-IR');
}
function formatNumber(value, decimals = 18) {
    try {
        if (!value || value.toString() === '0') return '0';
        const formatted = ethers.formatUnits(value, decimals);
        const num = parseFloat(formatted);
        if (num < 0.000001) return num.toExponential(2);
        return num.toLocaleString('en-US', { maximumFractionDigits: 6 });
    } catch { return '0'; }
}

// جمع‌آوری همه ایونت‌ها
window.fetchReports = async function(address) {
    const { contract, address: userAddress } = await connectWallet();
    const provider = (contract.runner && contract.runner.provider) || contract.provider;
    const contractWithProvider = contract.connect ? contract.connect(provider) : contract;
    contractWithProvider.provider = provider; // تضمین provider معتبر برای safeQueryEvents
    const reports = [];
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = 0;
    // Helper: اضافه کردن ایونت به reports
    function pushReport(type, title, amount, event, addr) {
        reports.push({
            type, title, amount,
            timestamp: event.args.timestamp ? Number(event.args.timestamp) * 1000 : event.blockNumber * 1000,
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
            address: addr,
            logIndex: event.logIndex
        });
    }
    // Activated
    let ev = await window.safeQueryEvents(contractWithProvider, contractWithProvider.filters.Activated(), fromBlock, currentBlock);
    ev.forEach(e => { pushReport('activated', 'فعال‌سازی', formatNumber(e.args.amountCPA, 18) + ' CPA', e, e.args.user); });
    console.log('Activated events:', ev.length);
    // PurchaseKind
    ev = await window.safeQueryEvents(contractWithProvider, contractWithProvider.filters.PurchaseKind(), fromBlock, currentBlock);
    ev.forEach(e => { pushReport('purchase', 'خرید', formatNumber(e.args.amountCPA, 18) + ' CPA', e, e.args.user); });
    console.log('PurchaseKind events:', ev.length);
    // TokensBought
    ev = await window.safeQueryEvents(contractWithProvider, contractWithProvider.filters.TokensBought(), fromBlock, currentBlock);
    ev.forEach(e => { pushReport('tokensbought', 'خرید توکن', `${formatNumber(e.args.usdcAmount, 6)} USDC → ${formatNumber(e.args.tokenAmount, 18)} CPA`, e, e.args.buyer); });
    console.log('TokensBought events:', ev.length);
    // TokensSold
    ev = await window.safeQueryEvents(contractWithProvider, contractWithProvider.filters.TokensSold(), fromBlock, currentBlock);
    ev.forEach(e => { pushReport('tokenssold', 'فروش توکن', `${formatNumber(e.args.tokenAmount, 18)} CPA → ${formatNumber(e.args.usdcAmount, 6)} USDC`, e, e.args.seller); });
    console.log('TokensSold events:', ev.length);
    // BinaryPointsUpdated
    ev = await window.safeQueryEvents(contractWithProvider, contractWithProvider.filters.BinaryPointsUpdated(), fromBlock, currentBlock);
    ev.forEach(e => { pushReport('binarypoints', 'به‌روزرسانی امتیاز باینری', `${formatNumber(e.args.newPoints, 18)} امتیاز (سقف: ${formatNumber(e.args.newCap, 18)})`, e, e.args.user); });
    console.log('BinaryPointsUpdated events:', ev.length);
    // BinaryRewardDistributed
    ev = await window.safeQueryEvents(contractWithProvider, contractWithProvider.filters.BinaryRewardDistributed(), fromBlock, currentBlock);
    ev.forEach(e => { pushReport('binaryreward', 'دریافت پاداش باینری', `${formatNumber(e.args.claimerReward, 18)} CPA`, e, e.args.claimer); });
    console.log('BinaryRewardDistributed events:', ev.length);
    // BinaryPoolUpdated
    ev = await window.safeQueryEvents(contractWithProvider, contractWithProvider.filters.BinaryPoolUpdated(), fromBlock, currentBlock);
    ev.forEach(e => { pushReport('binarypool', 'به‌روزرسانی استخر باینری', `${formatNumber(e.args.addedAmount, 18)} CPA (سایز جدید: ${formatNumber(e.args.newPoolSize, 18)})`, e, null); });
    console.log('BinaryPoolUpdated events:', ev.length);
    // TreeStructureUpdated
    ev = await window.safeQueryEvents(contractWithProvider, contractWithProvider.filters.TreeStructureUpdated(), fromBlock, currentBlock);
    ev.forEach(e => { let posLabel = e.args.position == 0 ? 'فرزند چپ' : e.args.position == 1 ? 'فرزند راست' : `موقعیت: ${e.args.position}`; pushReport('tree', 'تغییر ساختار شبکه', posLabel, e, e.args.user); });
    console.log('TreeStructureUpdated events:', ev.length);
    // Transfer
    ev = await contractWithProvider.queryFilter(contractWithProvider.filters.Transfer(), fromBlock, currentBlock);
    ev.forEach(e => { pushReport('transfer', 'انتقال توکن', `${formatNumber(e.args.value, 18)} CPA`, e, e.args.from === userAddress ? e.args.to : e.args.from); });
    console.log('Transfer events:', ev.length);
    // Approval
    ev = await contractWithProvider.queryFilter(contractWithProvider.filters.Approval(), fromBlock, currentBlock);
    ev.forEach(e => { pushReport('approval', 'تأییدیه انتقال', `${formatNumber(e.args.value, 18)} CPA`, e, e.args.owner === userAddress ? e.args.spender : e.args.owner); });
    console.log('Approval events:', ev.length);
    // IndexTransferred
    ev = await window.safeQueryEvents(contractWithProvider, contractWithProvider.filters.IndexTransferred(), fromBlock, currentBlock);
    ev.forEach(e => { pushReport('indextransfer', 'انتقال ایندکس', `از ${shortenAddress(e.args.previousOwner)} به ${shortenAddress(e.args.newOwner)} (ایندکس: ${e.args.index})`, e, e.args.previousOwner === userAddress ? e.args.newOwner : e.args.previousOwner); });
    console.log('IndexTransferred events:', ev.length);
    // MonthlyRewardClaimed
    ev = await window.safeQueryEvents(contractWithProvider, contractWithProvider.filters.MonthlyRewardClaimed(), fromBlock, currentBlock);
    ev.forEach(e => { pushReport('monthlyreward', 'دریافت پاداش ماهانه', `${formatNumber(e.args.reward, 18)} CPA (${e.args.monthsPassed} ماه)`, e, e.args.user); });
    console.log('MonthlyRewardClaimed events:', ev.length);
    // MonthlyRewardFailed
    ev = await window.safeQueryEvents(contractWithProvider, contractWithProvider.filters.MonthlyRewardFailed(), fromBlock, currentBlock);
    ev.forEach(e => { pushReport('monthlyfail', 'عدم موفقیت پاداش ماهانه', e.args.reason, e, e.args.user); });
    console.log('MonthlyRewardFailed events:', ev.length);
    // مرتب‌سازی بر اساس تاریخ (جدیدترین اول)
    reports.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return reports;
};

// نمایش گزارشات دسته‌بندی شده
window.loadReports = async function(address) {
    const reportsContainer = document.getElementById('reports-list');
    reportsContainer.innerHTML = '<div class="loading">در حال بارگذاری گزارشات...</div>';
    const reports = await window.fetchReports(address);
    if (!reports || reports.length === 0) {
        reportsContainer.innerHTML = '<div class="no-reports">هیچ گزارشی برای شما یافت نشد.</div>';
        return;
    }
    // دسته‌بندی
    const grouped = {};
    reports.forEach(r => { if (!grouped[r.type]) grouped[r.type] = []; grouped[r.type].push(r); });
    const typeOrder = [
        'activated','purchase','tokensbought','tokenssold','binarypoints','binaryreward','binarypool','tree','transfer','approval','indextransfer','monthlyreward','monthlyfail'
    ];
    const typeTitles = {
        activated: 'فعال‌سازی', purchase: 'خرید', tokensbought: 'خرید توکن', tokenssold: 'فروش توکن',
        binarypoints: 'امتیاز باینری', binaryreward: 'پاداش باینری', binarypool: 'استخر باینری',
        tree: 'ساختار شبکه', transfer: 'انتقال توکن', approval: 'تأییدیه انتقال',
        indextransfer: 'انتقال ایندکس', monthlyreward: 'پاداش ماهانه', monthlyfail: 'خطاهای پاداش ماهانه'
    };
    // تابع نمایش بر اساس دسته انتخابی
    async function renderReportsByType(selectedType) {
        reportsContainer.innerHTML = '';
        let typesToShow = typeOrder;
        if (selectedType && selectedType !== 'all') typesToShow = [selectedType];
        for (const type of typesToShow) {
            if (grouped[type] && grouped[type].length > 0) {
                const h = document.createElement('h3');
                h.textContent = typeTitles[type] || type;
                h.style.marginTop = '32px';
                h.style.color = '#1976d2';
                h.style.fontWeight = 'bold';
                h.style.fontSize = '1.15em';
                reportsContainer.appendChild(h);
                const groupDiv = document.createElement('div');
                groupDiv.className = 'event-group';
                groupDiv.dataset.type = type;
                reportsContainer.appendChild(groupDiv);
                for (const report of grouped[type]) {
                    const div = document.createElement('div');
                    div.className = 'report-sentence';
                    // جمله را به صورت async بساز
                    const sentence = await getReportSentence(report);
                    div.innerHTML = sentence;
                    groupDiv.appendChild(div);
                }
            }
        }
    }
    // مقدار اولیه (همه دسته‌ها)
    await renderReportsByType('all');
    // لیسنر برای select
    const select = document.getElementById('event-type-select');
    if (select) {
        select.onchange = function() {
            renderReportsByType(this.value);
        };
    }
};

// جمله فارسی برای هر ایونت
async function getReportSentence(report) {
    const time = report.timestamp ? `<span class='report-time'>${formatDate(report.timestamp)}</span>` : '';
    // نمایش آدرس به صورت ایندکس یا قرارداد یا کوتاه‌شده
    let addrPromise = '';
    if (report.address && window.contractConfig && window.contractConfig.contract) {
        addrPromise = displayAddress(report.address, window.contractConfig.contract, window.contractConfig.CONTRACT_ADDRESS);
    } else {
        addrPromise = Promise.resolve(shortenAddress(report.address));
    }
    // چون displayAddress async است، باید جمله را async بسازیم
    // پس getReportSentence باید async شود و در loadReports await شود
    switch (report.type) {
        case 'activated': return `${time} شما فعال شدید و ${report.amount} دریافت کردید.`;
        case 'purchase': return `${time} شما ${report.amount} خریداری کردید.`;
        case 'tokensbought': return `${time} شما ${report.amount} خریدید.`;
        case 'tokenssold': return `${time} شما ${report.amount} فروختید.`;
        case 'binarypoints': return `${time} امتیاز باینری شما به ${report.amount} تغییر یافت.`;
        case 'binaryreward': return `${time} شما پاداش باینری به مقدار ${report.amount} دریافت کردید.`;
        case 'binarypool': return `${time} ${report.amount}`;
        case 'tree': return `${time} ${report.amount}`;
        case 'transfer': return addrPromise.then(addr => `${time} انتقال توکن انجام شد. آدرس مقابل: <span class='wallet-address'>${addr}</span> مقدار: ${report.amount}`);
        case 'approval': return addrPromise.then(addr => `${time} شما مجوز انتقال ${report.amount} را صادر کردید. آدرس مقابل: <span class='wallet-address'>${addr}</span>`);
        case 'indextransfer': return `${time} انتقال ایندکس ${report.amount}`;
        case 'monthlyreward': return `${time} شما پاداش ماهانه به مقدار ${report.amount} دریافت کردید.`;
        case 'monthlyfail': return `${time} تلاش برای دریافت پاداش ماهانه ناموفق بود: ${report.amount}`;
        default: return `${time} ${report.title || 'رویداد'}: ${report.amount}`;
    }
} 