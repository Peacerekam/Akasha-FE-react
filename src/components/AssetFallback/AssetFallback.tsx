import { AMBR_ASSETS, ENKA_ASSETS } from "../../utils/helpers";
import { DetailedHTMLProps, useRef } from "react";

type AssetFallbackProps = DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
> & { isArtifact?: boolean };

export const AssetFallback: React.FC<AssetFallbackProps> = (props) => {
  const imgRef = useRef<HTMLImageElement>(null);

  const handleError = () => {
    const src = imgRef.current?.src;
    if (!src?.includes("enka")) return;

    const replaceWith = props.isArtifact
      ? `${AMBR_ASSETS}reliquary/`
      : AMBR_ASSETS;

    imgRef.current!.src = src?.replace(ENKA_ASSETS, replaceWith);
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
