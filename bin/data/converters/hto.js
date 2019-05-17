// dependencies
const request = require('sync-request')
const file = require('../../../data/file')

// the main conversion function
const convert = (data) => {
  const input = request('GET', data.source).getBody()
  const newdata = JSON.parse(input)
  data.fulltitle = newdata.fulltitle
  data.paragraphs.forEach((block) => {})
  data.notes.forEach((block) => {})
  file.save(data)
  console.log(`Imported ${section.id}`)
}

// convert a paragraph
const paragraph = x => {
  const p = {}
  p.id = x.id
  p.title = x.title ? content(x.title) : undefined
  p.before = x.subsection ? `${x.subsection}.` : undefined
  p.content = content(x.content)
  return p
}

// convert a footnote/endnote
const note = x => {
  const n = {}
  n.id = x.id
  n.paragraph = x.paragraph
  n.content = content(x.content)
  return n
}

// convert content
const content = x =>
  x.replace(/<\/?strong>/g, '')
    .replace(/<del(.*?)<\/del>/g, '')
    .replace(/<ins(.*?)>(.*?)<\/ins>/g, '$2')
    .replace(/<span class=('|")page-break('|")>\|<\/span>/g, '')
    .replace(/<span class=('|")tab('|")><\/span>/g, '')

// export the main conversion function
module.exports = convert
