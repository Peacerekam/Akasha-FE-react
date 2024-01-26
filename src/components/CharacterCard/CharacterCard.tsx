import "./style.scss";

import { Chart as ChartJS, registerables } from "chart.js";
import {
  ELEMENT_TO_COLOR,
  calcStatVals,
  handleTitle,
  scales,
  setGradientFromImage,
  toTalentProps,
} from "./cardHelpers";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { applyModalBodyStyle, getRelativeCoords } from "../CustomTable/Filters";
import {
  ascensionToLevel,
  delay,
  getArtifactsInOrder,
  getGenderFromIcon,
  toEnkaUrl,
} from "../../utils/helpers";
import {
  faCog,
  faDownload,
  faLock,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import html2canvas, { Options } from "html2canvas";

import { AdProviderContext } from "../../context/AdProvider/AdProviderContext";
import {
  CompactArtifact,
} from "../ArtifactListCompact";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FriendshipIcon from "../../assets/icons/Item_Companionship_EXP.png";
import { MetricContext } from "../../context/MetricProvider/MetricProvider";
import { PreviewModal } from "./PreviewModal";
import { Radar } from "react-chartjs-2";
import RarityStar from "../../assets/images/star.png";
import ReactSelect from "react-select";
import { RollList } from "../RollList";
import { Spinner } from "../Spinner";
import { StatListCard } from "../StatListCard";
import { TalentDisplay } from "./TalentDisplay";
import { TeammatesCompact } from "../TeammatesCompact";
import { TranslationContext } from "../../context/TranslationProvider/TranslationProviderContext";
import { WeaponMiniDisplay } from "../WeaponMiniDisplay";
import { reactSelectCustomFilterTheme } from "../../utils/reactSelectCustomFilterTheme";
import { useLocation } from "react-router-dom";

// import imglyRemoveBackground, { Config } from "@imgly/background-removal";

// import { toBlob, toPng } from "html-to-image";

ChartJS.register(...registerables);

type CharacterCardProps = {
  row: any;
  artifacts: any[];
  _calculations: any;
  setSelectedCalculationId?: any;
  errorCallback?: () => {};
};

export const CharacterCard: React.FC<CharacterCardProps> = ({
  row,
  artifacts,
  _calculations,
  setSelectedCalculationId,
  errorCallback,
}) => {
  const [width, setWidth] = useState<number>(window.innerWidth);
  // const [bgRemDownload, setBgRemDownload] = useState<number>(-1);
  // const [bgRemLoading, setBgRemLoading] = useState<boolean>(false);
  const [namecardBg, setNamecardBg] = useState<boolean>();
  const [simplifyColors, setSimplifyColors] = useState<boolean>();
  const [adaptiveBgColor, setAdaptiveBgColor] = useState<boolean>();
  const [displayBuildName, setDisplayBuildName] = useState<boolean>();
  const [privacyFlag, setPrivacyFlag] = useState<boolean>();
  const [toggleConfigure, setToggleConfigure] = useState(false);
  const [generating, setGenerating] = useState<
    "opening" | "downloading" | false
  >(false);
  const [hasCustomBg, setHasCustomBg] = useState<
    "vertical" | "horizontal" | ""
  >("");
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [imagePreviewBlob, setImagePreviewBlob] = useState<Blob>();
  const [filteredLeaderboards, setFilteredLeaderboards] = useState<any[]>([]);
  const [adaptiveColors, setAdaptiveColors] = useState<[string[], string[]]>();

  const uploadPictureInputRef = useRef<HTMLInputElement>(null);
  const backgroundPictureRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasBgRef = useRef<HTMLCanvasElement>(null);

  const { translate } = useContext(TranslationContext);
  const { contentWidth } = useContext(AdProviderContext);
  const { metric, customRvFilter } = useContext(MetricContext);

  const cardErrorCallback = async () => {
    if (!errorCallback) return;

    console.log("\nRerendering character card...", row.name, row.type);
    errorCallback();
  };

  const calculations = _calculations.calculations;
  const chartsData = _calculations.chartsData;

  const hardcodedScale = +Math.max(
    0.87,
    contentWidth ? contentWidth / 1280 : 1
  ).toFixed(3);
  const canvasWidth = 500 * hardcodedScale;
  const canvasHeight = 485 * hardcodedScale;

  const canvasBgWidth = 1200 * hardcodedScale;
  const canvasBgHeight = 485 * hardcodedScale;

  const canvasPixelDensity = 2;

  const location = useLocation();
  const DEBUG_MODE = location.search?.includes("debug");

  const noElementColor = "#ffffff";
  const elementKey = chartsData?.characterMetadata?.element;
  const elementalColor = ELEMENT_TO_COLOR[elementKey];
  // const namecardBgUrl = toEnkaUrl(chartsData?.characterMetadata?.namecard);
  // const elementalBgUrl = `/elementalBackgrounds/${chartsData?.characterMetadata?.element}-bg.jpg`;
  // const actualBgUrl = namecardBg ? namecardBgUrl : elementalBgUrl;
  // const elementalBg = `url(/elementalBackgrounds/${chartsData?.characterMetadata?.element}-bg.png)`

  const cardStyle = {
    // "--hue-rotate": `${
    //   ELEMENT_TO_HUE[chartsData?.characterMetadata?.element]
    // }deg`,
    // "--elemental-bg": `url(${elementalBgUrl})`,
    "--element-color": elementalColor || noElementColor,
    "--element-color-2": `${elementalColor || noElementColor}70`,
    // "--character-namecard-url": `url(${actualBgUrl})`,
  } as React.CSSProperties;

  // load from local storage
  useEffect(() => {
    const savedObj = JSON.parse(localStorage.getItem("cardSettings") ?? "{}");

    const setIfDifferent = (setFunc: any, key: string, value: any) => {
      setFunc(savedObj[key] || value || false);
    };

    setIfDifferent(setDisplayBuildName, "displayBuildName", displayBuildName);
    setIfDifferent(setSimplifyColors, "simplifyColors", simplifyColors);
    setIfDifferent(setAdaptiveBgColor, "adaptiveBgColor", adaptiveBgColor);
    setIfDifferent(setNamecardBg, "namecardBg", namecardBg);
    setIfDifferent(setPrivacyFlag, "privacyFlag", privacyFlag);

    console.log("\nLoading Character Card settings from Local Storage:");
    console.table(savedObj);
  }, [localStorage]);

  // save to local storage
  useEffect(() => {
    const oldObj = JSON.parse(localStorage.getItem("cardSettings") ?? "{}");
    let dirty = false;

    const assignIfDiffAndNotUndefined = (key: string, value: any) => {
      if (oldObj[key] !== value && value !== undefined) {
        console.log(`${key}: ${oldObj[key]} -> ${value}`);
        oldObj[key] = value;
        dirty = true;
      }
    };

    assignIfDiffAndNotUndefined("displayBuildName", displayBuildName);
    assignIfDiffAndNotUndefined("simplifyColors", simplifyColors);
    assignIfDiffAndNotUndefined("adaptiveBgColor", adaptiveBgColor);
    assignIfDiffAndNotUndefined("namecardBg", namecardBg);
    assignIfDiffAndNotUndefined("privacyFlag", privacyFlag);

    if (!dirty) return;

    const newObj = { ...oldObj };
    localStorage.setItem("cardSettings", JSON.stringify(newObj));
  }, [
    displayBuildName,
    simplifyColors,
    adaptiveBgColor,
    namecardBg,
    privacyFlag,
  ]);

  const handleToggleModal = (event: React.MouseEvent<HTMLElement>) => {
    setShowPreviewModal((prev) => !prev);

    const offsets = getRelativeCoords(event);
    applyModalBodyStyle(offsets);
  };

  const handleWindowSizeChange = () => {
    setWidth(window.innerWidth);
  };

  const getReadableStatText = (_statName: string) => {
    const textMap: any = {
      maxHp: "HP",
      atk: "ATK",
      def: "DEF",
      elementalMastery: "EM",
      energyRecharge: "ER%",
      critRate: "Crit Rate",
      healingBonus: "Healing Bonus",
      critDamage: "Crit DMG",
    };

    const output =
      textMap[_statName] ||
      (_statName.endsWith("DamageBonus")
        ? `${_statName[0].toUpperCase()}${_statName
            .slice(1, _statName.length)
            .replace("DamageBonus", " DMG")}`
        : _statName);

    return translate(output);
  };

  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);

    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !backgroundPictureRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx!.scale(canvasPixelDensity, canvasPixelDensity);
  }, [canvasRef, backgroundPictureRef]);

  useEffect(() => {
    if (!backgroundPictureRef.current) return;
    if (adaptiveBgColor === undefined || namecardBg === undefined) return;

    const mode = !uploadPictureInputRef?.current?.files?.[0] && "gacha";
    const coldStart = true;

    const maybePaintImageToCanvas = async (i = 0) => {
      if (!backgroundPictureRef.current) return;
      if (i > 5) {
        cardErrorCallback();
        return;
      }

      try {
        paintImageToCanvas(backgroundPictureRef.current.src, mode, coldStart);
      } catch (err) {
        // second time's a charm
        await delay(10);
        maybePaintImageToCanvas(i + 1);
      }
    };

    setIsLoadingImage(true);

    maybePaintImageToCanvas();

    backgroundPictureRef.current.addEventListener("load", () => {
      setIsLoadingImage(false);
    });
  }, [backgroundPictureRef, adaptiveBgColor, namecardBg]);

  const calculationIds = useMemo(
    () =>
      Object.keys(calculations ?? []).sort((a: any, b: any) => {
        const _aRank = ("" + calculations[a].ranking)?.replace("~", "");
        const _bRank = ("" + calculations[b].ranking)?.replace("~", "");

        const _aVal = _aRank.startsWith("(")
          ? _aRank.slice(1, _aRank.length - 1)
          : _aRank;

        const _bVal = _bRank.startsWith("(")
          ? _bRank.slice(1, _bRank.length - 1)
          : _bRank;

        const _a = calculations[a];
        const _b = calculations[b];

        const topA_ = +_aVal / _a.outOf;
        const topB_ = +_bVal / _b.outOf;

        const isTop1_a = Math.min(100, Math.ceil(topA_ * 100)) === 1;
        const isTop1_b = Math.min(100, Math.ceil(topB_ * 100)) === 1;

        const _priority = _b.priority - _a.priority;

        if (_priority !== 0) {
          return _priority;
        }

        if (isTop1_a && isTop1_b) {
          return +_aVal - +_bVal;
        }

        return topA_ - topB_;

        // return (
        //   _b.priority - _a.priority ||
        //   (isTop1_a && isTop1_b ? +_aVal - +_bVal : topA_ - topB_)
        // );

        // return +valA < +valB ? -1 : 1;
      }),
    [calculations]
  );

  useEffect(() => {
    const _calculationId = calculationIds.slice(0, 1);
    setFilteredLeaderboards(_calculationId);
    setSelectedCalculationId(_calculationId?.[0]);
  }, [calculationIds]);

  const displayCharts = useCallback(
    (chartData: any, calculationId: string) => {
      if (!chartData?.avgStats) return <></>;

      const {
        pyroDamageBonus,
        hydroDamageBonus,
        cryoDamageBonus,
        dendroDamageBonus,
        electroDamageBonus,
        anemoDamageBonus,
        geoDamageBonus,
        physicalDamageBonus,
      } = chartData.avgStats;

      const dmgStats: any[] = [
        {
          name: "pyroDamageBonus",
          value: pyroDamageBonus,
        },
        {
          name: "electroDamageBonus",
          value: electroDamageBonus,
        },
        {
          name: "cryoDamageBonus",
          value: cryoDamageBonus,
        },
        {
          name: "geoDamageBonus",
          value: geoDamageBonus,
        },
        {
          name: "dendroDamageBonus",
          value: dendroDamageBonus,
        },
        {
          name: "anemoDamageBonus",
          value: anemoDamageBonus,
        },
        {
          name: "hydroDamageBonus",
          value: hydroDamageBonus,
        },
        {
          name: "physicalDamageBonus",
          value: physicalDamageBonus,
        },
      ];

      const sorted = dmgStats
        .sort((a, b) => {
          const numA = +(a.value || 0);
          const numB = +(b.value || 0);
          return numA > numB ? -1 : 1;
        })
        .slice(0, 5);

      const lowestDmg =
        sorted.length > 1 ? +sorted[sorted.length - 1].value : 0;

      const relevantDamageTypes = sorted.filter(
        (a: any) => +a.value !== lowestDmg && +a.value > 0.14 && !isNaN(a.value)
      );

      const relevantStatNames = Object.keys(chartData.avgStats).filter(
        (statName: string) =>
          !(
            statName.endsWith("DamageBonus") &&
            !relevantDamageTypes.find((x) => x.name === statName)
          )
      );

      let percentagesArray = relevantStatNames.map((statName: string) => {
        const calcStat = calcStatVals(statName);

        const calculatedVal = calcStat.value(
          calculations[calculationId]?.stats?.[calcStat.key]
        );

        const calcStatPercentage = calculatedVal / chartData.avgStats[statName];

        const getExtragrated = (weight: number) => {
          const _a =
            {
              maxDEF: calculatedVal + 750,
              elementalMastery:
                calculatedVal > chartData.avgStats[statName]
                  ? calculatedVal + 150
                  : calculatedVal,
              critRate:
                chartData.avgStats[statName] < 0
                  ? Math.abs(chartData.avgStats[statName]) * 2
                  : calculatedVal,
            }[calcStat.key] || calculatedVal;

          const _b =
            {
              maxDEF: chartData.avgStats[statName] + 750,
              elementalMastery:
                calculatedVal > chartData.avgStats[statName]
                  ? chartData.avgStats[statName] + 150
                  : chartData.avgStats[statName],
              critRate:
                chartData.avgStats[statName] < 0
                  ? Math.abs(chartData.avgStats[statName] + calculatedVal)
                  : chartData.avgStats[statName],
            }[calcStat.key] || chartData.avgStats[statName];

          const _rel = _a - _b;
          return (_rel * weight + _b) / _b;
        };

        const percentAdjustment = statName.endsWith("DamageBonus")
          ? getExtragrated(1.5)
          : {
              critRate: getExtragrated(2),
              critDamage: getExtragrated(2),
              maxHp: getExtragrated(2.5),
              atk: getExtragrated(3),
              def: getExtragrated(3),
              elementalMastery: getExtragrated(2),
              energyRecharge: getExtragrated(3),
            }[statName] || calcStatPercentage;

        const _percent = percentAdjustment * 100;
        // return _percent;
        return {
          _p: Math.max(10, Math.min(170, _percent)),
          calculatedVal,
          avg: chartData.avgStats[statName],
          statName,
        };
      });

      const neutralWhiteColor = "rgba(255, 255, 255, 0.35)";
      const elementColor =
        ELEMENT_TO_COLOR[chartsData?.characterMetadata?.element];

      percentagesArray = percentagesArray.filter((x) => {
        // const isZero = 0 === x.calculatedVal && 0 === x.avg;
        const isNearZero =
          x.avg >= 0 &&
          x.avg <= 0.001 &&
          x.calculatedVal >= 0 &&
          x.calculatedVal <= 0.001;
        return !isNearZero;
      });

      const data = {
        labels: percentagesArray.map((x) => x.statName),
        datasets: [
          {
            pointHitRadius: 45 * hardcodedScale,
            label: `${row.type === "current" ? row.name : row.type}`,
            data: percentagesArray.map((x) => x._p),
            vals: percentagesArray.map((x) => x.calculatedVal),
            fill: true,
            backgroundColor: `${elementColor}45`,
            borderColor: `${elementColor}bb`,
            pointBackgroundColor: `${elementColor}bb`,
            pointBorderColor: `${elementColor}bb`,
            pointHoverBackgroundColor: generating ? neutralWhiteColor : `red`,
            pointHoverBorderColor: generating ? neutralWhiteColor : `white`,
          },
          {
            pointHitRadius: 45 * hardcodedScale,
            label: "TOP 1% AVG",
            data: percentagesArray.map((_) => 100),
            vals: percentagesArray.map((x) => x.avg),
            fill: false,
            backgroundColor: "transparent",
            borderColor: neutralWhiteColor,
            pointBackgroundColor: neutralWhiteColor,
            pointBorderColor: neutralWhiteColor,
            pointHoverBackgroundColor: generating ? neutralWhiteColor : `red`,
            pointHoverBorderColor: generating ? neutralWhiteColor : `white`,
          },
        ],
      };

      const plugins = {
        tooltip: {
          enabled: generating ? false : true,
          callbacks: {
            title: handleTitle,
            label: (obj: any) => {
              if (!obj) return "";
              if (!obj.dataset) return "";

              const statName = getReadableStatText(obj.label);
              const calcStat = calcStatVals(obj.label, true);

              const calculatedVal = calcStat
                .value(obj.dataset.vals[obj.dataIndex])
                .toFixed(1);

              return `${statName}: ${calculatedVal}`;
            },
          },
        },
        legend: {
          display: false,
        },
      };

      scales.r.pointLabels.callback = (statName: string, index: number) => {
        const translatedWord = getReadableStatText(statName);

        if (translatedWord.length > 13) {
          const _split = translatedWord.split(" ");

          if (_split.length > 2) {
            return _split.reduce(
              (acc, val, index) => {
                const mid = Math.floor(_split.length / 2);
                const lineNum = index >= mid ? 1 : 0;

                if (!acc[lineNum]) {
                  acc[lineNum] = val;
                } else {
                  acc[lineNum] += ` ${val}`;
                }

                return acc;
              },
              ["", ""]
            );
          }

          return _split;
        }

        return translatedWord;
      };

      scales.r.pointLabels.font.size = 9 * hardcodedScale;

      const radarOptions = {
        devicePixelRatio: 2,
        plugins,
        scales,
        elements: {
          point: {
            radius: 3 * hardcodedScale,
            hoverRadius: 3 * hardcodedScale,
            hoverBorderWidth: 1 * hardcodedScale,
          },
          line: {
            borderWidth: 2 * hardcodedScale,
          },
        },
      };

      return (
        <div className="chart-radar-wrapper">
          <Radar data={data} options={radarOptions} />
        </div>
      );
    },
    [row, calculations, chartsData, filteredLeaderboards, generating, translate]
  );

  const leaderboardHighlighs = useMemo(() => {
    return (
      <div className="card-leaderboards relative">
        {filteredLeaderboards.map((id: any) => {
          const calc = calculations[id];
          if (!calc) return <div key={id} />;

          const {
            // name,
            ranking,
            outOf,
            // details,
            // weapon,
            // result,
            // stats,
            variant,
            // calculationId,
            short,
          } = calc;

          const leaveOnlyNumbersRegex = /\D+/g;
          const _ranking = +(ranking + "")?.replace(leaveOnlyNumbersRegex, "");
          const _top = ranking
            ? `TOP ${
                Math.min(100, Math.ceil((_ranking / outOf) * 100)) || "?"
              }%`
            : "";

          const topBadge = (
            <span className="lb-badge" style={{ marginRight: 5 }}>
              <span>{_top}</span>
            </span>
          );

          const lbBadge = (
            <span className="lb-badge">
              <img alt="" className="weapon-icon" src={calc.weapon.icon} />
              <span>
                {short}{" "}
                {variant?.displayName?.replace("C6", "").replace("C2", "")}
              </span>
            </span>
          );

          const thisChartData = chartsData?.charts1pMetadata?.find(
            (x: any) => x.calculationId === id
          );

          return (
            <div key={id}>
              <div>{displayCharts(thisChartData, id)}</div>
              <div className="under-chart">
                <TeammatesCompact
                  teammates={calc.teammates}
                  scale={1.7 * hardcodedScale}
                />
                <span className="under-chart-badges">
                  {topBadge}
                  {lbBadge}
                </span>
                {/* <div>{shorterName}</div> */}
                {privacyFlag ? (
                  ""
                ) : (
                  <div>
                    {ranking ?? (
                      <span title="Rankings are cached. If you see this you need to refresh the page">
                        -
                      </span>
                    )}
                    <span className="opacity-5">/{outOf || "???"}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [privacyFlag, chartsData, filteredLeaderboards, generating, translate]);

  const reorderedArtifacts = useMemo(
    () => getArtifactsInOrder(artifacts, true),
    [JSON.stringify(artifacts)]
  );

  const compactList = useMemo(() => {
    const namecardBgUrl = toEnkaUrl(chartsData?.characterMetadata?.namecard);
    const elementalBgUrl = `/elementalBackgrounds/${chartsData?.characterMetadata?.element}-bg.jpg`;
    const actualBgUrl = namecardBg ? namecardBgUrl : elementalBgUrl;
    return reorderedArtifacts.map((artifact: any) => {
      return (
        <CompactArtifact
          key={artifact._id}
          artifact={artifact}
          row={row}
          canvasBgProps={{
            backgroundImage: actualBgUrl,
            adaptiveBgColor,
            namecardBg,
            adaptiveColors,
            hardcodedScale,
          }}
        />
      );
    });
  }, [
    JSON.stringify(reorderedArtifacts),
    chartsData,
    adaptiveBgColor,
    adaptiveColors,
    row,
    namecardBg,
    simplifyColors,
    metric,
    customRvFilter[row.name]?.length,
  ]);

  const artifactsDiv =
    reorderedArtifacts.length > 0 ? compactList : "no artifacts equipped";

  const paintImageToCanvas = useCallback(
    async (
      result: string,
      mode?: string | boolean,
      coldStart?: boolean,
      removeBg?: boolean
    ) => {
      if (!canvasBgRef?.current) return;
      if (!backgroundPictureRef?.current) return;

      const characterImg = backgroundPictureRef?.current;

      characterImg.crossOrigin = "anonymous";

      const isCustomBg = mode !== "gacha";
      const _result = result + "";

      if (removeBg && isCustomBg) {
        /*
        setBgRemLoading(true);

        // Custom Asset Serving
        // Currently, the wasm and onnx neural networks are served via unpkg.
        // For production use, we advise you to host them yourself.
        // Therefore, copy all .wasm and .onnx files to your public path $PUBLIC_PATH and reconfigure the library.
        const config: Config = {
          debug: true,
          // model: "small",
          // publicPath: "https://example.com/assets/", // path to the wasm files
          progress: (key, current, total) => {
            console.log(`Downloading ${key}: ${current} of ${total}`);
            setBgRemDownload((current / total) * 100);
          },
        };

        let imgBgRemovedBlob = null;

        try {
          imgBgRemovedBlob = await imglyRemoveBackground(_result, {
            ...config,
            // fetchArgs: { mode: "no-cors" },
          });
        } catch (err) {
          imgBgRemovedBlob = await imglyRemoveBackground(_result, {
            ...config,
            fetchArgs: { mode: "no-cors" },
          });
        }

        characterImg.src = imgBgRemovedBlob
          ? URL.createObjectURL(imgBgRemovedBlob)
          : "";

        setBgRemLoading(false);
        */
      } else {
        characterImg.src = _result;
      }

      const namecardBgUrl = toEnkaUrl(chartsData?.characterMetadata?.namecard);
      const elementalBgUrl = `/elementalBackgrounds/${chartsData?.characterMetadata?.element}-bg.jpg`;
      const actualBgUrl = namecardBg ? namecardBgUrl : elementalBgUrl;

      const elementalOrNamecardBgImg = new Image();
      elementalOrNamecardBgImg.crossOrigin = "anonymous";
      elementalOrNamecardBgImg.src = actualBgUrl;

      const bgWidth = canvasPixelDensity * canvasBgWidth;
      const bgHeight = canvasPixelDensity * canvasBgHeight;

      const backgroundCtx = canvasBgRef?.current?.getContext("2d");

      const drawBackground = async (i = 0) => {
        if (!canvasBgRef.current) return;
        if (i > 5) {
          cardErrorCallback();
          return;
        }

        // clear canvas
        backgroundCtx!.globalCompositeOperation = "source-out";
        backgroundCtx!.clearRect(0, 0, bgWidth, bgHeight);
        backgroundCtx!.filter = "contrast(100%)";

        try {
          if (namecardBg) {
            const namecardHeight = canvasPixelDensity * 572;
            const yOffset = -(namecardHeight - bgHeight);
            backgroundCtx!.drawImage(
              elementalOrNamecardBgImg,
              0,
              yOffset,
              bgWidth,
              namecardHeight
            );
          } else {
            backgroundCtx!.drawImage(
              elementalOrNamecardBgImg,
              0,
              0,
              bgWidth,
              bgHeight
            );
          }
        } catch (err) {
          console.log(err);
          await delay(10);
          await drawBackground(i + 1);
        }

        // return backgroundCtx;
      };

      const images = [characterImg, elementalOrNamecardBgImg];

      const allPromises = images.map((image: any) => {
        if (!image) return new Promise((resolve) => resolve(true));

        return new Promise((resolve) => {
          image.onload = async () => {
            if (coldStart) {
              await delay(10);
              await drawBackground();
            }
            resolve(true);
          };
          image.onerror = async () => {
            resolve(true);
          };
        });
      });

      await Promise.all(allPromises);
      await drawBackground();

      if (coldStart) {
        await delay(10);
      }

      if (characterImg.classList.contains("invalid-picture")) return;

      // characterImg.onload = () => resolve()
      // elementalOrNamecardBgImg.onload = () => resolve()

      if (!canvasRef.current) return;

      // Once the image is loaded, we will get the width & height of the image

      const imageWidth = characterImg.width;
      const imageHeight = characterImg.height;

      // width    2048
      // height   1024

      const _canvasWidth = mode === "gacha" ? canvasWidth * 1.55 : canvasWidth;
      const _canvasHeight =
        mode === "gacha" ? canvasHeight * 1.55 : canvasHeight;

      // get the scale
      // it is the min of the 2 ratios
      const canvasScale = Math.max(
        _canvasWidth / imageWidth,
        _canvasHeight / imageHeight
      );

      // Finding the new width and height based on the scale factor
      const newWidth = imageWidth * canvasScale;
      const newHeight = imageHeight * canvasScale;

      // get canvas context
      const characterCtx = canvasRef.current.getContext("2d");

      // Create gradient
      const gradientMask = characterCtx!.createLinearGradient(
        canvasWidth - 101 * hardcodedScale,
        0,
        canvasWidth - 3 * hardcodedScale,
        0
      );
      gradientMask.addColorStop(0, "black");
      gradientMask.addColorStop(1, "transparent");

      // clear canvas
      characterCtx!.globalCompositeOperation = "source-out";
      characterCtx!.clearRect(0, 0, canvasWidth, canvasHeight);

      // Fill with gradient
      characterCtx!.fillStyle = gradientMask;
      characterCtx!.fillRect(0, 0, canvasWidth, canvasHeight);

      // get the top left position of the image
      // in order to center the image within the canvas
      let x = _canvasWidth / 2 - newWidth / 2;
      let y = _canvasHeight / 2 - newHeight / 2;

      if (mode === "gacha") {
        if (row.name === "Traveler") {
          x = x - 100 * hardcodedScale;
          y = y + 30 * hardcodedScale;
        } else {
          x = x - 130 * hardcodedScale;
          y = y - 82 * hardcodedScale;
        }
      }

      characterCtx!.globalCompositeOperation = "source-in";
      characterCtx!.drawImage(characterImg, x, y, newWidth, newHeight);

      if (!adaptiveBgColor) return;

      const getRightEdgeData = async (i = 0) => {
        if (i > 5) {
          cardErrorCallback();
          return;
        }

        try {
          return characterCtx!.getImageData(
            Math.floor(canvasWidth * 2 - 25), // newWidth - 1, // start X
            0, // start Y
            1, // width of extracted data
            Math.floor(2 * canvasHeight - 1) // height of extracted data
          );
        } catch (err) {
          console.log(err);
          await delay(10);
          getRightEdgeData(i + 1);
        }
      };

      const rightEdgeData: any = await getRightEdgeData();

      if (!rightEdgeData) return;

      // Create gradient
      const gradientCoords = [0, 0, 0, bgHeight] as const;
      const adaptiveGradient_1 = backgroundCtx!.createLinearGradient(
        ...gradientCoords
      );

      const gradientSteps = 2;

      const setGradientFromImageDefault = (
        gradient: CanvasGradient,
        alphaOverride: string | number = "55"
      ) => {
        return setGradientFromImage(
          gradient,
          2 * canvasHeight,
          canvasWidth,
          rightEdgeData,
          gradientSteps,
          alphaOverride,
          characterCtx
        );
      };

      const solidGradientColors = setGradientFromImageDefault(
        adaptiveGradient_1,
        "ff"
      );

      backgroundCtx!.globalCompositeOperation = "color";
      backgroundCtx!.fillStyle = adaptiveGradient_1;
      backgroundCtx!.fillRect(0, 0, bgWidth, bgHeight);

      // Create gradient
      const adaptiveGradient_2 = backgroundCtx!.createLinearGradient(
        ...gradientCoords
      );

      // "multiply"
      // "overlay"
      // "color-dodge"
      // "color-burn"
      // "hard-light"
      // "soft-light"
      // "hue"
      // "color"

      const nonSolidGradientColors = setGradientFromImageDefault(
        adaptiveGradient_2,
        "55"
      );

      setAdaptiveColors([solidGradientColors, nonSolidGradientColors]);

      backgroundCtx!.globalCompositeOperation = "hard-light";
      backgroundCtx!.fillStyle = adaptiveGradient_2;
      backgroundCtx!.filter = "contrast(150%)";
      // backgroundCtx!.filter = "contrast(150%)";
      backgroundCtx!.fillRect(0, 0, bgWidth, bgHeight);
    },
    [
      canvasBgRef,
      backgroundPictureRef,
      chartsData,
      adaptiveBgColor,
      hasCustomBg,
      namecardBg,
    ]
  );

  const characterShowcase = useMemo(() => {
    const charImgUrl = toEnkaUrl(chartsData?.assets?.gachaIcon);
    const showcaseContainerClassNames = [
      "character-showcase-pic-container",
      hasCustomBg,
      row.name === "Traveler" ? "is-traveler" : "",
      generating ? "is-generating" : "",
      charImgUrl ? "" : "disable-input",
    ]
      .join(" ")
      .trim();
    return (
      <div>
        <div className="column-shadow-gradient-top" />
        <div className="column-shadow-gradient-left" />
        <div className="column-shadow-gradient-bottom" />
        {/* <div className="column-shadow-gradient" /> */}
        <div
          style={{ pointerEvents: "all" }}
          className={showcaseContainerClassNames}
          onClick={() => {
            uploadPictureInputRef?.current?.click();
          }}
        >
          <input
            ref={uploadPictureInputRef}
            style={{ display: "none", pointerEvents: "all" }}
            onChange={() => {
              const file = uploadPictureInputRef?.current?.files?.[0];
              if (!file) return;

              const reader = new FileReader();

              reader.addEventListener(
                "load",
                async (a) => {
                  paintImageToCanvas(reader.result + "");
                  setHasCustomBg("horizontal");
                },
                false
              );

              reader.readAsDataURL(file);
            }}
            type="file"
            name="filename"
          />
          <canvas
            width={canvasWidth * canvasPixelDensity}
            height={canvasHeight * canvasPixelDensity}
            style={{
              width: canvasWidth,
              height: canvasHeight,
            }}
            ref={canvasRef}
          />
          {isLoadingImage && (
            <div className="image-loading-wrapper">
              {charImgUrl ? <Spinner /> : "Something went wrong :("}
            </div>
          )}
          <img
            alt=""
            className={charImgUrl ? "" : "invalid-picture"}
            style={{ display: "none" }}
            ref={backgroundPictureRef}
            src={charImgUrl}
          />
        </div>
      </div>
    );
  }, [
    row,
    uploadPictureInputRef,
    backgroundPictureRef,
    canvasRef,
    hasCustomBg,
    generating,
    isLoadingImage,
    chartsData,
    hardcodedScale,
    // removeBg,
  ]);

  const characterStats = useMemo(
    () => (
      <div className="character-stats-inside">
        <StatListCard row={row} />
      </div>
    ),
    [row]
  );

  const characterMiddle = useMemo(
    () => (
      <div>
        <div className="character-weapon relative">
          <div className="weapon-icon">
            <img alt="" src={row.weapon.icon} />
            <div className="weapon-rarity">
              {[...Array(chartsData?.weaponMetadata?.rarity)].map((e, i) => (
                <img alt="*" key={`star-${i}`} src={RarityStar} />
              ))}
            </div>
          </div>
          <div className="weapon-data">
            <div className="weapon-name">{translate(row.weapon.name)}</div>
            <div className="weapon-stats">
              <div className="weapon-refinement">
                R{row.weapon.weaponInfo.refinementLevel.value + 1}
              </div>
              <div>
                <span>
                  {translate("Lv.")} {row.weapon.weaponInfo.level}
                </span>
                <span className="opacity-5">
                  /
                  {ascensionToLevel(
                    row.weapon.weaponInfo?.promoteLevel,
                    "weapon",
                    row.weapon.weaponInfo.level
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
        {characterStats}
        {/* <div className="card-leaderboards relative">{leaderboardHighlighs}</div> */}
      </div>
    ),
    [row, chartsData, translate]
  );

  const getBuildId = (build: any) => `${build.md5}`;

  const renderOptions = useCallback(
    (calcId: any) => {
      const c = calculations[calcId];
      if (!c) {
        return {
          label: (
            <span
              style={{ marginLeft: 5 }}
              className="react-select-custom-option"
            >
              Don't show any ranking
            </span>
          ),
          rawLabel: "Don't show any ranking",
          value: "hide",
          fieldKey: "hide",
          top: -1,
          priority: -1,
        };
      }
      const leaveOnlyNumbersRegex = /\D+/g;
      const _ranking = +(c.ranking + "")?.replace(leaveOnlyNumbersRegex, "");
      const _top = c.ranking
        ? `${Math.min(100, Math.ceil((_ranking / c.outOf) * 100)) || "?"}%`
        : "";

      const shorterName =
        c.name.length > 85 ? `${c.name.slice(0, 82)}...` : c.name;

      const label = (
        <>
          <span className="react-select-custom-option">
            <span className="for-dropdown">
              <WeaponMiniDisplay
                icon={c.weapon.icon}
                refinement={c.weapon.refinement}
              />
              <div
                style={{
                  width: 150,
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
              >
                {translate(c.weapon.name)}
              </div>
              <div style={{ width: 60 }}>top {_top}</div>
              {c.variant?.displayName
                ? `(${c.variant?.displayName}) `
                : ""}{" "}
              {shorterName}
            </span>
            <span className="for-pills">
              <img alt="" src={c.weapon.icon} />
              {translate(c.weapon.name)} - top {_top}{" "}
              {c.variant?.displayName ? `(${c.variant?.displayName}) ` : " "}
              {c.short}
            </span>
          </span>
        </>
      );

      const rawLabel = `top ${_top} ${c.weapon.name} R${c.weapon.refinement} ${
        c.name
      }${c.variant?.displayName ? ` ${c.variant?.displayName}` : ""}`;

      const thisOpt = {
        label,
        rawLabel,
        value: calcId,
        fieldKey: calcId,
        top: _ranking / c.outOf,
        priority: c.priority,
      };

      return thisOpt;
    },
    [calculations, translate]
  );

  const calcOptions = useMemo(
    () =>
      calculations && Object.keys(calculations).length > 0
        ? ["", ...Object.keys(calculations)].map(renderOptions).sort((a, b) => {
            // return b.priority - a.priority || a.top - b.top;
            return a.top > b.top ? 1 : -1;
          })
        : [],
    [calculations, translate]
  );

  const hasLeaderboardsColumn =
    filteredLeaderboards.length > 0 && filteredLeaderboards[0] !== "hide";

  const talentNAProps = toTalentProps(
    row,
    ["normalAttacks", "normalAttack"],
    chartsData
  );
  const talentSkillProps = toTalentProps(row, ["elementalSkill"], chartsData);
  const talentBurstProps = toTalentProps(row, ["elementalBurst"], chartsData);

  // const cvTextColor = getCharacterCvColor(row.critValue);
  // let cvTextStyle = {} as React.CSSProperties;

  // if (cvTextColor === "rainbow") {
  //   cvTextStyle = getRainbowTextStyle();
  // } else {
  //   cvTextStyle.filter = `drop-shadow(0 0 5px ${cvTextColor})`;
  // }

  const cardOverlay = useMemo(
    () => (
      <>
        <div key="character-name" className="character-name">
          <div>
            {displayBuildName
              ? row.type !== "current"
                ? row.type
                : translate(row.name)
              : translate(row.name, getGenderFromIcon(row.icon))}
          </div>
          {!privacyFlag && (
            <div className="character-nickname">{row.owner.nickname}</div>
          )}
        </div>
        {/* 
        <div className="character-title">{chartsData?.characterMetadata?.title}</div>
        <div className="character-title">{chartsData?.characterMetadata?.constellation}</div> 
        */}
        <div className="character-level">
          {translate("Lv.")} {row.propMap.level.val}
          <span className="opacity-5">
            /{ascensionToLevel(row.propMap.ascension.val, "character")}
          </span>
        </div>
        <div className="character-friendship">
          <img alt="friendship" src={FriendshipIcon} />{" "}
          {row.fetterInfo.expLevel}
        </div>
        <div
          className="character-cv"
          // style={cvTextStyle}
        >
          {row.critValue.toFixed(1)} cv
        </div>
        {!privacyFlag && (
          <div key="character-uid" className="character-uid">
            {row.uid}
          </div>
        )}
        <div className="character-constellations">
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const constImg = chartsData?.assets?.constellations?.[i];
            const isActivated = row.constellation >= i + 1;
            return (
              <div
                key={`${constImg}-${i}`}
                className={isActivated ? "activated" : ""}
              >
                {!isActivated && (
                  <span className="const-locked">
                    <FontAwesomeIcon
                      className="lock-icon"
                      icon={faLock}
                      size="1x"
                    />
                  </span>
                )}
                {constImg ? (
                  <img
                    alt="constellation"
                    key={`const-${i}`}
                    className={isActivated ? "activated" : ""}
                    src={toEnkaUrl(constImg)}
                  />
                ) : (
                  <div className="no-const" />
                )}
              </div>
            );
          })}
        </div>
        <div className="character-talents">
          <TalentDisplay talent={talentNAProps} />
          <TalentDisplay talent={talentSkillProps} />
          <TalentDisplay talent={talentBurstProps} />
        </div>
      </>
    ),
    [
      row,
      privacyFlag,
      talentNAProps,
      talentSkillProps,
      talentBurstProps,
      displayBuildName,
    ]
  );

  const cardContainer = useMemo(() => {
    const charImgUrl = toEnkaUrl(chartsData?.assets?.gachaIcon);
    const cardContainerClassNames = [
      "character-card-container",
      !namecardBg ? "elemental-bg-wrap" : "",
      simplifyColors ? "simplify-colors" : "",
      hasLeaderboardsColumn ? "" : "no-leaderboards",
      charImgUrl ? "" : "disable-input",
    ]
      .join(" ")
      .trim();
    return (
      <div className={cardContainerClassNames} style={cardStyle}>
        <div
          className="absolute-overlay"
          // onClick={handleEffectsIteration}
        >
          {cardOverlay}
        </div>
        <div className="character-left">{characterShowcase}</div>
        <div className="character-middle">{characterMiddle}</div>
        <div className="character-right">{leaderboardHighlighs}</div>
        <div className="character-artifacts">
          {/* ... */}
          {artifactsDiv}
        </div>
        <div className="character-artifacts-rv">
          <RollList artifacts={reorderedArtifacts} character={row.name} />
        </div>
        {/* <div className="wide-bg-shadow" /> */}
        <div
          className={`character-card-background ${
            !namecardBg ? "elemental-bg" : ""
          }`}
          // style={bgStyle}
        >
          {/* <div /> */}
          <canvas
            className="bg-as-canvas"
            ref={canvasBgRef}
            width={canvasBgWidth * canvasPixelDensity}
            height={canvasBgHeight * canvasPixelDensity}
            style={{
              width: canvasBgWidth,
              height: canvasBgHeight,
            }}
          />
        </div>
      </div>
    );
  }, [
    row,
    namecardBg,
    simplifyColors,
    adaptiveBgColor,
    chartsData,
    cardStyle,
    generating,
    translate,
    customRvFilter[row.name]?.length,
  ]);

  const handleSelectChange = (option: any) => {
    // const filters = options.map((o: any) => o.value);
    // setFilteredLeaderboards(filters);
    setFilteredLeaderboards([option.value]);
  };

  const selectedOptions = useMemo(() => {
    return calcOptions.filter((calc) => {
      return filteredLeaderboards.includes(calc.value);
    });
  }, [filteredLeaderboards, calcOptions]);

  // const defaultOption = useMemo(() => {
  //   return calcOptions.filter((calc) => {
  //     return filteredLeaderboards.includes(calc.value);
  //   });
  // }, [filteredLeaderboards, calcOptions]);

  const windowSizeT = 1280 - 10;
  const maxCardWidth = Math.min(windowSizeT, width);
  const scaleFactor = Math.max(0.75, +(maxCardWidth / windowSizeT));
  // const formattedSF = (adProvider === "playwire" ? Math.min(0.88, scaleFactor) : scaleFactor).toFixed(3)
  const formattedSF = scaleFactor.toFixed(3);
  const wrapperStyle = {
    "--hardcoded-card-scale": hardcodedScale,
    "--scale-factor": formattedSF,
  } as React.CSSProperties;

  const buildId = getBuildId(row);

  const handleGenerateAndDownload = async (
    mode: "download" | "open",
    event: any
  ) => {
    const cardNode = document.getElementById(buildId);
    if (!cardNode) return;

    const _opts: Partial<Options> = {
      scale: 1.75,
      // width: 1806,
      // height: 853,
      backgroundColor: null, // transparent
      allowTaint: true,
      useCORS: true,
      onclone: (document, element) => {
        const offsetElementBy = (
          selector: string,
          transform: number | string
          // transform?: string
        ) => {
          element.querySelectorAll(selector).forEach((el: any) => {
            el.style.transform = isNaN(+transform)
              ? transform
              : `translateY(${transform}px)`;
          });
        };

        // un-scale
        (element.style as any)["--scale-factor"] = "1";

        offsetElementBy(".character-talents .talent-display-value", 0); // ???
        offsetElementBy(".character-talents .talent-display-value > span", -1);
        offsetElementBy(".roll-list-member > span > span", -1);
        offsetElementBy(".roll-list-member > span > span > img", 1); // offset img
        offsetElementBy(
          ".character-artifacts .compact-artifact-main-stat > span",
          -1
        );
        offsetElementBy(".lb-badge > span", -1);
        // offsetElementBy(".compact-artifact-crit-value > span", -2);
        // offsetElementBy(".compact-artifact-crit-value > .smol-percentage", -2);
        offsetElementBy(
          ".compact-artifact-crit-value > span:not(.metric-formula)",
          -1
        );
        offsetElementBy(".table-stat-row span", -1);
        offsetElementBy(".table-stat-row > div:not(.flex)", -1);

        offsetElementBy(
          ".compact-artifact-subs .substat > span:last-child",
          -1
        );

        offsetElementBy(
          ".roll-dots",
          `translateX(calc(-100% - 3px)) translateY(-1px)`
        );
      },
    };

    const genDelay = 100; // 100ms

    try {
      if (mode === "download") {
        setGenerating("downloading");
        // const dataUrl = await toPng(cardNode, {
        //   pixelRatio: 1.5,
        //   fetchRequestInit: {
        //     mode: "cors",
        //     credentials: "same-origin", // include, *same-origin, omit
        //   },
        //   // filter: (node: HTMLElement) => {
        //   //   const exclusionClasses = ['remove-me', 'secret-div'];
        //   //   return !exclusionClasses.some((classname) => node.classList?.contains(classname));
        //   // }
        //   // cacheBust: true,
        // });

        await delay(genDelay);
        const canvas = await html2canvas(cardNode, _opts);
        const dataUrl = canvas.toDataURL("image/png", 1.0);

        if (!dataUrl) return;

        const _link = document.createElement("a");
        _link.download = `${row.name}-${row._id}.png`;
        _link.href = dataUrl;
        _link.click();
      }

      if (mode === "open") {
        setGenerating("opening");

        // const dataUrl = await toBlob(cardNode, {
        //   pixelRatio: 1.5,
        //   fetchRequestInit: {
        //     mode: "cors",
        //     credentials: "same-origin", // include, *same-origin, omit
        //   },
        // });
        // if (!dataUrl) return;
        // setImagePreviewBlob(dataUrl);
        // handleToggleModal(event);

        await delay(genDelay);
        const canvas = await html2canvas(cardNode, _opts);

        canvas.toBlob((blob) => {
          if (!blob) return;
          setImagePreviewBlob(blob);
          handleToggleModal(event);
        });

        // if (!dataUrl) return;

        // const url = URL.createObjectURL(dataUrl);
        // window.open(url, '_blank');
      }

      // @debug
      // const _img = new Image();
      // _img.src = dataUrl;
      // document.body.appendChild(_img);
    } catch (err) {
      console.log(err);
    }
    setGenerating(false);
  };

  // const mode = !uploadPictureInputRef?.current?.files?.[0] && "gacha";

  return (
    <div
      className="flex expanded-row relative mb-0 scale-factor-source"
      style={wrapperStyle}
    >
      <PreviewModal
        isOpen={showPreviewModal}
        toggleModal={handleToggleModal}
        blob={imagePreviewBlob}
        // dataURL={imagePreviewBlob}
      />
      <div className="card-wrapper-height-fix">
        <div
          id={buildId}
          className={`card-wrapper relative ${DEBUG_MODE ? "debug" : ""}`}
        >
          <div className="html-to-image-target">{cardContainer}</div>
        </div>
      </div>
      <div className="card-buttons-wrapper">
        <div className="card-buttons">
          <div className="card-configuration">
            <div className="buttons-row">
              {generating === "downloading" ? (
                <>
                  <Spinner />
                </>
              ) : (
                <button
                  className={`dl-button ${generating ? "opacity-5" : ""}`}
                  disabled={generating ? true : false}
                  onClick={(event) =>
                    handleGenerateAndDownload("download", event)
                  }
                >
                  <FontAwesomeIcon
                    className="filter-icon hoverable-icon"
                    icon={faDownload}
                    size="1x"
                    title="Download"
                  />
                  Download
                </button>
              )}
              {generating === "opening" ? (
                <>
                  <Spinner />
                </>
              ) : (
                <button
                  className={`dl-button ${generating ? "opacity-5" : ""}`}
                  disabled={generating ? true : false}
                  onClick={(event) => handleGenerateAndDownload("open", event)}
                >
                  <FontAwesomeIcon
                    className="filter-icon hoverable-icon"
                    icon={faMagnifyingGlass}
                    size="1x"
                    title="Open in new tab"
                  />
                  Open
                </button>
              )}
              <button
                className={toggleConfigure ? "toggled-conf-btn" : ""}
                onClick={() => {
                  setToggleConfigure((prev) => !prev);
                }}
              >
                <FontAwesomeIcon
                  className="filter-icon hoverable-icon"
                  icon={faCog}
                  size="1x"
                  title="Configure"
                />
                Configure Image
              </button>
            </div>
            {toggleConfigure ? (
              <div className="expanded-row toggle-config">
                <div
                  className={`card-select-wrapper ${
                    calcOptions.length === 0 ? "no-calcs" : ""
                  }`}
                >
                  <span className="card-select-label">Highlighed ranking</span>
                  <div className="card-select ">
                    <div className="react-select-calcs-wrapper">
                      <ReactSelect
                        isDisabled={calcOptions.length === 0}
                        // isMulti
                        options={calcOptions}
                        menuPortalTarget={document.body}
                        styles={reactSelectCustomFilterTheme}
                        maxMenuHeight={450}
                        menuPlacement="auto"
                        getOptionValue={(option: any) => option.rawLabel}
                        placeholder={
                          calcOptions.length === 0
                            ? "No leaderboards available"
                            : "Choose leaderboards"
                        }
                        value={selectedOptions?.[0]}
                        defaultValue={selectedOptions?.[0]}
                        onChange={(options) => {
                          if (!options) return;
                          handleSelectChange(options);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="card-checkboxes">
                  <div>
                    <label htmlFor={`${buildId}-bname`}>
                      Display build name
                    </label>
                    <input
                      id={`${buildId}-bname`}
                      type="checkbox"
                      checked={displayBuildName}
                      onChange={(e: any) =>
                        setDisplayBuildName(!!e.target.checked)
                      }
                    />
                  </div>
                  <div>
                    <label htmlFor={`${buildId}-sc`}>
                      Simplify border colors
                    </label>
                    <input
                      id={`${buildId}-sc`}
                      type="checkbox"
                      checked={simplifyColors}
                      onChange={(e: any) =>
                        setSimplifyColors(!!e.target.checked)
                      }
                    />
                  </div>
                  <div>
                    <label htmlFor={`${buildId}-abg`}>
                      Adaptive background
                    </label>
                    <input
                      id={`${buildId}-abg`}
                      type="checkbox"
                      checked={adaptiveBgColor}
                      onChange={(e: any) =>
                        setAdaptiveBgColor(!!e.target.checked)
                      }
                    />
                  </div>
                  <div>
                    <label htmlFor={`${buildId}-nb`}>Namecard background</label>
                    <input
                      id={`${buildId}-nb`}
                      checked={namecardBg}
                      type="checkbox"
                      onChange={(e: any) => setNamecardBg(!!e.target.checked)}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${buildId}-hr`}>Hide UID & ranking</label>
                    <input
                      id={`${buildId}-hr`}
                      checked={privacyFlag}
                      type="checkbox"
                      onChange={(e: any) => setPrivacyFlag(!!e.target.checked)}
                    />
                  </div>
                  {/* <div
                    className={
                      bgRemLoading || mode === "gacha" ? "disabled" : ""
                    }
                  >
                    <label htmlFor={`${buildId}-bgr`}>
                      AI background removal
                    </label>
                    <button
                      id={`${buildId}-bgr`}
                      disabled={bgRemLoading || mode === "gacha" ? true : false}
                      onClick={() => {
                        if (bgRemLoading || mode === "gacha") return;
                        if (!backgroundPictureRef.current) return;

                        const coldStart = false;
                        const removeBg = true;

                        paintImageToCanvas(
                          backgroundPictureRef.current.src,
                          mode,
                          coldStart,
                          removeBg
                        );
                      }}
                    >
                      {bgRemLoading ? (
                        <>
                          <Spinner />{" "}
                          {bgRemDownload > 0
                            ? `${bgRemDownload.toFixed(1)}%`
                            : "wait..."}
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon
                            className="filter-icon hoverable-icon"
                            icon={faUserXmark}
                            size="1x"
                            title="Remove background"
                          />
                          start
                        </>
                      )}
                    </button>
                    <span
                      className="opacity-5"
                      style={{ marginLeft: 10, fontSize: 12 }}
                    >
                      (dank af, beta af, requires downloading 88MB model)
                    </span>
                  </div> */}
                </div>
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
