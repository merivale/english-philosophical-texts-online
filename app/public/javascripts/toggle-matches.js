const toggleMatches = document.querySelectorAll('[data-action="toggle-matches"]')

toggleMatches.forEach((a) => {
  a.addEventListener('click', (e) => {
    const matches = document.getElementById(a.dataset.matches)
    matches.classList.toggle('active')
  })
})
