import ConversionForm from './conversion-form'
const favoritesGrid = document.querySelector('#favorites-grid')

export default class FavoritesForm {
  constructor(props) {
    const { id, base, quote, feeRate } = props
    this.id = id
    this.base = base
    this.quote = quote
    this.favoriteContainer = this.createFavorite(props)
    this.formEl = this.favoriteContainer.querySelector('form')
    this.conversionForm = new ConversionForm(this.formEl)
    this.formEl.querySelector(
      '[base-label]'
    ).innerHTML = this.conversionForm.baseName
    this.formEl.querySelector(
      '[quote-label]'
    ).innerHTML = this.conversionForm.quoteName
    if (feeRate) this.conversionForm.feeRate.value = feeRate
    this.conversionForm.convertCurrencies()
  }

  createFavorite({ id, base, baseAmount, quote, exRate, time }) {
    const innerHTML = `
        <form id="form-${id}" class="favorite-form">
            <input class="" id="base-${id}" name="base-amount" type="number" value="${baseAmount}" min="0" max="999999"
                inputmode="decimal" base-input>
            <label class="" for="base-${id}" base-label></label>
            <input class="" id="quote-${id}" name="quote-amount" type="number" min="0" max="999999"
                inputmode="decimal" quote-input>
            <label class="" for="quote-${id}" quote-label></label>
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
            <input hidden name="base-currency" value="${base}" base-currency>
            <input hidden name="quote-currency" value="${quote}" quote-currency>
            <input hidden id="ex-rate-${id}" name="ex-rate" value="${exRate}" pattern="\\d*\.\\d*" ex-rate>
            <input hidden id="time-input-${id}" name="time-input" value="${time}" time-input>
            <div class="rate-updated" id="last-updated-${id}" last-updated>Last updated:
                <span id="time-${id}" rel-time></span>
            </div>
            <button class="use-favorite" type="button" id="use-btn-${id}" use-btn>Use</button>
        </form>
        <button id="move-btn-${id}" class="fav-move" move-btn>Move</button>
        <button id="delete-btn-${id}" class="fav-delete" delete-btn>Delete</button>
        `
    const container = document.createElement('div')
    container.classList.add('favorite-form-container')
    container.setAttribute('favorite-id', id)
    container.innerHTML = innerHTML
    favoritesGrid.prepend(container)
    // form.draggable = true;
    return container
  }
}
