const express = require('express')
const router = express.Router()
const area = 'home'

router.get('/', (req, res) => {
  res.render('home/index', { area })
})

router.get('/principles', (req, res) => {
  res.render('home/principles', { area })
})

router.get('/permissions', (req, res) => {
  res.render('home/permissions', { area })
})

router.get('/contact', (req, res) => {
  res.render('home/contact', { area })
})

module.exports = router
