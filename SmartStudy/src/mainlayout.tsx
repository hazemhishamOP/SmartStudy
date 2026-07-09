import { Outlet } from "react-router";
import Navbar from "./components/navbar";

function Mainlayout() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        minHeight: "100vh",
        background: "#121214",
      }}
    >
      <Navbar />

      <main
        style={{
          padding: "50px 60px 60px 50px",   // زيادة padding من كل الجهات
          overflowY: "auto",
          maxWidth: "100%",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default Mainlayout;