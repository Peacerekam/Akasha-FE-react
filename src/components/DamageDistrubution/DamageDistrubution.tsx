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

type Additional = {
  name: string;
  quantity?: number;
  type?: string;
  value: number;
  index?: number;
};

type DamageData = {
  result: number;
  id: string;
  additional?: Additional[];
  calculation: {
    // ranking?: number;
    // outOf?: number;
    name?: string;
    short?: string;
    weapon?: any;
    hidden?: boolean;
  };
};

type DamageDistrubutionProps = {
  row: any;
  selectedCalculationId?: string;
};

const isReaction = (str: string) => {
  str = str.toLowerCase();

  return (
    str.includes("vape") ||
    str.includes("melt") ||
    str.includes("spread") ||
    str.includes("aggr")
  );
};

const COLORS_MAP: any = {
  N: "rgb(239,182,11)",
  C: "rgb(241,61,23)",
  E: "rgb(20,136,219)",
  Q: "rgb(41,206,62)",
  P: "rgb(0,193,180)",
};

const VAPE_COLORS_MAP: any = {
  N: "rgb(209,152,11)",
  C: "rgb(211,61,23)",
  E: "rgb(20,126,179)",
  Q: "rgb(41,166,52)",
  P: "rgb(0,163,150)",
};

export const DamageDistrubution: React.FC<DamageDistrubutionProps> = ({
  row,
  selectedCalculationId,
}) => {
  const [calculationId, setCalculationId] = useState<string>(
    selectedCalculationId || ""
  );
  const [allDamageData, setAllDamageData] = useState<DamageData[]>();
  const [highlighted, setHighlighted] = useState<Additional>();
  const [show, setShow] = useState(false);

  const { translate } = useContext(TranslationContext);
  const { getTopRanking } = useContext(SettingsContext);

  const variantlessId = useMemo(
    () => calculationId.slice(0, 10),
    [calculationId]
  );

  const damageData = useMemo(() => {
    // .findIndex(
    //   (x: any) => x.name === "Time" || x.type === "Time"
    // ) || -1;
    return allDamageData?.find((x) => x.id === variantlessId);
  }, [allDamageData, variantlessId]);

  const setLargestValueAsHighlighted = (toHighlight?: DamageData) => {
    if (!toHighlight?.additional) return;

    const indexOfLargestValue = toHighlight.additional.reduce(
      (max: number, curr: Additional, currIndex: number, arr: Additional[]) => {
        const totalValue_A = arr[max].value * (arr[max].quantity || 1);
        const totalValue_B = curr.value * (curr.quantity || 1);
        return totalValue_B > totalValue_A ? currIndex : max;
      },
      0
    );

    setHighlighted({
      ...toHighlight.additional[indexOfLargestValue],
      index: indexOfLargestValue,
    });
  };

  const getDamageDistribution = async () => {
    if (!row.md5) return;

    const _uid = encodeURIComponent(row.uid);
    const _md5 = encodeURIComponent(row.md5);
    const dmgDistributionURL = `/api/damageDistribution/${variantlessId}/${_uid}/${_md5}`;
    const { data } = await axios.get(dmgDistributionURL);

    setAllDamageData(data.data);

    const toHighlight: DamageData = data.data.find(
      (x: DamageData) => x.id === variantlessId
    );

    setLargestValueAsHighlighted(toHighlight);
  };

  useEffect(() => {
    if (show && !damageData) {
      getDamageDistribution();
    }
  }, [show]);

  useEffect(() => {
    setLargestValueAsHighlighted(damageData);
  }, [variantlessId, damageData]);

  const displayHighligted = useMemo(() => {
    if (!highlighted?.name || !damageData?.additional) {
      return <div className="highlighted-damage-source" />;
    }

    const _MAP = isReaction(highlighted.name) ? VAPE_COLORS_MAP : COLORS_MAP;

    let _color = highlighted.type
      ? _MAP[highlighted.type.slice(0, 1)] || "gray"
      : "gray";

    const _value = roundToFixed(highlighted.value, 0);

    const timeIndex = damageData.additional.findIndex((x) => x.name === "Time");
    const instances = [...damageData.additional];

    if (timeIndex > -1) {
      instances.splice(timeIndex, 1);
    }

    const total =
      timeIndex > -1
        ? instances.reduce((acc, val) => {
            return acc + val.value * (val?.quantity || 1);
          }, 0)
        : damageData.result;

    const val = highlighted.value;
    const totalVal = val * (highlighted.quantity || 1);
    const _p = (totalVal / total) * 100;
    const _quantity = roundToFixed(highlighted?.quantity || 1, 2);

    return (
      <div className="highlighted-damage-source">
        <div>
          <table cellSpacing={0}>
            <thead>
              <tr>
                <th style={{ color: _color }} colSpan={2}>
                  {highlighted.name}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Group</td>
                <td style={{ color: _color }}>{highlighted.type || "?"}</td>
              </tr>
              {/* <tr>
                <td>Value</td>
                <td style={{ color: _color }}>{_value}</td>
              </tr> */}
              {/* <tr>
                <td>Quantity</td>
                <td style={{ color: _color }}>{highlighted.quantity || 1}×</td>
              </tr> */}
              <tr>
                <td>Total Value</td>
                <td style={{ color: _color }}>
                  {_quantity}×{_value} = {roundToFixed(totalVal, 0)}
                </td>
              </tr>
              <tr>
                <td>% of Result</td>
                <td style={{ color: _color }}>{roundToFixed(_p, 2)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }, [damageData, highlighted]);

  const displayProportions = useMemo(() => {
    if (!damageData?.additional) return <></>;

    const total = damageData.result;

    const timeIndex = damageData.additional.findIndex((x) => x.name === "Time");
    const instances = [...damageData.additional];

    if (timeIndex > -1) {
      instances.splice(timeIndex, 1);
    }

    return (
      <>
        <div className="damage-distribution-container">
          {instances.map((el, i) => {
            const val = el.value * (el.quantity || 1);
            let _p = (val / total) * 100;

            if (_p < 0) _p = Math.abs(_p);
            if (_p < 2) _p = 2;

            // const displayValue = +val.toFixed(0);
            const _quantity = roundToFixed(el?.quantity || 1, 2);
            const _title =
              (el?.quantity ? `${_quantity}x ${el.name}` : el.name) +
              ` = ${roundToFixed(val, 2)}`;

            const _MAP = isReaction(el.name) ? VAPE_COLORS_MAP : COLORS_MAP;

            const _color = el.type
              ? _MAP[el.type.slice(0, 1)] || "gray"
              : "gray";

            const classNames = cssJoin([
              "damage-data",
              i === highlighted?.index ? "highlighted" : "",
            ]);

            const _style = {
              width: `${_p}%`,
              backgroundColor: _color,
            } as React.CSSProperties;

            return (
              <div
                tabIndex={0}
                className={classNames}
                key={`${i}-${el.name}`}
                title={_title}
                style={_style}
                onMouseOver={() => setHighlighted({ ...el, index: i })}
                onClick={() => setHighlighted({ ...el, index: i })}
              >
                <div tabIndex={0} className="damage-data-content">
                  {el.type || "?"}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  }, [damageData, highlighted]);

  const displayFormula = useMemo(() => {
    if (!damageData?.additional) return <></>;

    const timeIndex = damageData.additional.findIndex((x) => x.name === "Time");
    const time = timeIndex > -1 ? damageData.additional[timeIndex].value : null;
    const instances = [...damageData.additional];

    if (timeIndex > -1) {
      instances.splice(timeIndex, 1);
    }

    const total =
      timeIndex > -1
        ? instances.reduce((acc, val) => {
            return acc + val.value * (val?.quantity || 1);
          }, 0)
        : damageData.result;

    const roundedTotal = roundToFixed(total, 0);

    return (
      <div className="display-formula">
        {instances.map((el, i) => {
          const val = el.value;
          const _MAP = isReaction(el.name) ? VAPE_COLORS_MAP : COLORS_MAP;

          const _color = el.type ? _MAP[el.type.slice(0, 1)] || "gray" : "gray";

          const nextValue = instances[i + 1]?.value;
          const displayValue = roundToFixed(val, 0);
          const _quantity = roundToFixed(el?.quantity || 1, 2);
          const _title = el.quantity
            ? `${_quantity}x ${el.name} = ${roundToFixed(val, 2)}`
            : `${el.name} = ${roundToFixed(val, 2)}`;

          const classNames = cssJoin([
            "pointer",
            i === highlighted?.index ? "highlighted" : "",
          ]);

          const _style = {
            color: _color,
            fontWeight: 600,
            "--color": _color.replace(")", ", 0.5)"),
          } as React.CSSProperties;

          return (
            <span
              title={_title}
              key={`${i}-${el.name}`}
              onMouseOver={() => setHighlighted({ ...el, index: i })}
              onClick={() => setHighlighted({ ...el, index: i })}
              className={classNames}
            >
              <span tabIndex={0} style={_style}>
                {(el?.quantity || 1) !== 1 ? `${_quantity}×` : ""}
                {Math.abs(displayValue)}
              </span>
              {nextValue !== undefined && (
                <span>{nextValue >= 0 ? " + " : " - "}</span>
              )}
            </span>
          );
        })}
        {" = "}
        <span className={time ? "" : "final-result"}>{roundedTotal}</span>

        {/* refactor a bit? */}
        {time && (
          <div style={{ marginTop: 10 }}>
            <span>{roundedTotal}</span>
            <span
              style={{
                fontSize: 14,
                color: "white",
                position: "relative",
                bottom: 1,
              }}
            >
              {" / "}
            </span>
            <span>{time}</span>
            {" seconds = "}
            <span className="final-result">
              {/* @TODO: this should show actual DPS later */}
              {roundToFixed(damageData.result, 0)}
            </span>
            {" DPS"}
          </div>
        )}
      </div>
    );
  }, [damageData, highlighted]);

  const iconClassNames = cssJoin([
    "sort-direction-icon",
    !show ? "rotate-180deg" : "",
  ]);

  const calcOptions = useMemo(
    () =>
      allDamageData && allDamageData.length > 0
        ? allDamageData
            .filter((x) => !x?.calculation?.hidden)
            .map((_data) => {
              const calc = _data.calculation;

              // const leaveOnlyNumbersRegex = /\D+/g;
              // const _ranking = +(calc.ranking + "")?.replace(
              //   leaveOnlyNumbersRegex,
              //   ""
              // );

              // const _top = calc?.ranking
              //   ? `${getTopRanking(_ranking, calc?.outOf || 0) || "?"}%`
              //   : "";

              const label = (
                <>
                  <span className="react-select-custom-option">
                    <span className="for-dropdown">
                      <WeaponMiniDisplay
                        icon={toEnkaUrl(calc?.weapon?.icon)}
                        refinement={calc?.weapon?.refinement}
                      />
                      <div
                        style={{
                          width: 150,
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                        }}
                      >
                        {translate(calc?.weapon?.name)}
                      </div>
                      {/* <div style={{ width: 80 }}>top {_top}</div> */}
                      {/* {calc.variant ? <div>({calc.variant})</div> : ""} */}{" "}
                      <div>{calc?.name}</div>
                    </span>
                    <span className="for-pills">
                      <img alt="" src={toEnkaUrl(calc?.weapon?.icon)} />
                      {translate(calc?.weapon?.name)}
                      {/* - top {_top} */}
                      {/* {calc.variant ? <div>({calc.variant})</div> : ""}{" "} */}{" "}
                      {calc?.name}
                    </span>
                  </span>
                </>
              );

              const rawLabel = `${calc?.weapon?.name} R${calc?.weapon?.refinement} ${calc?.name}`;

              const thisOpt = {
                label,
                rawLabel,
                value: _data.id,
              };

              return thisOpt;
            })
        : [],
    [allDamageData, translate, getTopRanking]
  );

  const handleSelectChange = (option: any) => {
    setCalculationId(option.value);
  };

  const selectedOption = useMemo(() => {
    return calcOptions.find((d) => d.value === variantlessId);
  }, [allDamageData, variantlessId, translate]);

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
  }, [allDamageData, selectedOption]);

  return (
    <div className="expanded-row flex">
      <div className="damage-distribution-wrapper">
        <div className="clickable" onClick={() => setShow((prev) => !prev)}>
          {show ? "Hide" : "Show"} damage distribution
          <FontAwesomeIcon
            className={iconClassNames}
            icon={faChevronUp}
            size="1x"
          />
        </div>
        {show &&
          (!damageData ? (
            <Spinner />
          ) : (
            <>
              <div className="calc-selection">{calcsSelection}</div>
              {displayProportions}
              <div className="side-by-side">
                {displayHighligted}
                {displayFormula}
              </div>
            </>
          ))}
      </div>
    </div>
  );
};
