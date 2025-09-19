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

document.addEventListener('DOMContentLoaded', () => {
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

    // This function is the same as before
    function displayCountryDetails(country) {
        detailCountryName.textContent = country.CountryName;
        const lastUpdatedElement = document.getElementById('last-updated');
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
        let gridHTML = `
            <div class="data-label">GDP Growth Rate</div><div class="data-value">${country.GDP_Growth_YoY}%</div>
            <div class="data-label">Inflation Rate</div><div class="data-value">${country.Inflation_CPI_YoY}%</div>
            <div class="data-label">Policy Rate</div><div class="data-value">${country.PolicyRate_Percent}%</div>
            <div class="data-label">Unemployment Rate</div><div class="data-value">${country.Unemployment_Percent}%</div>
            <div class="data-label">Government 10Y Bond Yield</div><div class="data-value">${country.GovBond_10Y_Yield}%</div>
            <div class="data-label">Trade Balance (USD)</div><div class="data-value">${country.TradeBalance_USD}</div>
            <div class="data-label">Stock Index Value</div><div class="data-value">${country.StockIndex_Value}</div>
        `;
        detailDataGrid.innerHTML = gridHTML;
        pageThree.classList.add('visible');
    }

    // This is the same as before
    backBtn.addEventListener('click', () => {
        pageThree.classList.remove('visible');
    });
});