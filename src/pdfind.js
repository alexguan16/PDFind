menuOpen = false;
app = window.PDFViewerApplication;
findController = app.findController;

setup = function() {
	this.app = window.PDFViewerApplication;
	find = document.getElementById("viewFind");
	clone = find.cloneNode(true);
	clone.id = "listFind";
	right = document.getElementById("toolbarViewerRight");
	right.prepend(clone);
	//find.setAttribute("id", "listFind");

	right.addEventListener("click", findMenu);
	//find.style.visibility = 'hidden';

	new Promise((resolve, reject) => {
		l = () => 
			typeof window.PDFViewerApplication === 'undefined'
			|| typeof window.PDFViewerApplication.eventBus === 'undefined'
			|| window.PDFViewerApplication.eventBus === null 
			? setTimeout(l, 50) : resolve();
		l();
	}).then(() => {
		window.PDFViewerApplication.eventBus._on("pagesloaded", () => {
			findController = window.PDFViewerApplication.findController;

			if(typeof findController._match !== 'undefined') return;

			findController._match = findController.match;
			findController.match = function(query, content, pageIndex) {
				matches = findController._match(query, content, pageIndex);
				addFindItems(matches, content, pageIndex);
				return matches;
			}
		}, {once: true});
	});
};

findItem = document.createElement('dev');
findItem.classList.add("findItem");

findText = document.createElement('div');
findText.classList.add("findText");
findItem.append(findText);

findFoot = document.createElement('div');
findFoot.classList.add("findFoot");
findItem.append(findFoot);

findList = null;

addFindItems = function(matches, content, pageIndex) {
	matches.forEach((m, i) => {
		l = content.length - 1;
		a = m.index-20 > 0 ? m.index-20 : 0;
		b = m.index+20 < l ? m.index+20 : l;
		txt = content.slice(a, b);

		n = findItem.cloneNode(true);
		n.querySelector(".findFoot").innerHTML = pageIndex;
		n.querySelector(".findText").innerHTML = txt;

		n.addEventListener("click", function() {
			//console.log(i, pageIndex);
			//console.log(app.pdfViewer._pages[pageIndex]._textHighlighter.textDivs);
			//app.pdfViewer._pages[pageIndex]._textHighlighter.textDivs[i].scrollIntoView();
			app.pdfViewer._pages[pageIndex].div.scrollIntoView();
		}.bind(i, pageIndex));

		findList.append(n)
	});
}
findMenu = function() {
	if(menuOpen) {
		findMenuClose();
		menuOpen = false;
	} else {
		findMenuOpen();
		menuOpen = true;
	}
}
findMenuClose = function() {
	document.getElementById("findMenu").remove();
	pdfView = document.getElementById("viewerContainer");
	pdfView.style.insetInlineEnd = '';
};
findMenuOpen = function() {
	findMenu = document.createElement('div');
	findMenu.id = "findMenu";

	document.getElementById("outerContainer").append(findMenu);
	document.getElementById("viewerContainer").style.insetInlineEnd = "200px";

	findInput = document.createElement('input');
	findInput.id = "findInput";
	findInput.classList.add("toolbarField");
	findInput.addEventListener("keyup", function(e) {
		if(e.key === "Enter") {
			findList.innerHTML = '';

			app.eventBus.dispatch('find', {
				caseSensitive: false,
				findPrevious: false,
				highlightAll: true,
				phraseSearch: true,
				query: this.value
			});
		}
	});
	findMenu.append(findInput);

	findList = document.createElement('div');
	findList.id = "findList";
	findMenu.append(findList);
};

setup();