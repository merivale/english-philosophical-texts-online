const letter = document.getElementById('letter').dataset.letter
const author = document.getElementById('author').dataset.author
const limitInput = document.getElementById('limit')
const wordsTable = document.getElementById('words')

const update = (words) => {
  const toShow = limitInput.value > 0
    ? words.filter(x => x.frequency < limitInput.value)
    : words
  wordsTable.innerHTML = toShow.map(show).join('')
}

const show = word =>
  `<tr><td class="nowrap">${word.word}</td><td>${word.paragraphs.join(', ')}</td><td>${word.frequency}</td></tr>`

window.fetch(`/data/vocabulary/${author}/${letter}`)
  .then((response) => response.json())
  .then((words) => {
    limitInput.addEventListener('change', update.bind(null, words))
    update(words)
  })
