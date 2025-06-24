
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { NavLink } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <p className="text-2xl font-semibold mt-4">Oops! Página não encontrada</p>
        <p className="text-muted-foreground mt-2">A página que você está procurando não existe ou foi movida.</p>
        <NavLink to="/" className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Voltar para o Dashboard
        </NavLink>
      </div>
    </div>
  );
};

export default NotFound;

