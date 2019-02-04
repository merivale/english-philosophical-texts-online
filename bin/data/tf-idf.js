// dependencies
const get = require('../data/get')
const save = require('../data/save')

// augment a concordance with tf-idf data
const addTFIDF = (concordance, concordances) => {
  concordance.words.forEach((word) => {
    const tf = word.count / concordance.total
    const df = concordances.filter(d => d.words.find(w => w.word === word.word)).length
    const idf = Math.log(concordances.length / df)
    word.tfidf = tf * idf
  })
  save.concordance(concordance)
  console.log(`Generated TF-IDF data for ${concordance.id}`)
}

// dictionaries
const dictionaries = get.authors(false)
  .map(author => get.dictionary(author.id))
  .filter(dictionary => dictionary.total > 0)

// augment the dictionaries with tf-idf data
dictionaries.forEach((dictionary) => {
  dictionary.words.forEach((word) => {
    const tf = word.count / dictionary.total
    const df = dictionaries.filter(d => d.words.find(w => w.word === word.word)).length
    const idf = Math.log(dictionaries.length / df)
    word.tfidf = tf * idf
  })
  save.dictionary(dictionary)
  console.log(`Generated TF-IDF data for ${dictionary.id}`)
})
