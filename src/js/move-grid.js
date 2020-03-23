const moveGrid = document.querySelector('#move-grid')
let favorites

function closeMoveFavorites() {
  moveGrid.classList.remove('show')
  document.body.style.position = ''
  moveGrid.removeEventListener('touchstart', startMove)

  const nodes = moveGrid.querySelectorAll('.move-item')
  const ids = [...nodes].map(node => node.getAttribute('favorite-id'))
  favorites.reorder(ids)
}

export default function moveFavorite(btn, currentFavorites) {
  favorites = currentFavorites
  const blocks = currentFavorites
    .map(
      f =>
        `<div favorite-id="${f.id}" class="move-item">${f.base.short}<br>${f.quote.short}</div>`
    )
    .join('')
  moveGrid.innerHTML =
    blocks +
    `<button id="move-close" class="btn-primary move-close">Close</button>`
  const moveClose = moveGrid.querySelector('#move-close')
  moveClose.addEventListener('click', closeMoveFavorites)
  const id = btn.closest('.favorite-form-container').getAttribute('favorite-id')
  const selectedItem = moveGrid.querySelector(`[favorite-id="${id}"]`)
  selectedItem.classList.add('selected')
  // document.body.style.position = 'fixed';
  // document.body.style.top = window.scrollY + "px";
  moveGrid.classList.add('show')
  moveGrid.addEventListener('touchstart', startMove)
}

function startMove(e) {
  moveGrid
    .querySelectorAll('.selected')
    .forEach(s => s.classList.remove('selected'))
  const item = e.target.closest('.move-item')
  if (item) {
    item.classList.add('selected')
    const rect = item.getBoundingClientRect()
    const height = item.clientHeight
    const width = item.clientWidth
    item.style.position = 'absolute'
    item.style.height = height + 'px'
    item.style.width = width + 'px'
    item.style.left = rect.left + 'px'
    item.style.top = rect.top + 'px'

    const emptySpace = document.createElement('div')
    item.insertAdjacentElement('beforebegin', emptySpace)
    const items = moveGrid.querySelectorAll('.move-item')
    const moveMoveInstance = e => moveMove(e, item, items, emptySpace)
    const endMoveInstance = e =>
      endMove(e, item, emptySpace, moveMoveInstance, endMoveInstance)
    item.addEventListener('touchmove', moveMoveInstance)
    item.addEventListener('touchend', endMoveInstance)
  }
}

function areColliding(rect1, rect2) {
  const horizontal = rect1.left < rect2.right && rect1.right > rect2.left
  const vertical = rect1.top < rect2.bottom && rect1.bottom > rect2.top
  if (horizontal && vertical) {
    const result = {}
    if (rect2.top <= rect1.top) result.ver = 'top'
    else result.ver = 'bottom'
    if (rect2.left <= rect1.left) result.hor = 'left'
    else result.hor = 'right'
    return result
  } else return false
}

function moveMove(e, item, items, emptySpace) {
  const height = item.clientHeight
  const width = item.clientWidth
  item.style.left = e.touches[0].clientX - width / 2 + 'px'
  item.style.top = e.touches[0].clientY - height / 2 + 'px'
  items.forEach(i => {
    if (i !== item) {
      const collision = areColliding(
        i.getBoundingClientRect(),
        item.getBoundingClientRect()
      )
      if (collision) {
        const side = collision.hor === 'left' ? 'beforebegin' : 'afterend'
        i.insertAdjacentElement(side, emptySpace)
      }
    }
  })
}

function endMove(e, item, emptySpace, moveMoveInstance, endMoveInstance) {
  emptySpace.innerHTML = item.innerHTML
  emptySpace.replaceWith(item)
  item.style.position = ''
  item.style.height = ''
  item.style.width = ''
  item.style.left = ''
  item.style.top = ''

  item.removeEventListener('touchmove', moveMoveInstance)
  item.removeEventListener('touchend', endMoveInstance)
}
