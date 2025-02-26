import { STAT_KEYS, StatIcon, statIconImgElement } from "../../components";
import { useEffect, useMemo, useState } from "react";

import { Doughnut } from "react-chartjs-2";
import { ELEMENT_TO_COLOR } from "../../components/CharacterCard/cardHelpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PerfectScrollbar from "react-perfect-scrollbar";
import axios from "axios";
import { cssJoin } from "../../utils/helpers";
import { faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { useParams } from "react-router-dom";

const defaultDataset = {
  label: "Test dataset",
  borderColor: "#202525",
  borderWidth: 3,
  // borderRadius: 0,
  // rotation: 0, // can be animated
  // hoverOffset: 4,
  data: [],
  // backgroundColor: Object.values(ELEMENT_TO_COLOR).map((x) => `${x}77`),
  backgroundColor: ["#99999977"],
};

export const STAT_TO_COLOR = {
  "Crit RATE": "#ffffff",
  "Crit DMG": "#ffffff",
  "Elemental Mastery": "#cccccc",
  "Energy Recharge": "#cccccc",
  "Flat HP": "#666666",
  "Flat ATK": "#666666",
  "Flat DEF": "#666666",
  "HP%": "#999999",
  "ATK%": "#999999",
  "DEF%": "#999999",
  "Healing Bonus": "#eeeeee",
  "Physical DMG Bonus": "#ffffff",
  ...ELEMENT_TO_COLOR,
} as any;

const getImgElement = (url: string) => {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = url;
  return img;
};

const drawBlurred = (img: any) => {
  const canvas = document.createElement("canvas");
  var c: any = canvas.getContext("2d");
  c.width = 35;
  c.height = 35;
  c.clearRect(0, 0, 35, 35);
  c.filter = "blur(5px)";
  c.drawImage(img, 0, 0, 35, 35);
  return c; // returns the context
};

// returns a map counting the frequency of each color
// in the image on the canvas
function getColors(c: any) {
  var col,
    colors: any = {};
  var pixels, r, g, b, a;
  r = g = b = a = 0;
  pixels = c.getImageData(0, 0, c.width, c.height);
  for (var i = 0, data = pixels.data; i < data.length; i += 4) {
    r = data[i];
    g = data[i + 1];
    b = data[i + 2];
    a = data[i + 3]; // alpha
    // skip pixels >50% transparent
    if (a < 255 / 2) continue;
    col = rgbToHex(r, g, b);
    if (!colors[col]) colors[col] = 0;
    colors[col]++;
  }
  return colors;
}

function rgbToHex(r: any, g: any, b: any) {
  if (r > 255 || g > 255 || b > 255) throw new Error("Invalid color component");
  return ((r << 16) | (g << 8) | b).toString(16);
}

type ChartLabelsTableProps = {
  chart: any;
  images: any[];
  chartNum: number;
};

export const ChartLabelsTable: React.FC<ChartLabelsTableProps> = ({
  chart,
  images,
  chartNum,
}) => {
  const [show, setShow] = useState(false);

  const labels = chart.data.labels;
  if (labels.length === 0) return null;

  const iconClassNames = cssJoin([
    "sort-direction-icon",
    !show ? "rotate-180deg" : "",
  ]);

  const lastLabel = labels[labels.length - 1];
  const hasGroupedLabels = lastLabel?.includes(" - ");

  const groupedLabels = hasGroupedLabels ? lastLabel.split("\n") : [];

  const chartLabelsCombined = hasGroupedLabels
    ? [...labels.slice(0, -1), ...groupedLabels]
    : labels;

  return (
    <>
      <div className="clickable mt-10" onClick={() => setShow((prev) => !prev)}>
        {show ? "Hide" : "Show"} legend
        <FontAwesomeIcon
          className={iconClassNames}
          icon={faChevronUp}
          size="1x"
        />
      </div>

      {show && (
        <PerfectScrollbar
          className="mt-10"
          options={{
            suppressScrollY: false,
            suppressScrollX: true,
          }}
        >
          <div className="chart-result-wrapper">
            <table
              cellSpacing="0"
              className="chart-labels"
              style={{
                textAlign: "left",
              }}
            >
              <tbody>
                {chartLabelsCombined.map((label: string, i: number) => {
                  const isGrouped =
                    hasGroupedLabels && i >= chart.data.labels.length - 1;

                  const separator = " - ";

                  const chartData = isGrouped
                    ? label.split(separator)[0]
                    : chart.data.datasets[0].data[i];

                  const chartLabel = isGrouped
                    ? label.split(separator)[1]
                    : label;

                  const chartImgEl = images?.[chartNum]?.[i]?.src ? (
                    <img
                      alt={"-"}
                      className="table-icon"
                      src={images?.[chartNum]?.[i]?.src}
                    />
                  ) : (
                    ""
                  );

                  const iconName = isGrouped
                    ? label.split(" (")[0].split(separator)[1]
                    : label.split(" (")[0];

                  const chartIcon = STAT_KEYS[iconName] ? (
                    <StatIcon name={iconName} />
                  ) : (
                    chartImgEl
                  );

                  return (
                    <tr
                      key={label}
                      style={{
                        opacity: isGrouped ? "0.5" : "1",
                      }}
                    >
                      <td>{chartIcon}</td>
                      <td
                        style={{
                          textAlign: "right",
                          padding: "0 5px",
                        }}
                      >
                        {chartData}
                      </td>
                      <td>{chartLabel}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </PerfectScrollbar>
      )}
    </>
  );
};

export const ProfileCharts: React.FC<{ debug?: boolean }> = ({ debug }) => {
  const { uid } = useParams();

  const [chartsData, setChartsData] = useState<any[]>([]);
  const [images, setImages] = useState<HTMLImageElement[][]>([]);

  const fetchData = async () => {
    try {
      if (!uid) return;

      const _uid = encodeURIComponent(uid || "");
      const chartsURL = `/api/charts/user`;
      const response = await axios.get(chartsURL, {
        params: {
          uid: _uid,
          variant: "overview", // @TODO: change this
        },
      });

      const data = response?.data?.data;
      if (!data) return;

      setChartsData(data);
    } catch (err) {
      console.log(err);
    }
  };

  const loadImages = async () => {
    const resolveImage = (img: HTMLImageElement) => {
      if (!img) return new Promise((resolve) => resolve(true));
      return new Promise((resolve) => {
        img.onload = async () => {
          resolve(true);
        };
        img.onerror = async () => {
          resolve(true);
        };
      });
    };

    const allPromises = [];
    const structured = [];

    for (let i = 0; i < chartsData.length; i++) {
      // const sum = chartsData[i].data.reduce(
      //   (acc: number, x: any) => acc + x.value,
      //   0
      // );

      const _images = chartsData[i].data
        .filter((x: any) => {
          // const sliceDeg = (360 * (x.value / 2)) / sum;
          // const minDeg = 5;
          // console.log(x.label, x.icon && sliceDeg > minDeg)
          return x.icon; //&& sliceDeg > minDeg;
        })
        .map((x: any) => getImgElement(x.icon));

      allPromises.push(..._images.map(resolveImage));
      structured.push(_images);
    }

    await Promise.all(allPromises);
    setImages(structured);
  };

  useEffect(() => {
    fetchData();
  }, [uid]);

  useEffect(() => {
    loadImages();
  }, [chartsData]);

  const formattedData = useMemo(() => {
    return chartsData.map((x: any, i) => {
      const labels = x.data.map((val: any) => val.label);
      const data = x.data.map((val: any) => val.value);
      const icons = images?.[i] || [];
      const backgroundColor = [];

      // if there is icons field
      for (let i = 0; i < icons?.length; i++) {
        if (!icons[i]) continue;

        // @TODO: test the fancy color getting library
        // @TODO: test the fancy color getting library
        // @TODO: test the fancy color getting library
        const colors = getColors(drawBlurred(icons[i]));
        const keys = Object.keys(colors);
        const middlePixel = keys[+(keys.length / 2).toFixed()];
        const hex = `#${middlePixel}`;
        backgroundColor.push(hex);
      }

      // if labels are color names
      for (let i = 0; i < labels.length; i++) {
        const _label = labels[i].split(" DMG Bonus")[0];
        if (!STAT_TO_COLOR[_label]) continue;
        backgroundColor.push(`${STAT_TO_COLOR[_label]}77`);
      }

      const sum = data.reduce((acc: number, val: number) => acc + val, 0);

      const ungroupedData: any[] = [];
      const groupedData: any[] = [];

      data.forEach((val: any) => {
        const sliceDeg = (360 * (val / 2)) / sum;
        const minDeg = 2;

        if (sliceDeg < minDeg) {
          groupedData.push(val);
        } else {
          ungroupedData.push(val);
        }
      });

      const groupedSum = groupedData.reduce((acc, val) => (acc += val), 0);
      const displayGrouped = groupedData.length > 0;

      const finalData = displayGrouped
        ? [...ungroupedData, groupedSum]
        : ungroupedData;

      if (displayGrouped) {
        const otherLabel = groupedData.map((x, i) => {
          const labelIndex = i + ungroupedData.length;
          const percent = ((x / sum) * 100).toFixed(1);
          return `${x} - ${labels[labelIndex]} (${percent}%)`;
        });

        labels[ungroupedData.length] = otherLabel;
        labels.length = finalData.length;
        // backgroundColor[ungroupedData.length] = "gray"
      }

      labels.forEach((x: any, i: number) => {
        const val = finalData[i];
        const percent = ((val / sum) * 100).toFixed(1);
        const isLast = i === labels.length - 1;

        if (isLast && displayGrouped) {
          labels[i] = labels[i].join("\n");
        } else {
          labels[i] = `${x} (${percent}%)`;
        }
      });

      return {
        text: x.text,
        data: {
          labels,
          datasets: [
            {
              ...defaultDataset,
              label: "Value",
              data: finalData,
              // data,
              icons,
              ...(backgroundColor.length > 0 ? { backgroundColor } : {}),
            },
          ],
        },
      };
    });
  }, [chartsData, images]);

  const chartPadding = 0;

  const options = {
    layout: {
      padding: chartPadding,
    },
    responsive: true,
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
    animation: {
      // onComplete: function (context: any) {
      //   if (context.initial) {
      //     console.log("Initial animation finished");
      //     const drawImgs = (chart: any) => handleDrawDonutOverlay(chart);
      //     context.chart.config.plugins[0].afterDatasetsDraw = drawImgs;
      //     context.chart.update();
      //   } else {
      //     console.log("animation finished");
      //   }
      // },
    },
  };

  const handleDrawDonutOverlay = (chart: any) => {
    // Text height and font styles
    // const textHeight = 15;
    // const textHalfHeight = textHeight / 2;
    // const textFont = "normal 20px Arial, sans-serif";
    // Apply styles for text
    // ctx.font = textFont;

    const dataset = chart.config._config.data.datasets[0];
    const imgs =
      dataset.icons.length > 0
        ? dataset.icons
        : chart.config._config.data.labels.map((label: string) => {
            const iconName = label.split(" (")[0];
            return statIconImgElement(iconName);
          });

    if (imgs.length === 0) return;

    const { ctx } = chart;

    ctx.save();

    const chartData = dataset.data;
    const sum = chartData.reduce((acc: number, val: number) => acc + val, 0);

    const imageSize = 36;
    const imageSizeSmaller = 28;

    let imageHeight = imageSize * (chart.chartArea?.width / 250);
    let imageWidth = imageSize * (chart.chartArea?.width / 250);
    let centerX = chartPadding + chart.chartArea?.width / 2 - imageWidth / 2;
    let centerY = chartPadding + chart.chartArea?.height / 2 - imageHeight / 2;
    let accumulator = 0;

    const lastLabel = chart.data.labels[chart.data.labels.length - 1];
    const hasGroupedLabels = lastLabel?.includes("\n");

    imgs.forEach((img: any, i: number) => {
      if (!img) return;
      if (!chart.chartArea?.height) return;
      if (!chart.chartArea?.width) return;

      const isGrouped = hasGroupedLabels && i >= chart.data.labels.length - 1;
      if (isGrouped) return;

      const thisCount = chartData[i];
      accumulator += thisCount;

      const sliceDeg = (360 * (thisCount / 2)) / sum;
      const minDeg = 5;

      // dot show image if the slice is less than 5 degrees
      if (sliceDeg < minDeg) return;

      const degrees = (360 * (accumulator - thisCount / 2)) / sum - 90;
      const distance = chart.chartArea?.height / 2.75;

      ctx.shadowColor = "black";
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      if (STAT_KEYS[chart.data.labels[i].split(" (")[0]]) {
        imageHeight = imageSizeSmaller * (chart.chartArea?.width / 250);
        imageWidth = imageSizeSmaller * (chart.chartArea?.width / 250);
        centerX = chartPadding + chart.chartArea?.width / 2 - imageWidth / 2;
        centerY = chartPadding + chart.chartArea?.height / 2 - imageHeight / 2;
      }

      const imgX = centerX + Math.cos((degrees * Math.PI) / 180) * distance;
      const imgY = centerY + Math.sin((degrees * Math.PI) / 180) * distance;

      // draw original image
      // ctx.save();
      // ctx.globalAlpha = 0.5;
      ctx.drawImage(img, imgX, imgY, imageWidth, imageHeight);
      // ctx.restore();

      ctx.shadowBlur = 0;
      // ctx.restore();
    });
  };

  const plugins = [
    {
      id: "profile-charts-plugins",
      // beforeDraw: (chart: any) => {},
      // resize: (chart: any) => {},
      // afterRender: (chart: any) => {},
      afterDatasetsDraw: (chart: any) => {
        handleDrawDonutOverlay(chart);
      },
    },
  ];

  return (
    <div
      style={{ display: chartsData ? "block" : "none" }}
      className={cssJoin([
        "relative w-100 custom-table-wrapper",
        chartsData ? "mt-20 profile-charts profile-highlights" : "",
      ])}
    >
      <div>
        {formattedData ? (
          <>
            {/* <div className="charts-tabs flex gap-10">
              <div>Overview</div>
              <div>Rankings</div>
              <div>Builds</div>
              <div>Artifacts</div>
            </div> */}
            <PerfectScrollbar
              options={{
                suppressScrollY: true,
                // suppressScrollX: false,
              }}
            >
              <div className="flex">
                <div className="charts-grid">
                  {formattedData.map((chart, chartNum) => {
                    return (
                      <div
                        key={`profile-chart-${chart.text}-${chartNum}`}
                        className="charts-column"
                      >
                        <div className="chart-text">{chart.text}</div>
                        <div className="chart-container">
                          <Doughnut
                            // key={`donut-${chartsAnimEnd}`} // @TODO: dirty way of refreshing
                            data={chart.data}
                            options={options}
                            plugins={plugins} // @TODO: this should be included only to relevant charts?
                          />
                        </div>
                        <ChartLabelsTable
                          chart={chart}
                          images={images}
                          chartNum={chartNum}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </PerfectScrollbar>
          </>
        ) : null}
      </div>
    </div>
  );
};
