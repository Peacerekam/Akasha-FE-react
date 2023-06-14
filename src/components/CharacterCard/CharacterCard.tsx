import React, { useMemo, useState, useEffect } from "react";
import ReactSelect, { MultiValue } from "react-select";
import html2canvas from "html2canvas";
import { toPng } from "html-to-image";

import {
  getArtifactsInOrder,
  normalizeText,
  getArtifactCvClassName,
  isPercent,
  getInGameSubstatValue,
  getSubstatPercentageEfficiency,
  toEnkaUrl,
  getCharacterCvColor,
  ascensionToLevel,
} from "../../utils/helpers";
import { REAL_SUBSTAT_VALUES, STAT_NAMES } from "../../utils/substats";
import { StatIcon } from "../StatIcon";
import { StatList } from "../StatList";
import { reactSelectCustomFilterTheme } from "../../utils/reactSelectCustomFilterTheme";
import { WeaponMiniDisplay } from "../WeaponMiniDisplay";
import "./style.scss";
import axios from "axios";

type CharacterCardProps = {
  row: any;
  artifacts: any[];
  calculations: any[];
};

type TalentProps = {
  talent: {
    boosted: boolean;
    level: number;
    icon?: string;
  };
};

const TalentDisplay: React.FC<TalentProps> = ({ talent }) => {
  return (
    <div className="talent-display">
      {talent?.icon ? (
        <img src={talent?.icon} />
      ) : (
        <div className="talent-icon-placeholder opacity-5">?</div>
      )}
      <div
        className={`talent-display-value ${
          talent?.boosted ? "talent-boosted" : ""
        }`}
      >
        {talent?.level}
      </div>
    </div>
  );
};

export const CharacterCard: React.FC<CharacterCardProps> = ({
  row,
  artifacts,
  calculations,
}) => {
  const [enkaStyle, setEnkaStyle] = useState(false);
  const [namecardBg, setNamecardBg] = useState(false);
  const [simplifyColors, setSimplifyColors] = useState(false);
  const [privacyFlag, setPrivacyFlag] = useState(false);

  const calculationIds = useMemo(
    () =>
      Object.keys(calculations ?? []).sort((a: any, b: any) => {
        const _a = ("" + calculations[a].ranking)?.replace("~", "");
        const _b = ("" + calculations[b].ranking)?.replace("~", "");

        const valA = _a.startsWith("(") ? _a.slice(1, _a.length - 1) : _a;
        const valB = _b.startsWith("(") ? _b.slice(1, _b.length - 1) : _b;

        return +valA < +valB ? -1 : 1;
      }),
    [calculations]
  );

  useEffect(() => {
    setFilteredLeaderboards(calculationIds.slice(0, 2));
  }, [calculationIds]);

  const [filteredLeaderboards, setFilteredLeaderboards] = useState<any[]>([]);

  const leaderboardHighlighs = useMemo(() => {
    return filteredLeaderboards.map((id: any) => {
      const calc = calculations[id];
      const {
        name,
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
        ? `top ${Math.min(100, Math.ceil((_ranking / outOf) * 100)) || "?"}%`
        : "";

      const shorterName = name.split(",")[0];

      const lbBadge = (
        <span className="lb-badge">
          {short} {variant?.displayName}
        </span>
      );

      const topBadge = (
        <span style={{ marginRight: 5 }} className="lb-badge">
          {_top}
        </span>
      );

      return (
        <div key={id}>
          {topBadge}
          {lbBadge}
          <div style={{ marginTop: 5 }}>{shorterName}</div>
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
      );
    });
  }, [privacyFlag, filteredLeaderboards]);

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
                <img className="compact-artifact-icon" src={artifact.icon} />
                <span className="compact-artifact-crit-value">
                  <span>{Math.round(artifact.critValue * 10) / 10} cv</span>
                </span>
                <span className="compact-artifact-main-stat">
                  <StatIcon name={artifact.mainStatKey} />
                  {mainStatValue}
                  {isPercent(artifact.mainStatKey) ? "%" : ""}
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
                      {substatValue}
                      {isPercent(key) ? "%" : ""}
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

  const characterShowcase = (
    <div>
      <div className="column-shadow-gradient-top" />
      <div className="column-shadow-gradient-left" />
      <div className="column-shadow-gradient" />
      <div
        className={`character-showcase-pic-container ${
          row.name === "Traveler" ? "is-traveler" : ""
        }`}
      >
        <img src={toEnkaUrl(row.assets.gachaIcon)} />
      </div>
    </div>
  );

  const characterStats = (
    <div className="character-stats-inside">
      <div className="column-shadow" />
      <StatList
        row={row}
        // currentCategory={currentCategory}
        strikethrough={false}
        showCharacter
        showWeapon
      />
    </div>
  );

  const characterLbs = (
    <div>
      <div className="column-shadow" />
      <div className="card-leaderboards" style={{ position: "relative" }}>
        {leaderboardHighlighs}
      </div>
    </div>
  );

  const style = {
    "--character-namecard-url": !namecardBg
      ? `url(/elementalBackgrounds/${row.characterMetadata.element}-bg.jpg)`
      : `url(${toEnkaUrl(row.characterMetadata.namecard)})`,
  } as React.CSSProperties;

  const getBuildId = (build: any) => `${build.characterId}${build.type}`;

  const calcOptions = useMemo(
    () =>
      calculations
        ? Object.keys(calculations).map((calcId: any) => {
            const c = calculations[calcId];
            const leaveOnlyNumbersRegex = /\D+/g;
            const _ranking = +(c.ranking + "")?.replace(
              leaveOnlyNumbersRegex,
              ""
            );
            const _top = c.ranking
              ? `${
                  Math.min(100, Math.ceil((_ranking / c.outOf) * 100)) || "?"
                }%`
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
                    <div style={{ width: 60 }}>top {_top}</div>
                    {c.variant?.displayName
                      ? `(${c.variant?.displayName}) `
                      : ""}{" "}
                    {shorterName}
                  </span>
                  <span className="for-pills">
                    <img src={c.weapon.icon} />
                    top {_top}{" "}
                    {c.variant?.displayName
                      ? `(${c.variant?.displayName}) `
                      : " "}
                    {c.short}
                  </span>
                </span>
              </>
            );

            const rawLabel = `top ${_top} ${c.weapon.name} R${
              c.weapon.refinement
            } ${c.name}${
              c.variant?.displayName ? ` ${c.variant?.displayName}` : ""
            }`;

            const thisOpt = {
              label,
              rawLabel,
              value: calcId,
              fieldKey: calcId,
            };

            return thisOpt;
          })
        : [],
    [calculations]
  );

  const hasLeaderboardsColumn = filteredLeaderboards.length > 0;

  const buildCV = row.critValue || 0;
  const borderColor = getCharacterCvColor(buildCV);

  const bgStyle = {} as React.CSSProperties;

  if (borderColor === "rainbow") {
    // bgStyle.boxShadow = "0 0 0 1px red";
  } else {
    // bgStyle.boxShadow = `0 0 0 1px ${borderColor}`;
  }

  bgStyle.boxShadow = `0 0 0 1px #5f5f5f`; // @TODO: ...

  const toTalentProps = (row: any, keys: string[]) => {
    const talent = row?.talentsLevelMap?.[keys[0]];
    if (!talent) return null;

    const assetKey = keys[1] || keys[0];
    const asset = row.assets.talents[assetKey];
    const icon = asset ? toEnkaUrl(asset) : talent.icon;

    return {
      ...talent,
      icon,
    };
  };

  const talentNAProps = toTalentProps(row, ["normalAttacks", "normalAttack"]);
  const talentSkillProps = toTalentProps(row, ["elementalSkill"]);
  const talentBurstProps = toTalentProps(row, ["elementalBurst"]);

  const cardOverlay = (
    <>
      <div className="character-name">
        <div>{row.name}</div>
        {!privacyFlag && (
          <div className="character-nickname">{row.owner.nickname}</div>
        )}
      </div>
      {/* 
        <div className="character-title">{row.characterMetadata.title}</div>
        <div className="character-title">{row.characterMetadata.constellation}</div> 
      */}
      <div className="character-level">
        Lv. {row.propMap.level.val}
        <span className="opacity-5">
          /{ascensionToLevel(row.propMap.ascension.val)}
        </span>
      </div>
      <div className="character-friendship">x {row.fetterInfo.expLevel}</div>
      <div className="character-cv">{row.critValue.toFixed(1)} cv</div>
      {!privacyFlag && <div className="character-uid">{row.uid}</div>}
      <div className="character-constellations">
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const constImg = row.assets.constellations[i];
          return (
            <img
              key={`const-${i}`}
              className={row.constellation >= i + 1 ? "activated" : ""}
              src={toEnkaUrl(constImg)}
            />
          );
        })}
      </div>
      <div className="character-talents">
        <TalentDisplay talent={talentNAProps} />
        <TalentDisplay talent={talentSkillProps} />
        <TalentDisplay talent={talentBurstProps} />
      </div>
      <div className="character-weapon">
        <div className="weapon-icon">
          <img src={row.weapon.icon} />
        </div>
        <div>
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
    </>
  );

  const cardContainer = (
    <div
      className={`character-card-container ${
        simplifyColors ? "simplify-colors" : ""
      } ${hasLeaderboardsColumn ? "" : "no-leaderboards"}`}
      style={style}
      id={getBuildId(row)}
    >
      <div className="absolute-overlay">{cardOverlay}</div>
      <div className="character-left">{characterShowcase}</div>
      <div className="character-middle">{characterLbs}</div>
      <div className="character-right">{characterStats}</div>
      <div className="character-artifacts">
        {/* ... */}
        {artifactsDiv}
      </div>
      <div
        className={`character-card-background ${
          !namecardBg ? "elemental-bg" : ""
        }`}
        style={bgStyle}
      >
        <div />
      </div>
    </div>
  );

  const handleChange = (options: MultiValue<any>) => {
    const filters = options.map((o) => o.value);
    setFilteredLeaderboards(filters);
  };

  const selectedOptions = useMemo(() => {
    return calcOptions.filter((calc) => {
      return filteredLeaderboards.includes(calc.value);
    });
  }, [filteredLeaderboards, calcOptions]);

  return (
    <div className="flex expanded-row">
      <div style={{ margin: 20 }}>{cardContainer}</div>
      <div className="card-buttons">
        <button
          onClick={async () => {
            const cardNode = document.getElementById(getBuildId(row));
            if (!cardNode) return;

            const canvas = await html2canvas(cardNode, {
              allowTaint: true,
              backgroundColor: null,
              scale: 1.5,
            });

            document.body.appendChild(canvas);

            try {
              const dataUrl = await toPng(cardNode, {
                pixelRatio: 1.5,
                // cacheBust: true,
              });

              // @debug
              const _img = new Image();
              _img.src = dataUrl;
              document.body.appendChild(_img);

              // @todo ?
              const _link = document.createElement("a");
              _link.download = `${row.name}-${row._id}.png`;
              _link.href = dataUrl;
              _link.click();
            } catch (err) {
              console.log(err);
            }
          }}
        >
          DOWNLOAD IMAGE
        </button>
        <div className="card-configuration">
          <div className="card-checkboxes">
            <div style={{ color: "gray" }}>
              Enka style
              <input
                type="checkbox"
                onChange={(e: any) => setEnkaStyle(!!e.target.checked)}
                disabled
              />
            </div>
            <div>
              Simplify colors
              <input
                type="checkbox"
                onChange={(e: any) => setSimplifyColors(!!e.target.checked)}
              />
            </div>
            <div>
              Namecard background
              <input
                type="checkbox"
                onChange={(e: any) => setNamecardBg(!!e.target.checked)}
              />
            </div>
            <div>
              Hide UID & ranking
              <input
                type="checkbox"
                onChange={(e: any) => setPrivacyFlag(!!e.target.checked)}
              />
            </div>
          </div>
          <div className="card-select">
            <div className="react-select-calcs-wrapper">
              <ReactSelect
                isMulti
                options={calcOptions}
                menuPortalTarget={document.body}
                styles={reactSelectCustomFilterTheme}
                maxMenuHeight={450}
                getOptionValue={(option: any) => option.rawLabel}
                placeholder="Choose leaderboards"
                value={selectedOptions}
                defaultValue={selectedOptions}
                onChange={(options) => {
                  if (!options) return;
                  handleChange(options);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
