// ============================================
// DOM ELEMENTS
// ============================================
let base = document.getElementById('from');
let amount = document.getElementById('amount');
let foreign = document.getElementById('switch-to');
let btnConvert = document.getElementById('btn-convert');
let result = document.getElementById('result');
let typeCoinForeign = document.getElementById('typeCoinForeign');
let typeCoinAmount = document.getElementById('typeCoinAmount');
let amountValue = document.getElementById('amountValue');
let price = document.getElementById('salary');
let switchConin = document.getElementById('switch');
let load = document.querySelector('.icon-spin');
let saveCoin = [];
let saveData = [];
let currencyCache = {};

// ============================================
// TOM SELECT
// ============================================
const tomSelectConfig = {
    maxItems: 1,
    minItems: 1,
    maxOptions: null, // Allow all options
    onChange: () => syncDisabledOptions()
};

const s1 = new TomSelect("#from", tomSelectConfig);
const s2 = new TomSelect("#switch-to", tomSelectConfig);

// ============================================
// GET DATA FROM API
// ============================================
fetch("https://openexchangerates.org/api/currencies.json")
    .then(response => response.json())
    .then(data => {
        // save data in array
        saveData.push(data);
        // Create options for select
        Object.entries(data).forEach(([key, value]) => {
            let optionData = { value: key, text: value };

            s1.addOption(optionData);
            s2.addOption(optionData);
        });

        // Set default values
        s1.setValue('USD');
        s2.setValue('EGP');
        syncDisabledOptions();
        toCoin();
    })
    .catch(() => errorState());

function toCoin() {
    if (!base.value || !foreign.value) return;

    // Check if rates for this base currency are already cached
    if (currencyCache[base.value]) {
        dataFromObj();
        totalValue();
        return;
    }

    load.style.display = 'flex';

    fetch(`https://www.floatrates.com/daily/${base.value}.json`)
        .then(response => response.json())
        .then(coin => {
            currencyCache[base.value] = coin;
            load.style.display = 'none';
            dataFromObj();
            totalValue();
        })
        .catch(() => errorState());
}

// ============================================
// FUNCTOINS
// ============================================
function dataFromObj() {
    const baseCurrency = base.value;
    const foreignCurrency = foreign.value.toLowerCase();

    if (currencyCache[baseCurrency] && currencyCache[baseCurrency][foreignCurrency]) {
        const one = currencyCache[baseCurrency][foreignCurrency].rate;
        const tow = currencyCache[baseCurrency][foreignCurrency].inverseRate;
        saveCoin = [one, tow];
    }
}

function totalValue() {
    dataFromObj();

    price.innerHTML = `
        <div class="from-1">1 <span id="coin-now">${base.value}</span> = <span id="price-now">${saveCoin[0]}</span></div>
        <div class="to-1">1 <span id="coin-to">${foreign.value}</span> = <span id="price-to">${saveCoin[1]}</span></div>
    `;

    let total = amount.value * saveCoin[0];
    result.innerHTML = formatNumber(total.toFixed(3));
    amountValue.innerHTML = formatNumber(amount.value);
    typeCoinForeign.innerHTML = foreign.value;
    typeCoinAmount.innerHTML = base.value;
}

function switchValue() {
    let fromValue = s1.getValue();
    let toValue = s2.getValue();

    s1.setValue(toValue);
    s2.setValue(fromValue);

    toCoin();
}

function syncDisabledOptions() {
    let fromValue = s1.getValue();
    let toValue = s2.getValue();

    // Enable all options first
    Object.keys(s1.options).forEach(key => {
        s1.updateOption(key, { ...s1.options[key], disabled: false });
        s2.updateOption(key, { ...s2.options[key], disabled: false });
    });

    // Disable selected option in the other select
    if (fromValue && s2.options[fromValue]) {
        s2.updateOption(fromValue, { ...s2.options[fromValue], disabled: true });
    }

    if (toValue && s1.options[toValue]) {
        s1.updateOption(toValue, { ...s1.options[toValue], disabled: true });
    }
}

/**
 * Displays error state when API calls fail
 */
function errorState() {
    const box = document.querySelector('.box');
    box.classList.add('error');
    box.innerHTML = `
        <div>
            <i class="fa-solid fa-circle-exclamation" style="margin-inline-end: 5px;"></i> error in connection, please check your internet
        </div>
        <button id="rotate">Refresh <i class="fas fa-refresh"></i></button>
    `;
    load.style.display = 'none';

    document.getElementById('rotate').addEventListener('click', () => location.reload());
}

/**
 * Formats a number with commas
 */
function formatNumber(num) {
	if (num === null || num === undefined || isNaN(num)) return '';
	return Number(num).toLocaleString('en-US');
}

// ============================================
// EVENTS
// ============================================
amount.addEventListener('input', () => totalValue());

base.addEventListener('change', () => toCoin());

foreign.addEventListener('change', () => {
    dataFromObj();
    totalValue();
});

switchConin.addEventListener('click', () => {
    switchValue();
    [saveCoin[0], saveCoin[1]] = [saveCoin[1], saveCoin[0]];
    totalValue();
});