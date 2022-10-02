import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DomainBackground from "../../assets/images/Concept_Art_Liyue_Harbor.webp";
import { StylizedContentBlock } from "../../components/StylizedContentBlock";
import { FETCH_CATEGORIES_URL } from "../../utils/helpers";

type TransformedCategories = {
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
    }[];
  };
};

type Category = {
  label: string;
  icon: string;
  options: {
    label: string;
    value: {
      calculationId: string;
      characterId: number;
      details: string;
      weapon?: {
        icon: string;
        name: string;
      };
    };
  }[];
};

export const CategorySelectionPage: React.FC = () => {
  // const [categories, setCategories] = useState<Category[]>();
  const [categoriesTransformed, setCategoriesTransformed] =
    useState<TransformedCategories[]>();

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
        <div
          style={{
            margin: "10px 5px",
            display: "flex",
            position: "relative",
            justifyContent: "space-around",
            marginBottom: "15px",
            fontWeight: 600,
            fontSize: 24,
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          {categoriesTransformed?.map((category, index) => {
            const calcNames = Object.keys(category.calcs);
            if (calcNames.length === 0) return <></>;
            return (
              <div
                key={`${category.characterName}=${index}`}
                className="block-highlight"
                style={{
                  width: 250,
                  padding: 20,
                  textAlign: "center",
                  minWidth: 240,
                  minHeight: 350,
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
                  <img style={{ width: 90, height: 90 }} src={category.icon} />
                  <span>{category.characterName}</span>
                </div>

                <div style={{ marginTop: 10, fontWeight: 400, fontSize: 16 }}>
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
                          {calcs.map((calc) => {
                            return (
                              <span key={calc.calculationId}>
                                <a
                                  title={calc.weapon?.name}
                                  onClick={(event) => {
                                    event.preventDefault();
                                    navigate(
                                      `/leaderboards/${calc.calculationId}`
                                    );
                                  }}
                                  href={`${pathname}#/leaderboards/${calc.calculationId}`}
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
                                  <span
                                    style={{
                                      width: 200,
                                      whiteSpace: "break-spaces",
                                      // overflow: "hidden",
                                      // textOverflow: "ellipsis",
                                    }}
                                  ></span>
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
          })}
        </div>
      </div>
    </div>
  );
};
