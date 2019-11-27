// generate formatted text
export function formattedText (content) {
  return content.replace(/_/g, '') // remove underscores (used for disambiguating lemmas)
    .replace(/\b(I|i)pso(F|f)acto\b/g, '$1pso $2acto') // reinstate space in 'ipso facto'
    .replace(/\b(A|a)(P|p)riori\b/g, '$1 $2riori') // reinstate space in 'a priori'
    .replace(/\b(A|a)(P|p)osteriori\b/g, '$1 $2osteriori') // reinstate space in 'a posteriori'
    .replace(/\b(A|a)d(I|i)nfinitum\b/g, '$1d $2nfinitum') // reinstate space in 'ad infinitum'
    .replace(/\b(I|i)n(I|i)nfinitum\b/g, '$1n $2nfinitum') // reinstate space in 'in infinitum'
}

// generate lemmatized text
export function lemmatizedText (content, lemmaMap) {
  return dullText(strippedText(simplifiedText(content))).split(' ').map(x => lemmaMap[x] || x).join(' ')
}

// generate plain text
export function plainText (content) {
  return strippedText(simplifiedText(content))
}

// generate searchable text
export function searchableText (content) {
  return formattedText(strippedText(content))
}

// generate lowercase text with no punctuation
function dullText (content) {
  return content.split(' ')
    .map(x => (x === 'i.e.' || x === 'e.g.' || x === '&amp;' || x === '&amp;c.') ? x : x.replace(/[,.;:!?()]/g, ''))
    .join(' ')
    .toLowerCase()
}

// generate plain text
function simplifiedText (content) {
  return content.replace(/<a href="(.*?)"><sup>\[(.*?)\]<\/sup><\/a>/g, '[n$2]') // put footnote anchors in square brackets
    .replace(/<cite>(.*?)<\/cite>/g, '[$1]') // put citations in square brackets
    .replace(/<u>(.*?)<\/u>/g, '_$1_') // mark names with underscores
    .replace(/<i>(.*?)<\/i>/g, '*$1*') // mark foreign text with asterisks
}

// generate stripped text
function strippedText (content) {
  return content.replace(/<a href="(.*?)"><sup>(.*?)<\/sup><\/a>/g, '') // remove footnote anchors
    .replace(/<label>(.*?)<\/label>/g, '') // remove margin comments
    .replace(/<small>(.*?)<\/small>/g, '') // remove small things
    .replace(/(<(.*?)>)/g, '') // remove all HTML markup
    .replace(/(&emsp;)+/g, ' ') // replace tabs with single spaces
    .replace(/\s\s/g, ' ').trim() // trim whitespace
}
