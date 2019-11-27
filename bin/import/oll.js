// dependencies
import request from 'sync-request'
import JSDOM from 'jsdom'
import * as file from '../../service/file.js'

// cache of HTTP page requests
const docs = {}

// the main conversion function
export default function convert (data) {
  if (data.texts) {
    return // don't do anything with collections
  }
  const url = data.source.split('#')[0]
  const divId = data.source.split('#')[1]
  const doc = docs[url] || new JSDOM(request('GET', url).getBody()).window.document
  if (!docs[url]) {
    docs[url] = doc // save to the cache for subsequent conversions
  }
  const div = doc.getElementById(divId)
  const includeNotes = !data.id.match(/Mandeville/)
  const noteIds = []
  data.paragraphs = Array.from(div.querySelectorAll('p, ul.poem'))
    .map(convertParagraph.bind(null, includeNotes, noteIds))
  data.notes = noteIds.map(convertFootnote.bind(null, doc))
  data.imported = true
  file.save(data)
  console.log(`Imported ${data.id}`)
}

// map note ID to JSON object
function convertFootnote (doc, [paragraphId, divId], index) {
  const div = doc.getElementById(divId)
  const id = (index + 1).toString(10)
  const paragraphs = Array.from(div.querySelectorAll('p, ul.poem'))
    .map(convertParagraph.bind(null, false, []))
  const content = paragraphs.reduce((sofar, current) => sofar + current.content, '')
  return { paragraph: paragraphId, id, content }
}

// map paragraph DOM element to JSON object
function convertParagraph (includeNotes, noteIds, element, index) {
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
function getType (element, index) {
  if (element.classList.contains('poem')) return 'poem'
  if (element.parentElement.classList.contains('sp')) return 'dialogue'
  if (element.parentElement.classList.contains('cit')) return 'blockquote'
  return null
}

// poem content (change <ul> to <p>, change <li>s to <br>s)
function poemContent (element, includeNotes, noteIds, paragraphId) {
  element.removeAttribute('class')
  element.innerHTML = element.innerHTML.replace(/<li id="(.*?)">(.*?)<\/li>\n/g, '$2 <br>')
  return defaultContent(element, includeNotes, noteIds, paragraphId)
    .replace(/<br> ?<br>/g, '<br>')
    .replace(/<ul>(.*?) <br><\/ul>/, '<p>$1</p>')
}

// blockquote content
function blockquoteContent (element, includeNotes, noteIds, paragraphId) {
  return defaultContent(element, includeNotes, noteIds, paragraphId)
    .replace(/^<p><q>/, '<blockquote>')
    .replace(/<\/q><\/p>$/, '</blockquote>')
}

// default paragraph content
function defaultContent (element, includeNotes, noteIds, paragraphId) {
  // chuck away the id
  element.removeAttribute('id')
  // remove hyphens before page breaks
  element.innerHTML = element.innerHTML.replace(/-<span class="pb"/g, '<span class="pb"')
  // chuck away editorial notes
  element.innerHTML = element.innerHTML.replace(/∥<a.*?<\/a>(.*?)∥/g, '$1')
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
function breaksAndNotes (includeNotes, noteIds, paragraphId, element) {
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
function getSpeaker (element) {
  return element.querySelector('.speaker').textContent
    .replace(/Edition: orig; Page: \[.+\]/g, '')
    .replace(/ /g, '')
}
