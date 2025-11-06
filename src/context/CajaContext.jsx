// src/context/CajaContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../services/client";

const CajaContext = createContext();

export const useCaja = () => useContext(CajaContext);

export const CajaProvider = ({ children }) => {
  const [cajaAbierta, setCajaAbierta] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkCaja = async () => {
      const { data } = await supabase
        .from("CorteCaja")
        .select("id, estado")
        .order("id", { ascending: false })
        .limit(1);

      if (data && data.length > 0 && data[0].estado === "abierta") {
        setCajaAbierta(true);
      } else {
        setCajaAbierta(false);
      }
      setLoading(false);
    };

    checkCaja();
  }, []);

  return (
    <CajaContext.Provider value={{ cajaAbierta, setCajaAbierta, loading }}>
      {children}
    </CajaContext.Provider>
  );
};
