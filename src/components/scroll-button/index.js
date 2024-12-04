import React from "react";
import ScrollToTop from "react-scroll-up";

export const MyScrollUpButton = () => {
  return (
    <div>
      <ScrollToTop showUnder={160}>
        <span style={{ fontSize: 50 }}>&uarr;</span>
      </ScrollToTop>
    </div>
  );
};

export default MyScrollUpButton;
