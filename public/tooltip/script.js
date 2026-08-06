((global) => {
	if (global.__ambrTooltip__?.host) {
		return;
	}

	const gameModuleMap = {};
	let isHovered = false;
	let abortState;
	let lastMouseMove;
	const fetchCache = {};
	const dotTemplateCache = {};
	const innerWidth = 0 + global.innerWidth;

	async function fetchData(url, abortController) {
		if (fetchCache[url]) {
			return fetchCache[url];
		}

		const response = await fetch(url, {
			signal: abortController?.signal,
		});
		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}
		const json = await response.json();
		fetchCache[url] = json;
		return json;
	}
	// global.fetchData = fetchData;

	const loadScript = (url) => {
		return new Promise((resolve, reject) => {
			const s = document.createElement("script");
			s.src = url;
			s.onload = () => resolve(s);
			s.onerror = () => reject(new Error(`Failed to load ${url}`));
			document.head.appendChild(s);
		});
	};

	/* todo remove because it will break for people once libs are on the host */
	const base = document.location.host.endsWith("localhost:5173")
		? ""
		: "https://enka.network";

	loadScript(base + "/js/tooltip/v2/libraries/doT.js")
		.then(() => {
			console.log("doT loaded");
			return loadScript(base + "/js/tooltip/v2/libraries/expr-eval.js");
		})
		.then(() => {
			console.log("expr-eval loaded");
		})
		.catch(console.error);

	async function getDotTemplate(name) {
		if (dotTemplateCache[name]) {
			return dotTemplateCache[name];
		}
		const response = `
<div class="AmbrTooltip {{= it.theme ?? ''}} {{= it.prefix ?? ''}}">
  <div class="header">
    {{? !it.noIcon}}
      <div class="icon {{=it.icon.style}}">
        <div class="iconContainer">
          {{? it.icon.svgFrame}}
            <svg xmlns="http://www.w3.org/2000/svg" class="" viewBox="{{=it.icon.svgFrame.viewBox}}">
              {{=it.icon.svgFrame.content}}
            </svg>
          {{?}}
          {{? it.icon.url}}
            <img class="image" src="{{=it.icon.url}}" alt=""/>
          {{?}}
        </div>
      </div>
    {{?}}

    {{? !it.noTitle}}
      {{? it.context}}
        <div class="context">
          {{? it.context.icon}}
            <div
              class="contextIcon"
              style="background-image: url({{=it.context.icon}})"
            ></div>
          {{?}}
          <span>{{=it.context.text}}</span>
        </div>
      {{?}}
      <div class="name">
        {{? it.nameIcon}}
          <svg xmlns="http://www.w3.org/2000/svg" class="nameSvg {{=it.nameIcon.style ?? ''}}" viewBox="{{=it.nameIcon.svg.viewBox}}">
              {{=it.nameIcon.svg.content}}
          </svg>{{?}}<span>{{=it.name}}</span>
      </div>
    {{?}}

    <div class="tag-row">
      {{~it.tags :tag:i}}
        <div class="tag {{=tag.style}}">
          {{? tag.svg}}
            <svg xmlns="http://www.w3.org/2000/svg" class="" viewBox="{{=tag.svg.viewBox}}">
              {{=tag.svg.content}}
            </svg>
          {{?}}
          <span>{{=tag.text}}</span>
        </div>
      {{~}}
    </div>
  </div>

  <div class="scrollContent">
    {{~it.contents :item:i}}
      {{? item.title }}
        <div class="title {{=item.state}}">{{=item.title}}
          {{? item.label}}
            <span class="{{=item.label.style}}">{{=item.label.text}}</span>
          {{?}}
        </div>
      {{?}}
	  {{? item.description}}
		<div class="description {{=item.state}}">
			{{=item.description}}
		</div>
	  {{?}}
      {{? item.multiplyers}}
        <div class="table">
          {{~item.multiplyers :k:j}}
            <div class="tableStat">
              <span style="color:wheat">{{=k[0]}}</span><span>{{=k[1]}}</span>
            </div>
          {{~}}
        </div>
      {{?}}
      {{= (i != it.contents.length-1) ? '<div class="contentGap"></div>' : ''}}
    {{~}}

    {{? !it.noLore || it.table}}
      <hr />
    {{?}}

    {{? it.table}}
      <div class="table">
        {{~it.table :item:i}}
          <div class="tableStat">
            <span style="color:wheat">{{=item[0]}}</span><span>{{=item[1]}}</span>
          </div>
        {{~}}
      </div>
    {{?}}

    {{? it.lore && !it.noLore}}
      <div class="lore">
        <span>{{=it.lore}}</span>
      </div>
    {{?}}

    <div class="copyright">{{=it.copyright}}</div>

  </div>

  <svg xmlns="http://www.w3.org/2000/svg" class="keyboardArrowDown" viewBox= "0 0 768 768">
    <path fill="currentColor" d="M236.993 265.498l147 147 147-147 45 45-192 192-192-192z"></path>
  </svg>
</div>
`;
		const templateStr = await response;
		const dotTemplate = doT.template(templateStr);
		dotTemplateCache[name] = dotTemplate;
		return dotTemplate;
	}

	function createTooltipModule() {
		const module = document.createElement("div");
		document.body.appendChild(module);
		return module;
	}

	function positionTooltip(event, tooltip) {
		if (!tooltip) return;
		const element = event.target;
		const rect = element.getBoundingClientRect();
		const viewportBottom =
			global.innerHeight + document.documentElement.scrollTop;
		const viewportRight =
			document.documentElement.offsetWidth +
			document.documentElement.offsetLeft -
			document.documentElement.scrollLeft;

		var leftOffset = 20;
		var left = event.clientX + leftOffset;
		tooltip.style.left = left + "px";

		const isMobile = innerWidth <= 600;
		const isRightSide = left >= innerWidth / 2;
		const tooltipRight = tooltip.offsetWidth + tooltip.offsetLeft;
		const isTooRight = isMobile ? isRightSide : (viewportRight < tooltipRight + leftOffset);
		const targetLeft = isTooRight
			? left - tooltip.offsetWidth - leftOffset - 10
			: left;
		tooltip.style.left = targetLeft + "px";

		var topOffest = 70;
		var top =
			event.clientY + document.documentElement.scrollTop - topOffest;
		tooltip.style.top = top + "px";

		const tooltipBottom = tooltip.offsetHeight + tooltip.offsetTop;
		tooltip.style.top =
			Math.max(32, Math.min(viewportBottom - tooltipBottom + top, top)) +
			"px";
	}

	function hideTooltip(tooltip) {
		if (!tooltip) return;
		tooltip.style.display = "none";
	}

	function setScrollArrowState() {
		scrollContent = ambrModule.querySelector(".scrollContent");
		arrowDown = ambrModule.querySelector(".keyboardArrowDown");
		if (
			scrollContent.scrollHeight - scrollContent.offsetHeight ==
			scrollContent.scrollTop
		) {
			arrowDown.style.display = "none";
		} else {
			arrowDown.style.display = "block";
		}
	}

	const defaultLang = "EN";
	function langFormat(lang = "") {
		lang = lang ? lang.toUpperCase() : defaultLang;
		switch (lang) {
			case "ZH-TW":
				lang = "CHT";
				break;
			case "ZH-CN":
				lang = "CHS";
				break;
			case "JA":
				lang = "JP";
				break;
			case "KO":
				lang = "KR";
				break;
		}
		return lang;
	}

	function retrieveElementData(element, prefix) {
		const item = {
			id: element.getAttribute(`data-${prefix}-id`),
			type: element.getAttribute(`data-${prefix}-type`),
			level: element.getAttribute(`data-${prefix}-level`),
			index: element.getAttribute(`data-${prefix}-index`),
			id_b: element.getAttribute(`data-${prefix}-id-b`),
			promote: element.getAttribute(`data-${prefix}-promote`),
			upgrade: element.getAttribute(`data-${prefix}-upgrade`),
			lang: element.getAttribute(`data-${prefix}-lang`),
			args: element.getAttribute(`data-${prefix}-args`),
			noIcon: !!element.getAttribute(`data-${prefix}-no-icon`),
			noTitle: !!element.getAttribute(`data-${prefix}-no-title`),
			lore: !!element.getAttribute(`data-${prefix}-lore`),
		};
		return item;
	}

	function attachAmbrTooltipEventListener(element) {
		if (element.__giTooltip__) return;

		element.addEventListener("mouseenter", async () => {
			isHovered = true;
			const gameModule = gameModuleMap[element.__prefix__];
			var item = retrieveElementData(element, element.__prefix__);
			item.lang = langFormat(item.lang);
			try {
				abortState = new AbortController();
				const url = gameModule.apiUrl[item.type](item);
				const data = await fetchData(url, abortState);
				var formatedData = gameModule.DataFormat[item.type](data, item);
				const tmplData =
					gameModule.ItemTemplate[item.type](formatedData);
				tmplData.noIcon = item.noIcon;
				tmplData.noTitle = item.noTitle;
				tmplData.noLore = !item.lore;

				const tooltipTemplate = await getDotTemplate("tooltip");
				ambrModule.innerHTML = tooltipTemplate(tmplData);
				setScrollArrowState();
				positionTooltip(
					lastMouseMove,
					ambrModule.querySelector("div.AmbrTooltip"),
				);
			} catch (error) {
				hideTooltip(ambrModule.querySelector("div.AmbrTooltip"));
				if (error?.name != "AbortError") console.log(error);
			}
		});

		element.addEventListener("mouseleave", () => {
			isHovered = false;
			if (abortState) {
				abortState.abort();
				abortState = null;
			}
			const content = ambrModule.querySelector(".scrollContent");
			if (content) content.scrollTop = 0;
			hideTooltip(ambrModule.querySelector("div.AmbrTooltip"));
		});

		element.addEventListener("mousemove", (event) => {
			if (!isHovered) {
				return;
			}
			lastMouseMove = event;
			positionTooltip(event, ambrModule.querySelector("div.AmbrTooltip"));
		});

		element.addEventListener("wheel", (event) => {
			if (!isHovered) return;
			if (scrollContent.scrollHeight > scrollContent.offsetHeight) {
				event.preventDefault();
			}

			scrollContent = ambrModule.querySelector(".scrollContent");
			scrollContent.scrollTop += event.deltaY;
			setScrollArrowState();
		});

		element.__giTooltip__ = true;
	}

	function scanAndAttachTooltipEvents() {
		const prefixes = ["gi", "hsr", "zzz", "ef"];
		const types = [
			"weapon",
			"artifact",
			"talent",
			"constellation",
			"medal",
		];
		for (var prefix of prefixes) {
			const selector = types
				.map((type) => `[data-${prefix}-type="${type}"]`)
				.join(", ");
			const elements = document.querySelectorAll(selector);
			elements.forEach((element) => {
				element.__prefix__ = prefix;
				attachAmbrTooltipEventListener(element);
			});
		}
	}

	var ambrModule = createTooltipModule();

	if (!global.__ambrTooltip__) {
		global.__ambrTooltip__ = {};
	}
	global.__ambrTooltip__.host = true;

	const attach = (event) => {
		const game = Object.keys(event.detail)[0];

		console.log("Game module loaded:", game);
		const module = event.detail[game];
		Object.assign(gameModuleMap, event.detail);
		module.loadData(fetchData);

		global.__ambrTooltip__[game] = true;

		scanAndAttachTooltipEvents();
		const observer = new MutationObserver(() => {
			scanAndAttachTooltipEvents();
		});
		const config = { childList: true, subtree: true, attributes: false };
		observer.observe(document.body, config);
	};

	global.addEventListener("enkatooltips:sync:module", attach);
	global.dispatchEvent(new Event("enkatooltips:sync:host"));
})(window);
