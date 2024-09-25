import { FETCH_BUILDS_URL, cssJoin } from "../../utils/helpers";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { AdProviderContext } from "../../context/AdProvider/AdProviderContext";
import { ExpandedRowBuilds } from "../../components/ExpandedRowBuilds";
import PerfectScrollbar from "react-perfect-scrollbar";
import axios from "axios";

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

    setContentWidth(1280); // instead of isLoading state

    const isCombined = uid.startsWith("@");
    const _uid = encodeURIComponent(isCombined ? uid.slice(1) : uid);
    const _md5 = encodeURIComponent(md5);

    try {
      const response = await axios.get(FETCH_BUILDS_URL, {
        params: {
          uid: _uid,
          md5: _md5,
        },
      });

      if (response?.data?.data?.[0]) {
        setBuildData(response.data.data?.[0]);
        setContentWidth(1280);
        setPreventContentShrinking("showcase-details", "add");
      }
    } catch (err) {
      setContentWidth(1100);
      console.log(err);
    }
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
        buildData ? "mt-20 build-preview profile-highlights" : "",
      ])}
    >
      <div>
        {buildData ? (
          <PerfectScrollbar
            options={{
              suppressScrollY: true,
              // suppressScrollX: false,
            }}
          >
            <div className="custom-table">
              <div>
                <div
                  className="close-build"
                  onClick={handleClose}
                  title="Close build card"
                >
                  ×
                </div>
                <ExpandedRowBuilds row={buildData} isProfile={true} />
              </div>
            </div>
          </PerfectScrollbar>
        ) : null}
      </div>
    </div>
  );
};
