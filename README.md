google-docs-helper-menu
=======================

An attempt to creation a "helper menu" in google docs to help with common editing tasks.

I've some some further playing with Google Apps script, towards a "poor mans" integration of Zotero and Google docs (via scannable cite). Let me say up front that while what I have works for me, it's for a fairly specific use case, that may not be useful for everybody. It's mainly to implement a scannable cite workflow in Google docs, that's acceptable to my collaborators.

What I've done is to add a custom menu to Google documents, that will convert a scannable cite "{| ABC ||||zg...}" into a link (with text ABC) and the url pointing to zotero.org, with the actual scannable cite packed into a parameter. This makes the scannable cite neater, and helps you find the item on zotero.org if you want to check the reference.  (At the moment, links actually appear as {{ ABC }} with the "{{" and "}}" in a 5pt font. But that can be changed by just looking for links and examining them. I also have a work around to use Zotero stand alone with Chrome, where links don't go to zotero.org, but open in Zotero stand alone instead.)

There's also a function that unpacks such links back into scannable cites. The ideas is that in this way scannable cites can be updated (and repacked) or they can eventually be converted back into scannable cites and processed in that way.

I know it's a specific use case, but it effectively means that my collaborators are now happy to use scannable cite, and that we can thus use scannable cite in our google document (with the added benefit of looking up the items in Zotero). 

I know it's a long way from what could be done, and it's a specific use case, but it seems that there are quite a few things that aren't yet implemented in Google Apps script yet, and I couldn't find that many examples for Google Apps script (particularly for documents as opposed to spreadsheets). Hence trying something small, and see how that fares. One thing for instance is that Google apps script is really quite slow with large documents. Just getting a selection in a large document takes quite a bit of time!

Happy to have conversations with people who want to discuss this, c.f. zotero-dev (at) googlegroups.

Bjoern
