// dependencies
import lemmas from './generate/lemmas.js'
import plain from './generate/plain.js'
import sentences from './generate/sentences.js'
import search from './generate/search.js'
import usage from './generate/usage.js'
import rawusage from './generate/rawusage.js'
import tfidf from './generate/tfidf.js'

// sanity check
if (process.argv[2] === undefined) {
  throw new Error('argument missing')
}

// generate whatever is requested
switch (process.argv[2]) {
  case 'search':
    search(process.argv[3])
    break

  case 'plain':
    plain(process.argv[3])
    break

  case 'sentences':
    sentences(process.argv[3])
    break

  case 'lemmas':
    lemmas(process.argv[3])
    break

  case 'usage':
    usage(process.argv[3])
    break

  case 'rawusage':
    rawusage(process.argv[3])
    break

  case 'tfidf':
    tfidf(process.argv[3])
    break

  case 'all':
    search(process.argv[3])
    plain(process.argv[3])
    lemmas(process.argv[3])
    usage(process.argv[3])
    rawusage(process.argv[3])
    tfidf(process.argv[3])
    break

  default:
    throw new Error(`Unknown option ${process.argv[2]}`)
}
