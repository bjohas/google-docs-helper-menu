function onOpen() {
    // Add a menu with some items, some separators, and a sub-menu.
    DocumentApp.getUi().createMenu('Helper')
	.addItem('Zotero: Pack selected/next scan-cite in link', 'zoteroSCToLinkselection')
	.addItem('Zotero: Unpack selected/next link to scan-cite', 'zoteroLinkToSCselection')
	.addItem('Zotero: Pack first scan-cite in link', 'zoteroSCToLinkfromstart')
	.addItem('Zotero: Unpack first link to scan-cite', 'zoteroLinkToSCfromstart')
	.addToUi();
}

// Getting all links is not easy... so links are marked by {{ ... }}
// http://stackoverflow.com/questions/18727341/google-apps-script-get-all-links-in-a-document
// Cursor position
// https://developers.google.com/apps-script/reference/document/position
//https://developers.google.com/apps-script/reference/document/document
//https://developers.google.com/apps-script/reference/document/position
/* https://developers.google.com/apps-script/reference/document/position
// Insert some text at the cursor position and make it bold.
 var cursor = DocumentApp.getActiveDocument().getCursor();
 if (cursor) {
   // Attempt to insert text at the cursor position. If the insertion returns null, the cursor's
   // containing element doesn't allow insertions, so show the user an error message.
   var element = cursor.insertText('ಠ‿ಠ');
   if (element) {
     element.setBold(true);
   } else {
     DocumentApp.getUi().alert('Cannot insert text here.');
   }
 } else {
   DocumentApp.getUi().alert('Cannot find a cursor.');
 }
 
*/

// var paras = doc.getParagraphs();
// https://developers.google.com/apps-script/reference/document/range-builder
// https://developers.google.com/apps-script/reference/document/range
// https://developers.google.com/apps-script/reference/document/range-element
// https://developers.google.com/apps-script/reference/document/body  
/*
There are four functions:

They convert:
"Link to Scannable Cite" (Link to SC)
or
"Scannable Cite to Link" (SC to Link)

either working on the "selection" (or from the current cursor),
or
working from the start of the document "from start".

*/

function zoteroLinkToSCselection() {
    zoteroUseSelection(false);
}

function zoteroLinkToSCfromstart() {
    zoteroFromStart(false) ;
}

function zoteroSCToLinkselection() {
    zoteroUseSelection(true);
}

function zoteroSCToLinkfromstart() {
    zoteroFromStart(true);
}

/*
This function return the pattern to be matched. Adapt this if you want to 
match different patterns.
*/
function getPattern(pack) {
    // What pattern to look for.
    // if pack=true, look for {| ... |||....} to turn into links
    // if pack=false, look for {{ .... }} to turn from links into scannable cite.
    if (pack) {
	return '\{\\|([^\n\}]*)\\|\\|\\|\zg\:[^\n\}]+\:[^\n\}]+\}';
    } else {
	return '\{\{([^\n\}]*)\}\}';
    }
}

/*
The next two functions determine an appropriate range element, that contains the link or scannable cite to be worked on.
*/

function zoteroUseSelection(pack) {
    var pattern = getPattern(pack);
    var doc = DocumentApp.getActiveDocument();
    var body = doc.getBody();
    // Determine selection or cursor location...
    var selection = DocumentApp.getActiveDocument().getSelection();
    if (selection) {
	var elements = selection.getRangeElements();
	var element = elements[0];
	// var rangeElement = body.findText(pattern,element);
	var rangeElement = element.getElement().editAsText().findText(pattern);
    } else {
	// DocumentApp.getUi().alert('Cursor-based replacements do not work well yet - better to use a selection...');
	var cursor = doc.getCursor();
	if (cursor) {
	    var rangeBuilder = doc.newRange();
	    // We really want to add the previous element here, otherwise search doesn't continue forward.
	    // But "getSibling" seems to be deprecated.
	    rangeBuilder.addElement(cursor.getElement());
	    doc.setSelection(rangeBuilder.build());
	    var selection = DocumentApp.getActiveDocument().getSelection();
	    if (selection) {
		var elements = selection.getRangeElements();
		var element = elements[0];
	    };
	    var rangeElement = body.findText(pattern,element);
	} else {
	    DocumentApp.getUi().alert('Cannot find a cursor or selection.');
	};
    }
    if (rangeElement) {
	if (pack) {
	    zoteroCiteToLink(rangeElement);
	} else {
	    zoteroLinkToCite(rangeElement);
	}  
    } else {
	DocumentApp.getUi().alert('Cannot find suitable elements to process, i.e. did not find {|....|...} or {{...}}');
    }
};

function zoteroFromStart(pack) {
    var pattern = getPattern(pack);
    var doc = DocumentApp.getActiveDocument();
    var body = doc.getBody();
    var rangeElement = body.findText(pattern);
    // DocumentApp.getUi().alert('Element type: ' + rangeElement.getElement().getType() + "; " +rangeElement.getElement().getText());
    if (rangeElement) {
	if (pack) {
	    zoteroCiteToLink(rangeElement);
	} else {
	    zoteroLinkToCite(rangeElement);
	}
    } else {
	DocumentApp.getUi().alert('Cannot find suitable elements to process, i.e. did not find {|....|...} or {{...}}');
    }
}

/*
The next two functions convert the range element from scannable cite to link, and vice versa.
*/
/* Convert Links to scannable cite:
We expect that the text is stored in the parameter "r" (for reference), and that it's url encoded.
*/
function zoteroLinkToCite(rangeElement) {
    if (rangeElement.isPartial()) {
	var mytext =  rangeElement.getElement().getText();
	var url;
	// "http://oer.educ.cam.ac.uk/zotero/select/"+item_code+"?r="+encodeURI(mytext);
	var mynewtext = rangeElement.getElement().editAsText().getLinkUrl(rangeElement.getStartOffset());
	mynewtext = mynewtext.replace(/^.*?\?r=/,"");
	mynewtext = decodeURI(mynewtext);
	//    DocumentApp.getUi().alert(mynewtext);
	rangeElement.getElement().editAsText().deleteText(rangeElement.getStartOffset(), rangeElement.getEndOffsetInclusive() );
	rangeElement.getElement().editAsText().insertText(rangeElement.getStartOffset(), mynewtext);
    } else {
	DocumentApp.getUi().alert('The entire range element is included. Nothing was done.... Sorry, this needs further work ...');
    }

}

/*
Convert scannable cite to link. Important: We assume that the scannable cite is of the following form:
{| anything :lib_id_1|||zg:lib_id_2:item_id}
which is slightly non standard. If you know about zotero libraries, then you'll know about the two different kinds of library ids.
They are both used to build different links.

lib_id_1 is used to create a zotero:// link, while lib_id_2 is used for the http://zotero.org link.

Note that it's not possible to embed zotero:// links into google docs. Hence I have set up a redirects cript on our site,
http://oer.educ.cam.ac.uk/zotero/select/ which converts http:// links into zotero:// links. If you use Chrome
such links will trigger an external protocal request, which can be used with  Zotero-stand-alone. 
It should work with any browser that allows external protocal requests.
If you have the Zotero pane installed in firefox, this may not work in Firefox. 

*/
function zoteroCiteToLink(rangeElement) { 
    if (rangeElement.isPartial()) {
	// DocumentApp.getUi().alert('The character range begins at ' + rangeElement.getStartOffset()+'. The character range ends at ' + rangeElement.getEndOffsetInclusive());
	var mytext =  rangeElement.getElement().getText();
	rangeElement.getElement().editAsText().deleteText(rangeElement.getStartOffset(), rangeElement.getEndOffsetInclusive() );
	var mynewtext = mytext;
	var m;
	m = mynewtext.match(/\{\|([^\n]*)\:(\d+)\|\|\|zg\:(\w+)\:(\w+)\}/);
	mynewtext = "{{"+m[1]+"}}";
	var item_code;
	item_code = m[2] + "_" + m[4];
	mytext = m[0];
	rangeElement.getElement().editAsText().insertText(rangeElement.getStartOffset(), mynewtext);
	var thelength = mynewtext.length - 1;
	if (rangeElement.getEndOffsetInclusive() < thelength) {
	    thelength = rangeElement.getEndOffsetInclusive() -1;
	}
	var midpoint = parseInt(thelength/2);
	//    DocumentApp.getUi().alert('Ranges.'+rangeElement.getStartOffset()+" - "+rangeElement.getEndOffsetInclusive()+", len="+thelength+", mp=" +midpoint);
	var url1 = "http://oer.educ.cam.ac.uk/zotero/select/"+item_code+"?r="+encodeURI(mytext);
	var url2 = "http://zotero.org/groups/"+m[3]+"/items/itemKey/"+m[4];
	rangeElement.getElement().editAsText().setLinkUrl(rangeElement.getStartOffset(), rangeElement.getStartOffset()+midpoint, url1);
	rangeElement.getElement().editAsText().setLinkUrl(rangeElement.getStartOffset()+midpoint, rangeElement.getStartOffset()+thelength, url2);
	var size = 5;
	rangeElement.getElement().editAsText().setFontSize(rangeElement.getStartOffset(), rangeElement.getStartOffset()+2, size);
	rangeElement.getElement().editAsText().setFontSize(rangeElement.getStartOffset()+thelength-2, rangeElement.getStartOffset()+thelength, size);
    } else {
	DocumentApp.getUi().alert('The entire range element is included. Nothing was done.... Sorry, this needs further work ...');
    }
}
  
