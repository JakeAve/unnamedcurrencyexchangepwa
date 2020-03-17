export default function () {

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
            // killBill()
            el.scrollIntoView({
                inline,
                block,
                behavior
            });
        } catch {
            const pageOffSet = window.pageYOffset || document.scrollTop;
            const elOffSet = () => el.getBoundingClientRect().top + pageOffSet;
            const direction = elOffSet() < pageOffSet ? -1 : 1;
            const fakeSmooth = setInterval(() => {
                const value = elOffSet();
                if (Math.abs(value > 10)) {
                    window.scrollBy(0, 10 * direction);
                } else clearInterval(fakeSmooth);
            }, 10)
        }
    }

    class ConversionForm {
        constructor({
            formEl,
            id,
            base,
            quote,
            rate = "",
            time = ""
        }) {
            if (!formEl) {
                this.createFormEl(id, base, quote, rate, time);
                this.base = base;
                this.quote = quote;
                this.lastWorkingBaseCurr = base.short;
                this.lastWorkingQuoteCurr = quote.short;
            } else this.formEl = formEl;
            this.id = id || "main";

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
                .then(res => {
                    if (res.status !== 200) {
                        throw new Error(`API Returned ${res.status}`);
                    }
                    return res.json()
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
                })
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
                await this.setRate(formObj)
                    .catch(err => {
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
                    text = dateTimeFormat.format(new Date(this.timeInput.value));
                }
                this.relTime.innerHTML = text;
            }
        }

        createFormEl(id, base, quote, rate, time) {
            // debugger;
            const innerHTML = `
        <form id="form-${id}" class="favorite-form">
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
            <button class="use-favorite" type="button" id="use-btn-${id}" use-btn>Use</button>
        </form>
        <button id="move-btn-${id}" class="fav-move" move-btn>Move</button>
        <button id="delete-btn-${id}" class="fav-delete" delete-btn>Delete</button>
        `;
            const container = document.createElement('div');
            container.classList.add('favorite-form-container');
            container.setAttribute("favorite-id", id);
            container.innerHTML = innerHTML;
            // form.draggable = true;
            favoritesGrid.prepend(container);
            this.formEl = container.querySelector('form');
        }
    }

    const mainConverter = new ConversionForm({
        formEl: document.querySelector('#exchange-form')
    });

    const favoritesGrid = document.querySelector('#favorites-grid');

    const favorites = localStorageAvailable() && localStorage.getItem('favorites') !== null ? JSON.parse(localStorage.getItem('favorites')) : [];
    favorites.renderForms = () => favorites.reverse().map(fav => new ConversionForm({
        ...fav
    }));
    favorites.reorder = (order) => {
        const favCopy = favorites.map(f => f);
        order.forEach((id, index) => favorites[index] = favCopy.find(f => f.id === id));
        favorites.save();
        favoritesGrid.querySelectorAll('.favorite-form-container').forEach(n => n.remove());
        favorites.forms = favorites.renderForms();
    }
    favorites.forms = favorites.renderForms();
    favorites.save = () => {
        if (localStorageAvailable()) localStorage.setItem('favorites', JSON.stringify(favorites));
        else alert(`You need to enable "localStorage" for this site in your web browser to save a favorite.`);
    }

    const addToFavoritesBtn = mainConverter.formEl.querySelector('#add-to-fav');
    addToFavoritesBtn.addEventListener('click', createNewFavorite);

    function createNewFavorite() {
        const id = randomId();
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
        favorites.forms.forEach(c => {
            if (c.baseName === base.long && c.quoteName === quote.long) {
                alreadyExists = c;
            }
        });

        if (!alreadyExists && favorites.length < 20) {
            const favorite = {
                id,
                base,
                quote,
                rate,
                time
            };
            favorites.unshift(favorite);
            favorites.save();
            favorites.forms.unshift(new ConversionForm({
                ...favorite
            }));
        } else if (alreadyExists) {
            alert('This is already saved to favorites');
            const existingForm = alreadyExists.formEl;
            smoothScrollTo(existingForm);
        } else if (favorites.length >= 20) alert('You can only save up to 20 favorites');
    }

    function deleteFavorite(btn) {
        const favContainer = btn.closest('.favorite-form-container');
        const id = favContainer.getAttribute('favorite-id');
        const index1 = favorites.findIndex(f => f.id === id);
        favorites.splice(index1, 1);
        const index2 = favorites.forms.findIndex(f => f.id === id);
        favorites.forms.splice(index2, 1);
        if (localStorageAvailable()) localStorage.setItem('favorites', JSON.stringify(favorites));
        favContainer.classList.add('fade-away');

        setTimeout(() => favContainer.remove(), 300);
    }

    function useFavorite(btn) {
        const id = btn.closest('.favorite-form-container').getAttribute('favorite-id');
        const favIndex = favorites.forms.findIndex(f => f.id === id);
        const props = ['baseCurrSel', 'quoteCurrSel', 'baseInput', 'quoteInput', 'feeRate', 'exRate', 'timeInput'];
        props.forEach(p =>
            mainConverter[p].value = favorites.forms[favIndex][p].value
        )
        mainConverter.convertCurrencies();
        smoothScrollTo(mainConverter.formEl);
    }

    favoritesGrid.addEventListener('click', e => {
        const deleteBtn = e.target.closest('[delete-btn]');
        if (deleteBtn) return deleteFavorite(deleteBtn);
        const moveBtn = e.target.closest('[move-btn]');
        if (moveBtn) return moveFavorite(moveBtn);
        const useBtn = e.target.closest('[use-btn]');
        if (useBtn) return useFavorite(useBtn);
    })

    const switchArrow = document.querySelector('#switch-arrow');
    const currencySelectors = document.querySelector('.currency-selectors');
    switchArrow.addEventListener('click', switchBaseAndQuote);

    function switchBaseAndQuote() {
        switchArrow.blur();
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

    const moveGrid = document.querySelector('#move-grid');

    function closeMoveFavorites() {
        moveGrid.classList.remove('show');
        document.body.style.position = '';
        moveGrid.removeEventListener('touchstart', startMove);

        const nodes = moveGrid.querySelectorAll('.move-item');
        const ids = [...nodes].map(node => node.getAttribute('favorite-id'));
        favorites.reorder(ids);
    }

    function moveFavorite(btn) {
        const blocks = favorites.map(f => `<div favorite-id="${f.id}" class="move-item">${f.base.short}<br>${f.quote.short}</div>`).join('');
        moveGrid.innerHTML = blocks + `<button id="move-close" class="btn-primary move-close">Close</button>`;
        const moveClose = moveGrid.querySelector('#move-close');
        moveClose.addEventListener('click', closeMoveFavorites);
        const id = btn.closest('.favorite-form-container').getAttribute('favorite-id');
        const selectedItem = moveGrid.querySelector(`[favorite-id="${id}"]`);
        selectedItem.classList.add('selected');
        // document.body.style.position = 'fixed';
        // document.body.style.top = window.scrollY + "px";
        moveGrid.classList.add('show');
        moveGrid.addEventListener('touchstart', startMove);
    }


    function startMove(e) {
        moveGrid.querySelectorAll('.selected').forEach(s => s.classList.remove('selected'));
        const item = e.target.closest('.move-item');
        if (item) {
            item.classList.add('selected');
            const rect = item.getBoundingClientRect();
            const height = item.clientHeight;
            const width = item.clientWidth;
            item.style.position = 'absolute';
            item.style.height = height + "px";
            item.style.width = width + "px";
            item.style.left = rect.left + 'px';
            item.style.top = rect.top + 'px';

            const emptySpace = document.createElement('div');
            item.insertAdjacentElement('beforebegin', emptySpace);
            const items = moveGrid.querySelectorAll('.move-item');
            const moveMoveInstance = e => moveMove(e, item, items, emptySpace);
            const endMoveInstance = e => endMove(e, item, emptySpace, moveMoveInstance, endMoveInstance)
            item.addEventListener('touchmove', moveMoveInstance);
            item.addEventListener('touchend', endMoveInstance);
        }
    }

    function areColliding(rect1, rect2) {
        const horizontal = rect1.left < rect2.right && rect1.right > rect2.left;
        const vertical = rect1.top < rect2.bottom && rect1.bottom > rect2.top;
        if (horizontal && vertical) {
            const result = {}
            if (rect2.top <= rect1.top)
                result.ver = 'top';
            else result.ver = 'bottom';
            if (rect2.left <= rect1.left)
                result.hor = 'left';
            else result.hor = 'right';
            return result
        } else return false;
    }

    function moveMove(e, item, items, emptySpace) {
        const height = item.clientHeight;
        const width = item.clientWidth;
        item.style.left = e.touches[0].clientX - (width / 2) + 'px';
        item.style.top = e.touches[0].clientY - (height / 2) + 'px';
        items.forEach(i => {
            if (i !== item) {
                const collision = areColliding(i.getBoundingClientRect(), item.getBoundingClientRect());
                if (collision) {
                    const side = collision.hor === 'left' ? 'beforebegin' : 'afterend';
                    i.insertAdjacentElement(side, emptySpace);
                }
            }
        })
    }

    function endMove(e, item, emptySpace, moveMoveInstance, endMoveInstance) {
        emptySpace.innerHTML = item.innerHTML;
        emptySpace.replaceWith(item);
        item.style.position = '';
        item.style.height = '';
        item.style.width = '';
        item.style.left = '';
        item.style.top = '';

        item.removeEventListener('touchmove', moveMoveInstance);
        item.removeEventListener('touchend', endMoveInstance);
    }
}