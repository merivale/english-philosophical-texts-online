/*
 * Command-line module for checking data.
 */
import lexicon from './check/lexicon.js'
import texts from './check/texts.js'

// sanity check
if (process.argv[2] === undefined) {
  throw new Error('argument missing')
}

// check whatever is requested
switch (process.argv[2]) {
  case 'lexicon':
    lexicon()
    break

  case 'texts':
    texts(process.argv[3])
    break

  default:
    throw new Error(`Unknown option ${process.argv[2]}`)
}
