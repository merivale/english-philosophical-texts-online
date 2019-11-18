import lexicon from './check/lexicon.js'
import texts from './check/texts.js'

switch (process.argv[2]) {
  case 'lexicon':
    lexicon()
    break

  case 'texts':
    texts()
    break
}
