import currencies from './currencies'
import { getOptions } from './api-calls'

async function createOptionsArray() {
  const optionCodes = await getOptions()
  return optionCodes.map(code => currencies.find(c => c.currencyCode === code))
}

export default async function createCurrencyOptions() {
  const arr = await createOptionsArray()
  const options = arr.map(
    ({ currencyCode, longName }) =>
      `<option value="${currencyCode}">${longName} (${currencyCode})</option>`
  )
  document.querySelectorAll('.currency-select').forEach((select, index) => {
    select.innerHTML = options.join('')
    select.value = index === 0 ? 'USD' : 'EUR'
  })
}
