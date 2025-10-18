import { toEnkaUrl } from "../../utils/helpers";

export const ELEMENT_TO_COLOR = {
  Pyro: "#f58453",
  Electro: "#ffa1ff",
  Anemo: "#71fdec",
  Geo: "#ffc64a",
  Cryo: "#98efff",
  Dendro: "#a5ffab",
  Hydro: "#56a2ff",
} as any;

export const ELEMENT_TO_HUE = {
  Pyro: 325,
  Electro: 230,
  Anemo: 120,
  Geo: 375,
  Cryo: 160,
  Dendro: 65,
  Hydro: 180,
} as any;

export const calcStatVals = (_statName: string, reversed = false) => {
  return (
    {
      atk: {
        key: "maxATK",
        value: (n: number) => n,
      },
      def: { key: "maxDEF", value: (n: number) => n },
      maxHp: { key: "maxHP", value: (n: number) => n },
      critDamage: {
        key: "critDMG",
        value: (n: number) => (reversed ? (n || 0) * 100 : (n || 0) / 100),
      },
      critRate: {
        key: "critRate",
        value: (n: number) => (reversed ? (n || 0) * 100 : (n || 0) / 100),
      },
      healingBonus: {
        key: "healingBonus",
        value: (n: number) => (reversed ? (n || 0) * 100 : (n || 0) / 100),
      },
      energyRecharge: {
        key: "energyRecharge",
        value: (n: number) =>
          reversed ? (n || 0) * 100 : (100 + (n || 0)) / 100,
      },
    }[_statName] || {
      key: _statName.endsWith("DamageBonus")
        ? _statName.replace("DamageBonus", "DMG")
        : _statName,
      value: (n: number) =>
        _statName.endsWith("DamageBonus")
          ? reversed
            ? (n || 0) * 100
            : (n || 0) / 100
          : n || 0,
    }
  );
};

export const handleTitle = (arr: any) => {
  const obj = arr[0].dataset;
  if (!obj) return "";
  return `${obj.label}`;
};

export const scales = {
  r: {
    suggestedMin: 0,
    suggestedMax: 100,
    max: 120,
    ticks: {
      stepSize: 20,
      textStrokeColor: "transparent",
      color: "transparent",
      backdropColor: "transparent",
    },
    angleLines: {
      color: "rgba(255, 255, 255, 0.2)",
    },
    grid: {
      color: "rgba(255, 255, 255, 0.2)",
    },
    pointLabels: {
      // padding: 20,
      color: "#e7f6f2",
      font: {
        family: "GenshinFont",
        size: 9,
      },
      callback: (statName: string, index: number) => {
        return statName as string | string[];
      },
    },
  },
};

export const toTalentProps = (row: any, keys: string[], chartsData: any, index?: number) => {
  const talent = row?.talentsLevelMap?.[keys[0]];
  if (!talent) return null;

  const assetKey = keys[1] || keys[0];
  const asset = chartsData?.assets?.talents?.[assetKey];
  const icon = asset ? toEnkaUrl(asset) : talent.icon;

  return {
    ...talent,
    icon,
    index
  };
};

export const setGradientFromImage = (
  gradient: CanvasGradient,
  canvasHeight: number,
  canvasWidth: number,
  imgData: any,
  steps: number,
  alphaOverride: string | number,
  chCtx: CanvasRenderingContext2D | null,
  debug: boolean = false
) => {
  if (debug) {
    chCtx!.globalCompositeOperation = "source-over";
    console.log(imgData);
  }

  const outputColors = [];

  for (let i = 0; i <= steps; i++) {
    const targetY = Math.floor((canvasHeight / steps - 1) * i);
    const targetX = 0;
    const pixel = targetY + targetX;

    //To get the array position in the entire image data array, simply multiply your pixel position by 4 (since each pixel will have its own r,g,b,a in that order)
    const _position = pixel * 4;

    const c = {
      red: imgData.data[_position],
      green: imgData.data[_position + 1],
      blue: imgData.data[_position + 2],
      alpha: imgData.data[_position + 3],
    };

    const hexCode =
      c.alpha === 0
        ? "#00000000"
        : `#${[c.red, c.green, c.blue]
            .map((x) => (x || 0).toString(16).padStart(2, "0"))
            .join("")}${alphaOverride}`;

    const gradientStep = i / steps;
    gradient.addColorStop(gradientStep, hexCode);

    outputColors.push(hexCode);

    if (debug) {
      chCtx!.beginPath();
      // chCtx!.arc(canvasWidth - 1, targetY, 5, 0, 2 * Math.PI);

      chCtx!.fillStyle = "black";
      chCtx!.arc(canvasWidth - 1, targetY / 2, 9, 0, 2 * Math.PI);
      chCtx!.fill();

      chCtx!.closePath();
      chCtx!.beginPath();

      chCtx!.fillStyle = hexCode;
      chCtx!.arc(canvasWidth - 1, targetY / 2, 8, 0, 2 * Math.PI);

      chCtx!.closePath();
      chCtx!.fill();

      console.log(targetX, targetY, gradientStep, hexCode);
    }
  }

  return outputColors;
};
