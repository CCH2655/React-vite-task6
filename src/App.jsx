import { useState, useEffect, useRef } from 'react';
import * as bootstrap from "bootstrap";
import "./assets/style.css";
import axios from "axios";

// API 設定
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function App() {
  const INITIAL_TEMPLATE_DATA = {
    id: "",
    title: "",
    category: "",
    origin_price: "",
    price: "",
    unit: "",
    description: "",
    content: "",
    is_enabled: false,
    imageUrl: "",
    imagesUrl: [],
  };
 

  const productModalRef = useRef(null);
  const [modalType, setModalType] = useState(""); // "create", "edit", "delete"
  const [templateData, setTemplateData] = useState(INITIAL_TEMPLATE_DATA);

  const openModal = (product, type) => {
    setTemplateData((prevData) => ({
      ...prevData,
      ...product,
    }));

    // 設定 Modal 類型並顯示
    setModalType(type);
    productModalRef.current.show();
  };
  const closeModal = () => {
    productModalRef.current.hide();
  };

  const handleImageChange = (index, value) => {
    setTemplateData((prevData) => {
      const newImages = [...prevData.imagesUrl]; // 複製陣列
      newImages[index] = value; // 更新特定索引

      // 填寫最後一個空輸入框時，自動新增空白輸入框
      if (
        value !== "" &&
        index === newImages.length - 1 &&
        newImages.length < 5
      ) {
        newImages.push("");
      }
      // 清空輸入框時，移除最後的空白輸入框
      if (
          value === "" &&
          newImages.length > 1 &&
          newImages[newImages.length - 1] === ""
        ) {
        newImages.pop();
      }
      return { ...prevData, imagesUrl: newImages };
    });
  };
  
  const handleAddImage = () => {
    setTemplateData((prevData) => ({
      ...prevData,
      imagesUrl: [...prevData.imagesUrl, ""],
    }));
  };

  const handleRemoveImage = () => {
    setTemplateData((prevData) => {
      const newImages = [...prevData.imagesUrl];
      newImages.pop();
      return { ...prevData, imagesUrl: newImages };
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData, // 保留原有屬性
      [name]: value, // 更新特定屬性
    }));
  };
  
  const handleModalInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTemplateData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 產品 API
  const [products, setProducts] = useState([]);
  const getProductData = async () => {
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

  const updateProductData = async (id) => {
    // 決定 API 端點和方法
    let url;
    let method;

    if (modalType === "edit") {
      url = `${API_BASE}/api/${API_PATH}/admin/product/${id}`;
      method = "put";
    } else if (modalType === "create") {
      url = `${API_BASE}/api/${API_PATH}/admin/product`;
      method = "post";
    }

    // 準備要送出的資料（注意格式！）
    const productData = {
      data: {
        ...templateData,
        origin_price: Number(templateData.origin_price), // 轉換為數字
        price: Number(templateData.price), // 轉換為數字
        is_enabled: templateData.is_enabled ? 1 : 0, // 轉換為數字
        imagesUrl: templateData.imagesUrl.filter((url) => url !== ""), // 過濾空白
      },
    };

    try {
      let response;
      if (method === "put") {
        response = await axios.put(url, productData);
        // console.log("產品更新成功：", response.data);
        alert("產品更新成功！");
      } else {
        response = await axios.post(url, productData);
        // console.log("產品新增成功：", response.data);
        alert("產品新增成功！");
      }

      // 關閉 Modal 並重新載入資料
      closeModal();
      getProductData();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      console.error(`${modalType === "edit" ? "更新" : "新增"}失敗：`, errorMsg);
      alert(`${modalType === "edit" ? "更新" : "新增"}失敗：${errorMsg}`);
    }
  };
  const deleteProductData = async (id) => {
    try {
      const response = await axios.delete(
        `${API_BASE}/api/${API_PATH}/admin/product/${id}`
      );
      // console.log("產品刪除成功：", response.data);
      alert("產品刪除成功！");

      // 關閉 Modal 並重新載入資料
      closeModal();
      getProductData();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      console.error("刪除失敗：", errorMsg);
      alert("刪除失敗：" + errorMsg);
    }
  };

  // 登入驗證
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isAuth, setIsAuth] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = response.data;
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      // 設定 axios 預設 header
      axios.defaults.headers.common.Authorization = `${token}`;

      // 載入產品資料
      getProductData();
      setIsAuth(true);
    } catch (error) {
      setIsAuth(false);
      // console.error(error);
      alert(error.response.data.message);
    }
  }

  const checkAdmin = async () => {
    try {
      await axios.post(`${API_BASE}/api/user/check`);
      setIsAuth(true);
      getProductData(); // 載入產品資料
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

    // 初始化 Bootstrap Modal
    productModalRef.current = new bootstrap.Modal("#productModal", {
      keyboard: false,
    });

    // Modal 關閉時移除焦點
    document
      .querySelector("#productModal")
      .addEventListener("hide.bs.modal", () => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      });

    checkAdmin();
  }, []);
  
  return (
    <>
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
        <div className="container mt-4">

          <div className="card">
            <div className="card p-4">
              <div className="d-flex justify-content-between align-items-center">
                <h2>產品列表</h2>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => openModal(INITIAL_TEMPLATE_DATA, "create")}
                >
                  建立新的產品
                </button>
              </div>

              <table className="table">
                <thead>
                  <tr>
                    <th>分類</th>
                    <th>產品名稱</th>
                    <th>原價</th>
                    <th>售價</th>
                    <th>是否啟用</th>
                    <th>編輯</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={index}>
                      <td>{product.category}</td>
                      <td>{product.title}</td>
                      <td>{product.origin_price}</td>
                      <td>{product.price}</td>
                      <td>
                        <span className={`${product.is_enabled ? 'text-success' : ''}`}>
                          {product.is_enabled ? '啟用' : '未啟用'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => openModal(product, "edit")}
                          >
                            編輯
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => openModal(product, "delete")}
                          >
                            刪除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      <div
        id="productModal"
        className="modal fade"
        tabIndex="-1"
        aria-labelledby="productModalLabel"
        aria-hidden="true"
        ref={productModalRef}
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content border-0">
            <div className={`modal-header ${
                modalType === "delete" ? "bg-danger" : "bg-dark"
              } text-white`}>
              <h5 id="productModalLabel" className="modal-title">
                <span>
                  {modalType === "delete"
                    ? "刪除產品"
                    : modalType === "edit"
                    ? "編輯產品"
                    : "新增產品"}
                </span>
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {modalType === "delete" ? (
                <p className="h4">
                  確定要刪除
                  <span className="text-danger">{templateData.title}</span>
                  嗎?
                </p>
              ) : (
                <div className="row">
                  <div className="col-sm-4">
                    <div className="mb-2">
                      <div className="mb-3">
                        <label htmlFor="imageUrl" className="form-label">
                          輸入圖片網址
                        </label>
                        <input
                          type="text"
                          id="imageUrl"
                          name="imageUrl"
                          className="form-control"
                          placeholder="請輸入圖片連結"
                          value={templateData.imageUrl}
                          onChange={handleModalInputChange}
                        />
                      </div>
                      <img
                        className="img-fluid"
                        src={templateData.imageUrl}
                        alt="主圖"
                      />
                    </div>
                    <div >
                      {templateData.imagesUrl.map((image, index) => (
                        <div key={index} className="mb-2">
                          <input
                            type="text"
                            value={image}
                            onChange={(e) => handleImageChange(index, e.target.value)}
                            placeholder={`圖片網址${index + 1}`}
                            className="form-control"
                          />
                          {
                            image && 
                            <img
                              className="img-fluid"
                              src={image}
                              alt={`副圖${index + 1}`}
                            />
                          }
                        </div>
                      ))}
                      
                      <div className="d-flex justify-content-between gap-1">
                        {templateData.imagesUrl.length < 5 &&
                          templateData.imagesUrl[
                            templateData.imagesUrl.length - 1 
                          ] !== "" && (
                            <button 
                              className="btn btn-outline-primary btn-sm w-100"
                              onClick={handleAddImage}
                            >
                              新增圖片
                            </button>
                          )
                        }
                        {
                          templateData.imagesUrl.length >= 1 && (
                            <button 
                              className="btn btn-outline-danger btn-sm w-100"
                              onClick={handleRemoveImage}
                            >
                              刪除圖片
                            </button>
                          )
                        }
                      </div>

                    </div>
                  </div>
                  <div className="col-sm-8">
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label">
                        標題
                      </label>
                      <input
                        name="title"
                        id="title"
                        type="text"
                        className="form-control"
                        placeholder="請輸入標題"
                        value={templateData.title}
                        onChange={handleModalInputChange}
                      />
                    </div>

                    <div className="row">
                      <div className="mb-3 col-md-6">
                        <label htmlFor="category" className="form-label">
                          分類
                        </label>
                        <input
                          name="category"
                          id="category"
                          type="text"
                          className="form-control"
                          placeholder="請輸入分類"
                          value={templateData.category}
                          onChange={handleModalInputChange}
                        />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label htmlFor="unit" className="form-label">
                          單位
                        </label>
                        <input
                          name="unit"
                          id="unit"
                          type="text"
                          className="form-control"
                          placeholder="請輸入單位"
                          value={templateData.unit}
                          onChange={handleModalInputChange}
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="mb-3 col-md-6">
                        <label htmlFor="origin_price" className="form-label">
                          原價
                        </label>
                        <input
                          id="origin_price"
                          name="origin_price"
                          type="number"
                          min="0"
                          className="form-control"
                          placeholder="請輸入原價"
                          value={templateData.origin_price}
                          onChange={handleModalInputChange}
                          />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label htmlFor="price" className="form-label">
                          售價
                        </label>
                        <input
                          id="price"
                          name="price"
                          type="number"
                          min="0"
                          className="form-control"
                          placeholder="請輸入售價"
                          value={templateData.price}
                          onChange={handleModalInputChange}
                        />
                      </div>
                    </div>
                    <hr />

                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">
                        產品描述
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        className="form-control"
                        placeholder="請輸入產品描述"
                        value={templateData.description}
                        onChange={handleModalInputChange}
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="content" className="form-label">
                        說明內容
                      </label>
                      <textarea
                        id="content"
                        name="content"
                        className="form-control"
                        placeholder="請輸入說明內容"
                        value={templateData.content}
                        onChange={handleModalInputChange}
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          id="is_enabled"
                          name="is_enabled"
                          type="checkbox"
                          className="form-check-input"
                          checked={templateData.is_enabled}
                          onChange={handleModalInputChange}
                        />
                        <label className="form-check-label" htmlFor="is_enabled">
                          是否啟用
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                data-bs-dismiss="modal"
                onClick={() => closeModal()}
                >
                取消
              </button>
              {modalType === "delete" ? (
                <div>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => deleteProductData(templateData.id)}
                  >
                    刪除
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => updateProductData(templateData.id)}
                  >
                    確認
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
