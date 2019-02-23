# Dictionary

The dictionary is an array of lexemes (spread out over 26 files, one for each letter of the alphabet). Each lexeme has an ID (the standard or base form), and type, and a regex describing the various forms that lexeme can take.

Standardly, lexemes are allowed to have common forms; for example, the noun "bear" and the verb "bear" are typically considered as distinct lexemes, notwithstanding the several overlapping forms. On this understanding, it would be undeterminable whether an instance of "bears" in the database was the plural form of the noun, or the third person singular form of the verb.

To sidestep this problem (rather than solve it), lexemes in this dictionary are *not* allowed to have any forms in common. There is thus no indeterminacy, and every form is unambiguously the form of no more than one lexeme. The consequence of this is that *types* of lexemes must be understood more flexibly. For example, the lexeme "bear" is identified in this dictionary as a *verb*, notwithstanding the fact that it can also occur as a noun.

In addition to this, types are generally kept to a minimum. The types are:

- adjective: an adjective, but also including its adverbial '-ly' form (e.g. 'absurd', 'absurdly')
- noun: a noun (typically with both singular and plural forms) or a pronoun
- noun+: a noun that can also be an adjective with an adverbial '-ly' form (e.g. 'absolute', 'absolutely')
- verb: a verb (with all the usual forms), that may also be a noun (e.g. 'bear', as discussed above, or 'begin', 'beginning')
- verb+: a verb (maybe also a noun) that can also be an adjective with an adverbial '-ly' form (e.g. 'base', 'basely')
- particle: catch-all category for everything else, e.g. adverbs, articles, conjunctions, determiners, prepositions
