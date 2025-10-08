app = null;
findController = null;

findItem = document.createElement('dev');
findItem.classList.add("findItem");
findItem.classList.add("findClass");

findText = document.createElement('div');
findText.classList.add("findText");
findText.classList.add("treeItem");
findText.classList.add("findClass");
findItem.append(findText);

findFoot = document.createElement('div');
findFoot.classList.add("findFoot");
findFoot.classList.add("findClass");
findItem.append(findFoot);

findList = null;
findMenu = null;

menuOpen = false;

setup = function() {
	find = document.getElementById("viewFind");
	clone = find.cloneNode(true);
	clone.id = "listFind";
	clone.classList.add("findIcon");
	right = document.getElementById("toolbarViewerRight");
	right.prepend(clone);
	//find.setAttribute("id", "listFind");

	right.addEventListener("click", findMenu);
	//find.style.visibility = 'hidden';

	findMenu = document.createElement('div');
	findMenu.id = "findMenu";
	findMenu.classList.add("findClass");

	findInput = document.createElement('input');
	findInput.id = "findInput";
	findInput.classList.add("toolbarField");
	findInput.classList.add("findClass");
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
	findList.classList.add("findClass");
	findMenu.append(findList);

	document.getElementById("outerContainer").append(findMenu);
	document.querySelectorAll(".findClass").forEach(e => e.style.display = 'none');
};
findMenu = function() {
	if(menuOpen) findMenuClose();
	else findMenuOpen();
	menuOpen = !menuOpen;
}
findMenuClose = function() {
	document.querySelectorAll(".findClass").forEach(e => e.style.display = 'none');
	pdfView = document.getElementById("viewerContainer");
	pdfView.style.insetInlineEnd = '';
};
findMenuOpen = function() {
	app = window.PDFViewerApplication;
	findController = app.findController;
	if(typeof findController._match === 'undefined') {
		findController._match = findController.match;
		findController.match = function(query, content, pageIndex) {
			matchIdx = findController._matchesCountTotal;
			matches = findController._match(query, content, pageIndex);
			addFindItems(matches, content, pageIndex, matchIdx);
			return matches;
		}
	}

	app.eventBus._dispatch = app.eventBus.dispatch;
	app.eventBus.dispatch = function(eventName, data) {
		console.log(eventName, data);
		return app.eventBus._dispatch(eventName, data);
	}

	document.getElementById("outerContainer").append(findMenu);
	document.getElementById("viewerContainer").style.insetInlineEnd = "var(--findMenu-width)";
	document.querySelectorAll(".findClass").forEach(e => e.style.display = '');
};
addFindItems = function(matches, content, pageIndex, matchIdx) {
	matches.forEach((m, i) => {
		console.log(m);
		l = content.length - 1;
		a = m.index-20 > 0 ? m.index-20 : 0;
		b = m.index+20 < l ? m.index+20 : l;
		txt = content.slice(a, b);

		n = findItem.cloneNode(true);
		n.querySelector(".findFoot").innerHTML = pageIndex;
		n.querySelector(".findText").innerHTML = txt;

		n.addEventListener("click", function() {
			page = app.pdfViewer._pages[pageIndex];
			app.eventBus.on("textlayerrendered", function(p) {
				match = page._textHighlighter.matches[i];
				page._textHighlighter.textDivs[match.begin.divIdx].scrollIntoView({block: "center"});
			}.bind(page, i), {once: true});
			page.div.scrollIntoView();

			findController._selected = {
				pageIdx: pageIndex,
				matchIdx: i
			};
			findController._offset = {
				pageIdx: pageIndex,
				matchIdx: i,
				wrapped: false
			}
			findController._highlightMatches = true;
			app.eventBus.dispatch('updatetextlayermatches', {
				source: findController,
				pageIndex: pageIndex
			});

			app.eventBus.dispatch('updatefindcontrolstate', {
				source: findController,
				state: findController.state,
				previous: false,
				entireWord: findController.state.entireWord,
				matchesCount: {
					current: matchIdx + i + 1,
					total: findController._matchesCountTotal
				},
				rawQuery: findController._rawQuery
			});
		}.bind(i, pageIndex, matchIdx));
		n.addEventListener("mouseover", function() {
			this.style.backgroundColor = "var(--treeitem-selected-bg-color)";
		});
		n.addEventListener("mouseout", function() {
			this.style.backgroundColor = "";
		});

		findList.append(n)
	});
}

setup();