 // ==UserScript==
 // @name        Duolingo Course Switcher
 // @description Works on both the new an old website. Simplifies switching between courses that use different interface language (i.e., base language, the language from which you learn).
 // @namespace   http://moviemap.me/duoinc
 // @include     https://www.duolingo.com/*
 // @downloadURL https://github.com/elvper/DuolingoCourseSwitcher/raw/master/duolingo-course-switcher.user.js
 // @updateURL   https://github.com/elvper/DuolingoCourseSwitcher/raw/master/duolingo-course-switcher.user.js
 // @version     1.0.2
 // @require     http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
 // @grant       GM_getValue
 // @grant       GM_setValue
 // @author      elvper, arekolek, mofman, gmelikov, christeefury, guillaumebrunerie
 // ==/UserScript==

var duo = unsafeWindow.duo;
var _   = unsafeWindow._;

var activelanguagefrom = "";
var activelanguageto = "";
var flagssvgpos = [["fr", "es", "de", "pt", "it", "en", "ga", "hu", "ru", "pl"],
["ro", "dn", "tr", "id", "ja", "uk", 0, "el", "bn", "ar"],
["pa", "he", "ko", "vi", "sv", "zh-CN", "cs", "th", 0, "eo"],
["tlh", "da", 0, 0, "hv", 0, "no-BO", 0, "ca", "cy"],
["gug", "sw", "tl"]];
//yi = yiddish, ht = haitian creole, ta = tamil, hv = high Valyrian
var levelsxp = [60, 120, 200, 300, 450, 750, 1125, 1650, 2250, 3000, 3900, 4900, 6000, 7500, 9000, 10500, 12000, 13500, 15000, 17000, 19000, 22500, 26000, 30000];

//create the css for each flag
var flagpos = "", flcounter = 0;
for (i = 0; i < flagssvgpos.length; i++) {
	for (j = 0; j < flagssvgpos[i].length; j++) {
		if (flagssvgpos[i][j] != 0){
			flagpos += '.FromLang a > span.flag.flag-svg-micro.flag-'+flagssvgpos[i][j]+' {background-position: -'+j*38+'px -'+i*38+'px;}';
		}
	}
}

var languageNames = {"gu":"Gujarati","ga":"Irish","gn":"Guarani (Jopará)","gl":"Galician","la":"Latin","tt":"Tatar","tr":"Turkish","lv":"Latvian","tl":"Tagalog","th":"Thai","te":"Telugu","ta":"Tamil","yi":"Yiddish","dk":"Dothraki","de":"German","db":"Dutch (Belgium)","da":"Danish","uz":"Uzbek","el":"Greek","eo":"Esperanto","en":"English","zc":"Chinese (Cantonese)","eu":"Basque","et":"Estonian","ep":"English (Pirate)","es":"Spanish","zs":"Chinese","ru":"Russian","ro":"Romanian","be":"Belarusian","bg":"Bulgarian","ms":"Malay","bn":"Bengali","ja":"Japanese","or":"Oriya","xl":"Lolcat","ca":"Catalan","xe":"Emoji","xz":"Zombie","cy":"Welsh","cs":"Czech","pt":"Portuguese","lt":"Lithuanian","pa":"Punjabi (Gurmukhi)","pl":"Polish","hy":"Armenian","hr":"Croatian","hv":"High Valyrian","ht":"Haitian Creole","hu":"Hungarian","hi":"Hindi","he":"Hebrew","mb":"Malay (Brunei)","mm":"Malay (Malaysia)","ml":"Malayalam","mn":"Mongolian","mk":"Macedonian","ur":"Urdu","kk":"Kazakh","uk":"Ukrainian","mr":"Marathi","my":"Burmese","dn":"Dutch","af":"Afrikaans","vi":"Vietnamese","is":"Icelandic","it":"Italian","kn":"Kannada","zt":"Chinese (Traditional)","as":"Assamese","ar":"Arabic","zu":"Zulu","az":"Azeri","id":"Indonesian","nn":"Norwegian (Nynorsk)","no":"Norwegian","nb":"Norwegian (Bokmål)","ne":"Nepali","fr":"French","fa":"Farsi","fi":"Finnish","fo":"Faroese","ka":"Georgian","ss":"Swedish (Sweden)","sq":"Albanian","ko":"Korean","sv":"Swedish","km":"Khmer","kl":"Klingon","sk":"Slovak","sn":"Sindarin","sl":"Slovenian","ky":"Kyrgyz","sf":"Swedish (Finland)","sw":"Swahili"};

document.head.appendChild($('<style type="text/css">'+
	'.language-choice > .language-sub-courses {position:absolute; top:-28px !important; color:#000; background-color: #fff; min-width: 150px; min-height: 50px; display: none !important;}'+
	'.FromLang > ._1ZY-H.language-sub-courses {position:absolute; color:#000; background-color: #fff; min-width: 150px; min-height: 50px; display: none; margin-top:-69px !important;}'+
	'html[dir="ltr"] .language-sub-courses {left:200px !important;}'+
	'html[dir="rtl"] .language-sub-courses {right:200px !important;}'+
	'.HideThis {display: none;}'+
	'._1XE6M .FromLang:hover .language-sub-courses {display: block !important;}'+
	'._2kNgI._1qBnH.language-choice a span {color: #a9a9a9;}'+
	'._1XE6M {overflow: visible;}'+
	'.FromLang a span.flag.flag-svg-micro {background-image: url(//d35aaqx5ub95lt.cloudfront.net/images/flag-sprite11.svg); background-color: rgba(0,0,0,0.1); margin: 0; display: inline-block; vertical-align: middle; border-radius: 200px; width: 30px; height: 30px; background-size: 380px; position: relative; left: -35px; transform: scale(.75);}'+
	'._2kNgI._1qBnH.FromLang > a > span, ._2kNgI._1qBnH.extra-choice > a > span {position: relative; left: -30px;}'+
	'.FromLang > .language-sub-courses > .head {height: 36px; position: relative; top: 10px; padding: 0px 20px;}' +
	'._2PurW {padding: 0px 20px;}' +
	'.sublname {color: #000000 !important;}' +
	'.FromLang:hover > a > .sublname {color: #FFFFFF !important;}' +
	'._2kNgI._1qBnH:hover > a > .sublname, ._2kNgI._1qBnH:hover > a > .gray {color: #FFFFFF !important;}' +
	'.wspace {height: 8px;}' +
	flagpos+
	'</style>').get(0));

var header1 = JSON.parse('{"dn": "van", "sv": "fr\\u00e5n", "fr": "de", "hu": "-b\\u00f3l", "eo": "de", "tr": "-den", "es": "desde", "ro": "din", "ja": "\\u304b\\u3089", "vi": "t\\u1eeb", "it": "da", "he": "\\u05de", "el": "\\u03b1\\u03c0\\u03cc", "ru": "\\u0441", "ar": "\\u0645\\u0646", "en": "from", "ga": "\\u00f3", "cs": "od", "pt": "de", "de": "von", "zs": "\\u5f9e", "pl": "z"}');

function switchCourse(from, to) {
    $.post('/api/1/me/switch_language', {
            from_language: from,
            learning_language: to
        },
        function (data) {
            location.reload();
        }
    );
}

var curlangdata = "";
function getCourseData(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            curlangdata = JSON.parse(this.responseText);
        }
    };
    xhttp.open("GET", "https://www.duolingo.com/2016-04-13/users/177905737?fields=courses,currentCourse", true);
    xhttp.send();
}
getCourseData();

function updateCourses() {
    if(localStorage.getItem('dcs_courses') && !GM_getValue('dcs_courses')){
		// switch to greasemonkey storage
		GM_setValue('dcs_courses', localStorage.getItem('dcs_courses', '{}'));
    }
    var courses = JSON.parse(GM_getValue('dcs_courses', '{}'));
	var cur_lang_data = curlangdata;
	//xp to level
    for (i = 0; i < cur_lang_data.courses.length; i++) {
        cur_lang_data.courses[i].language = cur_lang_data.courses[i].learningLanguage;
		if (cur_lang_data.courses[i].xp > 29999){
			cur_lang_data.courses[i].level = 25;
		} else {
			for (j = 0; j < levelsxp.length; j++) {
				if(cur_lang_data.courses[i].xp < levelsxp[j]){
					cur_lang_data.courses[i].level = j + 1;
					j = 99;
				}
			}
		}
		delete cur_lang_data.courses[i].xp;
		delete cur_lang_data.courses[i].fromLanguage;
		delete cur_lang_data.courses[i].learningLanguage;
    }
	var learning = cur_lang_data.courses;
	activelanguagefrom = cur_lang_data.currentCourse.fromLanguage;
	activelanguageto = cur_lang_data.currentCourse.learningLanguage;
	courses[activelanguagefrom] = {};
    courses[activelanguagefrom] = learning;
    GM_setValue('dcs_courses', JSON.stringify(courses));
    return courses;
}

function updateCoursesOld(A) {
    if(localStorage.getItem('dcs_courses') && !GM_getValue('dcs_courses')){
      // switch to greasemonkey storage
      GM_setValue('dcs_courses', localStorage.getItem('dcs_courses'));
    }
    var courses = JSON.parse(GM_getValue('dcs_courses', '{}'));
    var learning = [].filter.call(A.languages, function(lang){ return lang.learning; });
    courses[A.ui_language] = learning.map(function(lang){ return _(lang).pick('language', 'level'); });
    GM_setValue('dcs_courses', JSON.stringify(courses));
    return courses;
}

function sortList() {
    var listitems = [].slice.call(document.getElementsByClassName("FromLang"));
	var sumlevel = [];
	for (j = 0; j < listitems.length; j++) {
		sumlevel[j] = 0;
		for (i = 0; i < listitems[j].getElementsByClassName("gray").length; i++) {
			sumlevel[j] = sumlevel[j] + parseInt(listitems[j].getElementsByClassName("gray")[i].innerText.match(/\d+/),10);
		}
	}
	var sortedlist = sortByLevel(listitems, sumlevel);
    $.each(sortedlist, function(idx, itm) { $(itm).insertBefore('._1oVFS.HideThis'); });
}

function sortByLevel(elements, levels) {
	var result = [];
	for(i = 0; levels.length > 0; i++) {
		var largelevel = levels.indexOf(Math.max.apply(null, levels));
		result[i] = elements.splice(largelevel, 1)[0];
		levels.splice(largelevel, 1);
	}
	return result;
}

function sortListOld() {
    var listitems = $('.languages > .language-choice').get();
    listitems.sort(function(a, b) { return $(b).find('li.language-choice').size() - $(a).find('li.language-choice').size(); });
    $.each(listitems, function(idx, itm) { $(itm).insertBefore('.languages > .divider'); });
}

$(document).on({
    mouseenter: function() {
		// Do nothing if we've already updated it
		if($(this)[0].getElementsByClassName('FromLang').length > 0)
            return;

		// Get and update languages in local storage
		var courses = updateCourses();

		// Do nothing if there's only one base language
		if(Object.keys(courses).length < 2)
			return;

		// I'm not sure why this can't be invoked in top level.
		$('._3I51r._3HsQj._2OF7V').on('click', '.extra-choice', function(){
			var from = $(this).attr('data-from');
			var to = $(this).attr('data-to');
			switchCourse(from, to);
		});

		// Get localized strings
		var levelLabel = "level ";

		// Remove the current list
		var fromlanguagenodes = document.getElementsByClassName('_2kNgI _1qBnH');
		for (i = 0; i < fromlanguagenodes.length; i++) {
			if(fromlanguagenodes[i].className.indexOf('HideThis') == -1 && fromlanguagenodes[i].className.indexOf('FromLang') == -1 ){
				fromlanguagenodes[i].className += ' HideThis';
			}
		}
		
		// Change top-level heading
		var header2 = document.getElementsByClassName("_2PurW")[0].getElementsByTagName("h6")[0].textContent;
		document.getElementsByClassName("_2PurW")[0].getElementsByTagName("h6")[0].textContent = header1[activelanguagefrom];

		// Create top-level list using source languages
		$.each(courses, function( from, value ) {
			fromCourse = '<li class="_2kNgI _1qBnH FromLang"><a href="javascript:;"><span class="flag flag-svg-micro flag-'+from+'"></span><span class="sublname">'+languageNames[from]+'</span></a><ul class="_1ZY-H language-sub-courses '+from+'"><li class="head"><h6>'+header2+'</h6></li></ul></li>';

			fromCourse = $(fromCourse).appendTo('._1XE6M');

			value.sort(function(a, b) { return b.level - a.level; });
			$.each(value, function( fromx, v ) {
				to = v.language;
				sub = $('<li class="_2kNgI _1qBnH language-choice extra-choice" data-from="'+from+'" data-to="'+to+'"><a href="javascript:;"><span class="flag flag-svg-micro flag-'+to+'"></span><span class="sublname">'+languageNames[to]+'</span> <span class="gray">'+levelLabel+v.level+'</span></a></li>');
				sub.appendTo('ul.'+from);
				if(from == activelanguagefrom && to == activelanguageto) {
					sub.addClass('_1oVFS');
				}
			});
			var whitespace = $('<div class="wspace"></div>');
			whitespace.appendTo('ul.'+from);
			if(from == activelanguagefrom) {
				fromCourse.addClass('_1oVFS');
			}
		});

		sortList();
    }
}, '._3I51r._3HsQj');

//new site
$(document).on({
    mouseenter: function() {
        // Do nothing if we've already updated it
        if($('ul.languages ul').size() > 0)
            return;

        // Get and update languages in local storage
        var A = duo.user.attributes;
        var courses = updateCourses(A);

        // Do nothing if there's only one base language
        if(Object.keys(courses).length < 2)
            return;

        // I'm not sure why this can't be invoked in top level.
        $('#topbar').on('click', '.extra-choice', function(){
            var from = $(this).attr('data-from');
            var to = $(this).attr('data-to');
            switchCourse(from, to);
        });

        // Get localized strings
        var languageNames = duo.language_names_ui[A.ui_language];
        var levelLabel = $('.languages .gray').first().text().split(' ')[0]+' ';

        // Remove the current list
        $('.languages > .language-choice').remove();

        // Change top-level heading
        var header2 = $('.languages > .head > h6').text();
        $('.languages > .head > h6').text(header1[A.ui_language] || 'From');

        // Create top-level list using source languages
        $.each(courses, function( from, value ) {
            fromCourse = '<li class="language-choice choice"><a href="javascript:;"><span class="flag flag-svg-micro flag-'+from+'"></span><span>'+languageNames[from]+'</span></a><ul class="dropdown-menu language-sub-courses '+from+'"><li class="head"><h6>'+header2+'</h6></li></ul></li>';

            fromCourse = $(fromCourse).insertBefore('.languages > .divider');

            value.sort(function(a, b) { return b.level - a.level; });
            $.each(value, function( fromx, v ) {
                to = v.language;
                sub = $('<li class="language-choice extra-choice" data-from="'+from+'" data-to="'+to+'"><a href="javascript:;"><span class="flag flag-svg-micro flag-'+to+'"></span><span>'+languageNames[to]+'</span> <span class="gray">'+levelLabel+v.level+'</span></a></li>');
                sub.appendTo('ul.'+from);
                if(from == A.ui_language && to == A.learning_language) {
                    sub.addClass('active');
                }
            });

            if(from == A.ui_language) {
                fromCourse.addClass('active');
            }
        });

        sortListOld();
    }
}, '.dropdown.topbar-language');

//old site
$(document).on({
    mouseenter: function () {
        $(this).children('.language-sub-courses').attr('style', 'display: block !important');
    },
    mouseleave: function () {
        $(this).children('.language-sub-courses').attr('style', 'display: none !important');
    }
}, '.choice');
