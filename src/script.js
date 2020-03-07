const exchangeForm = document.querySelector('#exchange-form');
const baseInput = document.querySelector('#base-amount');
const quoteInput = document.querySelector('#quote-amount');
const baseCurrency = document.querySelector('#base-currency');
const baseCurrSpan = document.querySelector('#base-currency-span');
const baseLabel = document.querySelector('#base-label');
const quoteCurrency = document.querySelector('#quote-currency');
const quoteCurrSpan = document.querySelector('#quote-currency-span');
const quoteLabel = document.querySelector('#quote-label');
const feeRate = document.querySelector('#fee-rate');
const exRate = document.querySelector('#ex-rate');
const timeInput = document.querySelector('#time-input');

function readForm() {
    const formData = new FormData(exchangeForm);
    const formObj = {};
    for (let i of formData) {
        const number = Number(i[1]);
        formObj[i[0]] = isNaN(number) ? i[1] : number;
    }
    return formObj
}

function setRate(formObj) {
    const base = formObj['base-currency'];
    const quote = formObj['quote-currency'];
    const url = `/convert/1/${base}/${quote}`;
    return fetch(url)
        .then(res => res.json())
        .then(json => {
            exRate.value = json.amount;
            timeInput.value = json.time;
            makeRelTimeText();
        })
        .catch(err => console.error(err))
}

function calculateAmount(element) {
    const formObj = readForm();
    const isQuote = element === quoteInput;
    if (isQuote) {
        const newValue = (formObj['quote-amount'] / formObj['ex-rate']) * (1 - formObj['fee-rate']);
        baseInput.value = newValue.toFixed(2);
    } else {
        const newValue = (formObj['base-amount'] * formObj['ex-rate']) * (1 - formObj['fee-rate']);
        quoteInput.value = newValue.toFixed(2);
    }
}

exchangeForm.addEventListener('input', async e => {
    const formObj = readForm();
    displaySelectSpan();
    if (e.target === baseCurrency || e.target === quoteCurrency || exRate.value === "")
        await setRate(formObj);
    calculateAmount(e.target);
})

function makeRelTimeText(lang = document.documentElement.lang) {
    let supportsRelativeTimeFormat;
    try {
        supportsRelativeTimeFormat = Intl.RelativeTimeFormat.supportedLocalesOf(lang).length > 0;
    } catch {
        supportsRelativeTimeFormat = false;
    }

    if (timeInput.value && supportsRelativeTimeFormat) {
        const relTime = new Intl.RelativeTimeFormat([lang], {
            numeric: "auto",
            style: "long"
        });
        const lastTime = new Date(timeInput.value);
        const now = new Date();
        const timeDiff = now - lastTime;
        let value, unit;
        if (timeDiff < 60 * 1000) {
            unit = "second";
            value = timeDiff / 1000;
        } else if (timeDiff < (60 * 60 * 1000)) {
            unit = "minute";
            value = timeDiff / (60 * 1000);
        } else if (timeDiff < (24 * 60 * 60 * 1000)) {
            unit = "hour";
            value = timeDiff / (60 * 60 * 1000)
        } else {
            unit = "day";
            value = timeDiff / (24 * 60 * 60 * 1000)
        }
        const text = relTime.format(-value.toFixed(), unit);
        document.querySelector('#rel-time').innerHTML = text;
    } else if (timeInput.value) {
        const time = new Date(timeInput.value);
        const dateTimeFormat = new Intl.DateTimeFormat([lang], {
            day: "numeric",
            month: "short",
            hour: "numeric",
            minute: "numeric",
            timeZoneName: "long"
        });
        const text = dateTimeFormat.format(time);
        document.querySelector('#rel-time').innerHTML = text;
    }
}

setInterval(makeRelTimeText, 60 * 1000);
makeRelTimeText();

function displaySelectSpan() {
    const baseCurrName = baseCurrency.querySelector(`[value="${baseCurrency.value}"]`).innerHTML;
    const quoteCurrName = quoteCurrency.querySelector(`[value="${quoteCurrency.value}"]`).innerHTML;
    baseCurrSpan.innerHTML = baseCurrName;
    quoteCurrSpan.innerHTML = quoteCurrName;
    baseLabel.innerHTML = `${baseCurrName} (${baseCurrency.value})`;
    const fee = feeRate.value !== "0.00" ? ` - ${feeRate.querySelector(`[value="${feeRate.value}"]`).innerHTML}` : "";
    quoteLabel.innerHTML = `${quoteCurrName} (${quoteCurrency.value})${fee}`;
}
displaySelectSpan();

const switchArrow = document.querySelector('#switch-arrow');
const currencySelectors = document.querySelector('.currency-selectors');
switchArrow.addEventListener('click', e => {
    currencySelectors.querySelectorAll('.select-container').forEach(el => {
        el.style.animation = "none";
        setTimeout(() => el.style.animation = "");
    });
    currencySelectors.classList.toggle('animate-switch');
    const base = baseCurrency.value;
    const quote = quoteCurrency.value;
    baseCurrency.value = quote;
    quoteCurrency.value = base;
    displaySelectSpan();
})