import { StylizedContentBlock } from "../../components/StylizedContentBlock";
// import DomainBackground from "../../assets/images/domain-background.jpg";
import DomainBackground from "../../assets/images/Concept_Art_Liyue_Harbor.webp";
import "./style.scss";

export const UIDSearchPage: React.FC = () => {
  return (
    <div>
      <div className="flex">
        <div className="content-block w-100 ">
          <StylizedContentBlock overrideImage={DomainBackground} />
          <div className="relative">
            <div className="relative" style={{ textAlign: "center", margin: '50px 0' }}>
              Enter UID / enka profile name
              <div
                className="flex"
                style={{ justifyContent: "center", marginTop: 10 }}
              >
                <div className="search-input relative">
                  <input
                    onChange={(event) => {
                      // setSearchText(event.target.value);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        // setLookupUID(inputUID);
                      }
                    }}
                  />
                  {true && (
                    <span className="fake-placeholder">type here...</span>
                  )}
                </div>
                <button
                  onClick={() => {
                    // setLookupUID(inputUID);
                  }}
                >
                  {'>>'}
                </button>
              </div>
            </div>
            <div>
            real time text search filter by UID and nickname</div>
            <div>show customTable component and filter it????</div>
          </div>
        </div>
      </div>
    </div>
  );
};
