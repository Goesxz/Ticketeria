import Footer from "./Footer";
import "./Layout.css";

function Layout({ children }) {
  return (
    <div className="layout">
      {children}
      <Footer />
    </div>
  );
}

export default Layout;
