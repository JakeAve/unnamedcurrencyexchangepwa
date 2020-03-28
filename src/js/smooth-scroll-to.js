export default function smoothScrollTo(el, options = {}) {
  const { inline = 'nearest', block = 'start', behavior = 'smooth' } = options
  try {
    el.scrollIntoView({
      inline,
      block,
      behavior
    })
  } catch {
    const rate = 25
    const pageOffSet = () => window.pageYOffset || document.scrollTop
    const elOffSet = () => el.getBoundingClientRect().top + pageOffSet()
    const direction = elOffSet() < pageOffSet() ? -1 : 1
    let lastPos
    const interval = setInterval(() => {
      window.scrollBy(0, rate * direction)
      if (
        Math.abs(pageOffSet() - elOffSet()) < rate / 2 ||
        pageOffSet() === lastPos
      )
        clearInterval(interval)
      lastPos = pageOffSet()
    }, 25)
  }
}
