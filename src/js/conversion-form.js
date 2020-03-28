import { getRate } from './api-calls'
import currencies from './currencies'

export default class ConversionForm {
  constructor(formEl) {
    this.formEl = formEl

    this.baseCurrency = this.formEl.querySelector('[base-currency]')
    this.baseSelCover = this.formEl.querySelector('[base-sel-cover]')
    this.baseLabel = this.formEl.querySelector('[base-label]')
    this.baseInput = this.formEl.querySelector('[base-input]')

    this.quoteCurrency = this.formEl.querySelector('[quote-currency]')
    this.quoteSelCover = this.formEl.querySelector('[quote-sel-cover]')
    this.quoteLabel = this.formEl.querySelector('[quote-label]')
    this.quoteInput = this.formEl.querySelector('[quote-input]')

    this.feeRate = this.formEl.querySelector('[fee-rate]')
    this.exRate = this.formEl.querySelector('[ex-rate]')
    this.timeInput = this.formEl.querySelector('[time-input]')
    this.relTime = this.formEl.querySelector('[rel-time]')

    this.formEl.addEventListener('input', e => this.convertCurrencies(e))

    setInterval(() => this.makeRelTimeText(), 60 * 60 * 1000)
  }

  revertCurrencies() {
    this.baseCurrency.value = this.lastWorkingBaseCurr
    this.quoteCurrency.value = this.lastWorkingQuoteCurr
    this.updateDisplay()
  }

  get baseName() {
    const longName = currencies.find(
      c => this.baseCurrency.value === c.currencyCode
    ).longName
    return `${longName} (${this.baseCurrency.value})`
  }

  get quoteName() {
    const longName = currencies.find(
      c => this.quoteCurrency.value === c.currencyCode
    ).longName
    return `${longName} (${this.quoteCurrency.value})`
  }

  readForm() {
    const formData = new FormData(this.formEl)
    const formObj = {}
    for (let i of formData) {
      const number = Number(i[1])
      formObj[i[0]] = isNaN(number) ? i[1] : number
    }
    return formObj
  }

  updateDisplay() {
    const fee =
      this.feeRate.value !== '0.00'
        ? ` - ${
            this.feeRate.querySelector(`[value="${this.feeRate.value}"]`)
              .innerHTML
          }`
        : ''
    if (this.baseSelCover && this.quoteSelCover) {
      this.baseSelCover.innerHTML = this.baseName
      this.quoteSelCover.innerHTML = this.quoteName
      this.baseLabel.innerHTML = this.baseName
      this.quoteLabel.innerHTML = this.quoteName + fee
    }
    if (fee) this.formEl.classList.add('warning')
    else this.formEl.classList.remove('warning')
  }

  setRate(formObj) {
    const base = formObj['base-currency']
    const quote = formObj['quote-currency']
    return getRate(base, quote)
      .then(({ rate, time }) => {
        this.exRate.value = rate
        this.timeInput.value = time
        this.lastWorkingBaseCurr = this.baseCurrency.value
        this.lastWorkingQuoteCurr = this.quoteCurrency.value
        this.makeRelTimeText()
      })
      .catch(err => console.error(err))
  }

  calculateAmount(element) {
    const formObj = this.readForm()
    const isQuote = element === this.quoteInput
    if (isQuote) {
      const newValue =
        (formObj['quote-amount'] / formObj['ex-rate']) *
        (1 - formObj['fee-rate'])
      this.baseInput.value = newValue.toFixed(2)
    } else {
      const newValue =
        formObj['base-amount'] * formObj['ex-rate'] * (1 - formObj['fee-rate'])
      this.quoteInput.value = newValue.toFixed(2)
    }
  }

  async convertCurrencies(event = {}) {
    const { target = null } = event
    const formObj = this.readForm()
    this.updateDisplay()
    const noTarget = !target
    const newRateRequired =
      target === this.baseCurrency ||
      target === this.quoteCurrency ||
      this.exRate.value === ''
    if (noTarget || newRateRequired) {
      await this.setRate(formObj).catch(() => {
        this.revertCurrencies()
        if (!navigator.onLine) {
          alert('Your device is offline and cannot get this currency exchange')
        }
      })
    }
    this.calculateAmount(target)
  }

  get elapsedTime() {
    if (this.timeInput.value) {
      const lastTime = new Date(this.timeInput.value)
      const now = new Date()
      return now - lastTime
    } else ''
  }

  makeRelTimeText(lang = document.documentElement.lang) {
    let supportsRelativeTimeFormat
    try {
      supportsRelativeTimeFormat =
        Intl.RelativeTimeFormat.supportedLocalesOf(lang).length > 0
    } catch {
      supportsRelativeTimeFormat = false
    }
    const timeDiff = this.elapsedTime
    if (timeDiff) {
      // if (timeDiff > 24 * 60 * 60 * 1000) {
      //     this.convertCurrencies()
      // }

      let text = ''
      if (supportsRelativeTimeFormat) {
        const relTimeFormat = new Intl.RelativeTimeFormat([lang], {
          numeric: 'auto',
          style: 'long'
        })
        let value, unit
        if (timeDiff < 60 * 1000) {
          unit = 'second'
          value = timeDiff / 1000
        } else if (timeDiff < 60 * 60 * 1000) {
          unit = 'minute'
          value = timeDiff / (60 * 1000)
        } else if (timeDiff < 24 * 60 * 60 * 1000) {
          unit = 'hour'
          value = timeDiff / (60 * 60 * 1000)
        } else {
          unit = 'day'
          value = timeDiff / (24 * 60 * 60 * 1000)
        }
        text = relTimeFormat.format(-value.toFixed(), unit)
      } else {
        const dateTimeFormat = new Intl.DateTimeFormat([lang], {
          day: 'numeric',
          month: 'short',
          hour: 'numeric',
          minute: 'numeric',
          timeZoneName: 'long'
        })
        text = dateTimeFormat.format(new Date(this.timeInput.value))
      }
      this.relTime.innerHTML = text
    }
  }
}
