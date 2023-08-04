import React from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";

function Categories(): JSX.Element {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar></Navbar>
      <div className="flex-1 flex flex-col md:flex-row"></div>
      <Footer></Footer>
    </div>
  );
}

export default Categories;
