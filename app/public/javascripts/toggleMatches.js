/*
 * Show/hide matches in search results on the search page.
 */

// get all toggle elements
const toggleMatches = document.querySelectorAll('[data-action="toggle-matches"]')

// add the toggle event listener
toggleMatches.forEach((a) => {
  a.addEventListener('click', (e) => {
    const matches = document.getElementById(a.dataset.matches)
    matches.classList.toggle('active')
  })
})
