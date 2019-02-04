// dependencies
const request = require('sync-request')
const { JSDOM } = require('jsdom')
const save = require('../../../data/save')

// cache HTTP page requests
const docs = {}

// the main conversion function
const convert = (data) => {
  const url = data.source.split('#')[0]
  const divId = data.source.split('#')[1]
  const doc = docs[url] || new JSDOM(request('GET', url).getBody()).window.document
  if (!docs[url]) docs[url] = doc // save for subsequent conversions
  const div = doc.getElementById(divId)
  const includeNotes = !data.id.match(/Mandeville/)
  const noteIds = []
  const paragraphs = Array.from(div.querySelectorAll('p, ul.poem'))
    .map(convertParagraph.bind(null, includeNotes, noteIds))
  const notes = noteIds.map(convertFootnote.bind(null, doc))
  const section = { id: data.id, paragraphs, notes }
  save.section(section)
  console.log(`Imported ${section.id}`)
}

// map note ID to JSON object
const convertFootnote = (doc, [paragraphId, divId], index) => {
  const div = doc.getElementById(divId)
  const id = (index + 1).toString(10)
  const paragraphs = Array.from(div.querySelectorAll('p, ul.poem'))
    .map(convertParagraph.bind(null, false, []))
  const content = paragraphs.reduce((sofar, current) => sofar + current.content, '')
  return { paragraph: paragraphId, id, content }
}

// map paragraph DOM element to JSON object
const convertParagraph = (includeNotes, noteIds, element, index) => {
  const p = {}
  p.id = (index + 1).toString(10)
  if (element.previousElementSibling && element.previousElementSibling.outerHTML.match(/^<h2/)) {
    p.title = `<h2>${element.previousElementSibling.innerHTML}</h2>`
  }
  switch (getType(element, index)) {
    case 'poem':
      p.content = poemContent(element, includeNotes, noteIds, p.id)
      break
    case 'blockquote':
      p.content = blockquoteContent(element, includeNotes, noteIds, p.id)
      break
    case 'dialogue':
      p.content = defaultContent(element, includeNotes, noteIds, p.id)
      p.before = `<em>${getSpeaker(element.parentElement)}</em>`
      break
    default:
      p.content = defaultContent(element, includeNotes, noteIds, p.id)
      break
  }
  return p
}

// type of paragraph
const getType = (element, index) => {
  if (element.classList.contains('poem')) return 'poem'
  if (element.parentElement.classList.contains('sp')) return 'dialogue'
  if (element.parentElement.classList.contains('cit')) return 'blockquote'
  return null
}

// poem content (change <ul> to <p>, change <li>s to <br>s)
const poemContent = (element, includeNotes, noteIds, paragraphId) => {
  element.removeAttribute('class')
  element.innerHTML = element.innerHTML.replace(/<li id="(.*?)">(.*?)<\/li>\n/g, '$2 <br>')
  return defaultContent(element, includeNotes, noteIds, paragraphId)
    .replace(/<br> ?<br>/g, '<br>')
    .replace(/<ul>(.*?) <br><\/ul>/, '<p>$1</p>')
}

// blockquote content
const blockquoteContent = (element, includeNotes, noteIds, paragraphId) =>
  defaultContent(element, includeNotes, noteIds, paragraphId)
    .replace(/^<p><q>/, '<blockquote>')
    .replace(/<\/q><\/p>$/, '</blockquote>')

// default paragraph content
const defaultContent = (element, includeNotes, noteIds, paragraphId) => {
  // chuck away the id
  element.removeAttribute('id')
  // remove hyphens before page breaks
  element.innerHTML = element.innerHTML.replace(/-<span class="pb"/g, '<span class="pb"')
  // chuck away page breaks and handle footnote links
  breaksAndNotes(includeNotes, noteIds, paragraphId, element)
  Array.from(element.children).forEach(breaksAndNotes.bind(null, includeNotes, noteIds, paragraphId))
  // sort out italics
  element.innerHTML = element.innerHTML.replace(/<span class="(ital|roman)">(.*?)<\/span>/g, '<em>$2</em>')
  if (element.classList.contains('ital')) {
    element.removeAttribute('class')
    element.innerHTML = `<em>${element.innerHTML}</em>`
  }
  // sort out smallcaps
  element.innerHTML = element.innerHTML.replace(/<span class="c?sc">(.*?)<\/span>/g, '<b>$1</b>')
  Array.from(element.children).forEach((c) => {
    if (c.outerHTML.match(/^<b>/)) c.innerHTML = c.innerHTML.replace(/ /g, '')
  })
  element.innerHTML = element.innerHTML.replace(/\b([A-Z]) ?<b>/g, '<b>$1')
  element.innerHTML = element.innerHTML.replace(/<\/b>([^ ])/g, '</b> $1')
  // sort out quotes
  element.innerHTML = element.innerHTML.replace(/’/g, '\'')
  element.innerHTML = element.innerHTML.replace(/“/g, '<q>')
  element.innerHTML = element.innerHTML.replace(/”/g, '</q>')
  // remove class attribute
  element.removeAttribute('class')
  // strip whitespace
  element.innerHTML = element.innerHTML.trim().replace(/ {2}/g, ' ')
  element.innerHTML = element.innerHTML.replace(/^<br>/, '')
  // return the modified element as an HTML string
  return element.outerHTML
}

// chuck away page breaks and handle footnote links
const breaksAndNotes = (includeNotes, noteIds, paragraphId, element) => {
  Array.from(element.children).forEach((c) => {
    if (c.classList.contains('pb')) element.removeChild(c)
    if (c.classList.contains('milestone')) element.removeChild(c)
    if (c.classList.contains('type-margin')) {
      c.outerHTML = `<label>${c.innerHTML}</label>`
    }
    if (c.classList.contains('footnote-link')) {
      if (includeNotes) {
        noteIds.push([paragraphId, c.getAttribute('href').slice(1)])
        c.outerHTML = `<a href="#n${noteIds.length}"><sup>[${noteIds.length}]</sup></a>`
      } else {
        element.removeChild(c)
      }
    }
  })
}

// speaker (remove page break spans and spaces)
const getSpeaker = (element) =>
  element.querySelector('.speaker').textContent
    .replace(/Edition: orig; Page: \[.+\]/g, '')
    .replace(/ /g, '')

// export the main conversion function
module.exports = convert
