import { DetailedHTMLProps, useRef } from "react";

type AssetFallbackProps = DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
>;

export const ENKA_ASSETS = "https://enka.network/ui/";
export const AMBR_ASSETS = "https://gi.yatta.moe/assets/UI/";

export const AssetFallback: React.FC<AssetFallbackProps> = (props) => {
  const imgRef = useRef<HTMLImageElement>(null);

  const handleError = () => {
    const src = imgRef.current?.src;
    if (!src?.includes("enka")) return;
    imgRef.current!.src = src?.replace(ENKA_ASSETS, AMBR_ASSETS);
  };

  return (
    <img
      {...props}
      alt={""}
      key={props.src}
      onError={handleError}
      ref={imgRef}
    />
  );
};
