import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { createContext } from "react";
import { useContext } from "react";
import App from "./App.jsx";


export const Context= createContext({
  isAuthenticated: false,
  setIsAuthenticated: () =>{ },
  user: null,
  setUser: () =>{},
});

//we craeted a component called AppWrapper that will wrap the entire application, because the variables in Context are static and for changes we have to use the useState hook
const AppWrapper= ()=>{
  const [isAuthenticated, setIsAuthenticated] = useState();
  const [user, setUser] = useState();

  return (
    <Context.Provider value={{isAuthenticated,setIsAuthenticated,user,setUser}}>
      <App/>
    </Context.Provider>
  );
};


createRoot(document.getElementById("root")).render(
  <StrictMode>
   <AppWrapper/>
  </StrictMode>
);
