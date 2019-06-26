const express = require('express')
const router = express.Router()
const area = 'about'

router.get('/', (req, res) => {
  res.render('about/index', { area })
})

router.get('/principles', (req, res) => {
  res.render('about/principles', { area })
})

router.get('/permissions', (req, res) => {
  res.render('about/permissions', { area })
})

router.get('/contact', (req, res) => {
  res.render('about/contact', { area })
})

module.exports = router
