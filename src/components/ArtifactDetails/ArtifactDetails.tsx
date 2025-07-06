import "./style.scss";

import {
  MAX_ROLLS,
  ROUNDED_REAL_SUBSTAT_VALUES,
  STAT_NAMES,
} from "../../utils/substats";
import { faArrowRight, faX } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";

import { Artifact } from "../Artifact/Artifact";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Spinner } from "../Spinner";
import { StatIcon } from "../StatIcon";
import axios from "axios";
import { cssJoin } from "../../utils/helpers";

type ArtifactDetailsProps = {
  artifactHash: string;
  uid: string;
};

export const ArtifactDetails: React.FC<ArtifactDetailsProps> = (row) => {
  const [artifactDetails, setArtifactDetails] = useState([]);

  const getArtifactDetails = async () => {
    const _uid = encodeURIComponent(row.uid);
    const ARTIFACT_DETAILS_URL = `/api/artifactDetails/${_uid}/${row.artifactHash}`;
    const { data } = await axios.get(ARTIFACT_DETAILS_URL);
    if (data.data) {
      setArtifactDetails(data.data);
    }
  };

  useEffect(() => {
    getArtifactDetails();
  }, []);

  return (
    <div className="expanded-row">
      <div
        className="artifact-details-wrapper"
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {artifactDetails.length === 0 ? <Spinner /> : ""}
        {artifactDetails.map((artifact: any, index: number) => {
          const isConsumed =
            artifactDetails.length > 1 && index !== artifactDetails.length - 1;

          const isSelected =
            artifactDetails.length > 1 && row.artifactHash === artifact._id;

          const isLast = index === artifactDetails.length - 1;

          const classNames = cssJoin([
            "artifact-details flex",
            isConsumed ? "is-consumed" : "",
            isSelected ? "selected-artifact" : "",
          ]);

          const rollsByType = artifact.substatsIdList.reduce(
            (acc: any, val: number) => {
              const { type, value } = ROUNDED_REAL_SUBSTAT_VALUES[val];
              const substatName = STAT_NAMES[type];

              if (!acc[substatName]) {
                acc[substatName] = [value];
              } else {
                acc[substatName].push(value);
              }

              return acc;
            },
            {}
          );

          return (
            <div className={classNames} key={artifact._id}>
              {index !== 0 && (
                <div className="arrow-right">
                  <FontAwesomeIcon icon={faArrowRight} size={`2x`} />
                </div>
              )}

              <div>
                <Artifact
                  key={artifact._id}
                  artifact={artifact}
                  width={isLast ? 250 : 210}
                />

                <div className="consume-icon">
                  {isConsumed && <FontAwesomeIcon icon={faX} size={`10x`} />}
                </div>

                {/* <div style={{ textAlign: "center" }}>
                  rerollNum: {artifact.rerollNum}
                </div> */}

                {/* @TODO: fix this */}
                <div
                  style={{
                    marginTop: 10,
                    // width: 250,
                    // display: "none"
                  }}
                  className="display-rolls"
                  tabIndex={0}
                >
                  {Object.keys(artifact.substats).map((key) => {
                    return (
                      <div
                        key={key}
                        className="flex gap-5"
                        style={{ justifyContent: "left" }}
                      >
                        {rollsByType[key].map((roll: number, j: number) => {
                          // const isLast = j === rollsByType[key].length - 1;
                          // const sum = isLast
                          //   ? rollsByType[key].reduce(
                          //       (acc: number, val: number) => acc + val,
                          //       0
                          //     )
                          //   : 0;

                          const rv = ((roll / MAX_ROLLS[key]) * 100).toFixed(0);
                          const cellWidth = 35;

                          return (
                            <div
                              key={`${roll}-${j}`}
                              style={{
                                flexWrap: "nowrap",
                                // flex: isLast ? 1 : 0,
                                // justifyContent: isLast
                                //   ? "space-between"
                                //   : "center",
                                fontSize: 12,
                                display: "flex",
                                // alignItems: "center",
                                // textAlign: "right",
                                gap: 5,
                              }}
                            >
                              {j === 0 && <StatIcon name={key} />}
                              {j !== 0 ? "- " : ""}

                              <div
                                className="exact-substat"
                                style={{ minWidth: cellWidth }}
                              >
                                {roll}
                              </div>

                              <div
                                className="roll-value"
                                style={{ minWidth: cellWidth }}
                              >
                                {rv}%
                              </div>

                              {/* {!isLast && (
                                <div
                                  className="arrow-right opacity-5"
                                  style={{ marginLeft: 5 }}
                                >
                                  <FontAwesomeIcon
                                    icon={faArrowRight}
                                    size={`1x`}
                                  />
                                </div>
                              )} */}

                              {/* {isLast && (
                                <div style={{ width: 50, textAlign: "left" }}>
                                  <StatIcon name={key} /> {+sum.toFixed(2)}
                                </div>
                              )} */}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
