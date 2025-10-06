menuOpen = false;
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
};
findMenu = function() {
	if(menuOpen) {
		findMenuClose();
		menuOpen = false;
	} else {
		findMenuOpen();
		menuOpen = true;
	}
};
findMenuOpen = function() {
	WIDTH = "200px"
	app = window.PDFViewerApplication;
	outer = document.getElementById("outerContainer")

	menu = document.createElement('div');
	menu.id = "findMenu";
	menu.style.width = WIDTH;
	menu.style.right = "0px";
	menu.style.position = "absolute";
	menu.style.height = "calc(100% - var(--toolbar-height))";
	menu.style.insetBlock = "var(--toolbar-height) 0";
	outer.append(menu);

	WAIT = 100;
	function queueFind(val) {
		if(app.findController._matchesCountTotal !== 0 ||
		  app.findController._normalizedQuery !== null) {
			//console.log('w', app.findController._matchesCountTotal !== 0, app.findController._normalizedQuery !== "");
			console.log('w', app.findController._matchesCountTotal, app.findController._normalizedQuery);
			return setTimeout(queueFind, WAIT, val);
		}
		
		console.log(app.findController._matchesCountTotal !== 0);
		console.log(app.findController._normalizedQuery !== "");
		console.log('r', app.findController._matchesCountTotal, app.findController._normalizedQuery);

		if(val === "af") {
			return;
		}

		app.eventBus.dispatch('find', {
			caseSensitive: false,
			findPrevious: false,
			highlightAll: true,
			phraseSearch: true,
			query: val
		});

	}

	input = document.createElement('input');
	input.id = "findInput";
	input.classList.add("toolbarField");
	input.addEventListener("keyup", function(e) {
		if(e.key === "Enter") {
			app.findController.setDocument(app.findController._pdfDocument);
			app.findController._normalizedQuery = null;
			queueFind(input.value);
		}
	});
	menu.append(input);

	createQueryDiv = (id) => {
		div = document.createElement('div');	
		div.id = id;
		div.classList.add("queryDiv");
		div.style.overflowY = "auto";
		div.style.height = "calc(100% - (var(--toolbar-height)))"
		return div; 
	};
	queryDiv = createQueryDiv('queryDiv');
	menu.append(queryDiv);
	
	queryElem = document.createElement('div');	
	queryElem.style.cursor = "pointer";
	queryElem.style.width = ""+ WIDTH +"-20px";
	queryElem.style.height = "100px";
	queryElem.classList.add("findItem");
	queryFoot = document.createElement('div');
	queryFoot.id = 'foot';
	queryElem.append(queryFoot);
	queryText = document.createElement('div');
	queryText.id = 'text';
	queryElem.append(queryText);

	queryProcess = (state, queryDiv, i) => {
		try{
		for(; i < app.findController._pageMatches.length; i++) {
			//app.findController._normalizedQuery === state.query; i++) {
			console.log(i, app.findController._pageMatches[i]);
			app.findController._pageMatches[i].forEach((p, j) => {
				elem = queryElem.cloneNode(true);
				elem.classList.add(state.query);
				elem.querySelector("#foot").innerHTML = (i+1);
				l = app.findController._pageContents[i].length;
				a = p-20 > 0 ? p-20 : 0;
				b = p+20 < l ? p+20 : l-1;
				text = app.findController._pageContents[i].slice(a, b);
				elem.querySelector("#text").innerHTML = text;
				elem.addEventListener("click", function() {
					window.location.href = window.location.href.split('#')[0] + "#page=" + (i+1);
				}.bind(i));
				if(app.findController._normalizedQuery !== state.query) return;
				queryDiv.append(elem);
			});
		}
		if(app.findController._pageMatches.length !== app.pdfViewer._pages.length) {
			setTimeout(queryProcess, WAIT, state, queryDiv, i);
		}
		} catch(e) {
			console.log('abort', e);
		}
	};
	queryWait = (state) => {
		//if(app.findController._normalizedQuery !== state.query &&
		if(app.findController._normalizedQuery !== state.query) {
			/*
			d = menu.querySelector(".queryDiv");
			if(d !== null) {
				d.remove();
			}
			*/
			setTimeout(queryWait, WAIT, state);
		}
		else {
			q = queryDiv.querySelectorAll("div:not(."+ state.query + ")")
			q.forEach((d) => {
				d.remove();
			});
			queryDiv.innerHTML = "";
			/*
			console.log(app.findController._pageMatches);
			while (typeof app.findController._pageMatches[0] === 'undefined') {
				app.findController._pageMatches.shift();
			}
			//.map(d => d.remove());
			*/
			console.log(app.findController._pageMatches);
			queryProcess.bind()(state, queryDiv, 0);
		}
	};
	app.findController._eventBus._on("find", (state) => {
		queryWait.bind()(state);
	});

	/*
	app.findController._eventBus._on("find", (state) => {
		//function queryWait(state) {
		function queryWait() {
			if(app.findController._normalizedQuery !== state.query) {
				console.log(state);
				setTimeout(queryWait, WAIT, state);
			}
			else {
				console.log(app.findController._normalizedQuery)
			}
		};
		//queryWait(state);
		queryWait();
	});

	/*
	app.findController._eventBus._on("find", function(state) {
		queryProcess = function(i, j) {
			if(app.findController._normalizedQuery !== state.query) {
				console.log(state);
				return;
			}
			if(app.findController._pageMatches.length !== app.pdfViewer._pages.length) {
				setTimeout(() => {
					queryProcess(j, app.findController._pageMatches.length);
				}, WAIT);
			}
			app.findController._pageMatches.slice(i,j).forEach(function(p, k) {
				if(p.length === 0) return;
				p.forEach(function(q) {
					h = i+k;
					elem = queryElem.cloneNode(true);
					elem.id = "find-"+ h +"-"+ q;
					elem.querySelector('#foot').innerHTML = (h+1);
					l = app.findController._pageContents[h].length;
					b = q-20 >= 0 ? q-20 : 0;
					e = q+20 < l ? q+20 : l-1;
					text = app.findController._pageContents[h].slice(b, e);
					elem.querySelector('#text').innerHTML = text;
					queryDiv.append(elem);
					elem.addEventListener("click", function(h) {
						window.location.href = window.location.href.split('#')[0] + "#page=" + (h+1);
					}.bind(this, h));
				});
			});
		}
		queryWait = function() {
			if(app.findController._normalizedQuery !== state.query) {
				setTimeout(queryWait, WAIT);
			} else {
				queryDiv.innerHTML = "";
				queryProcess(0, app.findController._pageMatches.length)
			}
		}
		queryWait();
	});
	*/

	viewer = document.getElementById("viewerContainer");
	viewer.style.insetInlineEnd = WIDTH;
};
findMenuClose = function() {
	document.getElementById("findMenu").remove();
	pdfView = document.getElementById("viewerContainer");
	pdfView.style.insetInlineEnd = '';
};

//if (document.readyState === "interactive" || document.readyState === "complete") {
setup();
//} else {
//  document.addEventListener("DOMContentLoaded", Pdfind.init, true);
//}