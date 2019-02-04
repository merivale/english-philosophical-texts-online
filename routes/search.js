const express = require('express')
const router = express.Router()
const area = 'search'

router.get('/', (req, res) => {
  res.render('search/index', { area })
})

module.exports = router
