function localStorageAvailable() {
    const value = "test";
    try {
        localStorage.setItem(value, value);
        localStorage.removeItem(value, value);
        return true;
    } catch {
        return false;
    }
}
function randomId() {
    const chars = `0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`;
    let rand = "";
    for (let i = 0; i < 8; i++) {
        const num = Math.floor(Math.random() * chars.length);
        rand += chars[num]
    }
    return rand;
}

function smoothScrollTo(el, options = {}) {
    const {
        inline = 'nearest', block = 'start', behavior = 'smooth'
    } = options;
    try {
        el.scrollIntoView({
            inline,
            block,
            behavior
        });
    } catch {
        el.scrollIntoView();
    }
}

class ConversionForm {
    constructor({
        formEl,
        base,
        quote,
        rate = "",
        time = ""
    }) {
        if (!formEl) {
            this.createFormEl(randomId(), base, quote, rate, time);
            this.base = base;
            this.quote = quote;
            this.lastWorkingBaseCurr = base.short;
            this.lastWorkingQuoteCurr = quote.short;
        } else this.formEl = formEl;

        this.baseCurrSel = this.formEl.querySelector('[base-currency]');
        this.baseSelCover = this.formEl.querySelector('[base-sel-cover]');
        this.baseLabel = this.formEl.querySelector('[base-label]')
        this.baseInput = this.formEl.querySelector('[base-input]')

        this.quoteCurrSel = this.formEl.querySelector('[quote-currency]');
        this.quoteSelCover = this.formEl.querySelector('[quote-sel-cover]');
        this.quoteLabel = this.formEl.querySelector('[quote-label]');
        this.quoteInput = this.formEl.querySelector('[quote-input]')

        this.feeRate = this.formEl.querySelector('[fee-rate]');
        this.exRate = this.formEl.querySelector('[ex-rate]');
        this.timeInput = this.formEl.querySelector('[time-input]');
        this.relTime = this.formEl.querySelector('[rel-time]');

        this.formEl.addEventListener('input', e => this.convertCurrencies(e));

        setInterval(() => this.makeRelTimeText(), 60 * 1000);

        this.convertCurrencies();
    }

    revertCurrencies() {
        console.log(this.lastWorkingBaseCurr, this.lastWorkingQuoteCurr)
        this.baseCurrSel.value = this.lastWorkingBaseCurr;
        this.quoteCurrSel.value = this.lastWorkingQuoteCurr;
        this.updateDisplay();
    }

    get baseName() {
        if (this.base) return this.base.long;
        else
            return this.baseCurrSel.querySelector(`[value="${this.baseCurrSel.value}"]`).innerHTML;
    }

    get quoteName() {
        if (this.quote) return this.quote.long
        else
            return this.quoteCurrSel.querySelector(`[value="${this.quoteCurrSel.value}"]`).innerHTML;

    }

    readForm() {
        const formData = new FormData(this.formEl);
        const formObj = {};
        for (let i of formData) {
            const number = Number(i[1]);
            formObj[i[0]] = isNaN(number) ? i[1] : number;
        }
        return formObj
    }

    updateDisplay() {
        const fee = this.feeRate.value !== "0.00" ? ` - ${this.feeRate.querySelector(`[value="${this.feeRate.value}"]`).innerHTML}` : "";
        if (this.baseSelCover && this.quoteSelCover) {
            this.baseSelCover.innerHTML = this.baseName;
            this.quoteSelCover.innerHTML = this.quoteName;
            this.baseLabel.innerHTML = this.baseName;
            this.quoteLabel.innerHTML = this.quoteName + fee;
        }
        if (fee)
            this.formEl.classList.add('warning');
        else this.formEl.classList.remove('warning');
    }

    setRate(formObj) {
        const base = formObj['base-currency'];
        const quote = formObj['quote-currency'];
        const url = `/convert/1/${base}/${quote}`;
        return fetch(url)
            .then(res => res.json()
                .then(json => {
                    /* console.log({
                        time: new Date(json.time),
                        online: navigator.onLine
                    });*/
                    this.exRate.value = json.amount;
                    this.timeInput.value = json.time;
                    this.lastWorkingBaseCurr = this.baseCurrSel.value;
                    this.lastWorkingQuoteCurr = this.quoteCurrSel.value;
                    this.makeRelTimeText();
                })
                .catch(err => console.error(err))
            )
    }

    calculateAmount(element) {
        const formObj = this.readForm();
        const isQuote = element === this.quoteInput;
        if (isQuote) {
            const newValue = (formObj['quote-amount'] / formObj['ex-rate']) * (1 - formObj['fee-rate']);
            this.baseInput.value = newValue.toFixed(2);
        } else {
            const newValue = (formObj['base-amount'] * formObj['ex-rate']) * (1 - formObj['fee-rate']);
            this.quoteInput.value = newValue.toFixed(2);
        }
    }

    async convertCurrencies(event = {}) {
        const {
            target = null
        } = event;
        const formObj = this.readForm();
        this.updateDisplay();
        const noTarget = !target;
        const newRateRequired = target === this.baseCurrSel || target === this.quoteCurrSel || this.exRate.value === "";
        if (noTarget || newRateRequired) {
            await this.setRate(formObj).catch(err => {
                this.revertCurrencies();
                if (!navigator.onLine) {
                    alert('Your device is offline and cannot get this currency exchange');
                }
            })
        }
        this.calculateAmount(target);
    }

    get elapsedTime() {
        if (this.timeInput.value) {
            const lastTime = new Date(this.timeInput.value);
            const now = new Date();
            return now - lastTime;
        } else "";
    }

    makeRelTimeText(lang = document.documentElement.lang) {
        let supportsRelativeTimeFormat;
        try {
            supportsRelativeTimeFormat = Intl.RelativeTimeFormat.supportedLocalesOf(lang).length > 0;
        } catch {
            supportsRelativeTimeFormat = false;
        }
        const timeDiff = this.elapsedTime;
        if (timeDiff) {
            if (timeDiff > 24 * 60 * 60 * 1000) {
                this.convertCurrencies()
            }

            let text = "";
            if (supportsRelativeTimeFormat) {
                const relTimeFormat = new Intl.RelativeTimeFormat([lang], {
                    numeric: "auto",
                    style: "long"
                });
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
                text = relTimeFormat.format(-value.toFixed(), unit);
            } else {
                const dateTimeFormat = new Intl.DateTimeFormat([lang], {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "numeric",
                    timeZoneName: "long"
                });
                text = dateTimeFormat.format(lastTime);
            }
            this.relTime.innerHTML = text;
        }
    }

    createFormEl(id, base, quote, rate, time) {
        const innerHTML = `
        <input class="" id="base-${id}" name="base-amount" type="number" value="1.00" min="0" max="999999"
            inputmode="decimal" base-input>
        <label class="" for="base-${id}" base-label>${base.long}</label>
        <input class="" id="quote-${id}" name="quote-amount" type="number" min="0" max="999999"
            inputmode="decimal" quote-input>
        <label class="" for="quote-${id}" quote-label>${quote.long}</label>
        <div class="fee-container">
            <label for="fee-${id}">Bank / Card Fee:&nbsp;</label>
            <select id="fee-${id}" name="fee-rate" fee-rate>
                <option value="0.00">0%</option>
                <option value="0.01">1%</option>
                <option value="0.02">2%</option>
                <option value="0.03">3%</option>
                <option value="0.04">4%</option>
                <option value="0.05">5%</option>
            </select>
        </div>
        <input hidden name="base-currency" value="${base.short}" base-currency>
        <input hidden name="quote-currency" value="${quote.short}" quote-currency>
        <input hidden id="ex-rate-${id}" name="ex-rate" value="${rate}" pattern="\\d*\.\\d*" ex-rate>
        <input hidden id="time-input-${id}" name="time-input" value="${time}" time-input>
        <div class="rate-updated" id="last-updated-${id}" last-updated>Last updated:
            <span id="time-${id}" rel-time></span>
        </div>
        <button class="use-favorite" type="button" id="button-${id}">Use</button>`;
        const form = document.createElement('form');
        form.id = `form-${id}`;
        form.classList.add('favorite-form');
        form.innerHTML = innerHTML;
        favoritesGrid.prepend(form);
        this.formEl = form;
    }
}

const mainConverter = new ConversionForm({
    formEl: document.querySelector('#exchange-form')
});

const favorites = localStorageAvailable() && localStorage.getItem('favorites') !== null ? JSON.parse(localStorage.getItem('favorites')) : [];
const favoritesGrid = document.querySelector('#favorites-grid');
const conversionForms = favorites.map(fav => new ConversionForm({
    ...fav
}));
const addToFavoritesBtn = mainConverter.formEl.querySelector('#add-to-fav');
addToFavoritesBtn.addEventListener('click', createNewFavorite);

function createNewFavorite() {
    const base = {
        long: mainConverter.baseName,
        short: mainConverter.baseCurrSel.value
    };
    const quote = {
        long: mainConverter.quoteName,
        short: mainConverter.quoteCurrSel.value
    };
    const rate = mainConverter.exRate.value;
    const time = mainConverter.timeInput.value;

    let alreadyExists = false
    conversionForms.forEach(c => {
        if (c.baseName === base.long && c.quoteName === quote.long) {
            alreadyExists = c;
        }
    });

    if (!alreadyExists && favorites.length < 20) {
        const favorite = {
            base,
            quote,
            rate,
            time
        };
        favorites.push(favorite);
        if (localStorageAvailable()) localStorage.setItem('favorites', JSON.stringify(favorites));
        else alert(`You need to enable "localStorage" for this site in your web browser to save a favorite.`);
        conversionForms.push(new ConversionForm({
            ...favorite
        }));
    } else if (alreadyExists) {
        alert('This is already saved to favorites');
        const existingForm = alreadyExists.formEl;
        smoothScrollTo(existingForm);
    } else if (favorites.length >= 20) alert('You can only save up to 20 favorites');
}

const switchArrow = document.querySelector('#switch-arrow');
const currencySelectors = document.querySelector('.currency-selectors');
switchArrow.addEventListener('click', switchBaseAndQuote);

function switchBaseAndQuote() {
    currencySelectors.querySelectorAll('.select-container').forEach(el => {
        el.style.animation = "none";
        setTimeout(() => el.style.animation = "");
    });
    currencySelectors.classList.toggle('animate-switch');
    const baseCurr = mainConverter.baseCurrSel.value;
    const quoteCurr = mainConverter.quoteCurrSel.value;
    mainConverter.baseCurrSel.value = quoteCurr;
    mainConverter.quoteCurrSel.value = baseCurr;
    // setTimeout(() => mainConverter.convertCurrencies());
    mainConverter.convertCurrencies();
}