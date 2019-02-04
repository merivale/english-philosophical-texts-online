// dependencies
const get = require('../data/get')
const save = require('../data/save')

// generate concordance for a text
const generateConcordance = (text) => {
  if (text.texts) text.texts.forEach((id) => generateConcordance(get.text(id)))
  const start = { id: text.id, total: 0, words: [] }
  const concordance = text.texts
    ? text.texts.map(get.concordance).reduce(combineConcordances, start)
    : makeConcordance(text.id)
  save.concordance(concordance)
  console.log(`Generated concordance for ${text.id}`)
}

// reduce an array of concordances to one concordance
const combineConcordances = (accumulator, current) => {
  accumulator.total += current.total
  current.words.forEach((x) => {
    const existing = accumulator.words.find(y => y.word === x.word)
    if (existing) {
      existing.count += x.count
    } else {
      accumulator.words.push(x)
    }
  })
  return accumulator
}

// make concordance out of array of paragraphs and notes
const makeConcordance = (id) => {
  const text = get.text(id, { enrich: true })
  if (!text) console.log(id)
  const blocks = text.paragraphs.concat(text.notes)
  const words = []
  let total = 0
  blocks.forEach((b) => {
    strip(b.content.toLowerCase()).split(' ').forEach(word => {
      const existing = words.find(x => x.word === word)
      total += 1
      if (existing) {
        existing.count += 1
      } else {
        words.push({ word, count: 1 })
      }
    })
  })
  return { id, total, words }
}

// strip text of HTML markup
const strip = text =>
  text.replace(/[,.;:!?()]/g, '').replace(/(<([^>]+)>)/g, '').replace(/\[\d+?\]/g, '')

// run the script
if (process.argv[2]) {
  // generate concordances for specified author
  const author = get.author(process.argv[2])
  generateConcordance(author)
} else {
  // generate concordances for all authors
  get.authors().forEach(generateConcordance)
}
