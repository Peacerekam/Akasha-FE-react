import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DomainBackground from "../../assets/images/Concept_Art_Liyue_Harbor.webp";
import { HelpBox, Spinner, StylizedContentBlock } from "../../components";
import { FETCH_CATEGORIES_URL } from "../../utils/helpers";
import { BASENAME } from "../../App";

export type TransformedCategories = {
  characterName: string;
  icon: string;
  calcs: {
    [calcName: string]: {
      label: string;
      characterId: string;
      calculationId: string;
      details: string;
      weapon?: {
        name: string;
        icon: string;
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
      <div className="content-block w-100">
        <StylizedContentBlock
          // variant="gradient"
          overrideImage={DomainBackground}
          revealCondition={
            categoriesTransformed && categoriesTransformed?.length > 0
          }
        />
        <HelpBox page="leaderboards" />
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
              .map((category, index) => {
                const calcNames = Object.keys(category.calcs);
                if (calcNames.length === 0) return <></>;
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
                      <span>{category.characterName}</span>
                    </div>

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
                                return (
                                  <span key={`${calc.calculationId}-${index}`}>
                                    <a
                                      title={calc.weapon?.name}
                                      onClick={(event) => {
                                        event.preventDefault();
                                        navigate(`/${leaderboardPath}`);
                                      }}
                                      href={`${BASENAME}/${leaderboardPath}`}
                                    >
                                      {calc.weapon && (
                                        <span>
                                          <img
                                            style={{ width: 45 }}
                                            src={calc.weapon.icon}
                                          />
                                          {/* <span>{calc.weapon.name}</span> */}
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
    </div>
  );
};
