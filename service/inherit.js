/*
 * Function for enriching a text with a property inherited from an ancestor.
 */
import { open } from './file.js'

export default function inherit (text, property) {
  if (text[property]) {
    return text[property]
  }
  if (text.parent) {
    return inherit(open('texts', text.parent), property)
  }
  return null
}
