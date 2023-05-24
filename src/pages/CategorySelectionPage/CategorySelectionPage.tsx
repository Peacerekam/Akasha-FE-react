import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DomainBackground from "../../assets/images/Concept_Art_Liyue_Harbor.webp";
import {
  AdsComponent,
  HelpBox,
  Spinner,
  StylizedContentBlock,
  WeaponMiniDisplay,
} from "../../components";
import { FETCH_CATEGORIES_URL } from "../../utils/helpers";
import { showAds } from "../../App";

export type TransformedCategories = {
  characterName: string;
  icon: string;
  name: string;
  characterId: number;
  baseStats: any;
  rarity: string;
  element: string;
  weapontype: string;
  version: string;
  substat: string;
  ascensionStat: {
    [key: string]: number;
  };
  calcs: {
    [calcName: string]: {
      label: string;
      characterId: string;
      calculationId: string;
      short: string;
      details: string;
      categorySize?: number;
      weapon?: {
        name: string;
        icon: string;
        refinement: number;
        substat: string;
        type: string;
        rarity: string;
      };
      defaultFilter?: string;
    }[];
  };
};

export const CategorySelectionPage: React.FC = () => {
  // const [categories, setCategories] = useState<Category[]>();
  const [categoriesTransformed, setCategoriesTransformed] = useState<
    TransformedCategories[]
  >([]);

  const navigate = useNavigate();
  const pathname = window.location.pathname;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const response = await axios.get(FETCH_CATEGORIES_URL);
    const { dataTransformed } = response.data;
    setCategoriesTransformed(dataTransformed);
  };

  return (
    <div className="flex">
      {showAds && <AdsComponent dataAdSlot="6204085735" />}
      <div className="content-block w-100">
        <StylizedContentBlock
          // variant="gradient"
          overrideImage={DomainBackground}
          revealCondition={
            categoriesTransformed && categoriesTransformed?.length > 0
          }
        />
        <HelpBox page="leaderboards" />

        <div className="relative">Newest: LIST OF 4 NEWEST + tiemstamp?</div>
        <div className="relative">filter by name, weapon, element, leaderboard name etc</div>
        <div className="relative">sort by rarity, element, weapon, categorySize</div>
        <div
          style={{
            display: "flex",
            position: "relative",
            justifyContent: "space-between",
            // marginBottom: "15px",
            fontWeight: 600,
            fontSize: 24,
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          {categoriesTransformed.length > 0 ? (
            categoriesTransformed
              ?.filter((category) => {
                const calcNames = Object.keys(category.calcs);
                return calcNames.length > 0;
              })
              .sort((a, b) => {
                const a_calcNames = Object.keys(a.calcs);
                const b_calcNames = Object.keys(b.calcs);
                const a_categorySize = +(
                  a.calcs[a_calcNames[0]]?.[0]?.categorySize || 0
                );
                const b_categorySize = +(
                  b.calcs[b_calcNames[0]]?.[0]?.categorySize || 0
                );

                return a_categorySize < b_categorySize ? 1 : -1;
              })
              .map((category, index) => {
                const calcNames = Object.keys(category.calcs);
                if (calcNames.length === 0) return <></>;

                const categorySize =
                  category.calcs[calcNames[0]]?.[0]?.categorySize || "-"

                return (
                  <div
                    key={`${category.characterName}-${index}`}
                    className="block-highlight"
                    style={{
                      width: 250,
                      // flexGrow: 1,
                      padding: 20,
                      textAlign: "center",
                      minWidth: 240,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 30,
                      }}
                    >
                      <img
                        style={{ width: 90, height: 90 }}
                        src={category.icon}
                      />
                      <span>
                        {category.characterName}
                      </span>
                    </div>

                    <div>count: {categorySize}</div>

                    <div
                      style={{ marginTop: 10, fontWeight: 400, fontSize: 16 }}
                    >
                      {calcNames.map((calcName, i) => {
                        const calcs = category.calcs[calcName];
                        return (
                          <div key={`${calcName}-${i}`}>
                            <div
                              style={{
                                marginTop: 30,
                                marginBottom: 10,
                                fontWeight: 600,
                              }}
                            >
                              {calcName}
                            </div>
                            <div>
                              {calcs.map((calc, index) => {
                                const leaderboardPath = `leaderboards/${
                                  calc.calculationId
                                }/${calc.defaultFilter || ""}`;

                                console.log(calc);

                                return (
                                  <span
                                    key={`${calc.calculationId}-${index}`}
                                    style={
                                      {
                                        // display: "none",
                                      }
                                    }
                                  >
                                    <a
                                      title={calc.weapon?.name}
                                      onClick={(event) => {
                                        event.preventDefault();
                                        navigate(`/${leaderboardPath}`);
                                      }}
                                      href={`/${leaderboardPath}`}
                                    >
                                      {calc.weapon && (
                                        <span
                                          style={{
                                            color: "white",
                                            display: "flex",
                                            gap: "10px",
                                            textAlign: "left",
                                          }}
                                        >
                                          {/* <img
                                            style={{ width: 45 }}
                                            src={calc.weapon.icon}
                                          /> */}
                                          <WeaponMiniDisplay
                                            icon={calc.weapon.icon || ""}
                                            refinement={
                                              calc.weapon?.refinement || 1
                                            }
                                          />
                                          <span>{calc.weapon.name}</span>
                                          {/* ({calc.categorySize}) */}
                                        </span>
                                      )}
                                    </a>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <Spinner />
            </div>
          )}
        </div>
      </div>
      {showAds && <AdsComponent dataAdSlot="6204085735" />}
    </div>
  );
};
