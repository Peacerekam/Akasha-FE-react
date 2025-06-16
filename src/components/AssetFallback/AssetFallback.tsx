import { DetailedHTMLProps, useState } from "react";

type AssetFallbackProps = DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
>;

export const ENKA_ASSETS = "https://enka.network/ui/";
export const AMBR_ASSETS = "https://gi.yatta.moe/assets/UI/";

export const AssetFallback: React.FC<AssetFallbackProps> = (props) => {
  const [src, setSrc] = useState(props.src);

  const handleError = () => {
    const provider = props.src?.includes("enka") ? "enka" : "ambr";

    if (provider === "enka") {
      const newSrc = src?.replace(ENKA_ASSETS, AMBR_ASSETS);
      setSrc(newSrc);
    }
  };

  return <img key={src} alt={""} {...props} src={src} onError={handleError} />;
};
