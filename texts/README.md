# Texts

The library is divided into hundreds of separate *texts*. A text is either a *collection* of other texts, or a *section*. Sections contain the actual text content, in the form of an array of paragraphs followed by a (possibly empty) array of notes. A section is either a short text with no substantial internal structure, or a part (essay, section, chapter, whatever) of a longer work. Sections can be nested within collections to arbitrary depth. For example, Hume's *Treatise* is made up of an introduction, three books, and an appendix; the introduction and appendix are sections; each book is made up of three parts; and each of those parts is made up of several sections. Any text always "bottoms out" at one or more sections.

In terms of their properties, collections and sections differ only in that the former contain an array of text IDs (referring to their component texts), while the latter contain arrays of paragraphs and notes (containing the actual text content). Otherwise, both collections and sections contain the same additional properties:

- id: unique id for this text
- parent: id of the parent text (if any)
- title: title of the work, as it should appear in lists
- breadcrumb: title of the work, as it should appear in the breadcrumb trail
- fulltitle: title of the work (in HTML), as it should appear at the top of the text itself
- published: date of the original edition
- copytext: date of the copytext edition
- source: URL of the source from which the text was generated
- imported: whether or not the text has been imported yet
- duplicate: works by two authors (e.g. printed exchanges of letters) appear under both authors; to prevent the dictionary counting their content twice, the second of each pair is marked as a duplicate
- comments: any comments, typically about the copytext and the reason for its selection
- copyright: copyright information

Many of these additional properties "trickle down" within a collection, in obvious ways. If a text has no copyright information, for example, then the `get.text` function will insert copyright information on the fly from its parent text (whose copyright information may itself have come from an ancestor higher up in the chain).

The directory structure mirrors the text IDs (so that the path of a text can be computed from its ID). Up to a point, paths and IDs also reflect the parent/child relationship (with child texts in subdirectories within the folder where their parent text resides), but only up to a point. Some collections are not represented in the IDs of their child texts, since in many cases this would make the ID needlessly long; parent texts are represented in the ID of a text typically only for the sake of disambiguation.

## Content

The paragraphs and notes of a section contain the text content. This is stored as HTML text, with HTML tags being used to encode formatting and meta-data. For simplicity, I avoid the use of classes and other attributes, reserving a single tag for a single purpose (and using CSS rules to translate this into the appropriate style on the screen). This sometimes entails using HTML tags with a narrower or slightly different meaning than usual. The key is as follows:

- `<p>`: A paragraph, as usual. Most paragraphs and notes consist of a single `<p>` element, but some may also include a `<blockquote>` or additional `<p>` elements, reflecting internal paragraph structure or line breaks.
- `<br>`: A line break (obviously). These are typically used to separate lines in verses of poetry.
- `<blockquote>`: A blockquote, as usual.
- `<cite>`: A citation, as usual.
- `<q>`: This represents text enclosed in double quotation marks. Such text may or may not be an inline quotation; some authors/printers used quotation marks to highlight particularly important assertions.
- `<a>` and `<sup>`: Footnote anchors in the text are marked up as `<a>` elements, with `<sup>` elements inside.
- `<label>`: Margin comments are represented as `<label>` elements. These are rendered floating to the right, rather than in the margin.
- `<em>`: Text in italics. Note that italic text *within* italic text should be rendered in normal style.
- `<b>`: Text in small-capitals. Note that small-caps text is always rendered in normal style, even within an `<em>` element.
- `<i>`: Text in a foreign language (i.e. not English).
- `<small>`: The `<small>` element is used to indicate text that should be *ignored* for the purposes of searching, generating concordances, etc. For example, this is placed around internal page references and Roman numerals, and margin comments that merely indicate the topic currently under discussion.

Note: The texts from *Hume Texts Online* contain some additional things that don't serve any purpose here, but which for simplicity I don't want to remove. These are page breaks (represented by '|'), and editorial markup (represented by `<ins>` and `<del>` tags). These are removed by the `get.text` function (`<del>` tags are removed entirely, and text within `<ins>` tags is preserved).
