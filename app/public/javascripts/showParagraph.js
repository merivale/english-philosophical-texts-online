/*
 * Display sentences when a paragraph ID is entered.
 */
import fetchJson from './fetchJson.js'

// get the relevant elements
const paragraphInput = document.getElementById('paragraph')
const textInput = document.getElementById('text')
const sentenceList = document.querySelector('[data-view="sentence-list"]')
const results = document.querySelector('[data-view="results"]')

// ID of the currently seleced sentence
let sentenceId = null

// if the elements are in the page, set things up
if (paragraphInput && textInput && sentenceList) {
  fetchJson('paragraph-ids', (paragraphIds) => {
    // update the paragraph ID list when the current value changes
    paragraphInput.addEventListener('keyup', (e) => {
      if (paragraphIds.includes(paragraphInput.value)) {
        fetchJson(`paragraph/${paragraphInput.value}`, (paragraph) => {
          const p = document.createElement('p')
          paragraph.sentences.forEach((sentence, index) => {
            p.appendChild(sentenceElement(sentence, `${paragraph.id}.${index + 1}`))
          })
          sentenceList.innerHTML = ''
          sentenceList.appendChild(p)
          sentenceList.classList.remove('hidden')
        })
      }
    })
  })

  // update results when the author select menu changes
  textInput.addEventListener('change', fetchMatchingSentences)
}

// create a clickable SPAN element for a sentence
function sentenceElement (sentence, id) {
  const span = document.createElement('span')
  span.innerHTML = sentence
  span.addEventListener('click', (e) => {
    Array.from(span.parentElement.children).forEach((span) => {
      span.classList.remove('active')
    })
    span.classList.add('active')
    sentenceId = id
    fetchMatchingSentences()
  })
  return span
}

function fetchMatchingSentences () {
  const textId = textInput.value
  if (sentenceId && textId) {
    results.innerHTML = '<p>Searching...</p>'
    results.classList.remove('hidden')
    fetchJson(`similar?textId=${textId}&sentenceId=${sentenceId}`, (sentences) => {
      const fragment = document.createDocumentFragment()
      sentences.forEach((sentence) => {
        const div = document.createElement('div')
        const id = document.createElement('div')
        const p = document.createElement('p')
        const idBits = sentence.id.split('.')
        const url = `texts/${idBits.slice(0, -2).join('/').toLowerCase()}#${idBits[idBits.length - 2]}`
        id.classList.add('id')
        p.classList.add('content')
        id.innerHTML = `<a href="${url}">${idBits.slice(0, -1).join('.')}</a>`
        p.innerHTML = sentence.matched
        div.classList.add('result')
        div.appendChild(id)
        div.appendChild(p)
        fragment.appendChild(div)
      })
      results.innerHTML = ''
      results.appendChild(fragment)
    })
  }
}
