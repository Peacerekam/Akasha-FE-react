import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { AdProviderContext } from "../../context/AdProvider/AdProviderContext";
import { ExpandedRowBuilds } from "../../components/ExpandedRowBuilds";
import axios from "axios";
import { cssJoin } from "../../utils/helpers";

export const BuildPreview: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { uid } = useParams();
  const { setContentWidth, setPreventContentShrinking } =
    useContext(AdProviderContext);

  const [buildData, setBuildData] = useState<any>();

  const fetchData = async () => {
    if (!location.search) return;

    const searchQuery = location.search;
    const query = new URLSearchParams(searchQuery);
    const md5 = query.get("build");

    if (!md5 || !uid) return;

    const _uid = encodeURIComponent(uid);
    const _md5 = encodeURIComponent(md5);

    const fetchURL = `/api/builds`;
    const response = await axios.get(fetchURL, {
      params: {
        uid: _uid,
        md5: _md5,
      },
    });

    if (!response?.data?.data?.[0]) return;

    setBuildData(response.data.data?.[0]);
    setContentWidth(1280);
    setPreventContentShrinking("showcase-details", "add");
  };

  useEffect(() => {
    fetchData();
  }, [location.search]);

  const handleClose = () => {
    navigate(`/profile/${uid}`);
    setPreventContentShrinking("showcase-details", "remove");
    setBuildData(undefined);
  };

  useEffect(() => {
    if (buildData) return;
    setContentWidth(1100);
  }, [buildData]);

  return (
    <div
      key={buildData?.md5 || "build-preview"}
      style={{ display: buildData ? "block" : "none" }}
      className={cssJoin([
        "relative w-100 custom-table-wrapper",
        buildData ? "mt-10 build-preview profile-highlights" : "",
      ])}
    >
      {buildData ? (
        <div className="custom-table">
          <div
            className="close-build"
            onClick={handleClose}
            title="Close build card"
          >
            ×
          </div>
          <ExpandedRowBuilds row={buildData} isProfile={true} />
        </div>
      ) : null}
    </div>
  );
};
