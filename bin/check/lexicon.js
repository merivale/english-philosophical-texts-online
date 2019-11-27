// dependencies
import * as get from '../../service/get.js'

// check the lexicon
export default function () {
  let lexicon
  let duplicates = false
  try {
    lexicon = get.lexicon()
  } catch (error) {
    console.error('Failed to open lexicon; bad JSON data?')
    return
  }
  // flatten and sort the lexicon
  const flatLexicon = flatten(Object.entries(lexicon)).sort()
  // check for duplicates
  flatLexicon.forEach((lemma, index) => {
    if (flatLexicon.slice(0, index).includes(lemma)) {
      console.error(`Duplicate: ${lemma}`)
      duplicates = true
    }
  })
  if (duplicates) {
    console.log('Otherwise OK.')
  } else {
    console.log('Everything looks OK.')
  }
}

// flatten an array
function flatten (array) {
  return array.reduce((acc, val) => Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), [])
}
