// dependencies
const lexicon = require('../../data/lexicon')

// flatten and sort the lexicon
const flatten = array =>
  array.reduce((acc, val) => Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), [])

const flatLexicon = flatten(Object.entries(lexicon)).sort()

// check for duplicates
flatLexicon.forEach((lemma, index) => {
  if (flatLexicon.slice(0, index).includes(lemma)) console.log(`Duplicate: ${lemma}`)
})
