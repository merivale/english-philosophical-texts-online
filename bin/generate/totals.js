// dependencies
const file = require('../../data/file')
const write = require('./write')

// subdirectory for storing search cache
const directory = 'cache/totals'

// generate cache of lemmatized texts
const generateTotalsCache = (id, offset = 0) => {
  // id === 'all' is a special case
  if (id === 'all') {
    const all = ['astell', 'berkeley', 'hume', 'hutcheson', 'locke', 'mandeville', 'norris', 'shaftesbury']
    all.forEach(generateTotalsCache)
    return
  }

  // look for a text with the given ID
  const text = file.open('texts', id)

  // throw an error if the text is not found
  if (!text) throw new Error(`No text found with ID ${id}.`)

  const totals = { texts: 0, words: 0 }

  // exit if the text is not an author and has not been imported
  if (text.forename === undefined && !text.imported) {
    return totals
  }

  // otherwise generate the totals cache for the text
  if (text.texts) {
    write(`Generating totals cache for ${text.id}...\n`, offset)
    // generate the totals cache for subtexts recursively
    text.texts.forEach((id) => {
      if (id.match(text.id.split('.')[0])) { // skip past subtexts by different authors
        const result = generateTotalsCache(id, offset + 1)
        totals.texts += result.texts
        totals.words += result.words
      }
    })
    file.save(directory, `${id}.index`, totals)
    write('done!\n', offset)
  } else {
    // generate the lemmatized text cache for this text
    write(`Generating totals cache for ${id}... `, offset)
    const plainText = file.open('cache/plain', id, 'txt')
    totals.texts = 1
    totals.words = plainText.replace(/\n/g, ' ').split(' ').filter(x => x.length > 0).length
    file.save(directory, id, totals)
    write('done!\n')
  }

  return totals
}

module.exports = generateTotalsCache
