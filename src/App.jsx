import { useState, useEffect } from 'react';

import "./assets/style.css";
import axios from "axios";

// API 設定
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;


function App() {
  // 表單資料狀態(儲存登入表單輸入)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  // 登入狀態管理(控制顯示登入或產品頁）
  const [isAuth, setIsAuth] = useState(false);
  // 產品資料狀態
  const [products, setProducts] = useState([]);
  // 目前選中的產品
  const [tempProduct, setTempProduct] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData, // 保留原有屬性
      [name]: value, // 更新特定屬性
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      // console.log(response.data);
      const { token, expired } = response.data;
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      // 設定 axios 預設 header
      axios.defaults.headers.common.Authorization = `${token}`;

      // 載入產品資料
      getData();

      // 更新登入狀態
      setIsAuth(true);
    } catch (error) {
      setIsAuth(false);
      // console.error(error);
      alert(error.response.data.message);
    }
  }

  // 檢查登入狀態
  const checkLogin = async () => {
    try {
      // 從 Cookie 取得 Token
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("hexToken="))
        ?.split("=")[1];
      // console.log("目前 Token：", token);

      if (token) {
        axios.defaults.headers.common.Authorization = token;
        // 驗證 Token 是否有效
        const res = await axios.post(`${API_BASE}/api/user/check`);
        // console.log("Token 驗證結果：", res.data);
        // 如果以驗證過，直接登入，並且載入資料
        if(res.data.success) {
          getData();
          setIsAuth(true);
        }
      }
    } catch (error) {
      // console.error("Token 驗證失敗：", error.response?.data);
      alert(error.response.data.message);
    }
  };

  const getData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products`
      );
      // console.log("產品資料：", response.data);
      setProducts(response.data.products);
    } catch (err) {
      console.error("取得產品失敗：", err.response?.data?.message);
    }
  };

  const deleteData = async (id) => {
    try {
      const response = await axios.delete(
        `${API_BASE}/api/${API_PATH}/admin/product/${id}`
      );
      // console.log("產品資料：", response.data);
      getData();
    } catch (err) {
      console.error("取得產品失敗：", err.response?.data?.message);
    }
  };

  useEffect(() => {
    // 頁面載入直接執行一次"檢查登入狀態"
    // main.jsx StrictMode 會執行第二次
    // checkLogin();
  }, []);

  return (
    <>
      <button
        className={`fixed m-2 btn ${!isAuth? "btn-danger" : "btn-success"}`}
        type="button"
        onClick={() => checkLogin()}
      >
        {!isAuth? "確認是否登入" : "已登入"}
      </button>

      {!isAuth ? (
        <div className="container ">
          <div className="position-absolute top-50 start-50 translate-middle card">
            <div className="card-body">
              <div className="row justify-content-center">
                <h1 className="h3 mb-3 font-weight-normal">請先登入</h1>

                <div className="col-8">
                  <form id="form" className="form-signin" 
                  onSubmit={handleSubmit}
                  >
                    <div className="form-floating mb-3">
                      <input
                        type="email"
                        className="form-control"
                        id="username"
                        name="username"
                        placeholder="name@example.com"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        autoFocus
                      />
                      <label htmlFor="username">Email address</label>
                    </div>
                    <div className="form-floating">
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                      <label htmlFor="password">Password</label>
                    </div>
                    <button
                      className="btn btn-lg btn-primary w-100 mt-3"
                      type="submit"
                    >
                      登入
                    </button>
                  </form>
                </div>
              </div>
              <p className="mt-5 mb-3 text-muted">&copy; 2025~∞ - 六角學院</p>
            </div>
          </div>
          
        </div>
      ) : (
        // 登入後的產品管理頁面 (同第一週)
        <div className="container">
          <div className="row mt-5">
            <div className="col-md-6">
              <div className="card">
                <div className="card p-4">
                  <h2>產品列表</h2>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>產品名稱</th>
                        <th>原價</th>
                        <th>售價</th>
                        <th>是否啟用</th>
                        <th>查看細節</th>
                        {/* <th>更多操作</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((item, index) => (
                        <tr key={index}>
                          <td>{item.title}</td>
                          <td>{item.origin_price}</td>
                          <td>{item.price}</td>
                          <td>
                            {item.is_enabled ? "啟用" : "未啟用"}
                          </td>
                          <td>
                            <button type="button" className="btn btn-primary" onClick={() => setTempProduct(item)}>查看細節</button>
                          </td>
                          {/* <td>
                            <button type="button" className="btn btn-danger" onClick={() => deleteData(item.id)}>刪除</button>
                          </td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
            </div>

            <div className="col-md-6 ">
              <div className="card">
                <div className="card p-4">
                  <h2>單一產品細節</h2>
                  {tempProduct ? (
                    <div className="card mb-3 p-2">
                      <img src={tempProduct.imageUrl} className="card-img-top primary-image" alt="主圖" />
                      <div className="card-body">
                        <h5 className="card-title">
                          {tempProduct.title}
                          <span className="badge bg-primary ms-2">{tempProduct.category}</span>
                        </h5>
                        <p className="card-text">商品描述：{tempProduct.description}</p>
                        <p className="card-text">商品內容：{tempProduct.content}</p>
                        <div className="d-flex">
                          <p className="card-text text-secondary"><del>{tempProduct.origin_price}</del></p>
                          元 / {tempProduct.price} 元
                        </div>
                        <h5 className="mt-3">更多圖片：</h5>
                        <div className="d-flex flex-wrap">
                          {tempProduct.imagesUrl.map((url, index) => {
                            return (
                              <img key={index} src={url} className="images" alt="更多圖片" />
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-secondary">請選擇一個商品查看</p>
                  )}
                </div>
              </div>
              
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default App
