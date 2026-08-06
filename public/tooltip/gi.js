(function (global) {
	const config = {
		prefix: "gi",
		copyright: "",
	};
	if (global.__ambrTooltip__?.[config.prefix]) return;

	replaceMap = {
		"-702": "-pyro",
		"-703": "-hydro",
		"-704": "-anemo",
		"-706": "-geo",
		"-707": "-electro",
		"-708": "-dendro",
		"-11702": "",
		"-11703": "",
		"-11704": "",
		"-11705": "",
		"-11706": "",
		"-11707": "",
		"-11708": "",
		"-11802": "",
		"-11803": "",
		"-11804": "",
		"-11805": "",
		"-11806": "",
		"-11807": "",
		"-11808": "",
	};

	function normalizeId(avatarId) {
		result = avatarId;
		for (var key in replaceMap) {
			result = result.replace(key, replaceMap[key]);
		}
		return result;
	}

	const apiUrl = {
		weapon: (item) =>
			`https://gi.yatta.moe/api/v2/${item.lang}/weapon/${item.id}`,
		artifact: (item) =>
			`https://gi.yatta.moe/api/v2/${item.lang}/reliquary/${item.id}`,
		talent: (item) =>
			`https://gi.yatta.moe/api/v2/${item.lang}/avatar/${normalizeId(item.id)}`,
		constellation: (item) =>
			`https://gi.yatta.moe/api/v2/${item.lang}/avatar/${normalizeId(item.id)}`,
		uiReliquary: (iconName) =>
			`https://gi.yatta.moe/assets/UI/reliquary/${iconName}.png`,
		ui: (iconName) => `https://gi.yatta.moe/assets/UI/${iconName}.png`,
		weaponCurve: () => `https://gi.yatta.moe/api/v2/static/weaponCurve`,
		loc: () => `https://api.enka.network/tooltip-data/locs/gi_loc.json`,
	};

	const svg = {
		keyboardArrowDown: {
			viewBox: "0 0 768 768",
			content:
				'<path fill="currentColor" d="M236.993 265.498l147 147 147-147 45 45-192 192-192-192z"></path>',
		},
		circl: {
			viewBox: "0 0 14 14",
			content:
				'<defs><linearGradient xlink:href="#linearGradient826" id="a" x1="7.03" x2="7.03" y1="1.455" y2="12.322" gradientTransform="matrix(.80836 0 0 .82012 1.247 1.345)" gradientUnits="userSpaceOnUse"><stop offset="0" style="stop-color:currentColor;stop-opacity:0"/><stop offset=".446" style="stop-color:currentColor;stop-opacity:.80000001"/><stop offset=".548" style="stop-color:currentColor;stop-opacity:.80000001"/><stop offset="1" style="stop-color:currentColor;stop-opacity:0"/></linearGradient><linearGradient id="b" x1="7.03" x2="7.03" y1="1.794" y2="12.257" gradientTransform="translate(1.239 1.243) scale(.82247)" gradientUnits="userSpaceOnUse"><stop offset="0" style="stop-color:#fff;stop-opacity:0"/><stop offset=".446" style="stop-color:#fff;stop-opacity:.7"/><stop offset=".548" style="stop-color:#fff;stop-opacity:.7"/><stop offset="1" style="stop-color:#fff;stop-opacity:0"/></linearGradient></defs><g style="display:inline"><path d="M6.998 1.638c2.778 0 5.056 2.197 5.266 4.963.01.137-.447.433-.447.433s.457.287.445.435c-.226 2.748-2.497 4.893-5.264 4.893-2.779 0-5.077-2.162-5.289-4.925-.01-.138.444-.418.444-.418s-.455-.275-.444-.41c.209-2.77 2.508-4.971 5.289-4.971z" style="opacity:1;fill:url(#a);fill-opacity:1;stroke-width:20.1392;-inkscape-stroke:none;paint-order:stroke markers fill"/><path d="M6.713 1.638C3.972 1.766 1.82 3.695 1.483 6.3a5.036 5.036 0 0 1-.075-.11s-.786.828-1.451.828c.67 0 1.45.83 1.45.83s.03-.047.076-.112c.338 2.607 2.5 4.507 5.25 4.625-2.657-.138-4.816-2.284-5.023-4.925.17-.208.38-.418.526-.418-.147 0-.355-.209-.526-.417.207-2.645 2.366-4.824 5.023-4.964h-.02zm.56 0c2.655.138 4.78 2.317 4.986 4.962-.174.213-.388.434-.538.434.15 0 .363.218.536.43-.217 2.63-2.336 4.762-4.983 4.898 2.739-.117 4.866-2.002 5.211-4.594l.064.095s.786-.83 1.451-.83c-.206 0-.423-.078-.624-.186a3.772 3.772 0 0 1-.827-.642s-.024.039-.06.091c-.335-2.61-2.467-4.54-5.217-4.658Z" style="fill:url(#b);stroke-width:19.7069;-inkscape-stroke:none;paint-order:stroke markers fill"/></g>',
		},
		FIGHT_PROP_ATTACK: {
			viewBox: "0 0 14 14",
			content:
				'<path fill="currentColor" d="m7.755 1.651 1.643 1.643 1.928-1.926L11.3.25a.23.23 0 0 1 .228-.22h2.2a.23.23 0 0 1 .228.229c-.121 2.66.556 2.457-1.337 2.4l-1.933 1.925L12.33 6.23a.23.23 0 0 1 0 .322c-1.167 1.208-.775.907-1.892-.106l-7.151 7.147a.46.46 0 0 1-.313.137 21 21 0 0 1-2.954.238 21 21 0 0 1 .238-2.953.45.45 0 0 1 .134-.319l7.146-7.153-.838-.839a.23.23 0 0 1 0-.323l.732-.73a.23.23 0 0 1 .322 0z"/>',
		},
		FIGHT_PROP_ATTACK_PERCENT: {
			viewBox: "0 0 14 14",
			content:
				'<path fill="currentColor" d="M11.53.031a.23.23 0 0 0-.23.219l.026 1.117-1.928 1.928-1.644-1.643a.23.23 0 0 0-.322 0l-.73.73a.23.23 0 0 0 0 .323l.837.838-7.146 7.154a.45.45 0 0 0-.135.319 21 21 0 0 0-.237 2.953 21 21 0 0 0 2.954-.239.46.46 0 0 0 .312-.136L6.383 10.5a3 3 0 0 1-.117-.258l-.002-.006-.002-.01a3 3 0 0 1-.186-1.07c0-.352.056-.703.182-1.04l.006-.032.002-.004c.12-.316.296-.618.543-.875s.55-.454.877-.582A2.7 2.7 0 0 1 8.7 6.428a2.7 2.7 0 0 1 1.385.373l.353-.354c.183.166.319.308.434.432a.7.7 0 0 1 .133-.115 1.3 1.3 0 0 1 .724-.225h.612a.23.23 0 0 0-.012-.309l-1.643-1.646 1.932-1.926c1.893.057 1.217.26 1.338-2.4a.23.23 0 0 0-.228-.227h-2.2z"/><g style="font-size:6.13466px;stroke:#000;stroke-width:1.84615;stroke-miterlimit:4;stroke-dasharray:none"><g style="stroke-width:1.84615;stroke-miterlimit:4;stroke-dasharray:none"><path fill="currentColor" stroke="none" d="M12.27 9.17h1.19q.074.025.055.086-2.895 4.03-3.423 4.687-.03.067-.129.055h-.76q-.135 0-.16-.074 2.988-4 3.196-4.398.031-.05.031-.11 0-.068-.08-.19.013-.056.08-.056M8.804 10.3q0-.288.086-.51.086-.226.233-.38.153-.16.362-.239.208-.086.454-.086.251 0 .46.086.209.08.356.24.153.153.239.38.086.22.086.509 0 .282-.086.51-.086.22-.24.38-.146.153-.355.239-.209.08-.46.08-.246 0-.454-.08-.209-.086-.362-.24-.147-.16-.233-.38-.086-.227-.086-.51Zm1.589 0q0-.196-.037-.35-.03-.153-.092-.257-.055-.11-.141-.166-.086-.061-.184-.061-.104 0-.19.06-.08.056-.141.167-.056.104-.092.257-.031.154-.031.35t.03.35q.037.153.093.263.06.11.14.166.087.055.19.055.099 0 .185-.055t.141-.166q.061-.11.092-.263.037-.154.037-.35m1.331 2.313q0-.289.086-.51.086-.226.233-.38.153-.16.362-.24.209-.085.454-.085.251 0 .46.086.209.08.356.24.153.153.24.38.085.22.085.509 0 .282-.086.509-.086.22-.24.38-.146.154-.355.24-.209.08-.46.08-.245 0-.454-.08-.209-.086-.362-.24-.147-.16-.233-.38-.086-.227-.086-.51zm1.589-.019q0-.196-.037-.35-.03-.153-.092-.257-.055-.11-.141-.166-.08-.061-.184-.061-.098 0-.184.061-.086.056-.147.166-.056.104-.092.258-.031.153-.031.35t.03.349q.037.153.093.264.061.11.147.165t.184.056q.104 0 .184-.056.086-.055.141-.165.061-.11.092-.264.037-.153.037-.35" aria-label="%" style="-inkscape-font-specification:TT_Skip-E;stroke:none;stroke-width:1.84615;stroke-miterlimit:4;stroke-dasharray:none" transform="matrix(1.3 0 0 1.3 -4.22 -4.231)"/></g></g>',
		},
		FIGHT_PROP_BASE_ATTACK: {
			viewBox: "0 0 14 14",
			content:
				'<path fill="currentColor" d="m7.755 1.651 1.643 1.643 1.928-1.926L11.3.25a.23.23 0 0 1 .228-.22h2.2a.23.23 0 0 1 .228.229c-.121 2.66.556 2.457-1.337 2.4l-1.933 1.925L12.33 6.23a.23.23 0 0 1 0 .322c-1.167 1.208-.775.907-1.892-.106l-7.151 7.147a.46.46 0 0 1-.313.137 21 21 0 0 1-2.954.238 21 21 0 0 1 .238-2.953.45.45 0 0 1 .134-.319l7.146-7.153-.838-.839a.23.23 0 0 1 0-.323l.732-.73a.23.23 0 0 1 .322 0z"/>',
		},
		FIGHT_PROP_CHARGE_EFFICIENCY: {
			viewBox: "0 0 14 14",
			content:
				'<path fill="currentColor" d="M3.562 7.002a4.03 4.03 0 0 1 4.045-4.049L7.606.608C4.09.61 1.216 3.487 1.216 7.003Z" style="fill-opacity:.5;stroke-width:.913084;-inkscape-stroke:none;paint-order:stroke markers fill"/><path fill="currentColor" d="M7.607.607v2.344a4.03 4.03 0 0 1 4.047 4.047 4.03 4.03 0 0 1-4.047 4.047 4.03 4.03 0 0 1-3.578-2.17l1.727-.348L1.87 4.123 0 9.689l1.67-.337c.942 2.36 3.251 4.039 5.937 4.039C11.123 13.39 14 10.517 14 7S11.123.607 7.607.607" style="fill-opacity:1;stroke-width:.913084;-inkscape-stroke:none;paint-order:stroke markers fill"/>',
		},
		FIGHT_PROP_CRITICAL: {
			viewBox: "0 0 14 14",
			content:
				'<path fill="currentColor" d="M14 0 7.256 3.5 1.973 1.465 3.5 6.236 0 14l7.256-3.5 4.771 1.527L10.5 7.256Zm-3.24 3.24L8.88 7.136 9.701 9.7l-2.564-.82-3.898 1.88 1.88-4.17-.82-2.565L7.137 5.12Z"/>',
		},
		FIGHT_PROP_CRITICAL_HURT: {
			viewBox: "0 0 14 14",
			content:
				'<path fill="currentColor" d="m0 14 3.5-7.764-1.527-4.772L7.255 3.5 14 0l-3.5 7.255 1.527 4.772L7.255 10.5z"/><path fill="currentColor" d="M7.045.19a6.76 6.76 0 0 0-3.326.857l3.613 1.392L10.168.967A6.65 6.65 0 0 0 7.045.189zM1.502 3.073A6.8 6.8 0 0 0 .309 6.947c0 .925.189 1.808.529 2.612l1.601-3.555-.937-2.93zm11.63.998-1.571 3.26 1.076 3.361a6.71 6.71 0 0 0 .496-6.621zm-5.8 7.489-3.11 1.5a6.7 6.7 0 0 0 6.436-.436z" style="opacity:.5;stroke-width:1.09597;-inkscape-stroke:none;paint-order:stroke markers fill"/>',
		},
		FIGHT_PROP_DEFENSE: {
			viewBox: "0 0 14 14",
			content:
				'<path fill="currentColor" d="M13.442.726a.29.29 0 0 0-.175-.268C12.859.286 11.503 0 7 0S1.143.286.735.458a.29.29 0 0 0-.176.269v7.44a.87.87 0 0 0 .125.453c1.579 2.6 5.347 4.855 6.16 5.339a.29.29 0 0 0 .3 0c.79-.482 4.56-2.688 6.169-5.335a.87.87 0 0 0 .127-.455zM7 11.968c.059.013-3.56-2.017-4.824-4.368V1.565s0-.452 4.824-.452z"/>',
		},
		FIGHT_PROP_DEFENSE_PERCENT: {
			viewBox: "0 0 14 14",
			content:
				'<path fill="currentColor" d="M7 0C2.498 0 1.142.285.734.457a.29.29 0 0 0-.175.27v7.441a.87.87 0 0 0 .125.451c1.353 2.228 4.301 4.196 5.632 5.02l.319-.426c.476-.637.767-1.035 1.095-1.48l-.01-.003-.011-.005-.016-.004A2.6 2.6 0 0 1 7 11.297v.672c.059.013-3.56-2.018-4.824-4.37V1.565s0-.45 4.824-.45v5.962c.21-.18.45-.322.705-.422a2.7 2.7 0 0 1 1.016-.195c.347 0 .695.062 1.023.195.329.129.622.33.861.582l.002.002c.027.027.034.066.059.094.082-.193.15-.39.361-.537.262-.18.535-.225.723-.225h1.69V.727a.29.29 0 0 0-.175-.27C12.858.285 11.502 0 7 0"/><g style="font-size:6.13466px;stroke:#000;stroke-width:1.84615;stroke-miterlimit:4;stroke-dasharray:none"><g style="stroke-width:1.84615;stroke-miterlimit:4;stroke-dasharray:none"><path fill="currentColor" stroke="none" d="M12.27 9.17h1.19q.074.025.055.086-2.895 4.03-3.423 4.687-.03.067-.129.055h-.76q-.135 0-.16-.074 2.988-4 3.196-4.398.031-.05.031-.11 0-.068-.08-.19.013-.056.08-.056M8.804 10.3q0-.288.086-.51.086-.226.233-.38.153-.16.362-.239.208-.086.454-.086.251 0 .46.086.209.08.356.24.153.153.239.38.086.22.086.509 0 .282-.086.51-.086.22-.24.38-.146.153-.355.239-.209.08-.46.08-.246 0-.454-.08-.209-.086-.362-.24-.147-.16-.233-.38-.086-.227-.086-.51Zm1.589 0q0-.196-.037-.35-.03-.153-.092-.257-.055-.11-.141-.166-.086-.061-.184-.061-.104 0-.19.06-.08.056-.141.167-.056.104-.092.257-.031.154-.031.35t.03.35q.037.153.093.263.06.11.14.166.087.055.19.055.099 0 .185-.055t.141-.166q.061-.11.092-.263.037-.154.037-.35m1.331 2.313q0-.289.086-.51.086-.226.233-.38.153-.16.362-.24.209-.085.454-.085.251 0 .46.086.209.08.356.24.153.153.24.38.085.22.085.509 0 .282-.086.509-.086.22-.24.38-.146.154-.355.24-.209.08-.46.08-.245 0-.454-.08-.209-.086-.362-.24-.147-.16-.233-.38-.086-.227-.086-.51zm1.589-.019q0-.196-.037-.35-.03-.153-.092-.257-.055-.11-.141-.166-.08-.061-.184-.061-.098 0-.184.061-.086.056-.147.166-.056.104-.092.258-.031.153-.031.35t.03.349q.037.153.093.264.061.11.147.165t.184.056q.104 0 .184-.056.086-.055.141-.165.061-.11.092-.264.037-.153.037-.35" aria-label="%" style="-inkscape-font-specification:TT_Skip-E;stroke:none;stroke-width:1.84615;stroke-miterlimit:4;stroke-dasharray:none" transform="matrix(1.3 0 0 1.3 -4.2 -4.2)"/></g></g>',
		},
		FIGHT_PROP_ELEC_ADD_HURT: {
			viewBox: "0 0 14 14",
			content:
				'<path d="M4.53 13.517a6.9 6.9 0 0 0 3.025-.468c-.237-.073-.46-.134-.675-.21a9 9 0 0 1-.643-.251 3.9 3.9 0 0 1-2.24-2.243 3.45 3.45 0 0 1-.127-1.82c.117.139.222.277.34.4a1.04 1.04 0 0 0 1.01.32A1.57 1.57 0 0 0 6.499 7.89a2.42 2.42 0 0 0-2.083-2.8 2.99 2.99 0 0 0-3.217 2.152 7.1 7.1 0 0 0-.326 2.186c-.005.309 0 .618 0 .9A7.1 7.1 0 0 1 .01 6.593a6.95 6.95 0 0 1 2.679-5.081c-.26.472-.52.917-.752 1.374a3.7 3.7 0 0 0-.412 1.52c.207-.192.385-.36.566-.523a4.66 4.66 0 0 1 2.155-1.161 3.57 3.57 0 0 1 3.075.79l-.442.09a1.213 1.213 0 0 0-.881 1.693 2.01 2.01 0 0 0 1.719 1.34 2.575 2.575 0 0 0 2.873-2.56 3.33 3.33 0 0 0-1.1-2.508A7.8 7.8 0 0 0 7.287.102C7.235.078 7.183.05 7.106.012a7 7 0 0 1 6.892 5.915c-.282-.45-.544-.9-.836-1.328a3.7 3.7 0 0 0-1.11-1.087c.08.37.172.72.227 1.077a4.09 4.09 0 0 1-.792 3.364 3.55 3.55 0 0 1-1.51 1.017.1.1 0 0 1-.048 0c.062-.2.134-.39.184-.587a1.09 1.09 0 0 0-.525-1.236A1.68 1.68 0 0 0 7.823 7.1a2.357 2.357 0 0 0-1.168 2.96 2.75 2.75 0 0 0 2.377 1.879 4.37 4.37 0 0 0 2.462-.5c.465-.215.9-.5 1.344-.76.056-.031.108-.07.18-.118a6.92 6.92 0 0 1-8.487 2.955z" style="fill:#b380ff"/>',
		},
		FIGHT_PROP_ELEMENT_MASTERY: {
			viewBox: "0 0 14 14",
			content:
				'<path fill="currentColor" d="m8.076 8.152-.017-.05A4.3 4.3 0 0 0 7.3 6.796a4 4 0 0 0-.325-.346A2.113 2.113 0 1 0 7 2.223a2.144 2.144 0 0 0-1.838 3.18 4.4 4.4 0 0 0-1.2-.168 4.4 4.4 0 0 0-.755.066l-.038.007C1.836-.24 10.7-1.672 10.962 4.342a3.985 3.985 0 0 1-2.886 3.81m3.662-2.137a4 4 0 0 0-.626-.235 4.5 4.5 0 0 1-1.105 1.7h.031a2.113 2.113 0 1 1-2.113 2.113 4 4 0 0 0-.025-.445 3.97 3.97 0 0 0-1.863-2.931l-.19-.11a3.963 3.963 0 1 0 .645 6.535q.122-.102.236-.214L6.7 12.39a4.4 4.4 0 0 1-.891-1.765 2.112 2.112 0 1 1-.883-2.914q.1.05.189.11a2.11 2.11 0 0 1 .942 1.49 2 2 0 0 1 .018.28 3.963 3.963 0 1 0 5.663-3.577z"/>',
		},
		FIGHT_PROP_FIRE_ADD_HURT: {
			viewBox: "0 0 14 14",
			content:
				'<path d="M7.113 14c-1.542-1.47-3.479-2.25-5.16-3.477-1.472-1.1-.269-3.047.585-4.163a18 18 0 0 0 1.753-2.522c-.007 1.6 1.56 2.152 2.781 2.709C4.77 6.412 2.808 9.1 4.645 10.92c-1.873-.773-2.7-2.455-1.3-4.17a2.113 2.113 0 0 0-.535 3.662c1.332.9 2.865 1.483 4.153 2.461a.2.2 0 0 0 .187.019c1.24-.892 2.61-1.577 3.921-2.349 1.654-.887 1.47-2.773-.154-3.583 1.455 2.82-1.213 4.942-3.9 4.745-2.925-.214-3.08-3.174-.626-2.705a1.39 1.39 0 0 0-.682 1.5c.526 1.495 2.954.974 3.81.031 1.095-1.027.327-3.031-.979-3.6-1.492-.7-4.443-1.527-3.3-3.737C5.936 2.109 6.75 1.385 6.877 0c.433.581 1.443 1.719 1.24 2.452-.24.72-1.085.982-1.348 1.71a1.334 1.334 0 0 0 .578 1.824c-1.018-1.09.09-2.409 1.15-2.981a3.3 3.3 0 0 0 1.136 4.056c-.725-1.6-1.347-1.64-.128-3.408a4.58 4.58 0 0 0 1.806 2.766c2.057 1.807 1.9 3.731-.52 5.067A16.7 16.7 0 0 0 7.112 14Zm.541-3.5C11.445 9.076 6.7 5.335 5.29 8.493c1.416-.809 3.357.427 2.364 2.007" style="fill:#f95"/>',
		},
		FIGHT_PROP_GRASS_ADD_HURT: {
			viewBox: "0 0 14 14",
			content:
				'<defs id="svg-FIGHT_PROP_GRASS_ADD_HURT__defs4"><style id="style2">.cls-1{fill:#a5c83b}</style></defs><g id="svg-FIGHT_PROP_GRASS_ADD_HURT__Livello_2" data-name="Livello 2" transform="scale(.04457)"><g id="svg-FIGHT_PROP_GRASS_ADD_HURT__Livello_10" data-name="Livello 10"><path id="svg-FIGHT_PROP_GRASS_ADD_HURT__path6" d="M173.68 70.934 157.051 90.29l-16.638-19.355a26.29 26.29 0 0 1-2.289-31.14l18.927-29.957 18.917 29.957a26.29 26.29 0 0 1-2.29 31.14" class="cls-1" style="stroke-width:1.09532"/><path id="svg-FIGHT_PROP_GRASS_ADD_HURT__path8" d="m278.71 174.201-.855.625.647.558c-7.591 42.959-41.853 61.798-61.338 71.13-22.027 10.537-60.09 32.247-60.09 57.779 0-25.532-38.073-47.242-60.1-57.779-19.497-9.332-53.758-28.171-61.338-71.119l.657-.57-.876-.635a102.4 102.4 0 0 1-1.325-16.747c0-55.861 44.382-80.451 72.148-80.451 20.965 0 36.146 12.541 42.269 18.697a5.53 5.53 0 0 1 .712 6.944l-4.458 6.846a2.65 2.65 0 0 1-4.305.197c-5.816-7.295-23.22-24.25-53.56-12.925-22.685 8.489-36.88 29.574-36.88 54.766 0 25.193 15.564 61.81 56.31 76.914s50.724 39.519 50.724 39.519 9.979-24.415 50.725-39.52c40.746-15.104 56.31-51.72 56.31-76.913s-14.239-46.233-36.857-54.7c-30.363-11.348-47.778 5.608-53.562 12.903a2.65 2.65 0 0 1-4.304-.197l-4.458-6.846a5.55 5.55 0 0 1 .712-6.944c6.177-6.2 21.315-18.698 42.268-18.698 27.778 0 72.149 24.58 72.149 80.452a102.4 102.4 0 0 1-1.325 16.714" class="cls-1" style="stroke-width:1.09532"/><path id="svg-FIGHT_PROP_GRASS_ADD_HURT__path10" d="m36.25 174.826-.658.57c-.076-.395-.153-.8-.208-1.206z" class="cls-1" style="stroke-width:1.09532"/><path id="svg-FIGHT_PROP_GRASS_ADD_HURT__path12" d="M139.199 211.125c-34.69-30.494-42.718-50.769-34.853-69.006 7.864-18.237 29.716-10.887 29.716-10.887-18.698-19.387-34.492-15.762-43.255-10.855a29.3 29.3 0 0 0-12.048 13.144c-7.12 15.06-.624 29.64 10.35 42.017-6.922.57-15.476 3.548-20.405 13.625 0 0 5.093-5.224 12.048-6.133 6.956-.91 13.91-1.282 19.3 3.066 17.865 15.116 39.147 25.029 39.147 25.029" class="cls-1" style="stroke-width:1.09532"/><path id="svg-FIGHT_PROP_GRASS_ADD_HURT__path14" d="M51.704 86.62a18.37 18.37 0 0 0-17.459-15.981l-22.3-.91 5.224 18.402a19.96 19.96 0 0 0 21.906 14.327l14.393-1.983z" class="cls-1" style="stroke-width:1.09532"/><path id="svg-FIGHT_PROP_GRASS_ADD_HURT__path16" d="m36.25 174.826-.658.57-8.642 7.48a13.144 13.144 0 0 1-15.904 1.03l-10.953-7.23 11.468-8.444a13.14 13.14 0 0 1 15.586 0l8.27 5.958z" class="cls-1" style="stroke-width:1.09532"/><path id="svg-FIGHT_PROP_GRASS_ADD_HURT__path18" d="M278.71 174.201a22 22 0 0 1-.208 1.183l-.647-.558z" class="cls-1" style="stroke-width:1.09532"/><path id="svg-FIGHT_PROP_GRASS_ADD_HURT__path20" d="M174.906 211.125c34.678-30.494 42.718-50.769 34.842-69.006C201.873 123.882 180 131.2 180 131.2c18.697-19.387 34.492-15.762 43.266-10.855a29.3 29.3 0 0 1 12.048 13.144c7.109 15.06.624 29.64-10.35 42.017 6.922.57 15.465 3.549 20.405 13.626 0 0-5.093-5.225-12.048-6.134-6.956-.91-13.911-1.282-19.3 3.067-17.832 15.148-39.114 25.06-39.114 25.06" class="cls-1" style="stroke-width:1.09532"/><path id="svg-FIGHT_PROP_GRASS_ADD_HURT__path22" d="M262.39 86.62a18.39 18.39 0 0 1 17.459-15.981l22.311-.91-5.224 18.402a19.98 19.98 0 0 1-21.907 14.327l-14.392-1.983z" class="cls-1" style="stroke-width:1.09532"/><path id="svg-FIGHT_PROP_GRASS_ADD_HURT__path24" d="m313.957 176.71-10.953 7.229a13.144 13.144 0 0 1-15.893-1.03l-8.653-7.492-.647-.559.855-.624 8.193-6.002a13.14 13.14 0 0 1 15.597 0z" class="cls-1" style="stroke-width:1.09532"/></g></g>',
		},
		FIGHT_PROP_HEALED_ADD: {
			viewBox: "0 0 14 14",
			content:
				'<path fill="currentColor" d="M4.766 0a.59.59 0 0 0-.59.588v.021c.08.674.664 4.285.691 4.258S1.283 4.255.609 4.176H.588a.59.59 0 0 0-.588.59v4.468a.59.59 0 0 0 .588.59h.144c.902-.12 4.161-.648 4.135-.674-.027-.027-.612 3.582-.691 4.256v.006a.59.59 0 0 0 .59.588h4.468a.59.59 0 0 0 .59-.588v-.006c-.08-.674-.664-4.283-.691-4.256-.026.026 3.233.554 4.135.674h.144a.59.59 0 0 0 .588-.59V4.766a.59.59 0 0 0-.588-.59h-.021c-.672.079-4.286.664-4.258.691s.612-3.584.691-4.258V.588A.59.59 0 0 0 9.234 0z"/><path fill="currentColor" d="M3.394 3.392C3.416 3.37.229 2.858.237 2.887S2.919.243 2.889.235s.483 3.179.505 3.157m7.212 0c.022.022.535-3.165.505-3.157s2.644 2.682 2.652 2.652-3.179.483-3.157.505m0 7.233c-.022.021 3.165.534 3.157.505s-2.682 2.644-2.652 2.652-.483-3.179-.505-3.157m-7.212 0c-.022-.022-.535 3.165-.505 3.157S.245 11.1.237 11.13s3.179-.484 3.157-.505" style="fill-opacity:.501023;stroke-width:1.80486;stroke-opacity:.370143;paint-order:stroke markers fill"/>',
		},
		FIGHT_PROP_HEAL_ADD: {
			viewBox: "0 0 14 14",
			content:
				'<path fill="currentColor" d="M14 4.765v4.47a.59.59 0 0 1-.588.589H9.824v3.588a.59.59 0 0 1-.589.588h-4.47a.59.59 0 0 1-.589-.588V9.824H.588A.59.59 0 0 1 0 9.235v-4.47a.59.59 0 0 1 .588-.589h3.588V.588A.59.59 0 0 1 4.765 0h4.47a.59.59 0 0 1 .589.588v3.588h3.588a.59.59 0 0 1 .588.589"/>',
		},
		FIGHT_PROP_HP: {
			viewBox: "0 0 14 14",
			content:
				'<path fill="currentColor" d="M3.5 7.654a.98.98 0 0 1 .449-.571c1.51-.85 3.586 2.117 6.544.548 1.927 6.083-8.893 6.247-6.992.023zM7 14c-3.373 0-6.75-2.421-5.134-7.26A18.5 18.5 0 0 1 6.57.213.75.75 0 0 1 7 0a.75.75 0 0 1 .432.212 18.5 18.5 0 0 1 4.705 6.528C13.749 11.579 10.376 14 7 14m.22-12.19A.6.6 0 0 0 7 1.735a.7.7 0 0 0-.22.075C5.07 3.134 2.7 7.092 2.839 9.21A4.02 4.02 0 0 0 7 12.753a4.02 4.02 0 0 0 4.162-3.538c.139-2.123-2.231-6.081-3.942-7.405"/><path fill="currentColor" d="M7.98 8.03a12.6 12.6 0 0 1 1.573-1.509c.569-.413.94 1.11.94 1.11a3.73 3.73 0 0 1-2.513.399" style="color:gray;fill-opacity:.496933"/>',
		},
		FIGHT_PROP_HP_PERCENT: {
			viewBox: "0 0 14 14",
			content:
				'<path fill="currentColor" d="M7 0a.75.75 0 0 0-.43.213A18.5 18.5 0 0 0 1.865 6.74c-1.515 4.536 1.357 6.945 4.502 7.23l-.09-.276.358-.48c.148-.198.22-.3.34-.461a4.02 4.02 0 0 1-4.137-3.541c-.14-2.118 2.231-6.076 3.941-7.4A.7.7 0 0 1 7 1.734a.6.6 0 0 1 .22.077c1.236.956 2.812 3.284 3.542 5.304a.8.8 0 0 1 .265-.32c.262-.18.535-.225.723-.225h.305A18.5 18.5 0 0 0 7.432.213.75.75 0 0 0 7 0M4.543 6.928a1.2 1.2 0 0 0-.594.154.98.98 0 0 0-.449.572c-1 3.277 1.523 4.78 3.857 4.584l.373-.506-.01-.002-.011-.005-.016-.004a2.6 2.6 0 0 1-.795-.518l-.066-.05-.018-.026a2.7 2.7 0 0 1-.527-.854l-.002-.005-.004-.01a3 3 0 0 1-.185-1.069c0-.351.058-.703.183-1.04l.006-.034.002-.002q.106-.279.274-.535c-.76-.317-1.427-.66-2.018-.65"/><path fill="currentColor" d="M9.756 6.45a.33.33 0 0 0-.203.071l-.055.047a2.6 2.6 0 0 1 .734.348c-.122-.244-.284-.46-.476-.467z" style="color:gray;fill-opacity:.496933"/><g style="font-size:6.13466px;stroke:#000"><path fill="currentColor" stroke="none" d="M12.27 9.17h1.19q.074.025.055.086-2.895 4.03-3.423 4.687-.03.067-.129.055h-.76q-.135 0-.16-.074 2.988-4 3.196-4.398.031-.05.031-.11 0-.068-.08-.19.013-.056.08-.056M8.804 10.3q0-.288.086-.51.086-.226.233-.38.153-.16.362-.239.208-.086.454-.086.251 0 .46.086.209.08.356.24.153.153.239.38.086.22.086.509 0 .282-.086.51-.086.22-.24.38-.146.153-.355.239-.209.08-.46.08-.246 0-.454-.08-.209-.086-.362-.24-.147-.16-.233-.38-.086-.227-.086-.51Zm1.589 0q0-.196-.037-.35-.03-.153-.092-.257-.055-.11-.141-.166-.086-.061-.184-.061-.104 0-.19.06-.08.056-.141.167-.056.104-.092.257-.031.154-.031.35t.03.35q.037.153.093.263.06.11.14.166.087.055.19.055.099 0 .185-.055t.141-.166q.061-.11.092-.263.037-.154.037-.35m1.331 2.313q0-.289.086-.51.086-.226.233-.38.153-.16.362-.24.209-.085.454-.085.251 0 .46.086.209.08.356.24.153.153.24.38.085.22.085.509 0 .282-.086.509-.086.22-.24.38-.146.154-.355.24-.209.08-.46.08-.245 0-.454-.08-.209-.086-.362-.24-.147-.16-.233-.38-.086-.227-.086-.51zm1.589-.019q0-.196-.037-.35-.03-.153-.092-.257-.055-.11-.141-.166-.08-.061-.184-.061-.098 0-.184.061-.086.056-.147.166-.056.104-.092.258-.031.153-.031.35t.03.349q.037.153.093.264.061.11.147.165t.184.056q.104 0 .184-.056.086-.055.141-.165.061-.11.092-.264.037-.153.037-.35" aria-label="%" style="-inkscape-font-specification:TT_Skip-E;stroke:none;-inkscape-stroke:none" transform="matrix(1.3 0 0 1.3 -4.2 -4.2)"/></g>',
		},
		FIGHT_PROP_ICE_ADD_HURT: {
			viewBox: "0 0 14 14",
			content:
				'<path d="M1.172 3.644s1.332 2.052 1.843 3.163q.078-.298.124-.602a6.25 6.25 0 0 1 3.337.506A6.25 6.25 0 0 1 4.37 4.068q.24-.192.46-.408c-1.217.112-3.658-.016-3.658-.016ZM5.426 6.1a7.2 7.2 0 0 0-2.314-.552 3.4 3.4 0 0 0-.193-.9c.303-.053.598-.147.876-.279A7.2 7.2 0 0 0 5.426 6.1Zm-4.254 4.256s1.332-2.052 1.843-3.163q.078.298.124.602a6.25 6.25 0 0 0 3.337-.506A6.25 6.25 0 0 0 4.37 9.932q.24.192.46.408c-1.217-.112-3.658.016-3.658.016zM5.426 7.9a7.2 7.2 0 0 1-2.314.552 3.5 3.5 0 0 1-.193.9c.303.053.598.147.876.279A7.2 7.2 0 0 1 5.426 7.9ZM7 13.75s-1.11-2.177-1.815-3.175q.297.081.583.193A6.24 6.24 0 0 0 7 7.626a6.25 6.25 0 0 0 1.232 3.143q.284-.111.578-.193C8.106 11.574 7 13.75 7 13.75Zm0-4.912a7.2 7.2 0 0 1-.675 2.284q.381.264.68.62.299-.356.68-.62A7.2 7.2 0 0 1 7 8.838Zm5.828 1.518s-1.331-2.052-1.843-3.163q-.077.298-.123.602a6.25 6.25 0 0 1-3.338-.506A6.26 6.26 0 0 1 9.63 9.932q-.24.192-.46.408c1.217-.112 3.657.016 3.657.016zM8.574 7.9a7.2 7.2 0 0 0 2.314.552q.036.464.193.9a3.4 3.4 0 0 0-.877.279A7.2 7.2 0 0 0 8.574 7.9Zm4.254-4.256s-1.331 2.052-1.843 3.163a6 6 0 0 1-.123-.602 6.25 6.25 0 0 0-3.338.506A6.26 6.26 0 0 0 9.63 4.068a6 6 0 0 1-.46-.408c1.217.112 3.657-.016 3.657-.016ZM8.574 6.1a7.2 7.2 0 0 1 2.314-.552 3.5 3.5 0 0 1 .193-.9 3.4 3.4 0 0 1-.877-.279A7.2 7.2 0 0 1 8.574 6.1ZM7 .25S5.89 2.426 5.185 3.424q.297-.082.583-.193A6.24 6.24 0 0 1 7 6.374a6.25 6.25 0 0 1 1.232-3.143q.284.111.578.193C8.106 2.426 7 .25 7 .25Zm0 4.912a7.2 7.2 0 0 0-.675-2.284 3.5 3.5 0 0 0 .68-.62q.299.356.68.62A7.2 7.2 0 0 0 7 5.162Zm1.103 2.853-.068.787-.718-.334H6.68l-.717.334-.065-.787-.32-.557-.649-.454.649-.453.32-.553.068-.788.717.335h.64l.718-.335.068.788.32.55.648.454-.648.454Z" style="fill:#5df;stroke:#5df;stroke-width:.3;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;fill-rule:evenodd"/>',
		},
		FIGHT_PROP_PHYSICAL_ADD_HURT: {
			viewBox: "0 0 14 14",
			content:
				'<path fill="currentColor" d="m11.491 7.919-2.489 1.66v1.77l2.489-1.66 2.489 1.66v-1.77zm0 2.434-2.489 1.66v1.771l2.489-1.66 2.489 1.66v-1.771ZM7.43 1.658l-.731.731a.23.23 0 0 0 0 .322l.837.837-7.144 7.143a.46.46 0 0 0-.133.318 21 21 0 0 0-.239 2.952 21 21 0 0 0 2.952-.239.46.46 0 0 0 .318-.133l7.143-7.144c1.116 1.012.725 1.313 1.89.106a.23.23 0 0 0 0-.322L10.68 4.588l1.926-1.926c1.89.06 1.215.263 1.335-2.395a.23.23 0 0 0-.227-.228h-2.192a.23.23 0 0 0-.228.219l.025 1.116L9.393 3.3 7.752 1.658a.23.23 0 0 0-.322 0"/>',
		},
		FIGHT_PROP_ROCK_ADD_HURT: {
			viewBox: "0 0 14 14",
			content:
				'<path d="M7.119 6.009c-.5.538-.953 1.041-1.42 1.537a.23.23 0 0 0-.061.286 4.5 4.5 0 0 0 1.355 1.719.18.18 0 0 0 .164-.009c.388-.257.785-.5 1.15-.788a16 16 0 0 0 2.142-1.993c.18.366.382.7.518 1.063.2.535.356 1.088.535 1.632a.29.29 0 0 1-.061.286 12.3 12.3 0 0 1-1.768 1.985c-.84.755-1.714 1.47-2.574 2.2A1 1 0 0 1 6.99 14c-.5-.411-1.02-.817-1.52-1.243a29 29 0 0 1-2.847-2.774A16.8 16.8 0 0 1 .529 7.137a.245.245 0 0 1 0-.279A10 10 0 0 1 1.875 5.1a25.3 25.3 0 0 0 5.158 8.241 12.4 12.4 0 0 0 2.98-4.617l-.036-.03-2.933 2.463c-.04-.032-.081-.061-.117-.1a13.5 13.5 0 0 1-2.562-3.364.25.25 0 0 1 .05-.356c.5-.442 1-.89 1.5-1.325.227-.194.474-.365.737-.566zm.228 2.545c.263-.2.51-.372.736-.566.506-.435 1-.883 1.5-1.325a.25.25 0 0 0 .05-.356 13.5 13.5 0 0 0-2.56-3.369c-.035-.034-.076-.063-.115-.1L4.025 5.306l-.04-.03A12.35 12.35 0 0 1 6.97.659 25.3 25.3 0 0 1 12.126 8.9a10 10 0 0 0 1.345-1.758.24.24 0 0 0 0-.279 16.7 16.7 0 0 0-2.1-2.846 29 29 0 0 0-2.842-2.774C8.03.817 7.514.411 7.009 0c-.05.033-.081.049-.107.071-.86.732-1.734 1.447-2.573 2.2A12.2 12.2 0 0 0 2.56 4.258a.29.29 0 0 0-.062.286c.179.544.334 1.1.536 1.632.136.361.336.7.517 1.063a16 16 0 0 1 2.14-1.993c.367-.285.765-.531 1.152-.788a.18.18 0 0 1 .164-.009 4.5 4.5 0 0 1 1.355 1.719.23.23 0 0 1-.06.286c-.468.5-.926 1-1.421 1.537z" style="fill:#fc0"/>',
		},
		FIGHT_PROP_SHIELD_COST_MINUS_RATIO: {
			viewBox: "0 0 14 14",
			content:
				'<path fill="currentColor" d="M13.442.726a.29.29 0 0 0-.175-.268C12.859.286 11.503 0 7 0S1.143.286.735.458a.29.29 0 0 0-.176.269v7.44a.87.87 0 0 0 .125.453c1.579 2.6 5.347 4.855 6.16 5.339a.29.29 0 0 0 .3 0c.79-.482 4.56-2.688 6.169-5.335a.87.87 0 0 0 .127-.455zM5.695 10.773 6.74 7l-4-1 5.61-4.762L7.306 5.01l4 1z"/>',
		},
		FIGHT_PROP_WATER_ADD_HURT: {
			viewBox: "0 0 14 14",
			content:
				'<path d="m2.923 12.245.253.13a7.94 7.94 0 0 0 3.89.963 3.753 3.753 0 0 0 .487-7.464 3.6 3.6 0 0 0-1.691.132.938.938 0 0 1-.716-1.732 4.3 4.3 0 0 1 1.48-.366 4.91 4.91 0 0 1 5.049 3.446 4.93 4.93 0 0 1-2.517 5.764c4.218-1.543 4.723-7.809.812-10.017a5.34 5.34 0 0 0-3.437-.829 5.5 5.5 0 0 0-3.65 1.775 7 7 0 0 0-.416.524.87.87 0 0 1-.927.337.93.93 0 0 1-.781-.638.88.88 0 0 1 .1-.684 6.2 6.2 0 0 1 1.363-1.721A7.1 7.1 0 0 1 6.136.081a6.93 6.93 0 0 1 6.848 3.359c2.683 4.1-.263 9.987-5.094 10.472a6.84 6.84 0 0 1-3.241-.343 4 4 0 0 1-1.726-1.324m5.516-.119a2.04 2.04 0 0 1-2.35.064 1.5 1.5 0 0 1-.007-2.613.95.95 0 0 1 1.433.505c.77 2.06 2.637.147 1.424-1.246a2.38 2.38 0 0 0-2.17-.95 2.486 2.486 0 1 0 .784 4.891 2.4 2.4 0 0 0 1.52-1.151c-.21.166-.41.351-.634.5M2.21 9.521a.663.663 0 1 0 .663.663.663.663 0 0 0-.663-.663M.959 6.133a.958.958 0 1 0 .957.957.96.96 0 0 0-.957-.957" style="fill:#3e99ff"/>',
		},
		FIGHT_PROP_WIND_ADD_HURT: {
			viewBox: "0 0 14 14",
			content:
				'<path d="M.2 4.905c.764 1.2 1.813 2.475 3.362 2.434 1.025-.067 2.374.224 2.679 1.36.313.864-.825 1.981-1.513 1.123-.108-.186-.04-.3.173-.325 1 .02 1.348-1.12.4-1.514-.813-.1-1.548.527-2.33.707C.792 9.32-.523 6.729.2 4.907zm9.912 2.43c-1.056-.074-2.45.563-2.375 1.785a.973.973 0 0 0 1.1.985c.316.012.724-.547.294-.613-1.621 0-1.022-2.1.346-1.4a5.2 5.2 0 0 0 2.343.687c1.8-.177 2.572-2.3 1.989-3.859-.871 1.303-1.957 2.597-3.697 2.414zm-2.42-.772a7.5 7.5 0 0 0 2.226-.861A3.067 3.067 0 0 0 9.286.09a5.14 5.14 0 0 1-1.594 6.473m-1.343-.014A5.07 5.07 0 0 1 4.734.07a3.075 3.075 0 0 0-1.122 5.287 8 8 0 0 0 2.7 1.235zm5.342-.09c-1.143.656-2.594.363-3.651 1.217a1.557 1.557 0 0 0 .07 2.768c.234.1.462.206.689.014.223-.167.4-.162.72-.012a9.1 9.1 0 0 0-2.512 3.482 9.2 9.2 0 0 0-2.523-3.478.605.605 0 0 1 .726 0c.6.347 1.443-.4 1.555-1 .247-1.179-.936-2.106-1.982-2.33-.512-.12-1.038-.182-1.55-.3C.866 6.337.51 3.94 1.669 2.105c.668 4.9 4 3.555 5.332 6.26 1.32-2.67 4.678-1.382 5.345-6.26.81 1.415 1.054 3.522-.655 4.354M7.57 11.65 7 11.271l-.572.385.58.972zM7 10.137a1.6 1.6 0 0 1-1 .911.925.925 0 0 0 .99-.272c.427.327.795.417 1.047.255A1.56 1.56 0 0 1 7 10.137" style="fill:#80ffe6"/>',
		},
	};

	const reliquarySuit = {
		EQUIP_BRACER: {
			hash: "2511636352",
			uiIcon: "UI_Icon_Equip_Bracer",
		},
		EQUIP_NECKLACE: {
			hash: "2498820160",
			uiIcon: "UI_Icon_Equip_Necklace",
		},
		EQUIP_SHOES: {
			hash: "3886070176",
			uiIcon: "UI_Icon_Equip_Shoes",
		},
		EQUIP_RING: {
			hash: "2587857504",
			uiIcon: "UI_Icon_Equip_Ring",
		},
		EQUIP_DRESS: {
			hash: "89548520",
			uiIcon: "UI_Icon_Equip_Dress",
		},
	};

	const talentTypeHash = {
		0: "1653327868",
		1: "4260972229",
		2: "2453877364",
		3: "2602723764",
		4: "2602723764",
		5: "2602723764",
		6: "2602723764",
		7: "2602723764",
		8: "2602723764",
	};

	const talentExtraMap = {
		0: "",
		1: "",
		2: "",
		3: "",
		4: " - A1",
		5: " - A4",
		6: "",
		7: "",
		8: "",
	};

	const romeNum = {
		1: "I",
		2: "II",
		3: "III",
		4: "IV",
		5: "V",
		6: "VI",
	};

	const weaponRarityMaxLevel = {
		1: 70,
		2: 70,
		3: 90,
		4: 90,
		5: 90,
	};

	const talentIndexMap = {
		0: 0,
		1: 1,
		2: 3,
		3: 2,
		4: 4,
		5: 5,
		6: 6,
		7: 8,
	};

	const KWARGS = new Map([
		["NON_BREAK_SPACE", "&nbsp;"],
		["\n", "<br>"],
	]);

	function format(text) {
		text = text.replaceAll("\\n", "<br>");
		text = text.replace(
			/<color=#([0-9A-Fa-f]{8})>(.*?)<\/color>/g,
			(match, colorCode, text) => {
				const r = parseInt(colorCode.slice(0, 2), 16);
				const g = parseInt(colorCode.slice(2, 4), 16);
				const b = parseInt(colorCode.slice(4, 6), 16);
				const a = (parseInt(colorCode.slice(6, 8), 16) / 255).toFixed(
					2,
				);
				const rgbaColor = `rgba(${r}, ${g}, ${b}, ${a})`;
				return `<span style="color: ${rgbaColor};">${text}</span>`;
			},
		);
		text = text.replace(/{LAYOUT_([A-Z]+)#(.*?)}/g, (_, layout, value) => {
			if (layout === "PC") {
				return value;
			}
			return "";
		});
		text = text.replace(/\{\/?LINK(?:[^}]*)}/g, (_) => {
			return "";
		});

		if (text.length < 1 || text[0] != "#") return text;
		return text
			.slice(1)
			.replace(
				/{(\w+)}/g,
				(_, ...args) => KWARGS.get(args[0]) ?? `<${args[0]}>`,
			);
	}

	function ifPercentMultiply(statName, statValue, round) {
		let split = statName.split("_");
		let isPercent = [
			"HURT",
			"CRITICAL",
			"EFFICIENCY",
			"PERCENT",
			"ADD",
		].includes(split[split.length - 1]);
		if (round && isPercent)
			return (
				Math.round((statValue * 100 + Number.EPSILON + 0.0001) * 10) /
				10
			);
		if (round) return Math.round(statValue);
		return statValue;
	}

	function formatParam(template, params) {
		return template.replace(
			/\{param(\d+):([FIP\d]*)\}/g,
			(match, index, format) => {
				const paramValue = params[parseInt(index) - 1];
				if (paramValue === undefined) return match;

				let formattedValue = paramValue;
				if (format.startsWith("F")) {
					const decimalPlaces = parseInt(format.slice(1)) || 0;
					if (format.includes("P"))
						formattedValue = (paramValue * 100).toFixed(
							decimalPlaces,
						);
					else formattedValue = paramValue.toFixed(decimalPlaces);
				} else if (format === "I") {
					formattedValue = Math.round(paramValue);
				} else if (format === "P") {
					formattedValue = (paramValue * 100).toFixed(0);
				}
				if (format.includes("P")) {
					formattedValue += "%";
				}
				return formattedValue;
			},
		);
	}

	function formatStat(name, value) {
		value = ifPercentMultiply(name, value, true);
		if (value >= 1000) {
			value = Array.from(value + "");
			value.splice(-3, 0, ",");
			value = value.join("");
		}
		name = name.split("_");
		if (
			["HURT", "CRITICAL", "EFFICIENCY", "PERCENT", "ADD"].includes(
				name[name.length - 1],
			)
		)
			value = (value.toFixed ? value.toFixed(1) : value) + "%";
		return value;
	}

	const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

	class DataFormat {
		static artifact(data, item) {
			const level = item.level;
			const suit = item.index
				? Object.keys(reliquarySuit)[item.index]
				: Object.keys(reliquarySuit)[0];
			const lang = item.lang;
			const icon = data.data.suit[suit].icon;
			const affixList = Object.values(data.data.affixList);
			const suitName = locData[lang][reliquarySuit[suit].hash];
			const suitIcon = apiUrl.ui(reliquarySuit[suit].uiIcon);

			return {
				name: data.data.suit[suit].name,
				suitName: suitName,
				suitIcon: suitIcon,
				icon: apiUrl.uiReliquary(icon),
				level: level,
				affixList: affixList,
				setName: data.data.name,
				lore: data.data.suit[suit].description,
			};
		}

		static weapon(data, item) {
			const rarity = data.data.rank;
			const level = item.level
				? clamp(item.level, 1, weaponRarityMaxLevel[rarity])
				: weaponRarityMaxLevel[rarity];
			const refine = item.index ? clamp(item.index, 1, 5) : 1;
			const lang = item.lang;
			let promote = parseInt(item.promote);
			if (!promote) {
				data.data.upgrade.promote.forEach((element) => {
					if (element.unlockMaxLevel <= level) {
						promote = element.promoteLevel;
					}
				});
			}

			const promote_atk = promote
				? data.data.upgrade.promote[promote].addProps[
						data.data.upgrade.prop[0].propType
					]
				: 0;
			const base_atk =
				data.data.upgrade.prop[0].initValue *
				curveData.data[level].curveInfos[
					data.data.upgrade.prop[0].type
				];
			const affix = data.data.affix
				? {
						name: Object.values(data.data.affix)[0].name,
						description: format(
							Object.values(data.data.affix)[0].upgrade[
								refine - 1
							],
						),
						refine: refine,
					}
				: undefined;
			const main_stat = data.data.upgrade.prop[1]
				? {
						type: data.data.upgrade.prop[1].propType,
						value:
							data.data.upgrade.prop[1].initValue *
							curveData.data[level].curveInfos[
								data.data.upgrade.prop[1].type
							],
					}
				: undefined;

			var tags = [
				{ text: `${locData[lang]["level"]} ${level}` },
				{
					text: formatStat(
						"FIGHT_PROP_ATTACK",
						base_atk + promote_atk,
					),
					svg: svg.FIGHT_PROP_BASE_ATTACK,
				},
			];

			if (main_stat) {
				tags.push({
					text: formatStat(main_stat.type, main_stat.value),
					svg: svg[main_stat.type],
				});
			}

			return {
				name: data.data.name,
				type: data.data.type,
				rarity: rarity,
				icon: apiUrl.ui(data.data.icon),
				affix: affix,
				tags: tags,
				lore: data.data.description,
			};
		}

		static talent(data, item) {
			const level = item.level ? clamp(parseInt(item.level), 1, 15) : 8;
			let index;
			if (item.id_b) {
				index = parseInt(item.id_b);
			} else if (item.index) {
				index = talentIndexMap[item.index];
			} else {
				index = 0;
			}
			let adjIndex = index;
			if (index >= 3) {
				if (!!data.data.talent[2]) adjIndex++;
				if (data.data.talent[3]?.type == 0) adjIndex++;
			}
			const lang = item.lang;
			const talent = data.data.talent[adjIndex];
			const charName = data.data.name;
			const element = data.data.element;
			let multiplyers = [];
			if (talent.promote) {
				const promote = talent.promote[level]
					? talent.promote[level]
					: talent.promote[1];
				const params = promote.params;
				const descriptions = promote.description;
				descriptions.map((text) => {
					if (text == "") return;
					let [type, multiplyer] = format(text).split("|");
					multiplyer = formatParam(multiplyer, params);
					multiplyers.push([type, multiplyer]);
				});
			}

			multiplyers = multiplyers.length != 0 ? multiplyers : null;

			const tags = [];
			const talentType = locData[lang][talentTypeHash[item.index]];
			const talentExtra = talentExtraMap[item.index];
			if (talentType) tags.push({ text: talentType + talentExtra });
			const talentlevel = [0, 1, 2].includes(parseInt(item.index))
				? `${locData[lang]["level"]} ${level}`
				: null;
			if (talentlevel) tags.push({ text: talentlevel });
			const name = talent.name.startsWith(talentType)
				? talent.name.slice(talentType.length + 2)
				: talent.name;

			return {
				name: name,
				description: talent.description,
				icon: apiUrl.ui(talent.icon),
				charName,
				tags,
				multiplyers,
				element,
			};
		}

		static constellation(data, item) {
			const lang = item.lang;
			const index = item.index ? parseInt(item.index) : 1;
			const constellation = data.data.constellation[index - 1];
			const charName = data.data.name;
			const element = data.data.element;
			const talentTag =
				locData[lang]["constellation"] + ` ${romeNum[index]}`;
			const tags = [{ text: talentTag }];

			return {
				icon: apiUrl.ui(constellation.icon),
				name: constellation.name,
				description: constellation.description,
				charName,
				element,
				tags,
			};
		}
	}

	class ItemTemplate {
		static artifact(data) {
			function bonusState(index) {
				if (data.level == null) {
					return "";
				} else if (data.level >= 2 * (index + 1)) {
					return "Active";
				} else {
					return "Inactive";
				}
			}

			return {
				theme: null,
				icon: {
					url: data.icon,
				},
				name: data.name,
				context: {
					text: data.suitName,
					icon: data.suitIcon,
				},
				tags: [],
				subName: null,
				contents: data.affixList.map((description, index) => {
					return {
						title: data.setName,
						description: format(description),
						state: bonusState(index),
						label: {
							text: String(index + 1) * 2,
							style: "setPiece",
						},
					};
				}),
				lore: data.lore,
				copyright: config.copyright,
				prefix: config.prefix,
			};
		}

		static weapon(data) {
			return {
				theme: `Rarity-${data.rarity}`,
				icon: {
					style: null,
					url: data.icon,
				},
				name: data.name,
				subName: null,
				tags: data.tags,
				contents: data.affix
					? [
							{
								title: data.affix.name,
								description: format(data.affix.description),
								label: {
									text: `R${data.affix.refine}`,
									style: "weaponRefine",
								},
							},
						]
					: [],
				lore: data.lore,
				copyright: config.copyright,
				prefix: config.prefix,
			};
		}

		static talent(data) {
			return {
				theme: data.element,
				icon: {
					svgFrame: svg.circl,
					style: "talent",
					url: data.icon,
				},
				name: data.name,
				context: {
					text: data.charName,
					icon: null,
				},
				tags: data.tags,
				contents: [
					{
						title: null,
						description: format(data.description),
					},
				],
				table: data.multiplyers,
				copyright: config.copyright,
				prefix: config.prefix,
			};
		}

		static constellation(data) {
			return {
				theme: data.element,
				icon: {
					svgFrame: svg.circl,
					style: "talent",
					url: data.icon,
				},
				name: data.name,
				context: {
					text: data.charName,
					icon: null,
				},
				tags: data.tags,
				contents: [
					{
						title: null,
						description: format(data.description),
					},
				],
				lore: data.lore,
				copyright: config.copyright,
				prefix: config.prefix,
			};
		}
	}

	let curveData;
	let locData;

	function loadData(fetcher) {
		fetcher(apiUrl.weaponCurve())
			.then((response) => {
				curveData = response;
			})
			.catch(() => {
				setTimeout(() => {
					loadData();
				}, 5000);
			});
		fetcher(apiUrl.loc())
			.then((response) => {
				locData = response;
			})
			.catch(() => {
				setTimeout(() => {
					loadData();
				}, 5000);
			});
	}

	const moduleConfig = {};
	moduleConfig[config.prefix] = {
		DataFormat,
		ItemTemplate,
		loadData,
		apiUrl,
	};

	global.dispatchEvent(
		new CustomEvent("enkatooltips:sync:module", { detail: moduleConfig }),
	);

	global.addEventListener("enkatooltips:sync:host", () => {
		global.dispatchEvent(
			new CustomEvent("enkatooltips:sync:module", {
				detail: moduleConfig,
			}),
		);
	});
})(window);
