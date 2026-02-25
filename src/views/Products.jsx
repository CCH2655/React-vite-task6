import { useEffect, useRef, useState } from "react";
import * as bootstrap from "bootstrap";
import axios from "axios";

import Pagination from "../components/Pagination";
import ProductModal from "../components/ProductModal";

// API 設定
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

const INITIAL_TEMPLATE_DATA = {
  id: "",
  title: "",
  category: "",
  origin_price: "",
  price: "",
  unit: "",
  description: "",
  content: "",
  imageUrl: "",
  imagesUrl: [],
  is_enabled: false,
  is_delivery: false,
};

function Products() {
  const productModalRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [templateData, setTemplateData] = useState(INITIAL_TEMPLATE_DATA);
  const [modalType, setModalType] = useState("");
  const [pagination, setPagination] = useState({});

  const getProducts = async (page = 1) => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products?page=${page}`,
      );
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error("取得產品失敗：", err.response?.data?.message);
    }
  };

  const openModal = (product, type) => {
    setTemplateData({
      ...INITIAL_TEMPLATE_DATA,
      ...product,
    });
    setModalType(type);
    productModalRef.current.show();
  };
  const closeModal = () => {
    productModalRef.current.hide();
  };

  useEffect(() => {
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

    // 載入Products列表的時候，執行getProducts
    getProducts(); 
  }, []);

  return (
    <>
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

            <div className="d-flex flex-column justify-content-center align-items-center">
              <table className="table">
                <thead>
                  <tr>
                    <th>分類</th>
                    <th>產品名稱</th>
                    <th>原價</th>
                    <th>售價</th>
                    <th>可否宅配</th>
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
                        <span className={`${product.is_delivery ? 'text-success' : 'text-danger'}`}>
                          {product.is_delivery ? '可宅配' : '無宅配'}
                        </span>
                      </td>
                      <td>
                        <span className={`${product.is_enabled ? 'text-success' : 'text-danger'}`}>
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

              <Pagination pagination={pagination} changePage={getProducts} />
            </div>
            
          </div>
        </div>
      </div>

      <ProductModal
        modalType={modalType}
        templateProduct={templateData}
        getProducts={getProducts}
        closeModal={closeModal}
      />

    </>
  )
}

export default Products