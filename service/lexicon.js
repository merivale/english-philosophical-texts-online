/*
 * Functions for getting lexicon data.
 */
import { open } from './file.js'

// define module variables so they don't have to be recreated each time
let _raw
let _reduced
let _flat
let _lemmaMap
let _commonLemmas

// get the raw lexicon
export function raw () {
  // return the cached raw lexicon if it exists
  if (_raw) return _raw
  // otherwise open it, cache it, and return it
  _raw = open(null, 'lexicon') || {}
  return _raw
}

// get the reduced lexicon
export function reduced () {
  // return the cached reduced lexicon if it exists
  if (_reduced) return _reduced
  // otherwise create it, cache it, and return it
  _raw = raw()
  _reduced = Object.keys(_raw)
    .map((lemma) => _raw[lemma].concat(lemma))
    .filter(words => words.length > 1)
  return _reduced
}

// get the flattened lexicon
export function flat () {
  // return the cached flattened lexicon if it exists
  if (_flat) return _flat
  // otherwise create it, cache it, and return it
  _raw = raw()
  _flat = flatten(Object.entries(_raw)).sort()
  return _flat
}

// get the lemma map
export function lemmaMap () {
  // return the hashed lemma map if it exists
  if (_lemmaMap) return _lemmaMap
  // otherwise create it, cache it, and return it
  _raw = raw()
  _lemmaMap = {}
  Object.keys(_raw).forEach((lemma) => {
    _raw[lemma].forEach((word) => {
      _lemmaMap[word] = lemma
    })
  })
  return _lemmaMap
}

// get the array of common lemmas
export function commonLemmas () {
  // return the cached array if it exists
  if (_commonLemmas) return _raw
  // otherwise open it, cache it, and return it
  _commonLemmas = open('cache', 'common-lemmas') || []
  return _commonLemmas
}

// get a regular expression string for matching any word with the same lemma
export function regexString (word) {
  _reduced = reduced()
  const group = _reduced.find(group => group.includes(word))
  return group ? `(${group.join('|')})` : word
}

// flatten an array
function flatten (array) {
  return array.reduce((acc, val) => Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), [])
}
