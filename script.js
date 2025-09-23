// --- PASTE YOUR GOOGLE SHEET API URL HERE ---
const GOOGLE_SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbzFNFSaHW78XPAJCE1Z_nKWEpwEH-PJd8WxKgArTSPcNzOBiJXYFa7IDRcIsvi67UfMNw/exec';

// --- IMAGE & CURRENCY MAPS ---
const IMAGE_MAP = {
    US: 'images/us.png', JP: 'images/jp.png', DE: 'images/de.png', GB: 'images/gb.png', FR: 'images/fr.png',
    IT: 'images/it.png', CA: 'images/ca.png', CN: 'images/cn.png', IN: 'images/in.png', BR: 'images/br.png',
    RU: 'images/ru.png', ZA: 'images/za.png', AU: 'images/au.png', AR: 'images/ar.png', ID: 'images/id.png',
    MX: 'images/mx.png', SA: 'images/sa.png', KR: 'images/kr.png', TR: 'images/tr.png', IL: 'images/il.png'
};
const CURRENCY_MAP = {
    US: '$', JP: '¥', DE: '€', GB: '£', FR: '€', IT: '€', CA: '$', CN: '¥',
    IN: '₹', BR: 'R$', RU: '₽', ZA: 'R', AU: '$', AR: '$', ID: 'Rp',
    MX: '$', SA: '﷼', KR: '₩', TR: '₺', IL: '₪'
};
const METRIC_FREQUENCY_MAP = {
    'GDP_Growth_YoY': 'YoY Quarterly',
    'Inflation_CPI_YoY': 'YoY Monthly',
    'Unemployment_Percent': 'Monthly',
    'TradeBalance_USD': 'Quarterly',
};

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const scrollContainer = document.querySelector('.scroll-container');
    const scrollIndicator = document.querySelector('.scroll-down-indicator');
    const countryListNav = document.getElementById('country-list');
    const pageThree = document.getElementById('page-three');
    const backBtn = document.getElementById('back-btn');
    const detailCountryName = document.getElementById('detail-country-name');
    const detailDataGrid = document.getElementById('detail-data-grid');
    let economicData = [];

    // --- EVENT LISTENERS & DATA FETCH ---
    scrollContainer.addEventListener('scroll', () => {
        scrollIndicator.classList.toggle('hidden', scrollContainer.scrollTop > 20);
    });
    fetch(GOOGLE_SHEET_API_URL)
        .then(response => response.json())
        .then(data => {
            economicData = data;
            populateCountryList(economicData);
        })
        .catch(error => console.error("Error fetching data:", error));
    countryListNav.addEventListener('click', (event) => {
        const countryLink = event.target.closest('a');
        if (!countryLink) return;
        event.preventDefault();
        const countryCode = countryLink.dataset.code;
        const countryData = economicData.find(c => c.CountryCode_ISO2 === countryCode);
        if (countryData) {
            displayCountryDetails(countryData);
        }
    });
    backBtn.addEventListener('click', () => {
        pageThree.classList.remove('visible');
    });

    // --- HELPER FUNCTIONS ---
    function populateCountryList(countries) {
        let listHTML = '';
        countries.forEach(country => {
            const countryCode = country.CountryCode_ISO2;
            const imagePath = IMAGE_MAP[countryCode];
            const fallbackImage = `https://placehold.co/200x100/1f2937/9ca3af?text=${countryCode}`;
            listHTML += `<a href="#" data-code="${countryCode}"><img src="${imagePath}" alt="${country.CountryName} outline" onerror="this.src='${fallbackImage}'"><span>${country.CountryName}</span></a>`;
        });
        countryListNav.innerHTML = listHTML;
    }
    function formatStockIndex(value) {
        if (value === null || value === undefined || String(value).trim() === '') return "N/A";
        const cleanValue = String(value).replace(/[^0-9.]/g, '');
        const num = parseFloat(cleanValue);
        if (isNaN(num)) return "N/A";
        return num.toLocaleString('en-US');
    }

    function displayCountryDetails(country) {
        detailCountryName.textContent = country.CountryName;
        const lastUpdatedElement = document.getElementById('last-updated');
        if (country.LastUpdated_Date) {
            const date = new Date(country.LastUpdated_Date);
            const formatter = new Intl.DateTimeFormat('en-IN', {
                year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata', timeZoneName: 'short'
            });
            lastUpdatedElement.textContent = `Last updated on: ${formatter.format(date).replace(',', ' at')}`;
        } else {
            lastUpdatedElement.textContent = '';
        }
        
        const createChangeHTML = (changeValue, unit, text = 'vs last period', invertColors = false) => {
            const num = parseFloat(changeValue);

            if (num === 0 && unit.trim() === 'bps') {
                return `<span class="change-value">${changeValue}${unit} ${text}</span>`;
            }

            if (changeValue === null || changeValue === undefined || isNaN(num) || num === 0) {
                return '';
            }

            const sign = num > 0 ? '+' : '';
            
            let colorClass;
            if (invertColors) {
                colorClass = num > 0 ? 'negative' : 'positive';
            } else {
                colorClass = num > 0 ? 'positive' : 'negative';
            }

            return `<span class="change-value ${colorClass}">${sign}${changeValue}${unit} ${text}</span>`;
        };
        
        const stockIndexName = country.StockIndex_Name || '';
        const currencySymbol = CURRENCY_MAP[country.CountryCode_ISO2] || '';
        const formattedStockValue = formatStockIndex(country.StockIndex_Value);
        const stockDisplayValue = `(${stockIndexName}) ${currencySymbol}${formattedStockValue}`;
        
        const tradeBalanceUnit = String(country.TradeBalance_Measure).toLowerCase().includes('million') ? 'mn' : 'bn';
       const createFrequencyHTML = (metricKey) => {
            const freqText = METRIC_FREQUENCY_MAP[metricKey];
            return freqText ? `<br><span class="metric-frequency">${freqText}</span>` : '';
        };
        let gridHTML = `
            <div class="data-label">GDP Growth Rate ${createFrequencyHTML('GDP_Growth_YoY')}</div>
            <div class="data-value"><span>${country.GDP_Growth_YoY}%</span>${createChangeHTML(country.GDP_Growth_YoY_Change, ' p.p.')}</div>

            <div class="data-label">Inflation Rate ${createFrequencyHTML('Inflation_CPI_YoY')}</div>
            <div class="data-value"><span>${country.Inflation_CPI_YoY}%</span>${createChangeHTML(country.Inflation_CPI_YoY_Change, ' p.p.', 'vs last period', true)}</div>

            <div class="data-label">Policy Rate</div>
            <div class="data-value"><span>${country.PolicyRate_Percent}%</span>${createChangeHTML(country.PolicyRate_Percent_Change, ' bps', 'vs last revision')}</div>
            
            <div class="data-label">Unemmployment Rate ${createFrequencyHTML('Unemployment_Percent')}</div>
            <div class="data-value"><span>${country.Unemployment_Percent}%</span></div>

            <div class="data-label">Government 10Y Bond Yield</div>
            <div class="data-value"><span>${country.GovBond_10Y_Yield}%</span>${createChangeHTML(country.GovBond_10Y_Yield_Change, ' p.p.')}</div>

           <div class="data-label">Trade Balance ${createFrequencyHTML('TradeBalance_USD')}</div>
            <div class="data-value">
                <span>${country.TradeBalance_USD} ${tradeBalanceUnit}</span>
                ${createChangeHTML(country.TradeBalance_USD_Change, ` ${tradeBalanceUnit}`)}
            </div>

            <div class="data-label">Stock Index Value</div>
            <div class="data-value"><span>${stockDisplayValue}</span></div>
        `;
        detailDataGrid.innerHTML = gridHTML;
        pageThree.classList.add('visible');
    }
});

