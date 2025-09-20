// --- PASTE YOUR GOOGLE SHEET API URL HERE ---
const GOOGLE_SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbzFNFSaHW78XPAJCE1Z_nKWEpwEH-PJd8WxKgArTSPcNzOBiJXYFa7IDRcIsvi67UfMNw/exec';

// --- THIS IS THE NEW IMAGE MAP ---
// IMPORTANT: You must create an 'images' folder in your project
// and save your PNGs there. The filenames must be lowercase
// and match these keys (e.g., 'us.png', 'jp.png').
const IMAGE_MAP = {
    US: 'images/us.png',
    JP: 'images/jp.png',
    DE: 'images/de.png',
    GB: 'images/gb.png',
    FR: 'images/fr.png',
    IT: 'images/it.png',
    CA: 'images/ca.png',
    CN: 'images/cn.png',
    IN: 'images/in.png',
    BR: 'images/br.png',
    RU: 'images/ru.png',
    ZA: 'images/za.png',
    AU: 'images/au.png',
    AR: 'images/ar.png',
    ID: 'images/id.png',
    MX: 'images/mx.png',
    SA: 'images/sa.png',
    KR: 'images/kr.png',
    TR: 'images/tr.png'
    // Add more countries here as needed
};
// --- NEW: A map to associate country codes with currency symbols ---
const CURRENCY_MAP = {
    US: '$',
    JP: '¥',
    DE: '€',
    GB: '£',
    FR: '€',
    IT: '€',
    CA: '$',
    CN: '¥',
    IN: '₹',
    BR: 'R$',
    RU: '₽',
    ZA: 'R',
    AU: '$',
    AR: '$',
    ID: 'Rp',
    MX: '$',
    SA: '﷼',
    KR: '₩',
    TR: '₺'
};

document.addEventListener('DOMContentLoaded', () => {
     const scrollContainer = document.querySelector('.scroll-container');
    const scrollIndicator = document.querySelector('.scroll-down-indicator');

    // Listen for scroll events on the main container
    scrollContainer.addEventListener('scroll', () => {
        // If the user has scrolled more than 20 pixels down...
        if (scrollContainer.scrollTop > 20) {
            // ...add the 'hidden' class to fade it out.
            scrollIndicator.classList.add('hidden');
        } else {
            // Optional: If they scroll back to the very top, make it reappear.
            scrollIndicator.classList.remove('hidden');
        }
    });
    // --- END OF NEW LOGIC ---
    const countryListNav = document.getElementById('country-list');
    const pageThree = document.getElementById('page-three');
    const backBtn = document.getElementById('back-btn');
    const detailCountryName = document.getElementById('detail-country-name');
    const detailDataGrid = document.getElementById('detail-data-grid');

    let economicData = [];

    fetch(GOOGLE_SHEET_API_URL)
        .then(response => response.json())
        .then(data => {
            economicData = data;
            populateCountryList(economicData);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            countryListNav.innerHTML = '<p style="color: red;">Could not load country data.</p>';
        });
    
    // --- THIS FUNCTION IS UPDATED TO USE PNGs ---
    function populateCountryList(countries) {
        let listHTML = '';
        countries.forEach(country => {
            const countryCode = country.CountryCode_ISO2;
            // Get the image path, or a placeholder if not found
            const imagePath = IMAGE_MAP[countryCode] || 'https://placehold.co/200x100/1f2937/9ca3af?text=?';

            listHTML += `
                <a href="#" data-code="${countryCode}">
                    <img src="${imagePath}" alt="${country.CountryName} outline">
                    <span>${country.CountryName}</span>
                </a>`;
        });
        countryListNav.innerHTML = listHTML;
    }

    // This event listener works the same as before
    countryListNav.addEventListener('click', (event) => {
        const countryLink = event.target.closest('a');
        if (countryLink) {
            event.preventDefault();
            const countryCode = countryLink.dataset.code;
            const countryData = economicData.find(c => c.CountryCode_ISO2 === countryCode);
            if (countryData) {
                displayCountryDetails(countryData);
            }
        }
    });
 // --- HELPER FUNCTIONS MOVED HERE (BEFORE THEY ARE CALLED) ---
    function formatTradeBalance(value) {
        if (value === null || value === undefined || String(value).trim() === '') return "N/A";
        const cleanValue = String(value).replace(/[^0-9.-]/g, '');
        const num = parseFloat(cleanValue);
        if (isNaN(num)) return "N/A";
        let billions = (Math.abs(num) > 1000000) ? num / 1_000_000_000 : num;
        return `${billions.toFixed(1)} bn`;
    }

    function formatStockIndex(value) {
        if (value === null || value === undefined || String(value).trim() === '') return "N/A";
        const cleanValue = String(value).replace(/[^0-9.]/g, '');
        const num = parseFloat(cleanValue);
        if (isNaN(num)) return "N/A";
        return num.toLocaleString('en-US');
    }
    // This function is the same as before
    function displayCountryDetails(country) {
        detailCountryName.textContent = country.CountryName;
        const lastUpdatedElement = document.getElementById('last-updated');
    // Check if the date data exists
    if (country.LastUpdated_Date) {
        // --- THIS IS THE NEW FORMATTING LOGIC ---

        // 1. Create a formatter specifically for the India locale (en-IN)
        //    and the Asia/Kolkata timezone (which is IST).
        const formatter = new Intl.DateTimeFormat('en-IN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true, // This will give us AM/PM
            timeZone: 'Asia/Kolkata', // Convert from UTC to IST
            timeZoneName: 'short' // This will add "IST"
        });

        // 2. Create a Date object from the sheet's data string
        const date = new Date(country.LastUpdated_Date);

        // 3. Use the formatter to create the final, readable string
        const formattedDate = formatter.format(date);

        // The output will be something like: "19/09/2025, 12:00:00 am IST"
        // We can replace the comma for a cleaner look.
        lastUpdatedElement.textContent = `Last updated on: ${formattedDate.replace(',', ' at')}`;

        // --- END OF NEW LOGIC ---

    } else {
        lastUpdatedElement.textContent = ''; // If no date, make it blank
    }
    const formattedTradeBalance = formatTradeBalance(country.TradeBalance_USD);
        const formattedStockValue = formatStockIndex(country.StockIndex_Value);
        const stockIndexName = country.StockIndex_Name || '';
        const currencySymbol = CURRENCY_MAP[country.CountryCode_ISO2] || '';
        const stockDisplayValue = `(${stockIndexName}) ${currencySymbol}${formattedStockValue}`;
    
        let gridHTML = `
            <div class="data-label">GDP Growth Rate</div><div class="data-value">${country.GDP_Growth_YoY}%</div>
            <div class="data-label">Inflation Rate</div><div class="data-value">${country.Inflation_CPI_YoY}%</div>
            <div class="data-label">Policy Rate</div><div class="data-value">${country.PolicyRate_Percent}%</div>
            <div class="data-label">Unemployment Rate</div><div class="data-value">${country.Unemployment_Percent}%</div>
            <div class="data-label">Government 10Y Bond Yield</div><div class="data-value">${country.GovBond_10Y_Yield}%</div>
            <div class="data-label">Trade Balance (USD)</div><div class="data-value">${formattedTradeBalance}</div>
            <div class="data-label">Stock Index Value</div><div class="data-value">${stockDisplayValue}</div>
        `;
        detailDataGrid.innerHTML = gridHTML;
        pageThree.classList.add('visible');
    }

    // This is the same as before
    backBtn.addEventListener('click', () => {
        pageThree.classList.remove('visible');
    });
});