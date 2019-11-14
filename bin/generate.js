// dependencies
const lemmas = require('./generate/lemmas')
const plain = require('./generate/plain')
const search = require('./generate/search')
const usage = require('./generate/usage')
const totals = require('./generate/totals')
const tfidf = require('./generate/tfidf')

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

  case 'lemmas':
    lemmas(process.argv[3])
    break

  case 'usage':
    usage(process.argv[3])
    break

  case 'totals':
    totals(process.argv[3])
    break

  case 'tfidf':
    tfidf(process.argv[3])
    break

  case 'all':
    search(process.argv[3])
    plain(process.argv[3])
    lemmas(process.argv[3])
    usage(process.argv[3])
    totals(process.argv[3])
    tfidf(process.argv[3])
    break

  default:
    throw new Error(`Unknown option ${process.argv[2]}`)
}
