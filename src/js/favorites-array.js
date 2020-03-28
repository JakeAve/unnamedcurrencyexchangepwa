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

const favorites =
  localStorageAvailable() && localStorage.getItem('favorites') !== null
    ? JSON.parse(localStorage.getItem('favorites'))
    : []
favorites.renderForms = () =>
  favorites.reverse().map(
    fav =>
      new IndividualFavorite({
        ...fav
      })
  )
favorites.reorder = order => {
  const favCopy = favorites.map(f => f)
  order.forEach(
    (id, index) => (favorites[index] = favCopy.find(f => f.id === id))
  )
  favorites.save()
  favoritesGrid
    .querySelectorAll('.favorite-form-container')
    .forEach(n => n.remove())
  favorites.forms = favorites.renderForms()
}
favorites.forms = favorites.renderForms()
favorites.save = () => {
  if (localStorageAvailable())
    localStorage.setItem('favorites', JSON.stringify(favorites))
  else
    alert(
      `You need to enable "localStorage" for this site in your web browser to save a favorite.`
    )
}

// window.addEventListener('beforeunload', () => favorites.save())

export default favorites
