const exchangeForm = document.querySelector('#exchange-form');
const baseInput = document.querySelector('#base-input');
const quoteInput = document.querySelector('#quote-input');
const baseCurrency = document.querySelector('#base-currency');
const quoteCurrency = document.querySelector('#quote-currency');
const feeRate = document.querySelector('#fee-rate');
const exRate = document.querySelector('#ex-rate');
const timeInput = document.querySelector('#time-input');

exchangeForm.addEventListener('input', async e => {
    const formObj = readForm();
    if (e.target === baseCurrency || e.target === quoteCurrency || exRate.value === "") {
        await setRate(formObj);
    }
    calculateAmount(e.target);
})

function setRate(formObj) {
    const base = formObj['base-currency'];
    const quote = formObj['quote-currency'];
    const url = `/convert/1/${base}/${quote}`;
    return fetch(url)
        .then(res => res.json()).then(json => {
            exRate.value = json.amount;
            timeInput.value = json.time;
        })
        .catch(err => console.log(err))
}

function readForm() {
    const formData = new FormData(exchangeForm);
    const formObj = {};
    for (let i of formData) {
        const number = Number(i[1]);
        formObj[i[0]] = isNaN(number) ? i[1] : number;
    }
    return formObj
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
