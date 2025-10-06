async function hook() {
	resp = await fetch("content/web/viewer.html");
	content = await resp.text();
	document.open();
	document.write(content);
	document.close();

	script = document.createElement('script')
	script.src = "../../pdfind.js";
	document.body.append(script);

	css = document.createElement('link');
	css.setAttribute('rel', "stylesheet");
	css.setAttribute('type', 'text/css');
	css.setAttribute('href', "../../pdfind.css");
	document.head.append(css);
};
hook();