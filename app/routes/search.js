/*
 * Controller for the SEARCH area of the site.
 */
import express from 'express'
import * as get from '../../service/get.js'
import search from '../../service/search.js'

// create and export the router
const router = express.Router()
export default router

// define the area id
const area = 'search'

// route for the search page
router.all('/', (req, res) => {
  const authors = get.authors().filter(a => a.imported.length > 0)
  const defaults = {
    query11: null,
    query1op: null,
    query12: null,
    query21: null,
    query2op: null,
    query22: null,
    ignorePunctuation: true,
    wholeWords: true,
    variantSpellings: true
  }
  const post = (req.method === 'POST') ? req.body : defaults
  const query1 = post.query12
    ? { query1: post.query11, operator: post.query1op, query2: post.query12 }
    : post.query11
  const query2 = post.query22
    ? { query1: post.query21, operator: post.query2op, query2: post.query22 }
    : post.query21
  const texts = post.text ? [post.text] : null
  const query = query2 ? { query1, operator: 'bot', query2 } : query1
  const options = {
    ignorePunctuation: post.ignorePunctuation,
    wholeWords: post.wholeWords,
    variantSpellings: post.variantSpellings
  }
  const text = post.text ? get.text(post.text, false) : null
  if (texts && text === null) {
    const results = null
    const error = 'Invalid text ID.'
    res.render('search/index', { area, authors, post, results, error })
  } else {
    const results = (texts && query) ? search(texts, query, options) : null
    res.render('search/index', { area, authors, post, results })
  }
})
