
import { NavLink } from "react-router-dom";
import { NavLinks } from "./NavLinks";

const AppSidebar = () => {
  return (
    <aside className="hidden w-64 flex-col border-r bg-secondary md:flex">
      <div className="flex h-16 items-center border-b px-6">
        <NavLink to="/" className="flex items-center">
          <img src="/lovable-uploads/34538c76-855c-4a49-9aae-18637b429168.png" alt="AgroAjuda Logo" className="h-8" />
        </NavLink>
      </div>
      <NavLinks />
    </aside>
  );
};

export default AppSidebar;
