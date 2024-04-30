import "./style.scss";

import React, { useEffect, useMemo, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Spinner } from "../Spinner";
import axios from "axios";
import { cssJoin } from "../../utils/helpers";
import { faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { useParams } from "react-router-dom";

type Additional = {
  name: string;
  quantity?: number;
  type?: string;
  value: number;
  adjustedValue?: number;
};

type DamageData = {
  result: number;
  id: string;
  additional?: Additional[];
};

type DamageDistrubutionProps = {
  row: any;
};

export const DamageDistrubution: React.FC<DamageDistrubutionProps> = ({
  row,
}) => {
  const [damageData, setDamageData] = useState<DamageData>();
  const [highlighted, setHighlighted] = useState<Additional>();
  const [show, setShow] = useState(false);
  // const [byType, setByType] = useState<boolean>(false);

  const { calculationId } = useParams();

  const getDamageDistribution = async () => {
    if (!row.md5) return;
    const _uid = encodeURIComponent(row.uid);
    const _md5 = encodeURIComponent(row.md5);
    const dmgDistributionURL = `/api/damageDistribution/${calculationId}/${_uid}/${_md5}`;
    const { data } = await axios.get(dmgDistributionURL);

    setDamageData(data.data);
    if (data.data?.additional) {
      setHighlighted(data.data.additional?.[0]);
    }
  };

  useEffect(() => {
    if (show && !damageData) {
      getDamageDistribution();
    }
  }, [show]);

  const COLORS_MAP: any = {
    N: "rgb(209,152,11)",
    C: "rgb(211,61,23)",
    E: "rgb(20,126,179)",
    Q: "rgb(41,166,52)",
    A: "rgb(0,163,150)",
    // X: "RGB(157,63,157)"
  };

  const VAPE_COLORS_MAP: any = {
    N: "rgb(239,182,11)",
    C: "rgb(241,61,23)",
    E: "rgb(20,136,219)",
    Q: "rgb(41,206,62)",
    A: "rgb(0,193,180)",
  };

  const displayHighligted = useMemo(() => {
    if (!highlighted || !damageData) {
      return <div className="highlighted-damage-source" />;
    }

    const _MAP = highlighted.name.includes("Vape")
      ? VAPE_COLORS_MAP
      : COLORS_MAP;

    let _color = highlighted.type
      ? _MAP[highlighted.type.slice(0, 1)] || "orange"
      : "gray";

    const _value = +highlighted.value.toFixed(0);
    const _adjustedValue = highlighted.adjustedValue
      ? +highlighted.adjustedValue.toFixed(0)
      : null;

    const total = damageData.result;
    const val = highlighted.adjustedValue || highlighted.value;
    const totalVal = val * (highlighted.quantity || 1);
    const _p = (totalVal / total) * 100;

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
              <tr>
                <td>Value</td>
                <td style={{ color: _color }}>{_value}</td>
              </tr>
              {_adjustedValue && (
                <tr>
                  <td>Adjusted value</td>
                  <td style={{ color: _color }}>{_adjustedValue}</td>
                </tr>
              )}
              <tr>
                <td>Quantity</td>
                <td style={{ color: _color }}>{highlighted.quantity || 1}×</td>
              </tr>
              <tr>
                <td>% of total</td>
                <td style={{ color: _color }}>{+_p.toFixed(2)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }, [highlighted, damageData]);

  const displayProportions = useMemo(() => {
    if (!damageData?.additional) return <></>;

    const instances = damageData.additional;
    const total = damageData.result;

    return (
      <>
        <div className="damage-distribution-container">
          {instances.map((el, i) => {
            const val = (el.adjustedValue || el.value) * (el.quantity || 1);
            let _p = (val / total) * 100;

            if (_p < 0) _p = Math.abs(_p);
            if (_p < 2) _p = 2;

            const displayValue = +val.toFixed(0);
            const _title =
              (el.quantity ? `${el.quantity}x ${el.name}` : el.name) +
              ` = ${displayValue}`;

            const _MAP = el.name.includes("Vape")
              ? VAPE_COLORS_MAP
              : COLORS_MAP;

            const _color = el.type
              ? _MAP[el.type.slice(0, 1)] || "orange"
              : "gray";

            return (
              <div
                tabIndex={0}
                className="damage-data"
                key={`${i}-${el.name}`}
                title={_title}
                style={{
                  width: `${_p}%`,
                  backgroundColor: _color,
                }}
                onMouseOver={() => setHighlighted(el)}
                onClick={() => setHighlighted(el)}
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

    const instances = damageData.additional;
    const total = damageData.result;

    return (
      <div className="display-formula">
        {instances.map((el, i) => {
          const val = (el.adjustedValue || el.value);
          const _MAP = el.name.includes("Vape") ? VAPE_COLORS_MAP : COLORS_MAP;

          const _color = el.type
            ? _MAP[el.type.slice(0, 1)] || "orange"
            : "gray";

          const nextValue = instances[i + 1]?.value;
          const displayValue = +val.toFixed(0);
          const _title = el.quantity ? `${el.quantity}x ${el.name}` : el.name;

          return (
            <span
              title={_title}
              key={`${i}-${el.name}`}
              onMouseOver={() => setHighlighted(el)}
              onClick={() => setHighlighted(el)}
              className="pointer"
            >
              <span tabIndex={0} style={{ color: _color, fontWeight: 600 }}>
                {(el?.quantity || 1) > 1 ? `${el?.quantity}× ` : ""}
                {Math.abs(displayValue)}
              </span>
              {!!nextValue && <span>{nextValue > 0 ? " + " : " - "}</span>}
            </span>
          );
        })}
        {" = "}
        <span className="final-result">{+total.toFixed(0)}</span>
      </div>
    );
  }, [damageData, highlighted]);

  const iconClassNames = cssJoin([
    "sort-direction-icon",
    !show ? "rotate-180deg" : "",
  ]);

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
