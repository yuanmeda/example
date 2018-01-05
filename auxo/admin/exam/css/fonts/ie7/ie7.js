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
		el.innerHTML = '<span style="font-family: \'elearning-admin\'">' + entity + '</span>' + html;
	}
	var icons = {
		'icon-add': '&#xe900;',
		'icon-article': '&#xe901;',
		'icon-change': '&#xe902;',
		'icon-Chart': '&#xe903;',
		'icon-chat': '&#xe904;',
		'icon-clear': '&#xe905;',
		'icon-close': '&#xe906;',
		'icon-yes': '&#xe907;',
		'icon-home': '&#xe908;',
		'icon-xiasanjiao': '&#xe909;',
		'icon-new-course': '&#xe90a;',
		'icon-delcourse': '&#xe90b;',
		'icon-online': '&#xe90c;',
		'icon-popup': '&#xe90d;',
		'icon-set': '&#xe90e;',
		'icon-Settings': '&#xe90f;',
		'icon-Users': '&#xe910;',
		'icon-View': '&#xe911;',
		'icon-offline': '&#xe912;',
		'icon-pro': '&#xe913;',
		'icon-sanjiao': '&#xe914;',
		'icon-search': '&#xe915;',
		'icon-larrow': '&#xe916;',
		'icon-rarrow': '&#xe917;',
		'icon-uparrow': '&#xe918;',
		'icon-darrow': '&#xe919;',
		'icon-star': '&#xe91a;',
		'icon-list': '&#xe91b;',
		'icon-gouxuan': '&#xe91c;',
		'icon-tj': '&#xe608;',
		'icon-ctj': '&#xe607;',
		'icon-ts': '&#xe609;',
		'icon-run': '&#xe605;',
		'icon-czd': '&#xe606;',
		'icon-approve': '&#xe60a;',
		'icon-plan': '&#xe603;',
		'icon-course': '&#xe602;',
		'icon-class': '&#xe601;',
		'icon-time': '&#xe91d;',
		'icon-arrow-right': '&#xe91e;',
		'icon-arrow-left': '&#xe91f;',
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
		c = c.match(/icon-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
}());
