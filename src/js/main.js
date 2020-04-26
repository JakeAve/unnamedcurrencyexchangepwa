import serviceWorker from './app.js'
serviceWorker()

import ConversionForm from './conversion-form'
import IndividualFavorite from './individual-favorite'
import favorites from './favorites-array'
import moveFavorite from './move-grid'
import randomId from './random-id'
import createCurrencyOptions from './create-currency-options'
import smoothScrollTo from './smooth-scroll-to'

const mainConverter = new ConversionForm(
  document.querySelector('#exchange-form')
)

const addToFavoritesBtn = mainConverter.formEl.querySelector('#add-to-fav')
addToFavoritesBtn.addEventListener('click', createNewFavorite)

function createNewFavorite() {
  const id = randomId()
  const base = mainConverter.baseCurrency.value
  const baseAmount = mainConverter.baseInput.value
  const quote = mainConverter.quoteCurrency.value
  const exRate = mainConverter.exRate.value
  const time = mainConverter.timeInput.value
  const feeRate = mainConverter.feeRate.value

  const alreadyExists = favorites.find(
    c => c.base === base && c.quote === quote
  )

  if (!alreadyExists && favorites.length < 20) {
    const favorite = new IndividualFavorite({
      id,
      base,
      baseAmount,
      quote,
      exRate,
      feeRate,
      time
    })
    favorites.push(favorite)
  } else if (alreadyExists) {
    alert('This is already saved to favorites')
    smoothScrollTo(alreadyExists.formEl)
  } else if (favorites.length >= 20)
    alert('You can only save up to 20 favorites')
}

function deleteFavorite(btn) {
  const favContainer = btn.closest('.favorite-form-container')
  const id = favContainer.getAttribute('favorite-id')
  const index1 = favorites.findIndex(f => f.id === id)
  favorites.splice(index1, 1)
  favContainer.classList.add('fade-away')

  setTimeout(() => favContainer.remove(), 300)
}

function useFavorite(btn) {
  const id = btn.closest('.favorite-form-container').getAttribute('favorite-id')
  const fave = favorites.find(f => f.id === id)
  const props = [
    'baseCurrency',
    'quoteCurrency',
    'baseInput',
    'quoteInput',
    'feeRate',
    'exRate',
    'timeInput'
  ]
  props.forEach(p => (mainConverter[p].value = fave.conversionForm[p].value))
  mainConverter.convertCurrencies()
  smoothScrollTo(mainConverter.formEl)
}

const favoritesGrid = document.querySelector('#favorites-grid')

favoritesGrid.addEventListener('click', e => {
  const deleteBtn = e.target.closest('[delete-btn]')
  if (deleteBtn) return deleteFavorite(deleteBtn)
  const moveBtn = e.target.closest('[move-btn]')
  if (moveBtn) return moveFavorite(moveBtn, favorites)
  const useBtn = e.target.closest('[use-btn]')
  if (useBtn) return useFavorite(useBtn)
})

const switchArrow = document.querySelector('#switch-arrow')
const currencySelectors = document.querySelector('.currency-selectors')
switchArrow.addEventListener('click', switchBaseAndQuote)

function switchBaseAndQuote() {
  switchArrow.blur()
  currencySelectors.querySelectorAll('.select-container').forEach(el => {
    el.style.animation = 'none'
    setTimeout(() => (el.style.animation = ''))
  })
  currencySelectors.classList.toggle('animate-switch')
  const baseCurr = mainConverter.baseCurrency.value
  const quoteCurr = mainConverter.quoteCurrency.value
  mainConverter.baseCurrency.value = quoteCurr
  mainConverter.quoteCurrency.value = baseCurr
  // setTimeout(() => mainConverter.convertCurrencies());
  mainConverter.convertCurrencies()
}

createCurrencyOptions().then(() => mainConverter.convertCurrencies())
