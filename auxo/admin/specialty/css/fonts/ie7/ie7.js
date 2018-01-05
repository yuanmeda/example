/* To avoid CSS expressions while still supporting IE 7 and IE 6, use this script */
/* The script tag referencing this file must be placed before the ending body tag. */

/* Use conditional comments in order to target IE 7 and older:
	<!--[if lt IE 8]><!-->
	<script src="ie7/ie7.js"></script>
	<!--<![endif]-->
*/

(function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'train-admin\'">' + entity + '</span>' + html;
	}
	var icons = {
		'tricon-class': '&#xe601;',
		'tricon-course': '&#xe602;',
		'tricon-plan': '&#xe603;',
		'tricon-run': '&#xe605;',
		'tricon-czd': '&#xe606;',
		'tricon-ctj': '&#xe607;',
		'tricon-tj': '&#xe608;',
		'tricon-ts': '&#xe609;',
		'tricon-approve': '&#xe60a;',
		'tricon-add': '&#xe900;',
		'tricon-article': '&#xe901;',
		'tricon-change': '&#xe902;',
		'tricon-Chart': '&#xe903;',
		'tricon-chat': '&#xe904;',
		'tricon-clear': '&#xe905;',
		'tricon-close': '&#xe906;',
		'tricon-yes': '&#xe907;',
		'tricon-home': '&#xe908;',
		'tricon-xiasanjiao': '&#xe909;',
		'tricon-new-course': '&#xe90a;',
		'tricon-delcourse': '&#xe90b;',
		'tricon-online': '&#xe90c;',
		'tricon-popup': '&#xe90d;',
		'tricon-set': '&#xe90e;',
		'tricon-Settings': '&#xe90f;',
		'tricon-Users': '&#xe910;',
		'tricon-View': '&#xe911;',
		'tricon-offline': '&#xe912;',
		'tricon-pro': '&#xe913;',
		'tricon-sanjiao': '&#xe914;',
		'tricon-search': '&#xe915;',
		'tricon-larrow': '&#xe916;',
		'tricon-rarrow': '&#xe917;',
		'tricon-uparrow': '&#xe918;',
		'tricon-darrow': '&#xe919;',
		'tricon-star': '&#xe91a;',
		'tricon-list': '&#xe91b;',
		'tricon-gouxuan': '&#xe91c;',
		'tricon-time': '&#xe91d;',
		'tricon-arrow-right': '&#xe91e;',
		'tricon-arrow-left': '&#xe91f;',
		'0': 0
		},
		els = document.getElementsByTagName('*'),
		i, c, el;
	for (i = 0; ; i += 1) {
		el = els[i];
		if(!el) {
			break;
		}
		c = el.className;
		c = c.match(/tricon-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
}());
