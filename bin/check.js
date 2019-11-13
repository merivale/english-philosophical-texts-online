// dependencies
const lexicon = require('./check/lexicon')

switch (process.argv[2]) {
  case 'lexicon':
    lexicon()
    break
}
