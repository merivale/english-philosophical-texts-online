const express = require('express')
const router = express.Router()
const area = 'texts'
const get = require('../data/get')

// index (list of authors)
router.get('/', (req, res) => {
  const authors = get.authors()
  const males = authors.filter(a => a.sex === 'Male')
  const females = authors.filter(a => a.sex === 'Female')
  const authorsWithTexts = authors.filter(a => a.imported.length > 0)
  const imported = authors.reduce((acc, current) => acc + current.imported.length, 0)
  const total = authors.reduce((acc, current) => acc + current.texts.length, 0)
  res.render('index', { area, authors, males, females, authorsWithTexts, imported, total })
})

module.exports = router
