const express = require('express')
const router = express.Router()
const get = require('../data/get')

// authors json
router.get('/authors.json', (req, res) => {
  const authors = get.authors({ enrich: true })
  res.json(authors)
})

// letters json
router.get('/letters/:letter', (req, res) => {
  const words = get.dictionary(req.params.letter)
  res.json(words)
})

module.exports = router
