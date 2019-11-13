// dependencies
const request = require('sync-request')
const file = require('../../data/file')

// the main conversion function
const convert = (data) => {
  const input = request('GET', data.source).getBody()
  const newdata = JSON.parse(input)
  data.fulltitle = content(newdata.fulltitle)
  if (data.paragraphs) data.paragraphs = newdata.paragraphs.map(paragraph)
  if (data.notes && data.notes.length) data.notes = newdata.notes.map(note)
  file.save(data)
  console.log(`Imported ${data.id}`)
}

// convert a paragraph
const paragraph = x =>
  ({
    id: x.id,
    title: x.title ? content(x.title) : undefined,
    before: x.before ? `${x.before}.` : undefined,
    content: content(x.content)
  })

// convert a footnote/endnote
const note = x =>
  ({
    id: x.id,
    paragraph: x.paragraph,
    content: content(x.content)
  })

// convert content
const content = x =>
  x.replace(/<\/?strong>/g, '')
    .replace(/<del(.*?)<\/del>/g, '')
    .replace(/<ins(.*?)>(.*?)<\/ins>/g, '$2')
    .replace(/\|/g, '')
    .replace(/a priori/g, 'apriori')
    .replace(/a posteriori/g, 'aposteriori')
    .replace(/ad infinitum/g, 'adinfinitum')
    .replace(/in infinitum/g, 'ininfinitum')
    .replace(/ipso facto/g, 'ipsofacto')

// export the main conversion function
module.exports = convert
