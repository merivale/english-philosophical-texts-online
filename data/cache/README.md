# Cache

The `data/cache` directory contains several subdirectories, each of which duplicates the structure of the `data/texts` directory, and contains data derived from the texts themselves. Rather than derive these data on the fly whenever the are needed, they can be generated once and stored here for subsequent reuse.

## 1. Search

The files in the `search` subdirectory contain searchable versions of the text. These versions are stripped of all HTML content and disambiguating underscores, and have spaces between Latin word-pairs restored. (See `data/LEMMAS.md` for an explanation of disambiguating underscores and Latin word-pairs.)

## 2. Plain

The files in the `plain` subdirectory contain plain text versions of the text. These versions have all metadata (paragraph numbers, etc.) removed. As with the searchable versions, HTML content and disambiguating underscores are removed, and space between Latin word-pairs restored. However, a simple Markdown-style markup is used to preserve data concerning citations, names, and foreign text. Citations are marked with square brackets (e.g. `[Sect. I. of the Essay on the Passions]`), names are marked with underscores (e.g. `_Cicero_`), and foreign text is marked with asterisks (e.g. `*Cogito, ergo sum*`).

## 3. Lemmas

The files in the `lemmas` subdirectory contain plain text versions of the text, with the addition that individual words are mapped to their corresponding lemmas. Citations, names, and foreign text are marked up as in the plain text versions, and left unchanged.

## 4. Usage

The files in the `usage` subdirectory contain summary data on word/lemma usage, and are generated from the lemmatized versions of the text.
