/*
 * Convert texts from the Text Creation Partnership.
 */
import request from 'sync-request'
import JSDOM from 'jsdom'
import * as file from '../../service/file.js'

// cache for HTTP page requests
const docs = {}

// the main conversion function
export default function convert (data) {
  if (data.texts) {
    return // don't do anything with collections
  }
  const doc = docs[data.source] || new JSDOM(request('GET', data.source).getBody()).window.document
  if (!docs[data.source]) {
    docs[data.source] = doc // save to cache for subsequent conversions
  }
  const notesData = []
  data.paragraphs = getParagraphs(doc, data.id).map(convertParagraph.bind(null, notesData))
  data.notes = notesData.map(convertFootnote)
  file.save(data)
  console.log(`Imported ${data.id}`)
}

// get paragraphs from the HTML document
function getParagraphs (doc, id) {
  const all = Array.from(doc.querySelectorAll('#doccontent p, #doccontent .lg'))
  if (id === 'Astell.SPL') return all.slice(7, 63)
  if (id === 'Norris.LLG.Pref') return all.slice(0, 16)
  if (id === 'Norris.LLG.P1') return all.slice(16, 25)
  if (id === 'Astell.LLG.P2') return all.slice(25)
  return all
}

// convert a paragraph and save any footnote data for later
function convertParagraph (notesData, paragraph, index) {
  const id = (index + 1).toString(10)
  const content = convertContent(paragraph, notesData, id)
  return { id, content }
}

// convert a footnote
function convertFootnote ({ paragraph, url }, index, notesData) {
  const doc = new JSDOM(request('GET', url).getBody()).window.document
  const div = doc.querySelector('#doccontent > div')
  const id = (index + 1).toString(10)
  const content = convertContent(div, notesData, paragraph)
  return { id, paragraph, content }
}

// convert paragraph or footnote content
function convertContent (node, notesData, paragraphId) {
  Array.from(node.children).forEach((x) => {
    // chuck away page breaks
    if (x.classList.contains('pbtext')) node.removeChild(x)
    // change italics rendering
    if (x.classList.contains('rend-italic')) x.outerHTML = `<em>${x.innerHTML}</em>`
    // handle footnotes
    if (x.classList.contains('ptr')) {
      const noteId = notesData.length + 1
      // save footnote data for later handling
      notesData.push({ paragraphId, url: x.querySelector('a[href]').getAttribute('href') })
      // make a footnote link
      x.outerHTML = `<a href="#n${noteId}"><sup>[${noteId}]</sup></a>`
    }
  })
  return `<p>${node.innerHTML.trim()}</p>`
    .replace(/<div class="line">(.*?)<\/div>/g, '$1 <br>') // .lg
    .replace(/<span class="pbtext">.*?<\/span>/g, '') // in case the for loop missed any
    .replace(/<span class="rend-italic">(.*?)<\/span>/g, '<em>$1</em>') // in case the for loop missed any
    .replace(/<span class="notenumber">.*?<\/span>/g, '') // at the start of footnotes
    .replace(/<span class="gap">•<\/span>/g, '[?]')
    .replace(/<span class="gap">〈◊〉<\/span>/g, '[??]')
    .replace(/∣/g, '') // ditch line breaks
    .replace(/\n\n/g, ' ') // sort out white space
    .replace(/\n/g, ' ')
}
