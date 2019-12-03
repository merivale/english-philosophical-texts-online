/*
 * Command-line module for generating cached data.
 */
import common from './generate/common.js'
import ids from './generate/ids.js'
import lemmas from './generate/lemmas.js'
import plain from './generate/plain.js'
import rawusage from './generate/rawusage.js'
import search from './generate/search.js'
import sentences from './generate/sentences.js'
import tfidf from './generate/tfidf.js'
import usage from './generate/usage.js'

// sanity check
if (process.argv[2] === undefined) {
  throw new Error('argument missing')
}

// generate whatever is requested
switch (process.argv[2]) {
  case 'ids':
    ids()
    break

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

  case 'common':
    common()
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
    ids()
    search(process.argv[3])
    plain(process.argv[3])
    sentences(process.argv[3])
    lemmas(process.argv[3])
    common()
    usage(process.argv[3])
    rawusage(process.argv[3])
    tfidf(process.argv[3])
    break

  default:
    throw new Error(`Unknown option ${process.argv[2]}`)
}
