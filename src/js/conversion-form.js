import { getRate } from "./api-calls";
const favoritesGrid = document.querySelector("#favorites-grid");

export default class ConversionForm {
  constructor({ formEl, id, base, quote, rate = "", time = "" }) {
    if (!formEl) {
      this.createFormEl(id, base, quote, rate, time);
      this.base = base;
      this.quote = quote;
      this.lastWorkingBaseCurr = base.short;
      this.lastWorkingQuoteCurr = quote.short;
    } else this.formEl = formEl;
    this.id = id || "main";

    this.baseCurrSel = this.formEl.querySelector("[base-currency]");
    this.baseSelCover = this.formEl.querySelector("[base-sel-cover]");
    this.baseLabel = this.formEl.querySelector("[base-label]");
    this.baseInput = this.formEl.querySelector("[base-input]");

    this.quoteCurrSel = this.formEl.querySelector("[quote-currency]");
    this.quoteSelCover = this.formEl.querySelector("[quote-sel-cover]");
    this.quoteLabel = this.formEl.querySelector("[quote-label]");
    this.quoteInput = this.formEl.querySelector("[quote-input]");

    this.feeRate = this.formEl.querySelector("[fee-rate]");
    this.exRate = this.formEl.querySelector("[ex-rate]");
    this.timeInput = this.formEl.querySelector("[time-input]");
    this.relTime = this.formEl.querySelector("[rel-time]");

    this.formEl.addEventListener("input", e => this.convertCurrencies(e));

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
      return this.baseCurrSel.querySelector(
        `[value="${this.baseCurrSel.value}"]`
      ).innerHTML;
  }

  get quoteName() {
    if (this.quote) return this.quote.long;
    else
      return this.quoteCurrSel.querySelector(
        `[value="${this.quoteCurrSel.value}"]`
      ).innerHTML;
  }

  readForm() {
    const formData = new FormData(this.formEl);
    const formObj = {};
    for (let i of formData) {
      const number = Number(i[1]);
      formObj[i[0]] = isNaN(number) ? i[1] : number;
    }
    return formObj;
  }

  updateDisplay() {
    const fee =
      this.feeRate.value !== "0.00"
        ? ` - ${
            this.feeRate.querySelector(`[value="${this.feeRate.value}"]`)
              .innerHTML
          }`
        : "";
    if (this.baseSelCover && this.quoteSelCover) {
      this.baseSelCover.innerHTML = this.baseName;
      this.quoteSelCover.innerHTML = this.quoteName;
      this.baseLabel.innerHTML = this.baseName;
      this.quoteLabel.innerHTML = this.quoteName + fee;
    }
    if (fee) this.formEl.classList.add("warning");
    else this.formEl.classList.remove("warning");
  }

  setRate(formObj) {
    const base = formObj["base-currency"];
    const quote = formObj["quote-currency"];
    return getRate(base, quote)
      .then(({ rate, time }) => {
        this.exRate.value = rate;
        this.timeInput.value = time;
        this.lastWorkingBaseCurr = this.baseCurrSel.value;
        this.lastWorkingQuoteCurr = this.quoteCurrSel.value;
        this.makeRelTimeText();
      })
      .catch(err => console.error(err));
  }

  calculateAmount(element) {
    const formObj = this.readForm();
    const isQuote = element === this.quoteInput;
    if (isQuote) {
      const newValue =
        (formObj["quote-amount"] / formObj["ex-rate"]) *
        (1 - formObj["fee-rate"]);
      this.baseInput.value = newValue.toFixed(2);
    } else {
      const newValue =
        formObj["base-amount"] * formObj["ex-rate"] * (1 - formObj["fee-rate"]);
      this.quoteInput.value = newValue.toFixed(2);
    }
  }

  async convertCurrencies(event = {}) {
    const { target = null } = event;
    const formObj = this.readForm();
    this.updateDisplay();
    const noTarget = !target;
    const newRateRequired =
      target === this.baseCurrSel ||
      target === this.quoteCurrSel ||
      this.exRate.value === "";
    if (noTarget || newRateRequired) {
      await this.setRate(formObj).catch(() => {
        this.revertCurrencies();
        if (!navigator.onLine) {
          alert("Your device is offline and cannot get this currency exchange");
        }
      });
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
      supportsRelativeTimeFormat =
        Intl.RelativeTimeFormat.supportedLocalesOf(lang).length > 0;
    } catch {
      supportsRelativeTimeFormat = false;
    }
    const timeDiff = this.elapsedTime;
    if (timeDiff) {
      // if (timeDiff > 24 * 60 * 60 * 1000) {
      //     this.convertCurrencies()
      // }

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
        } else if (timeDiff < 60 * 60 * 1000) {
          unit = "minute";
          value = timeDiff / (60 * 1000);
        } else if (timeDiff < 24 * 60 * 60 * 1000) {
          unit = "hour";
          value = timeDiff / (60 * 60 * 1000);
        } else {
          unit = "day";
          value = timeDiff / (24 * 60 * 60 * 1000);
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
    const container = document.createElement("div");
    container.classList.add("favorite-form-container");
    container.setAttribute("favorite-id", id);
    container.innerHTML = innerHTML;
    // form.draggable = true;
    favoritesGrid.prepend(container);
    this.formEl = container.querySelector("form");
  }
}
