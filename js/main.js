// ============================================
// VARIABLE
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
let cacheCurrence = {};

// ============================================
// TOM SELECT
// ============================================
let s1 = new TomSelect("#from", {
    maxItems: 1,
    minItems: 1,
    valueField: 'value',
    labelField: 'text',
    searchField: 'text',
    onDelete: function (values) {
        return false;
    },
    onChange: function (value) {
        syncDisabledOptions(value);
    }
});

let s2 = new TomSelect("#switch-to", {
    maxItems: 1,
    minItems: 1,
    valueField: 'value',
    labelField: 'text',
    searchField: 'text',
    onDelete: function (values) {
        return false;
    },
    onChange: function (value) {
        syncDisabledOptions(value);
    }
});

// ============================================
// GET DATA FROM API
// ============================================
fetch("https://openexchangerates.org/api/currencies.json")
    .then(response => response.json())
    .then(data => {
        // save data in array
        saveData.push(data)

        // create option for select
        Object.entries(data).forEach(function ([key, value]) {
            // Add option to select
            let optionData = { value: key, text: value };
            s1.addOption(optionData)
            s2.addOption(optionData)
        })

        // Add option to select
        s1.setValue('USD')
        s2.setValue('EGP')

        // Sync disabled options after initial values are set
        syncDisabledOptions();

        toCoin();
    })
    .catch(function () {
        errorState()
    })

function toCoin() {
    load.style.display = 'flex';
    if (!base.value || !foreign.value) return;

    fetch(`https://www.floatrates.com/daily/${base.value}.json`)
    .then(response => response.json())
    .then(coin => {
        cacheCurrence = { ...coin }
        load.style.display = 'none';
        dataFromObj()
        totalValue();
    }).catch(function () {
        errorState()
    })
}

// ============================================
// FUNCTOINS
// ============================================
function totalValue() {
    dataFromObj()
    price.innerHTML = `
        <div class="from-1">1 <span id="coin-now">${base.value}</span> = <span id="price-now">${saveCoin[0]}</span></div>
        <div class="to-1">1 <span id="coin-to">${foreign.value}</span> = <span id="price-to">${saveCoin[1]}</span></div>
    `
    let total = amount.value * saveCoin[0];
    result.innerHTML = total.toFixed(2);
    amountValue.innerHTML = amount.value
    typeCoinForeign.innerHTML = foreign.value;
    typeCoinAmount.innerHTML = base.value;
}

function switchValue() {
    let fromValue = s1.getValue();
    let toValue = s2.getValue();

    s1.setValue(toValue);
    s2.setValue(fromValue);

    toCoin();
    totalValue();
}

function dataFromObj() {
    let keyCoin = foreign.value.toLowerCase();
    if (cacheCurrence[keyCoin]) {
        let one = cacheCurrence[keyCoin].rate;
        let tow = cacheCurrence[keyCoin].inverseRate;
        saveCoin = [one, tow];
    }
}

/**
 * error state
 */
function errorState() {
    let box = document.querySelector('.box');
    box.classList.add('error')
    box.innerHTML = `
    <div>
        <i class="fa-solid fa-circle-exclamation" style="margin-inline-end: 5px;" ></i> error in connection, please check your internet
    </div>
    <button id="rotate">Refresh <i class="fas fa-refresh"></i></button>
    `;
    load.style.display = 'none';
    rotate.addEventListener('click', function () {
        location.reload()
    })
}

/**
 * sync disabled options
 */
function syncDisabledOptions(value) {
    console.log(value)
    const fromValue = s1.getValue();
    const toValue = s2.getValue();

    // ===== Enable all options first =====
    Object.keys(s1.options).forEach(key => {
        s1.updateOption(key, { ...s1.options[key], disabled: false });
        s2.updateOption(key, { ...s2.options[key], disabled: false });
    });

    // ===== Disable selected option in the other select =====
    if (fromValue && s2.options[fromValue]) {
        s2.updateOption(fromValue, { ...s2.options[fromValue], disabled: true });
    }

    if (toValue && s1.options[toValue]) {
        s1.updateOption(toValue, { ...s1.options[toValue], disabled: true });
    }
}

// ============================================
// EVENTS
// ============================================
amount.addEventListener('input', function () {
    totalValue()
    dataFromObj()
})

base.addEventListener('change', function () {
    toCoin();
    totalValue();
})

foreign.addEventListener('change', function () {
    dataFromObj();
    totalValue();
})

switchConin.addEventListener('click', function () {
    switchValue();
    [saveCoin[0], saveCoin[1]] = [saveCoin[1], saveCoin[0]]
    totalValue()

})