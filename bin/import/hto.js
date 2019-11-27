// dependencies
import request from 'sync-request'
import * as file from '../../service/file.js'

// the main conversion function
export default function convert (data) {
  const input = request('GET', data.source).getBody()
  const newdata = JSON.parse(input)
  data.fulltitle = content(newdata.fulltitle)
  if (data.paragraphs) data.paragraphs = newdata.paragraphs.map(paragraph)
  if (data.notes && data.notes.length) data.notes = newdata.notes.map(note)
  file.save('texts', data.id, data)
  console.log(`Imported ${data.id}`)
}

// convert a paragraph
function paragraph (x) {
  return {
    id: x.id,
    title: x.title ? content(x.title) : undefined,
    before: x.before ? `${x.before}.` : undefined,
    content: content(x.content)
  }
}

// convert a note
function note (x) {
  return {
    id: x.id,
    paragraph: x.paragraph,
    content: content(x.content)
  }
}

// convert content
function content (x) {
  return x.replace(/<\/?strong>/g, '')
    .replace(/<del(.*?)<\/del>/g, '')
    .replace(/<ins(.*?)>(.*?)<\/ins>/g, '$2')
    .replace(/\|/g, '')
    .replace(/a priori/g, 'apriori')
    .replace(/a posteriori/g, 'aposteriori')
    .replace(/ad infinitum/g, 'adinfinitum')
    .replace(/in infinitum/g, 'ininfinitum')
    .replace(/ipso facto/g, 'ipsofacto')
}
