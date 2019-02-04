// dependencies
const request = require('sync-request')
const yaml = require('js-yaml')
const save = require('../../../data/save')

// the main conversion function
const convert = (data) => {
  const input = request('GET', data.source).getBody()
  const section = transform(yaml.load(input))
  save.section(section)
  console.log(`Imported ${section.id}`)
}

// transform JSONified input to required format
const transform = (input) => {
  const output = {}
  output.id = id(input.label)
  if (input.paragraphs) output.paragraphs = input.paragraphs.map(paragraph)
  if (input.notes) output.notes = input.notes.map(note)
  return output
}

// convert a label to an id
const id = (label) => {
  const first = label.split('.')[0]
  switch (first) {
    case 'D':
      return label.replace(/^D/, 'Hume.DNR').replace(/\.0$/, '.Intro')
    case 'E':
      return label.replace(/^E/, 'Hume.EHU')
    case 'H':
      return label.replace(/^H/, 'Hume.HE')
    case 'L':
      return label.replace(/^L/, 'Hume.LG')
    case 'M':
      return label.replace(/^M/, 'Hume.EPM')
    case 'N':
      return label.replace(/^N/, 'Hume.NHR').replace(/\.0$/, '.Intro')
    case 'P':
      return label.replace(/^P/, 'Hume.DP')
    case 'T':
      return label.replace(/^T/, 'Hume.THN').replace(/\.0$/, '.Intro')
    default:
      return `Hume.${label}`
  }
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
