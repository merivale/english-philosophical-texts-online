/*
 * Filter and order the list of authors on the home page.
 */
import fetchJson from './fetchJson.js'

// get the relevant elements
const authorsDiv = document.getElementById('authors')
const filterInput = document.querySelector('[data-action="filter-authors"]')
const orderInput = document.querySelector('[data-action="order-authors"]')

// if the elements are in the page, set things up
if (authorsDiv && filterInput && orderInput) {
  fetchJson('authors', (authors) => {
    filterInput.addEventListener('keyup', update.bind(null, authors))
    orderInput.addEventListener('change', update.bind(null, authors))
    update(authors)
  })
}

// update the list of authors
const update = (authors) => {
  if (orderInput.value === 'alphabetical') {
    authors.sort((x, y) => x.id.localeCompare(y.id, 'en'))
  }
  if (orderInput.value === 'published') {
    authors.sort((x, y) => x.published - y.published)
  }
  if (orderInput.value === 'birth') {
    authors.sort((x, y) => x.birth - y.birth)
  }
  const regex = filterInput.value.length > 0
    ? new RegExp(`\\b(${filterInput.value})`, 'i')
    : null
  const toShow = regex
    ? authors.filter(x => x.fullname.match(regex))
    : authors
  authorsDiv.innerHTML = toShow.map(show.bind(null, regex)).join('')
}

// generate html for a given author
const show = (regex, author) =>
  `<div class="author"><h4><a href="${author.url}">${author.fullname.replace(regex, '<mark>$1</mark>')} (${author.birth}-${author.death})</a></h4><div class="details"><p>Nationality: ${author.nationality}</p><p>Sex: ${author.sex}</p><p>Texts in library: ${author.imported.length} / ${author.texts.length}</p></div></div>`
