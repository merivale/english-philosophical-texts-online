// dependencies
const analyse = require('../../data/analyse')
const file = require('../../data/file')
const write = require('./write')

// subdirectory for storing usage data
const directory = 'cache/usage'

// generate usage details from text string
const usage = (content) => {
  const lemmaTokens = content.replace(/\*(.*?)\*/g, '')
    .replace(/_(.*?)_/g, '')
    .replace(/\[(.*?)\]/g, '')
    .replace(/\n/g, ' ')
    .split(' ')
    .filter(x => x.length > 0)
  const lemmaTypes = []
  lemmaTokens.forEach((token) => {
    const existing = lemmaTypes.find(x => x.lemma === token)
    if (existing) {
      existing.total += 1
    } else {
      lemmaTypes.push({ lemma: token, total: 1 })
    }
  })
  lemmaTokens.sort((x, y) => x.total - y.total)
  return lemmaTypes
}

// generate details for text
const generateUsageData = (id, offset = 0) => {
  const text = file.open('texts', id)
  if (text.imported || text.forename) {
    if (text.texts) {
      write(`Caching word usage statistics for ${text.id}...\n`, offset)
      const details = {
        people: [],
        citations: [],
        foreign: [],
        numbers: [],
        count: 0,
        lexemes: [],
        unidentified: []
      }
      text.texts.forEach((id) => {
        if (id.match(text.id.split('.')[0])) { // skip past subtexts by different authors
          generateUsageData(id, offset + 1)
          const subdetails = file.open(directory, id)
          if (subdetails) {
            combine(details.people, subdetails.people, 'name')
            details.citations.push(...subdetails.citations)
            details.foreign.push(...subdetails.foreign)
            details.numbers.push(...subdetails.numbers)
            details.count += subdetails.count
            combine(details.lexemes, subdetails.lexemes, 'lemma')
            combine(details.unidentified, subdetails.unidentified, 'word')
          }
        }
      })
      file.save(directory, `${text.id}.index`, details)
      write('done!\n', offset)
    } else {
      write(`Caching details for ${text.id}... `, offset)
      const details = analyse(text)
      file.save(directory, text.id, details)
      write('done!\n')
    }
  }
}

module.exports = generateUsageData
