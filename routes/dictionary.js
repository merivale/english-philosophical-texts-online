const createError = require('http-errors')
const express = require('express')
const router = express.Router()
const area = 'dictionary'
const get = require('../data/get')
const alphabet = '_0123456789abcdefghijklmnopqrstuvwxyz'.split('')

const authorDictionary = (id, letter) =>
  get.dictionary(letter).filter((word) =>
    word.paragraphs.filter(id => id.split('.')[0] === id).length > 0
  )

// index
router.get('/', (req, res) => {
  const letters = alphabet.map(letter => ({ letter, words: get.dictionary(letter) }))
  const total = letters.reduce((x, y) => x + y.words.length, 0)
  res.render('dictionary/index', { area, letters, total })
})

// letter
router.get('/letter/:letter', (req, res, next) => {
  if (alphabet.includes(req.params.letter.toLowerCase())) {
    const letter = req.params.letter
    const words = get.dictionary(letter)
    res.render('dictionary/letter', { area, letter, words })
  } else {
    next(createError(404))
  }
})

// author letter
router.get('/author/:author/:letter', (req, res, next) => {
  const author = get.author(req.params.author)
  if (author && alphabet.includes(req.params.letter.toLowerCase())) {
    const letter = req.params.letter
    const words = get.vocabulary(author.id, letter)
    res.render('dictionary/author-letter', { area, author, letter, words })
  } else {
    next(createError(404))
  }
})

// author
router.get('/author/:author', (req, res, next) => {
  const author = get.author(req.params.author)
  if (author) {
    const letters = alphabet.map(letter => ({ letter, words: authorDictionary(author.id, letter) }))
    const total = letters.reduce((x, y) => x + y.words.length, 0)
    res.render('dictionary/index', { area, author, letters, total })
  } else {
    next(createError(404))
  }
})

module.exports = router
