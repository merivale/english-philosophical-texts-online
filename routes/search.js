const express = require('express')
const router = express.Router()
const get = require('../data/get')
const search = require('../data/search')
const area = 'search'

router.all('/', (req, res) => {
  const authors = get.authors().filter(a => a.imported.length > 0)
  const post = (req.method === 'POST') ? req.body : false
  const query1 = post.query12
    ? { query1: post.query11, operator: post.query1op, query2: post.query12 }
    : post.query11
  const query2 = post.query22
    ? { query1: post.query21, operator: post.query2op, query2: post.query22 }
    : post.query21
  const query = query2 ? { query1, operator: 'bot', query2 } : query1
  const texts = post.author ? get.author(post.author, false).texts : null
  console.log(texts)
  const results = (texts && query) ? search(texts, query) : null
  res.render('search/index', { area, authors, post, results })
})

module.exports = router
