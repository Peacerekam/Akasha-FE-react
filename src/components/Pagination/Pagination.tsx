import React, { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

import { FetchParams } from "../CustomTable";
import "./style.scss";

export const Pagination = ({
  totalRows = 0,
  pageSize = 0,
  pageNumber = 0,
  setParams = null,
}: {
  totalRows?: number;
  pageSize?: number;
  pageNumber?: number;
  setParams?: React.Dispatch<React.SetStateAction<FetchParams>> | null;
}) => {
  const lastPage = Math.ceil(totalRows / pageSize);
  const disableNext = pageNumber === lastPage;
  const disablePrevious = pageNumber === 1;

  const handleNextPage = () => {
    if (!setParams) return;
    setParams((prev: FetchParams) => ({
      ...prev,
      page: prev.page + 1,
    }));
  };

  const handlePreviousPage = () => {
    if (!setParams) return;
    setParams((prev: FetchParams) => ({
      ...prev,
      page: prev.page - 1,
    }));
  };

  const handleSetPage = (n: number) => {
    if (!setParams) return;
    setParams((prev: FetchParams) => ({
      ...prev,
      page: n,
    }));
  };

  const getVisiblePages = useMemo(() => {
    const arr = [];
    const range = 3;
    const endOffset = range * 2 + 2;

    const isCloseToEnd = pageNumber + range + 1 > lastPage;
    const isCloseToStart = pageNumber - range < 1;

    let nStart = isCloseToStart ? 1 : pageNumber - range;
    let nEnd = pageNumber + endOffset;

    if (isCloseToEnd) {
      nEnd = lastPage;
      nStart = lastPage - endOffset + 1;
      if (nStart < 0) nStart = 1;
    }

    if (nStart !== 1) arr.push(1);

    for (let i = nStart; i < nEnd; i++) {
      if (i <= 0) continue;
      if (i >= lastPage) break;
      if (arr.length >= endOffset) break;
      arr.push(i);
    }

    arr.push(lastPage);

    return arr;
  }, [pageNumber, lastPage]);

  const displayPageRange = useMemo(
    () =>
      getVisiblePages.map((page: number, index) => {
        const classNames = [
          "relative button-wrapper",
          page === pageNumber ? "highlight-button" : "",
        ]
          .join(" ")
          .trim();

        const displayFirstLabel = (
          <span onClick={() => handleSetPage(1)} className="button-label">
            first
          </span>
        );

        const displayLastLabel = (
          <span
            onClick={() => handleSetPage(lastPage)}
            className="button-label"
          >
            last
          </span>
        );

        return (
          <span key={`num-btn-${page}-${index}`} className={classNames}>
            <button onClick={() => handleSetPage(page)}>{page}</button>
            {/* dont show labels if theres only 1 page total */}
            {lastPage !== 1 && (
              <>
                {page === 1 ? displayFirstLabel : ""}
                {page === lastPage ? displayLastLabel : ""}
              </>
            )}
          </span>
        );
      }),
    [pageNumber, lastPage, getVisiblePages]
  );

  if (totalRows === 0) return null;

  const to = Math.min(pageNumber * pageSize, totalRows);
  const from = Math.max(to - pageSize + 1, 1);

  return (
    <div className="pagination-wrapper">
      <div className="pagination">
        {totalRows > pageSize && (
          <div className="pagination-buttons">
            <span className="relative button-wrapper">
              <button disabled={disablePrevious} onClick={handlePreviousPage}>
                <FontAwesomeIcon icon={faChevronLeft} size="1x" />
              </button>
              <span onClick={() => handleSetPage(1)} className="button-label">
                back
              </span>
            </span>

            {displayPageRange}

            <span className="relative button-wrapper">
              <button disabled={disableNext} onClick={handleNextPage}>
                <FontAwesomeIcon icon={faChevronRight} size="1x" />
              </button>
              <span
                onClick={() => handleSetPage(lastPage)}
                className="button-label"
              >
                next
              </span>
            </span>
          </div>
        )}
        <div className="pagination-details">
          {from}-{to} of {totalRows}
        </div>
      </div>
    </div>
  );
};
