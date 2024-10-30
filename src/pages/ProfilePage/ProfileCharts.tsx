import { FETCH_BUILDS_URL, cssJoin } from "../../utils/helpers";
import { useEffect, useState } from "react";

import { Doughnut } from "react-chartjs-2";
import { ELEMENT_TO_COLOR } from "../../components/CharacterCard/cardHelpers";
import PerfectScrollbar from "react-perfect-scrollbar";
import axios from "axios";
import { useParams } from "react-router-dom";

export const ProfileCharts: React.FC = () => {
  const { uid } = useParams();

  const [chartsData, setChartsData] = useState<any>();

  const fetchData = async () => {
    try {
      if (!uid) return;
      const _uid = encodeURIComponent(uid || "");
      const response = await axios.get(FETCH_BUILDS_URL, {
        params: { uid: _uid },
      });

      const data = response?.data?.data;
      if (!data) return;

      setChartsData(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // @TODO: useMemo
  const data = {
    labels: ["Hydro", "Electro", "Dendro"],
    datasets: [
      {
        label: "Dataset #1",
        borderColor: "#202525",
        borderWidth: 5,
        // borderRadius: 0,
        data: [300, 100, 50],
        backgroundColor: [
          `${ELEMENT_TO_COLOR.Hydro}bb`,
          `${ELEMENT_TO_COLOR.Electro}bb`,
          `${ELEMENT_TO_COLOR.Dendro}bb`,
        ],
        // rotation: 0, // can be animated
        // hoverOffset: 4,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: false,
        // position: "top" as "top",
      },
      title: {
        display: false,
        text: "...",
      },
    },
  };

  return (
    <div
      style={{ display: chartsData ? "block" : "none" }}
      className={cssJoin([
        "relative w-100 custom-table-wrapper",
        chartsData ? "mt-20 profile-charts profile-highlights" : "",
      ])}
    >
      <div>
        {chartsData ? (
          <>
            <div className="flex gap-10">
              <div>Overview</div>
              <div>Rankings</div>
              <div>Builds</div>
              <div>Artifacts</div>
            </div>
            <PerfectScrollbar
              options={{
                suppressScrollY: true,
                // suppressScrollX: false,
              }}
            >
              <div className="charts-grid">
                <div className="charts-column">
                  <div className="chart-container">
                    <Doughnut data={data} options={options} />
                  </div>
                  <div className="chart-subtext">Ranking related</div>
                  <div>wtf can i show on a donut lol</div>
                  <div>maybe not a donut chart...</div>
                </div>
                <div className="charts-column">
                  <div className="chart-container">
                    <Doughnut data={data} options={options}  />
                  </div>
                  <div className="chart-subtext">Builds related</div>
                  <div>elements/levels/conststellations</div>
                </div>
                <div className="charts-column">
                  <div className="chart-container">
                    <Doughnut data={data} options={options}  />
                  </div>
                  <div className="chart-subtext">Artifacts related</div>
                  <div>artifact set distribution</div>
                </div>
              </div>
            </PerfectScrollbar>
          </>
        ) : null}
      </div>
    </div>
  );
};
