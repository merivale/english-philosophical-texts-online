const express = require('express')
const router = express.Router()
const area = 'compare'

router.get('/', (req, res) => {
  res.render('compare/index', { area })
})

module.exports = router
