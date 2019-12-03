/*
 * Function to check the lexicon data.
 */
import * as lexicon from '../../service/lexicon.js'

// check the lexicon
export default function () {
  // try to open the lexicon
  try {
    lexicon.raw()
  } catch (error) {
    console.error('Failed to open lexicon; bad JSON data?')
    return
  }
  // check for duplicate entries
  const flatLexicon = lexicon.flat()
  let duplicates = false
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
