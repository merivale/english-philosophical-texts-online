/*
 * Dynamically update an option list of IDs.
 */
import fetchJson from './fetchJson.js'

// get an array of ID list inputs
const idListInputs = Array.from(document.querySelectorAll('[data-action="id-list"]'))

// if there are any, fetch the sub IDs data and set things up
if (idListInputs.length > 0) {
  fetchJson('sub-ids', (subIds) => {
    idListInputs.forEach((input) => {
      input.addEventListener('keyup', (e) => {
        const datalist = document.getElementById(input.dataset.list)
        const fragment = document.createDocumentFragment()
        const subs = input.value ? subIds[input.value] : subIds.all
        if (subs) {
          subs.forEach((id) => {
            const option = document.createElement('option')
            option.value = id
            fragment.appendChild(option)
          })
          datalist.innerHTML = ''
          datalist.appendChild(fragment)
        }
      })
    })
  })
}
