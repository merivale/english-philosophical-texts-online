// dependencies
const analyse = require('../../data/analyse')
const file = require('../../data/file')
const write = require('./write')

// subdirectory for storing usage data
const directory = 'cache/usage'

// generate details for text
const generateUsageData = (id, offset = 0) => {
  const text = file.open('texts', id)
  if (text.imported || text.forename) {
    if (text.texts) {
      write(`Caching details for ${text.id}...\n`, offset)
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

// combine two records of text details
const combine = (details, subdetails, nameField) => {
  subdetails.forEach((x) => {
    const existing = details.find(y => y[nameField] === x[nameField])
    if (existing) {
      existing.frequency += x.frequency
    } else {
      details.push(x)
    }
    details.sort((a, b) => a[nameField].localeCompare(b[nameField]))
  })
}

module.exports = generateUsageData
