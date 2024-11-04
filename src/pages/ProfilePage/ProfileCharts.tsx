import { STAT_KEYS, StatIcon, statIconImgElement } from "../../components";
import { useEffect, useMemo, useState } from "react";

import { Doughnut } from "react-chartjs-2";
import { ELEMENT_TO_COLOR } from "../../components/CharacterCard/cardHelpers";
import PerfectScrollbar from "react-perfect-scrollbar";
import axios from "axios";
import { cssJoin } from "../../utils/helpers";
import { useParams } from "react-router-dom";

const defaultDataset = {
  label: "Test dataset",
  borderColor: "#202525",
  borderWidth: 3,
  // borderRadius: 0,
  // rotation: 0, // can be animated
  // hoverOffset: 4,
  data: [],
  backgroundColor: Object.values(ELEMENT_TO_COLOR).map((x) => `${x}bb`),
};

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

// function draw(img: any) {
//   var canvas = document.createElement("canvas");
//   var c: any = canvas.getContext("2d");
//   c.width = canvas.width = img.width;
//   c.height = canvas.height = img.height;
//   c.clearRect(0, 0, c.width, c.height);
//   c.drawImage(img, 0, 0, img.width, img.height);
//   return c; // returns the context
// }

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
export const ProfileCharts: React.FC = () => {
  const { uid } = useParams();

  const [chartsData, setChartsData] = useState<any[]>([]);
  const [images, setImages] = useState<HTMLImageElement[][]>([]);

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
      const _images = chartsData[i].data
        .filter((x: any) => x.icon)
        .map((x: any) => getImgElement(x.icon));

      allPromises.push(..._images.map(resolveImage));
      structured.push(_images);
    }

    await Promise.all(allPromises);
    setImages(structured);
  };

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

        const colors = getColors(drawBlurred(icons[i])); // @TODO: test the fancy color getting library
        const keys = Object.keys(colors);
        const middlePixel = keys[+(keys.length / 2).toFixed()];
        const hex = `#${middlePixel}`;
        backgroundColor.push(hex);
      }

      // if labels are color names
      for (let i = 0; i < labels.length; i++) {
        if (!ELEMENT_TO_COLOR[labels[i]]) continue;

        backgroundColor.push(`${ELEMENT_TO_COLOR[labels[i]]}77`);
      }

      return {
        text: x.text,
        data: {
          labels,
          datasets: [
            {
              ...defaultDataset,
              label: "Value",
              data,
              icons,
              ...(backgroundColor.length > 0 ? { backgroundColor } : {}),
            },
          ],
        },
      };
    });
  }, [chartsData, images]);

  const fetchData = async () => {
    try {
      if (!uid) return;

      const _uid = encodeURIComponent(uid || "");
      const chartsURL = `/api/charts/user`;
      const response = await axios.get(chartsURL, {
        params: {
          uid: _uid,
          variant: "overview", // @TODO:
        },
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
        : chart.config._config.data.labels.map((x: string) =>
            statIconImgElement(x)
          );

    if (imgs.length === 0) return;

    const { ctx } = chart;

    ctx.save();

    const chartData = dataset.data;
    const sum = chartData.reduce((acc: number, val: number) => acc + val, 0);

    const imageHeight = 35 * (chart.chartArea?.width / 250);
    const imageWidth = 35 * (chart.chartArea?.width / 250);

    const centerX = chartPadding + chart.chartArea?.width / 2 - imageWidth / 2;
    const centerY =
      chartPadding + chart.chartArea?.height / 2 - imageHeight / 2;

    let accumulator = 0;

    imgs.forEach((img: any, i: number) => {
      if (!img) return;
      if (!chart.chartArea?.height) return;
      if (!chart.chartArea?.width) return;

      const thisCount = chartData[i];
      accumulator += thisCount;

      // @TODO: maybe use this to group up results with less than 5deg
      // @TODO: maybe use this to group up results with less than 5deg
      // @TODO: maybe use this to group up results with less than 5deg
      // grouped up result could show all included artifact sets on the tooltip in separate lines
      // grouped up result could show all included artifact sets on the tooltip in separate lines
      // grouped up result could show all included artifact sets on the tooltip in separate lines
      const sliceDeg = (360 * (thisCount / 2)) / sum;
      const minDeg = 5;

      // dot show image if the slice is less than 5 degrees
      if (sliceDeg < minDeg) return;

      const degrees = (360 * (accumulator - thisCount / 2)) / sum - 90;
      const distance = chart.chartArea?.height / 2.7;

      const imgX = centerX + Math.cos((degrees * Math.PI) / 180) * distance;
      const imgY = centerY + Math.sin((degrees * Math.PI) / 180) * distance;

      // @TODO: dynamically calc imageWidth and imageHeight based on thisCount
      // @TODO: dynamically calc imageWidth and imageHeight based on thisCount
      // @TODO: dynamically calc imageWidth and imageHeight based on thisCount

      ctx.shadowColor = "black";
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // draw original image in normal mode
      ctx.drawImage(img, imgX, imgY, imageWidth, imageHeight);

      ctx.shadowBlur = 0;
      ctx.restore();
    });
  };

  const plugins = [
    {
      id: "pluginId",
      // beforeDraw: (chart: any) => handleDrawImage(chart),
      afterDatasetsDraw: (chart: any) => handleDrawDonutOverlay(chart), // imgs over the chart, but below the tooltip
      resize: (chart: any) => handleDrawDonutOverlay(chart),
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
            <div className="charts-tabs flex gap-10">
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
                            // key={images.length} // @TODO: dirty way of refreshing
                            data={chart.data}
                            options={options}
                            plugins={plugins} // @TODO: this should be included only to relevant charts?
                          />
                        </div>
                        <PerfectScrollbar
                          options={{
                            suppressScrollY: false,
                            suppressScrollX: false,
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
                                {chart.data.labels.map(
                                  (x: string, i: number) => (
                                    <tr key={x}>
                                      {images?.[chartNum]?.[i]?.src && (
                                        <td>
                                          <img
                                            alt={x}
                                            className="table-icon"
                                            src={images?.[chartNum]?.[i]?.src}
                                          />
                                        </td>
                                      )}
                                      {STAT_KEYS[x] && (
                                        <td>
                                          <StatIcon name={x} />
                                        </td>
                                      )}
                                      <td
                                        style={{
                                          textAlign: "right",
                                          paddingRight: 5,
                                        }}
                                      >
                                        {chart.data.datasets[0].data[i]}
                                      </td>
                                      <td>{x}</td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </PerfectScrollbar>
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
