import { useState, useEffect, useRef } from "react";
import "./assets/style.css";
import axios from "axios";

import Login from "./views/Login";
import Products from "./views/Products";

// API 設定
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function App() {
  // 登入驗證
  const [isAuth, setIsAuth] = useState(false);

  const checkAdmin = async () => {
    try {
      await axios.post(`${API_BASE}/api/user/check`);
      setIsAuth(true);
    } catch (err) {
      console.log("權限檢查失敗：", err.response?.data?.message);
      setIsAuth(false);
    }
  };

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("hexToken="))
      ?.split("=")[1];

    if (token) {
      axios.defaults.headers.common.Authorization = token;
    }

    checkAdmin();
  }, []);

  return (
    <>
      {!isAuth ? (
        <Login 
          setIsAuth={setIsAuth}
        />
      ) : (
        <Products />
      )}
    </>
  );
}

export default App;
