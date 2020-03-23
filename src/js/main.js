import serviceWorker from './app.js'

serviceWorker()

import ConversionForm from './conversion-form'
import favorites, { localStorageAvailable } from './favorites-array'
import moveFavorite from './move-grid'
import randomId from './random-id'
import createCurrencyOptions from './create-currency-options'

function smoothScrollTo(el, options = {}) {
  const { inline = 'nearest', block = 'start', behavior = 'smooth' } = options
  try {
    // killBill()
    el.scrollIntoView({
      inline,
      block,
      behavior
    })
  } catch {
    const pageOffSet = window.pageYOffset || document.scrollTop
    const elOffSet = () => el.getBoundingClientRect().top + pageOffSet
    const direction = elOffSet() < pageOffSet ? -1 : 1
    const fakeSmooth = setInterval(() => {
      const value = elOffSet()
      if (Math.abs(value > 10)) {
        window.scrollBy(0, 10 * direction)
      } else clearInterval(fakeSmooth)
    }, 10)
  }
}

const mainConverter = new ConversionForm({
  formEl: document.querySelector('#exchange-form')
})

const addToFavoritesBtn = mainConverter.formEl.querySelector('#add-to-fav')
addToFavoritesBtn.addEventListener('click', createNewFavorite)

function createNewFavorite() {
  const id = randomId()
  const base = {
    long: mainConverter.baseName,
    short: mainConverter.baseCurrSel.value
  }
  const quote = {
    long: mainConverter.quoteName,
    short: mainConverter.quoteCurrSel.value
  }
  const rate = mainConverter.exRate.value
  const time = mainConverter.timeInput.value

  let alreadyExists = false
  favorites.forms.forEach(c => {
    if (c.baseName === base.long && c.quoteName === quote.long) {
      alreadyExists = c
    }
  })

  if (!alreadyExists && favorites.length < 20) {
    const favorite = {
      id,
      base,
      quote,
      rate,
      time
    }
    favorites.unshift(favorite)
    favorites.save()
    favorites.forms.unshift(
      new ConversionForm({
        ...favorite
      })
    )
  } else if (alreadyExists) {
    alert('This is already saved to favorites')
    const existingForm = alreadyExists.formEl
    smoothScrollTo(existingForm)
  } else if (favorites.length >= 20)
    alert('You can only save up to 20 favorites')
}

function deleteFavorite(btn) {
  const favContainer = btn.closest('.favorite-form-container')
  const id = favContainer.getAttribute('favorite-id')
  const index1 = favorites.findIndex(f => f.id === id)
  favorites.splice(index1, 1)
  const index2 = favorites.forms.findIndex(f => f.id === id)
  favorites.forms.splice(index2, 1)
  if (localStorageAvailable())
    localStorage.setItem('favorites', JSON.stringify(favorites))
  favContainer.classList.add('fade-away')

  setTimeout(() => favContainer.remove(), 300)
}

function useFavorite(btn) {
  const id = btn.closest('.favorite-form-container').getAttribute('favorite-id')
  const favIndex = favorites.forms.findIndex(f => f.id === id)
  const props = [
    'baseCurrSel',
    'quoteCurrSel',
    'baseInput',
    'quoteInput',
    'feeRate',
    'exRate',
    'timeInput'
  ]
  props.forEach(
    p => (mainConverter[p].value = favorites.forms[favIndex][p].value)
  )
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
  const baseCurr = mainConverter.baseCurrSel.value
  const quoteCurr = mainConverter.quoteCurrSel.value
  mainConverter.baseCurrSel.value = quoteCurr
  mainConverter.quoteCurrSel.value = baseCurr
  // setTimeout(() => mainConverter.convertCurrencies());
  mainConverter.convertCurrencies()
}

createCurrencyOptions().then(() => mainConverter.updateDisplay())
