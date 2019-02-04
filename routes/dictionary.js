const createError = require('http-errors')
const express = require('express')
const router = express.Router()
const area = 'dictionary'
const get = require('../data/get')
const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')

// index
router.get('/', (req, res) => {
  const letters = alphabet.map(letter => ({ letter, words: get.dictionary(letter) }))
  const total = letters.reduce((x, y) => x + y.words.length, 0)
  res.render('dictionary/index', { area, letters, total })
})

// letter
router.get('/:letter', (req, res, next) => {
  if (alphabet.indexOf(req.params.letter.toLowerCase()) > -1) {
    const letter = req.params.letter
    const words = get.dictionary(letter)
    res.render('dictionary/letter', { area, letter, words })
  } else {
    next(createError(404))
  }
})

module.exports = router
