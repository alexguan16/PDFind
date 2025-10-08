app = null;
findBar = null;
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

findSpacer = document.createElement('div');
findSpacer.id = "findSpacer";

findList = null;
findButton = null;

setup = function() {
	app = window.PDFViewerApplication;
	findBar = app.findBar;
	findController = app.findController;

	console.log(window.PDFViewerApplication.pdfDocument);
	find = document.getElementById("viewFind");
	document.getElementById("toolbarViewerLeft").append(find);


	findbar = document.getElementById("findbar");
	findbar.style.insetInlineStart = find.offsetLeft + 'px';

	findButton = find.cloneNode(true);
	//findButton.id = "listFind";
	findButton.classList.add("findIcon");
	findButton.setAttribute("aria-checked", false);
	document.getElementById("toolbarSidebarLeft").append(findButton);
	//find.setAttribute("id", "listFind");

	findButton.addEventListener("click", findMenu);
	//find.style.visibility = 'hidden';

	findList = document.createElement('div');
	findList.id = "findList";
	findList.classList.add("findClass");
	document.getElementById("sidebarContent").append(findList);

	document.getElementById("sidebarViewButtons").addEventListener("click", () => {
		findButton.classList.toggle("toggled", false);
		findButton.setAttribute("aria-checked", false);
		[].forEach.call(findList.children, (e) => e.classList.toggle("hidden", true));

		findController._highlightMatches &= findbar.opened
		app.eventBus.dispatch("updatetextlayermatches", {
			source: findController,
			pageIndex: -1
		});
	});

	find.addEventListener("click", function() {
		if(findButton.getAttribute("aria-checked")) {
			findController._highlightMatches = true;
			app.eventBus.dispatch("updatetextlayermatches", {
				source: findController,
				pageIndex: -1
			});
		}
/*
		app.eventBus.dispatch("find", {
			query: findBar.findField.value,
			caseSensitive: findBar.caseSensitive.checked,
			highlightAll: findBar.highlightAll.checked,
			findPrevious: false,
			matchDiactrics: findBar.matchDiacritics.checked,
		});
*/
	});

	app.eventBus.on("find", function(a) {
		if(a.type !== "highlightallchange" && a.type !== "again") {
			findList.innerHTML = "";
			findList.append(findSpacer);
		}
	});
	
	if(typeof findController._match === 'undefined') {
		findController._match = findController.match;
		findController.match = function(query, content, pageIndex) {
			matchIdx = findController._matchesCountTotal;
			matches = findController._match(query, content, pageIndex);
			addFindItems(matches, content, pageIndex, matchIdx);
			return matches;
		}
	}

/*
	if(typeof app.eventBus._dispatch === 'undefined') {
		app.eventBus._dispatch = app.eventBus.dispatch;
		app.eventBus.dispatch = function(eventName, data) {
			console.log(eventName, data);
			return app.eventBus._dispatch(eventName, data);
		}
	}
*/
};

findMenu = function() {
	buttons = document.getElementById("sidebarViewButtons").children;
	views = document.getElementById("sidebarContent").children;
	
	[].forEach.call(buttons, (e) => e.classList.toggle("toggled", false));
	[].forEach.call(buttons, (e) => e.setAttribute("aria-checked", false));
	[].forEach.call(views, (e) => e.classList.toggle("hidden", true));

	findButton.classList.toggle("toggled", true);
	findButton.setAttribute("aria-checked", true);

	findList.classList.toggle("hidden", false);
	[].forEach.call(findList.children, (e) => e.classList.toggle("hidden", false));

	findController._highlightMatches = findBar.highlightAll.checked;
	app.eventBus.dispatch("updatetextlayermatches", {
		source: findController,
		pageIndex: -1
	});
};

addFindItems = function(matches, content, pageIndex, matchIdx) {
	tl = 30
	matches.forEach((m, i) => {
		t = findController._rawQuery.length;
		l = content.length - 1;
		a = m.index-tl > 0 ? m.index-tl : 0;
		b = m.index+t+tl < l ? m.index+t+tl : l;
		f = content.slice(a, m.index).split(" ");
		s = content.slice(m.index+t, b).split(" ");
		f.shift();
		s.pop();
		txt = f.join(" ")
			+ "<b><i>" + content.slice(m.index, m.index+t) + "<\/i><\/b>" 
			+ s.join(" ")
			+ "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp";

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

			findController._selected = findController._offset = {
				pageIdx: pageIndex,
				matchIdx: i
			};
			findController._offset.wrapped = false;
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

		n.classList.toggle("hidden", findButton.getAttribute("aria-checked") === "false");
		findList.append(n)
	});
}

l = () => {
	if(typeof window.PDFViewerApplication === 'undefined'
		|| typeof window.PDFViewerApplication.eventBus === 'undefined'
		|| window.PDFViewerApplication.eventBus === null
		|| typeof window.PDFViewerApplication.pdfDocument === 'undefined'
		|| window.PDFViewerApplication.pdfDocument === null
	) setTimeout(l, 100);
	else setup();
};
l();