import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import ReactSelect from "react-select";

import html2canvas, { Options } from "html2canvas";
// import { toBlob, toPng } from "html-to-image";

import { Chart as ChartJS, registerables } from "chart.js";
import { Radar } from "react-chartjs-2";
import { useLocation } from "react-router-dom";

import {
  getArtifactsInOrder,
  normalizeText,
  getArtifactCvClassName,
  isPercent,
  getInGameSubstatValue,
  getSubstatPercentageEfficiency,
  toEnkaUrl,
  ascensionToLevel,
} from "../../utils/helpers";
import { REAL_SUBSTAT_VALUES, STAT_NAMES } from "../../utils/substats";
import { StatIcon } from "../StatIcon";
import { reactSelectCustomFilterTheme } from "../../utils/reactSelectCustomFilterTheme";
import { WeaponMiniDisplay } from "../WeaponMiniDisplay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCog,
  faDownload,
  faLock,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { Spinner } from "../Spinner";
import { StatListCard } from "../StatListCard";
import { RollList } from "../RollList";
import CrownOfInsight from "../../assets/images/Crown_of_Insight.webp";
import RarityStar from "../../assets/images/star.png";
import FriendshipIcon from "../../assets/icons/Item_Companionship_EXP.png";
import { PreviewModal } from "./PreviewModal";
import { applyModalBodyStyle, getRelativeCoords } from "../CustomTable/Filters";
import { TeammatesCompact } from "../TeammatesCompact";
import {
  ELEMENT_TO_COLOR,
  ELEMENT_TO_HUE,
  calcStatVals,
  handleLabel,
  handleTitle,
  scales,
  toTalentProps,
} from "./cardHelpers";
import "./style.scss";
import { ArtifactOnCanvas } from "../ArtifactListCompact";

ChartJS.register(...registerables);

type CharacterCardProps = {
  row: any;
  artifacts: any[];
  _calculations: any;
  setSelectedCalculationId?: any;
};

type TalentProps = {
  talent: {
    boosted: boolean;
    level: number;
    rawLevel: number;
    icon?: string;
  };
};

const TalentDisplay: React.FC<TalentProps> = ({ talent }) => {
  const isBoosted = !!talent?.boosted;
  const isCrowned = talent?.rawLevel
    ? talent?.rawLevel === 10
    : talent?.level === (talent?.boosted ? 13 : 10);

  return (
    <div
      className={`talent-display ${isCrowned ? "talent-crowned" : ""} ${
        isBoosted ? "talent-boosted" : ""
      }`}
    >
      {talent?.icon ? (
        <span>
          <img src={talent?.icon} />
        </span>
      ) : (
        <div className="talent-icon-placeholder opacity-5">?</div>
      )}
      <div className={"talent-display-value"}>
        <span>{talent?.level}</span>
        {isCrowned && <img className="crown-of-insight" src={CrownOfInsight} />}
      </div>
    </div>
  );
};

export const CharacterCard: React.FC<CharacterCardProps> = ({
  row,
  artifacts,
  _calculations,
  setSelectedCalculationId,
}) => {
  const [width, setWidth] = useState<number>(window.innerWidth);
  // const [enkaStyle, setEnkaStyle] = useState(false);
  const [namecardBg, setNamecardBg] = useState(false);
  const [simplifyColors, setSimplifyColors] = useState(false);
  const [privacyFlag, setPrivacyFlag] = useState(false);
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

  const uploadPictureInputRef = useRef<HTMLInputElement>(null);
  const backgroundPictureRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const calculations = _calculations.calculations;
  const chartsData = _calculations.chartsData;

  const canvasWidth = 500;
  const canvasHeight = 485;
  const canvasPixelDensity = 2;

  const location = useLocation();
  const DEBUG_MODE = location.search?.includes("debug");

  const handleToggleModal = (event: React.MouseEvent<HTMLElement>) => {
    setShowPreviewModal((prev) => !prev);

    const offsets = getRelativeCoords(event);
    applyModalBodyStyle(offsets);
  };

  const handleWindowSizeChange = () => {
    setWidth(window.innerWidth);
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
    paintImageToCanvas(backgroundPictureRef.current.src, "gacha");

    setIsLoadingImage(true);
    backgroundPictureRef.current.addEventListener("load", () => {
      setIsLoadingImage(false);
    });
  }, [canvasRef, backgroundPictureRef]);

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
            pointHitRadius: 45,
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
            pointHitRadius: 45,
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
            label: handleLabel,
          },
        },
        legend: {
          display: false,
        },
      };

      const radarOptions = {
        devicePixelRatio: 2,
        plugins,
        scales,
        elements: {
          point: {
            hoverRadius: 3,
            hoverBorderWidth: 1,
          },
          line: {
            borderWidth: 2,
          },
        },
      };

      return (
        <div className="chart-radar-wrapper">
          <Radar data={data} options={radarOptions} />
        </div>
      );
    },
    [row, calculations, chartsData, filteredLeaderboards, generating]
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
            weapon,
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
              <img className="weapon-icon" src={calc.weapon.icon} />
              <span>
                {short} {variant?.displayName?.replace("C6 ", "")}
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
                <TeammatesCompact teammates={calc.teammates} scale={1.7} />
                {topBadge}
                {lbBadge}
                {/* <div>{shorterName}</div> */}
                {privacyFlag ? (
                  ""
                ) : (
                  <div>
                    {ranking ?? (
                      // @TODO: something cooler than this tho
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
  }, [privacyFlag, chartsData, filteredLeaderboards, generating]);

  const reorderedArtifacts = useMemo(
    () => getArtifactsInOrder(artifacts),
    [JSON.stringify(artifacts)]
  );

  const compactList = useMemo(() => {
    return (
      <>
        {reorderedArtifacts.map((artifact: any) => {
          const substatKeys = Object.keys(artifact.substats);
          const className = getArtifactCvClassName(artifact);

          const summedArtifactRolls: {
            [key: string]: { count: number; sum: number };
          } = artifact.substatsIdList.reduce((acc: any, id: number) => {
            const { value, type } = REAL_SUBSTAT_VALUES[id];
            const realStatName = STAT_NAMES[type];
            return {
              ...acc,
              [realStatName]: {
                count: (acc[realStatName]?.count ?? 0) + 1,
                sum: (acc[realStatName]?.sum ?? 0) + value,
              },
            };
          }, {});

          const mainStatValue = isPercent(artifact.mainStatKey)
            ? Math.round(artifact.mainStatValue * 10) / 10
            : Math.round(artifact.mainStatValue);

          return (
            <div
              key={artifact._id}
              className={`flex compact-artifact ${className}`}
            >
              <div className="compact-artifact-bg" />
              <div className="compact-artifact-icon-container">
                <ArtifactOnCanvas icon={artifact.icon} />
                <span className="compact-artifact-crit-value">
                  <span>{Math.round(artifact.critValue * 10) / 10} cv</span>
                </span>
                <span className="compact-artifact-main-stat">
                  <StatIcon name={artifact.mainStatKey} />
                  <span>
                    {mainStatValue}
                    {isPercent(artifact.mainStatKey) ? "%" : ""}
                  </span>
                </span>
              </div>
              <div className="compact-artifact-subs">
                {substatKeys.map((key: any) => {
                  if (!key) return <></>;

                  const substatValue = getInGameSubstatValue(
                    artifact.substats[key],
                    key
                  );
                  const isCV = key.includes("Crit");

                  const normSubName = normalizeText(
                    key.replace("substats", "")
                  );
                  const classNames = [
                    "substat flex nowrap gap-5",
                    normalizeText(normSubName),
                    isCV ? "critvalue" : "",
                  ]
                    .join(" ")
                    .trim();

                  const opacity = getSubstatPercentageEfficiency(
                    normSubName,
                    artifact.substats[key]
                  );

                  const rollDots = "•".repeat(summedArtifactRolls[key].count);

                  return (
                    <div
                      key={normalizeText(key)}
                      className={classNames}
                      style={{ opacity: opacity }}
                    >
                      <span className="roll-dots">{rollDots}</span>
                      <span>
                        <StatIcon name={key} />
                      </span>
                      <span>
                        {substatValue}
                        {isPercent(key) ? "%" : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </>
    );
  }, [JSON.stringify(reorderedArtifacts)]);

  const artifactsDiv =
    reorderedArtifacts.length > 0 ? compactList : "no artifacts equipped";

  const paintImageToCanvas = (result: string, mode?: string) => {
    const img = backgroundPictureRef?.current;
    if (!img) return;

    img.crossOrigin = "anonymous";
    img.src = result + "";

    img.onload = () => {
      if (!canvasRef.current) return;

      // Once the image is loaded, we will get the width & height of the image

      const imageWidth = img.width;
      const imageHeight = img.height;

      // width    2048
      // height   1024

      const _canvasWidth = mode === "gacha" ? canvasWidth * 1.55 : canvasWidth;
      const _canvasHeight =
        mode === "gacha" ? canvasHeight * 1.55 : canvasHeight;

      // get the scale
      // it is the min of the 2 ratios
      const scaleFactor = Math.max(
        _canvasWidth / imageWidth,
        _canvasHeight / imageHeight
      );

      // Finding the new width and height based on the scale factor
      const newWidth = imageWidth * scaleFactor;
      const newHeight = imageHeight * scaleFactor;

      // get canvas context
      const ctx = canvasRef.current.getContext("2d");

      // Create gradient
      const gradientMask = ctx!.createLinearGradient(
        canvasWidth - 101,
        0,
        canvasWidth - 3,
        0
      );
      gradientMask.addColorStop(0, "black");
      gradientMask.addColorStop(1, "transparent");

      // clear canvas
      ctx!.globalCompositeOperation = "source-out";
      ctx!.clearRect(0, 0, canvasWidth, canvasHeight);

      // Fill with gradient
      ctx!.fillStyle = gradientMask;
      ctx!.fillRect(0, 0, canvasWidth, canvasHeight);

      // get the top left position of the image
      // in order to center the image within the canvas
      let x = _canvasWidth / 2 - newWidth / 2;
      let y = _canvasHeight / 2 - newHeight / 2;

      if (mode === "gacha") {
        if (row.name === "Traveler") {
          x = x - 100;
          y = y + 30;
        } else {
          x = x - 130;
          y = y - 82;
        }
      }

      ctx!.globalCompositeOperation = "source-in";
      ctx!.drawImage(img, x, y, newWidth, newHeight);
    };
  };

  const characterShowcase = useMemo(
    () => (
      <div>
        <div className="column-shadow-gradient-top" />
        <div className="column-shadow-gradient-left" />
        <div className="column-shadow-gradient-bottom" />
        {/* <div className="column-shadow-gradient" /> */}
        <div
          style={{ pointerEvents: "all" }}
          className={`character-showcase-pic-container ${hasCustomBg} ${
            row.name === "Traveler" ? "is-traveler" : ""
          } ${generating ? "is-generating" : ""}`}
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
                  setHasCustomBg("horizontal"); // irrelevant
                },
                false
              );

              reader.readAsDataURL(file);
            }}
            type="file"
            name="filename"
          />
          <canvas
            height={canvasHeight * canvasPixelDensity}
            width={canvasWidth * canvasPixelDensity}
            style={{
              width: canvasWidth,
              height: canvasHeight,
            }}
            ref={canvasRef}
          />
          {isLoadingImage && (
            <div className="image-loading-wrapper">
              <Spinner />
            </div>
          )}
          <img
            style={{ display: "none" }}
            ref={backgroundPictureRef}
            src={toEnkaUrl(chartsData?.assets?.gachaIcon)}
          />
        </div>
      </div>
    ),
    [
      row,
      uploadPictureInputRef,
      backgroundPictureRef,
      canvasRef,
      hasCustomBg,
      generating,
      isLoadingImage,
      chartsData,
    ]
  );

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
            <img src={row.weapon.icon} />
            <div className="weapon-rarity">
              {[...Array(chartsData?.weaponMetadata?.rarity)].map((e, i) => (
                <img key={`star-${i}`} src={RarityStar} />
              ))}
            </div>
          </div>
          <div className="weapon-data">
            <div className="weapon-name">{row.weapon.name}</div>
            <div className="weapon-stats">
              <div className="weapon-refinement">
                R{row.weapon.weaponInfo.refinementLevel.value + 1}
              </div>
              <div>
                <span>Lv. {row.weapon.weaponInfo.level}</span>
                <span className="opacity-5">
                  /{ascensionToLevel(row.weapon.weaponInfo?.promoteLevel)}
                </span>
              </div>
            </div>
          </div>
        </div>
        {characterStats}
        {/* <div className="card-leaderboards relative">{leaderboardHighlighs}</div> */}
      </div>
    ),
    [row, chartsData]
  );

  const cardStyle = {
    // "--hue-rotate": `${
    //   ELEMENT_TO_HUE[chartsData?.characterMetadata?.element]
    // }deg`,
    "--elemental-bg": `url(/elementalBackgrounds/${chartsData?.characterMetadata?.element}-bg.png)`,
    "--character-namecard-url": !namecardBg
      ? `url(/elementalBackgrounds/${chartsData?.characterMetadata?.element}-bg.png)`
      : `url(${toEnkaUrl(chartsData?.characterMetadata?.namecard)})`,
    "--element-color": ELEMENT_TO_COLOR[chartsData?.characterMetadata?.element],
    "--element-color-2": `${
      ELEMENT_TO_COLOR[chartsData?.characterMetadata?.element]
    }70`,
  } as React.CSSProperties;

  const getBuildId = (build: any) => `${build.characterId}${build.type}`;

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
                {c.weapon.name}
              </div>
              <div style={{ width: 60 }}>top {_top}</div>
              {c.variant?.displayName
                ? `(${c.variant?.displayName}) `
                : ""}{" "}
              {shorterName}
            </span>
            <span className="for-pills">
              <img src={c.weapon.icon} />
              {c.weapon.name} - top {_top}{" "}
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
    [calculations]
  );

  const calcOptions = useMemo(
    () =>
      calculations && Object.keys(calculations).length > 0
        ? ["", ...Object.keys(calculations)].map(renderOptions).sort((a, b) => {
            // return b.priority - a.priority || a.top - b.top;
            return a.top > b.top ? 1 : -1;
          })
        : [],
    [calculations]
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
        <div className="character-name">
          <div>{row.name}</div>
          {!privacyFlag && (
            <div className="character-nickname">{row.owner.nickname}</div>
          )}
        </div>
        {/* 
        <div className="character-title">{chartsData?.characterMetadata?.title}</div>
        <div className="character-title">{chartsData?.characterMetadata?.constellation}</div> 
      */}
        <div className="character-level">
          Lv. {row.propMap.level.val}
          <span className="opacity-5">
            /{ascensionToLevel(row.propMap.ascension.val)}
          </span>
        </div>
        <div className="character-friendship">
          <img src={FriendshipIcon} /> {row.fetterInfo.expLevel}
        </div>
        <div
          className="character-cv"
          // style={cvTextStyle}
        >
          {row.critValue.toFixed(1)} cv
        </div>
        {!privacyFlag && <div className="character-uid">{row.uid}</div>}
        <div className="character-constellations">
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const constImg = chartsData?.assets?.constellations?.[i];
            const isActivated = row.constellation >= i + 1;
            return (
              <div key={constImg} className={isActivated ? "activated" : ""}>
                {!isActivated ? (
                  <span className="const-locked">
                    <FontAwesomeIcon
                      className="lock-icon"
                      icon={faLock}
                      size="1x"
                    />
                  </span>
                ) : (
                  ""
                )}
                <img
                  key={`const-${i}`}
                  className={isActivated ? "activated" : ""}
                  src={toEnkaUrl(constImg)}
                />
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
    [row, privacyFlag, talentNAProps, talentSkillProps, talentBurstProps]
  );

  // const handleEffectsIteration = () => {
  //   setIteration((prev) => prev + 1);
  //   const effects = [setSimplifyColors, setNamecardBg];
  //   let _i = iteration % 2;
  //   for (let i = 0; i <= _i; i++) {
  //     effects[i]((prev) => !prev);
  //   }
  // };

  const cardContainer = useMemo(
    () => (
      <div
        className={`character-card-container ${
          !namecardBg ? "elemental-bg-wrap" : ""
        } ${simplifyColors ? "simplify-colors" : ""} ${
          hasLeaderboardsColumn ? "" : "no-leaderboards"
        }`}
        style={cardStyle}
      >
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
          <div />
        </div>
      </div>
    ),
    [row, namecardBg, simplifyColors, cardStyle, generating]
  );

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

  const windowSizeT = 1200 + 95;
  const maxCardWidth = Math.min(windowSizeT, width);
  const scaleFactor = Math.max(0.83, +(maxCardWidth / windowSizeT).toFixed(3));
  const wrapperStyle = { "--scale-factor": scaleFactor } as React.CSSProperties;

  const handleGenerateAndDownload = async (
    mode: "download" | "open",
    event: any
  ) => {
    const cardNode = document.getElementById(getBuildId(row));
    if (!cardNode) return;

    const _opts: Partial<Options> = {
      scale: 1.5,
      // width: 1806,
      // height: 853,
      backgroundColor: null,
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
        offsetElementBy(".compact-artifact-crit-value > span", -2);
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
          id={getBuildId(row)}
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
                <div className="card-checkboxes ">
                  {/* <div style={{ color: "gray" }}>
                Enka style
                <input
                  type="checkbox"
                  onChange={(e: any) => setEnkaStyle(!!e.target.checked)}
                  disabled
                />
              </div> */}
                  <div>
                    <label htmlFor={`${getBuildId(row)}-sc`}>
                      Simplify colors
                    </label>
                    <input
                      id={`${getBuildId(row)}-sc`}
                      type="checkbox"
                      checked={simplifyColors}
                      onChange={(e: any) =>
                        setSimplifyColors(!!e.target.checked)
                      }
                    />
                  </div>
                  <div>
                    <label htmlFor={`${getBuildId(row)}-nb`}>
                      Namecard background
                    </label>
                    <input
                      id={`${getBuildId(row)}-nb`}
                      checked={namecardBg}
                      type="checkbox"
                      onChange={(e: any) => setNamecardBg(!!e.target.checked)}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${getBuildId(row)}-hr`}>
                      Hide UID & ranking
                    </label>
                    <input
                      id={`${getBuildId(row)}-hr`}
                      checked={privacyFlag}
                      type="checkbox"
                      onChange={(e: any) => setPrivacyFlag(!!e.target.checked)}
                    />
                  </div>
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
