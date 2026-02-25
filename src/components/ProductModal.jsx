import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function ProductModal({
  modalType,
  templateProduct,
  getProducts,
  closeModal,
}) {
  const [tempData, setTempData] = useState(templateProduct);

  useEffect(() => {
    setTempData(templateProduct);
  }, [templateProduct]);

  const handleModalInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTempData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (index, value) => {
    setTempData((prevData) => {
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
    setTempData((prevData) => ({
      ...prevData,
      imagesUrl: [...prevData.imagesUrl, ""],
    }));
  };

  const handleRemoveImage = () => {
    setTempData((prevData) => {
      const newImages = [...prevData.imagesUrl];
      newImages.pop();
      return { ...prevData, imagesUrl: newImages };
    });
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
        ...tempData,
        origin_price: Number(tempData.origin_price), // 轉換為數字
        price: Number(tempData.price), // 轉換為數字
        is_enabled: tempData.is_enabled ? 1 : 0, // 轉換為數字
        imagesUrl: tempData.imagesUrl.filter((url) => url !== ""), // 過濾空白
      },
    };

    try {
      let response;
      if (method === "put") {
        response = await axios.put(url, productData);
        alert("產品更新成功！");
      } else {
        response = await axios.post(url, productData);
        alert("產品新增成功！");
      }

      // 關閉 Modal 並重新載入資料
      closeModal();
      getProducts();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;      
      alert(`${modalType === "edit" ? "更新" : "新增"}失敗：${errorMsg}`);
    }
  };

  const delProductData = async (id) => {
    try {
      const response = await axios.delete(
        `${API_BASE}/api/${API_PATH}/admin/product/${id}`
      );
      alert("產品刪除成功！");

      // 關閉 Modal 並重新載入資料
      closeModal();
      getProducts();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      alert("刪除失敗：" + errorMsg);
    }
  };

  const handleUploadImage = async (e) => {
    const url = `${API_BASE}/api/${API_PATH}/admin/upload`;

    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const formData = new FormData();
      formData.append("file-to-upload", file);

      let res = await axios.post(url, formData);
      const uploadedImageUrl = res.data.imageUrl;

      setTempData((prevTemplatedata) => ({
        ...prevTemplatedata,
        imageUrl: uploadedImageUrl,
      }))
    } catch (error) {
      console.error("Upload error:", error);
    }

  }

  return (
    <div
      id="productModal"
      className="modal fade"
      tabIndex="-1"
      aria-labelledby="productModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-xl">
        <div className="modal-content border-0">
          <div
            className={`modal-header ${
              modalType === "delete" ? "bg-danger" : "bg-dark"
            } text-white`}
          >
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
                <span className="text-danger">{tempData.title}</span>
                嗎?
              </p>
            ) : (
              <div className="row">
                <div className="col-sm-4">
                  <div className="mb-2">
                    <div className="mb-3">
                      <label htmlFor="fileUpload" className="form-label">
                        上傳圖片
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        name="fileUpload"
                        id="fileUpload"
                        accept=".jpg,.jpeg,.png"
                        onChange={handleUploadImage}
                      />
                    </div>
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
                        value={tempData.imageUrl}
                        onChange={handleModalInputChange}
                      />
                    </div>
                    {
                      tempData.imageUrl &&
                      <img
                        className="img-fluid"
                        src={tempData.imageUrl}
                        alt="主圖"
                      />
                    }
                  </div>
                  <div>
                    {tempData.imagesUrl.map((image, index) => (
                      <div key={index} className="mb-2">
                        <input
                          type="text"
                          value={image}
                          onChange={(e) => handleImageChange(index, e.target.value)}
                          placeholder={`圖片網址${index + 1}`}
                          className="form-control"
                        />
                        {image && (
                          <img
                            className="img-fluid"
                            src={image}
                            alt={`副圖${index + 1}`}
                          />
                        )}
                      </div>
                    ))}

                    <div className="d-flex justify-content-between gap-1">
                      {tempData.imagesUrl.length < 5 &&
                        tempData.imagesUrl[
                          tempData.imagesUrl.length - 1
                        ] !== "" && (
                          <button
                            className="btn btn-outline-primary btn-sm w-100"
                            onClick={handleAddImage}
                          >
                            新增圖片
                          </button>
                        )}
                      {tempData.imagesUrl.length >= 1 && (
                        <button
                          className="btn btn-outline-danger btn-sm w-100"
                          onClick={handleRemoveImage}
                        >
                          刪除圖片
                        </button>
                      )}
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
                      value={tempData.title}
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
                        value={tempData.category}
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
                        value={tempData.unit}
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
                        value={tempData.origin_price}
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
                        value={tempData.price}
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
                      value={tempData.description}
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
                      value={tempData.content}
                      onChange={handleModalInputChange}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        id="is_delivery"
                        name="is_delivery"
                        type="checkbox"
                        className="form-check-input"
                        checked={tempData.is_delivery}
                        onChange={handleModalInputChange}
                      />
                      <label className="form-check-label" htmlFor="is_delivery">
                        宅配
                      </label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        id="is_enabled"
                        name="is_enabled"
                        type="checkbox"
                        className="form-check-input"
                        checked={tempData.is_enabled}
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
                  onClick={() => delProductData(tempData.id)}
                >
                  刪除
                </button>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => updateProductData(tempData.id)}
                >
                  確認
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductModal
