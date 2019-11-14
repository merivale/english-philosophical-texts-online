// dependencies
const file = require('../../data/file')
const prepare = require('./prepare')
const write = require('./write')

// subdirectory for storing search cache
const directory = 'cache/search'

// generate cache of searchable texts
const generateSearchCache = (id, offset = 0) => {
  // id === 'all' is a special case
  if (id === 'all') {
    const all = ['astell', 'berkeley', 'hume', 'hutcheson', 'locke', 'mandeville', 'norris', 'shaftesbury']
    all.forEach(generateSearchCache)
    return
  }

  // look for a text with the given ID
  const text = file.open('texts', id)

  // throw an error if the text is not found
  if (!text) throw new Error(`No text found with ID ${id}.`)

  // exit if the text is not an author and has not been imported
  if (text.forename === undefined && !text.imported) {
    return
  }

  // otherwise generate the search cache for the text
  write(`Generating search cache for ${text.id}...\n`, offset)
  if (text.texts) {
    // generate the search cache for subtexts recursively
    text.texts.forEach((id) => {
      if (id.match(text.id.split('.')[0])) { // skip past subtexts by different authors
        generateSearchCache(id, offset + 1)
      }
    })
    write('done!\n', offset)
  } else {
    // generate the search cache for this text
    write(`Generating search cache for ${text.id}... `, offset)
    const data = {
      id: text.id,
      fulltitle: prepare.searchableText(text.fulltitle),
      paragraphs: text.paragraphs.map(p => Object.assign(p, { content: prepare.searchableText(p.content) })),
      notes: text.notes.map(n => Object.assign(n, { content: prepare.searchableText(n.content) }))
    }
    file.save(directory, text.id, data)
    write('done!\n')
  }
}

module.exports = generateSearchCache
