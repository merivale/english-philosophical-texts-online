// dependencies
const get = require('../../data/get')
const save = require('../../data/save')

// load the current dictionary into memory
const dictionary = get.dictionary()

// dictionary update function
const updateDictionary = (id) => {
  const text = get.text(id)
  if (text.texts) {
    text.texts.forEach(updateDictionary)
  } else if (text.imported) {
    const fulltext = get.text(id, { enrich: true })
    const blocks = fulltext.paragraphs.concat(fulltext.notes)
    blocks.forEach((b) => {
      strip(b.content).split(' ').forEach((word) => {
        const existing = dictionary.find(x => x.word === word)
        if (existing) {
          existing.frequency += 1
          existing.paragraphs.push(`${text.id}.${b.id}`)
        } else {
          dictionary.push({
            lexeme: word,
            word,
            frequency: 1,
            paragraphs: [`${text.id}.${b.id}`]
          })
        }
      })
    })
    console.log(`Added dictionary entries from ${id}`)
  }
}

// strip content of all markup, punctuation, etc.
const strip = content =>
  content.toLowerCase()
    .replace(/[,.;:!?()]/g, '') // remove all punctuation
    .replace(/<a(.*?)>(.*?)<\/a>/g, '') // remove all footnote anchors
    .replace(/<i>(.*?)<\/i>/g, '') // remove all foreign language text
    .replace(/<cite>(.*?)<\/cite>/g, '') // remove all citations
    .replace(/<small>(.*?)<\/small>/g, '') // remove anything marked as <small>
    .replace(/<([^>]+)>/g, '') // remove all HTML tags
    .replace(/—/g, ' ') // replace mdashes with spaces
    .replace(/ {2}/g, ' ') // replace double spaces with single spaces

// reset all frequencies to zero
dictionary.forEach((x) => {
  x.frequency = 0
  x.paragraphs = []
})

// update the dictionary with the data from every text
get.authors().forEach((author) => {
  author.texts.forEach(updateDictionary)
})

// trim the fat and save
console.log('Saving dictionary...')
save.dictionary(dictionary.filter(x => x.frequency > 0))
console.log('        ... done.')
