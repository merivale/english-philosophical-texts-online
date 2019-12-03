/*
 * Dynamically update an option list of IDs.
 */
import fetchJson from './fetchJson.js'

// get an array of ID list inputs
const idListInputs = Array.from(document.querySelectorAll('[data-action="id-list"]'))

// download JSON and add event listeners if there are any
if (idListInputs.length > 0) {
  fetchJson('sub-text-ids', (subTextIds) => {
    const paragraphsNeeded = idListInputs.some(input => input.dataset.paragraphs)
    if (paragraphsNeeded) {
      fetchJson('sub-paragraph-ids', (subParagraphIds) => {
        idListInputs.forEach((input) => {
          input.addEventListener('keyup', (e) => {
            updateIds(input, subTextIds, subParagraphIds)
          })
        })
      })
    } else {
      idListInputs.forEach((input) => {
        input.addEventListener('keyup', (e) => {
          updateIds(input, subTextIds)
        })
      })
    }
  })
}

// define input KEYUP event
function updateIds (input, subTextIds, subParagraphIds = {}) {
  // see if we need to change the list (and if so, to what)
  let subs = null
  if (!input.value) {
    subs = subTextIds.all
  } else if (subTextIds[input.value]) {
    subs = subTextIds[input.value]
  } else if (input.dataset.paragraphs && subParagraphIds[input.value]) {
    subs = subParagraphIds[input.value]
  }

  // change the list
  if (subs) {
    const datalist = document.getElementById(input.dataset.list)
    const fragment = document.createDocumentFragment()
    subs.forEach((id) => {
      const option = document.createElement('option')
      option.value = id
      fragment.appendChild(option)
    })
    datalist.innerHTML = ''
    datalist.appendChild(fragment)
  }
}
