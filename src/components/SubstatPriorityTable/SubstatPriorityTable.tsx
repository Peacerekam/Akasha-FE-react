import "./style.scss";

import React, { useContext, useEffect, useMemo, useState } from "react";
import { cssJoin, toEnkaUrl } from "../../utils/helpers";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactSelect from "react-select";
import { SettingsContext } from "../../context/SettingsProvider/SettingsProvider";
import { Spinner } from "../Spinner";
import { TranslationContext } from "../../context/TranslationProvider/TranslationProviderContext";
import { WeaponMiniDisplay } from "../WeaponMiniDisplay";
import axios from "axios";
import { faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { reactSelectCustomFilterTheme } from "../../utils/reactSelectCustomFilterTheme";
import { roundToFixed } from "../../utils/substats";

type SubstatPriority = {
  calculation: {
    calculationId: string;
    name: string;
    short?: string;
    variant?: string;
    hidden?: boolean;
    weapon: {
      name: string;
      icon: string;
      substat: string;
      type: string;
      rarity: string;
      refinement: number;
    };
  };
  substats: {
    [substatName: string]: {
      result: number;
      newRank: number | string;
      oldRank: number | string;
      substatValue: number;
      outOf: number;
    };
  };
};

type SubstatPriorityTableProps = {
  row: any;
  selectedCalculationId?: string;
};

export const SubstatPriorityTable: React.FC<SubstatPriorityTableProps> = ({
  row,
  selectedCalculationId,
}) => {
  const [calculationId, setCalculationId] = useState<string>(
    selectedCalculationId || ""
  );
  const [priorityData, setPriorityData] = useState<SubstatPriority[]>([]);
  const [relativeTo, setRelativeTo] = useState<string>("Base");
  const [show, setShow] = useState(false);

  const { translate } = useContext(TranslationContext);
  const { getTopRanking } = useContext(SettingsContext);

  const getSubstatPriority = async () => {
    if (!row.md5) return;
    const _uid = encodeURIComponent(row.uid);
    const _md5 = encodeURIComponent(row.md5);
    const calcDetailsURL = `/api/substatPriority/${_uid}/${_md5}`;
    const { data } = await axios.get(calcDetailsURL);
    setPriorityData(data.data);

    // @TODO: in the future make it fetch only the data for currently selected calculationId
    // @TODO: needs a small rewrite on the backend
  };

  useEffect(() => {
    if (show && priorityData && priorityData.length === 0) {
      getSubstatPriority();
    }
  }, [show]);

  useEffect(() => {
    if (selectedCalculationId) {
      setCalculationId(selectedCalculationId);
    }
  }, [selectedCalculationId]);

  const handleSelectChange = (option: any) => {
    setCalculationId(option.value);
  };

  const calcOptions = useMemo(
    () =>
      priorityData && priorityData.length > 0
        ? priorityData
            .filter((x) => !x.calculation?.hidden)
            .map((_data) => {
              const calc = _data.calculation;

              const _base = _data.substats["Base"];
              const leaveOnlyNumbersRegex = /\D+/g;
              const _ranking = +(_base.oldRank + "")?.replace(
                leaveOnlyNumbersRegex,
                ""
              );

              const _top = _base.oldRank
                ? `${getTopRanking(_ranking, _base.outOf) || "?"}%`
                : "";

              const label = (
                <>
                  <span className="react-select-custom-option">
                    <span className="for-dropdown">
                      <WeaponMiniDisplay
                        icon={toEnkaUrl(calc.weapon.icon)}
                        refinement={calc.weapon.refinement}
                      />
                      <div
                        style={{
                          width: 150,
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                        }}
                      >
                        {translate(calc.weapon.name)}
                      </div>
                      <div style={{ width: 80 }}>top {_top}</div>
                      {calc.variant ? <div>({calc.variant})</div> : ""}
                      <div>{calc.name}</div>
                    </span>
                    <span className="for-pills">
                      <img alt="" src={toEnkaUrl(calc.weapon.icon)} />
                      {translate(calc.weapon.name)} - top {_top}
                      {calc.variant ? <div>({calc.variant})</div> : ""}{" "}
                      {calc.name}
                    </span>
                  </span>
                </>
              );

              const weaponName = _data.calculation.weapon.name;
              const weaponRefinement = _data.calculation.weapon.refinement;
              const calcName = _data.calculation.name;
              const calcVariant = calc.variant || "";
              const rawLabel = `${weaponName} R${weaponRefinement} ${calcName} ${calcVariant}`;

              const thisOpt = {
                label,
                rawLabel,
                value: _data.calculation.calculationId,
              };

              return thisOpt;
            })
        : [],
    [priorityData, translate, getTopRanking]
  );

  const selectedOption = useMemo(() => {
    return calcOptions.find((d) => d.value === calculationId);
  }, [priorityData, calculationId, translate]);

  const calcsSelection = useMemo(() => {
    return (
      <>
        <div
          className={`substat-priority-select-wrapper ${
            calcOptions.length === 0 ? "no-calcs" : ""
          }`}
        >
          <span className="substat-priority-select-label">
            Select leaderboard
          </span>
          <div className="substat-priority-select">
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
                value={selectedOption}
                defaultValue={selectedOption}
                onChange={(options) => {
                  if (!options) return;
                  handleSelectChange(options);
                }}
              />
            </div>
          </div>
        </div>
      </>
    );
  }, [priorityData, selectedOption]);

  const selectedPriorityData = useMemo(() => {
    return priorityData?.find(
      (x) => x.calculation.calculationId === calculationId
    );
  }, [priorityData, calculationId, selectedOption]);

  //
  //  HEADERS
  //

  const alwaysIncludeHeaders = ["Base", "Crit RATE", "Crit DMG"];

  const tableHeaders = useMemo(() => {
    if (!selectedPriorityData?.substats) return null;

    return ["Substat name", ...Object.keys(selectedPriorityData?.substats)].map(
      (name) => {
        const value = selectedPriorityData.substats?.[name]?.result;
        if (
          !alwaysIncludeHeaders.includes(name) &&
          value === selectedPriorityData.substats["Base"].result
        ) {
          return null;
        }

        const isP_ = name.endsWith("%") || name.startsWith("Crit");
        const substatValue =
          selectedPriorityData.substats?.[name]?.substatValue;

        const _title =
          name === "Base"
            ? ""
            : `${substatValue}${isP_ ? "%" : ""} ${name.replace("%", "")}`;

        return (
          <td
            key={name}
            title={_title}
            className="substat-clickable"
            onClick={() => {
              if (name === "Substat name") return;
              setRelativeTo(name);
            }}
            style={{
              color: name === relativeTo ? "orange" : "",
            }}
          >
            {translate(name)}
          </td>
        );
      }
    );
  }, [
    priorityData,
    selectedPriorityData,
    selectedOption,
    relativeTo,
    translate,
  ]);

  //
  //  RESULTS ROWS
  //
  const resultsTableRows = useMemo(() => {
    if (!selectedPriorityData?.substats) return null;

    const highestGainsNum = Math.max(
      ...Object.values(selectedPriorityData.substats).map((x) => x.result)
    );

    const highestPercentage =
      (highestGainsNum * 100) / selectedPriorityData.substats["Base"].result -
      100;

    return [
      "Leaderboard result",
      ...Object.keys(selectedPriorityData?.substats),
    ].map((name) => {
      const value = selectedPriorityData?.substats?.[name]?.result;
      if (!value) return <td key={name}>{name}</td>;
      if (
        !alwaysIncludeHeaders.includes(name) &&
        value === selectedPriorityData.substats["Base"].result
      )
        return null;

      const relativeComparator = selectedPriorityData.substats["Base"].result;
      const relativeValue = (value * 100) / relativeComparator - 100;

      const revRGB = 255 - (relativeValue / highestPercentage) * 255;
      const cellStyle = {
        color: `rgba(${revRGB}, 255,${revRGB}, 1)`,
      };

      return (
        <td style={cellStyle} key={`${name}-val`}>
          {roundToFixed(value, 0)}
        </td>
      );
    });
  }, [priorityData, selectedPriorityData, selectedOption]);

  const rankToNum = (n: string | number) => {
    const _n = ("" + n)?.replace("~", "");
    const _nVal = _n.startsWith("(") ? _n.slice(1, _n.length - 1) : _n;

    return +_nVal;
  };

  //
  //  RANKINGS ROWS
  //
  const rankingsTableRows = useMemo(() => {
    if (!selectedPriorityData?.substats) return null;

    const highestGainsNum = Math.max(
      ...Object.values(selectedPriorityData.substats).map((x) => x.result)
    );

    const highestPercentage =
      (highestGainsNum * 100) / selectedPriorityData.substats["Base"].result -
      100;

    return [
      "New leaderboard ranking",
      ...Object.keys(selectedPriorityData?.substats),
    ].map((name) => {
      const value = selectedPriorityData?.substats?.[name]?.result;
      if (!value) return <td key={name}>{name}</td>;
      if (
        !alwaysIncludeHeaders.includes(name) &&
        value === selectedPriorityData.substats["Base"].result
      )
        return null;

      const relativeComparator = selectedPriorityData.substats["Base"].result;
      const relativeValue = (value * 100) / relativeComparator - 100;

      const revRGB = 255 - (relativeValue / highestPercentage) * 255;
      const cellStyle = {
        color: `rgba(${revRGB}, 255,${revRGB}, 1)`,
      };

      const newRank = selectedPriorityData?.substats?.[name]?.newRank;
      const oldRank = selectedPriorityData?.substats?.[name]?.oldRank;
      const _newRank = rankToNum(newRank);
      const _oldRank = rankToNum(oldRank);
      const _diff = _oldRank - _newRank;

      if (relativeComparator === value) {
        return (
          <td style={cellStyle} key={`${name}-val`}>
            {oldRank}
          </td>
        );
      }

      return (
        <td style={cellStyle} key={`${name}-val`}>
          {name === "Base" ? oldRank : ""}
          {name !== "Base" ? Math.max(1, _newRank) : ""}{" "}
          {name === "Base" || _diff === 0 ? "" : `(+${_diff})`}
        </td>
      );
    });
  }, [priorityData, selectedPriorityData, selectedOption]);

  //
  //  DMG GAIN ROWS
  //
  const dmgGainTableRows = useMemo(() => {
    if (!selectedPriorityData?.substats) return null;

    const highestGainsNum = Math.max(
      ...Object.values(selectedPriorityData.substats).map((x) => x.result)
    );

    const highestPercentage =
      (highestGainsNum * 100) / selectedPriorityData.substats["Base"].result -
      100;

    return [
      "DMG/Result gain over base",
      ...Object.keys(selectedPriorityData?.substats),
    ].map((name) => {
      const value = selectedPriorityData?.substats?.[name]?.result;
      if (!value) return <td key={name}>{name}</td>;
      if (
        !alwaysIncludeHeaders.includes(name) &&
        value === selectedPriorityData.substats["Base"].result
      )
        return null;

      const dmgGainValue = value - selectedPriorityData.substats["Base"].result;

      const relativeValue =
        (value * 100) / selectedPriorityData.substats["Base"].result - 100;

      const roundedVal = roundToFixed(dmgGainValue, 0);
      const revRGB = 255 - (relativeValue / highestPercentage) * 255;
      const cellStyle = {
        color: `rgba(${revRGB}, 255,${revRGB}, 1)`,
        opacity: roundedVal === 0 ? 0.25 : 1,
      };

      return (
        <td
          className={roundedVal === 0 ? "opacity-5" : ""}
          key={`${name}-percentage`}
          style={cellStyle}
        >
          {roundedVal > 0 ? "+" : ""}
          {roundedVal || "-"}
        </td>
      );
    });
  }, [priorityData, selectedPriorityData, selectedOption]);

  //
  //  RELATIVE % ROWS
  //
  const relativeTableRows = useMemo(() => {
    if (!selectedPriorityData?.substats) return null;

    const highestGainsNum = Math.max(
      ...Object.values(selectedPriorityData.substats).map((x) => x.result)
    );

    const highestPercentage =
      (highestGainsNum * 100) / selectedPriorityData.substats["Base"].result -
      100;

    return [
      "% gain over base",
      ...Object.keys(selectedPriorityData?.substats),
    ].map((name) => {
      const value = selectedPriorityData?.substats?.[name]?.result;
      if (!value) return <td key={name}>{name}</td>;
      if (
        !alwaysIncludeHeaders.includes(name) &&
        value === selectedPriorityData.substats["Base"].result
      )
        return null;

      const relativeValue =
        (value * 100) / selectedPriorityData.substats["Base"].result - 100;

      const roundedVal = roundToFixed(relativeValue, 2);
      const revRGB = 255 - (relativeValue / highestPercentage) * 255;
      const cellStyle = {
        color: `rgba(${revRGB}, 255,${revRGB}, 1)`,
        opacity: roundedVal === 0 ? 0.25 : 1,
      };

      return (
        <td
          className={roundedVal === 0 ? "opacity-5" : ""}
          key={`${name}-percentage`}
          style={cellStyle}
        >
          {roundedVal > 0 ? "+" : ""}
          {roundedVal ? `${roundedVal}%` : "-"}
        </td>
      );
    });
  }, [priorityData, selectedPriorityData, selectedOption]);

  //
  //  RELATIVE TO ROLL % ROWS
  //
  const relativeRollTableRows = useMemo(() => {
    if (relativeTo === "Base") return null;
    if (!selectedPriorityData?.substats) return null;

    return [
      `% diff vs ${relativeTo} roll`,
      ...Object.keys(selectedPriorityData.substats),
    ].map((name) => {
      const value = selectedPriorityData?.substats?.[name]?.result;
      if (!value) return <td key={name}>{name}</td>;
      if (
        !alwaysIncludeHeaders.includes(name) &&
        value === selectedPriorityData.substats["Base"].result
      )
        return null;

      const dmgGainValue = value - selectedPriorityData.substats["Base"].result;
      const dmgRelToGainValue =
        selectedPriorityData.substats[relativeTo].result -
        selectedPriorityData.substats["Base"].result;

      const relativeValue =
        dmgRelToGainValue === 0
          ? 0
          : ((dmgGainValue - dmgRelToGainValue) / dmgRelToGainValue) * 100;

      const roundedVal = roundToFixed(relativeValue, 2);
      const revRGB =
        roundedVal === 0 ? 0 : 255 - Math.abs(relativeValue / 50) * 255;

      const cellStyle = {
        color:
          roundedVal === 0
            ? "white"
            : roundedVal > 0
            ? `rgba(${revRGB}, 255,${revRGB}, 1)`
            : `rgba(255, ${revRGB},${revRGB}, 1)`,
      };

      return (
        <td key={`${name}-percentage`} style={cellStyle}>
          {roundedVal > 0 ? "+" : ""}
          {roundedVal}%
        </td>
      );
    });
  }, [priorityData, selectedPriorityData, selectedOption, relativeTo]);

  const iconClassNames = cssJoin([
    "sort-direction-icon",
    !show ? "rotate-180deg" : "",
  ]);

  const displaySpinner = priorityData && priorityData.length === 0;

  return (
    <div className="expanded-row flex">
      <div className="substat-priority-wrapper">
        <div className="clickable" onClick={() => setShow((prev) => !prev)}>
          {show ? "Hide" : "Show"} substat priority
          <FontAwesomeIcon
            className={iconClassNames}
            icon={faChevronUp}
            size="1x"
          />
        </div>
        {show && (
          <div className="substat-priority-list">
            {displaySpinner ? (
              <Spinner />
            ) : (
              <>
                <div className="calc-selection">{calcsSelection}</div>
                <table className="substat-table" cellSpacing={0}>
                  <tbody>
                    <tr>{tableHeaders}</tr>
                    <tr>{resultsTableRows}</tr>
                    <tr>{dmgGainTableRows}</tr>
                    <tr>{relativeTableRows}</tr>
                    {relativeTo !== "Base" ? (
                      <tr>{relativeRollTableRows}</tr>
                    ) : null}
                    <tr>{rankingsTableRows}</tr>
                  </tbody>
                </table>
                <div className="substat-priority-help">
                  * above table shows how an additional single max substat roll
                  affects your leaderboard result. How you interpret this data
                  is up to you ¯\_(ツ)_/¯.
                  <br />
                  One interesting use is to find if you hit diminishing returns
                  on any of your stats. For example, some Ayaka builds with
                  extremely high Crit DMG might start seeing a better
                  performance from ATK% rolls instead. Similarly if any of the %
                  gains is much higher than the rest, chances are your build is
                  unbalanced and needs that stat.
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
