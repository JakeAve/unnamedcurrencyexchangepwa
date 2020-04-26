import IndividualFavorite from './individual-favorite'
const favoritesGrid = document.querySelector('#favorites-grid')

export function localStorageAvailable() {
  const value = 'test'
  try {
    localStorage.setItem(value, value)
    localStorage.removeItem(value, value)
    return true
  } catch {
    return false
  }
}

const favoritesArray =
  localStorageAvailable() &&
  localStorage.getItem('favorites') !== null &&
  localStorage.getItem('favorites').length
    ? JSON.parse(localStorage.getItem('favorites'))
    : []

const renderForms = (arr) =>
  arr.map(
    (fav) =>
      new IndividualFavorite({
        ...fav,
      })
  )

const save = () => {
  if (localStorageAvailable()) {
    const rootProps = favorites.map((f) => f.rootProps)
    localStorage.setItem('favorites', JSON.stringify(rootProps))
  } else
    alert(
      `You need to enable "localStorage" for this site in your web browser to save a favorite.`
    )
}

const favorites = new Proxy(renderForms(favoritesArray), {
  set(target, key, value) {
    // console.log(target, key, value)
    const success = Reflect.set(target, key, value)
    if (success) {
      save()
    }
    return Reflect.set(target, key, value)
  },
  apply(target, key, value) {
    // console.log('I finally applied', { target, key, value }) // not sure why I added the apply
    Reflect.apply(target, key, value)
  },
})

favorites.reorder = (order) => {
  const favCopy = [...favorites]
  order.forEach(
    (id, index) => (favorites[index] = favCopy.find((f) => f.id === id))
  )
  favoritesGrid
    .querySelectorAll('.favorite-form-container')
    .forEach((n) => n.remove())
  renderForms(favorites.map((f) => f.rootProps))
}

window.addEventListener('beforeunload', () => save())

export default favorites
