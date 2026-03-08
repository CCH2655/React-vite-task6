import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function DeleteCheckModal({
  deleteModalType,
  delCartId,
  closeModal,
}) {

  const delCart = async () => {
    try {
      const url = deleteModalType == "delCart" ? 
        `${API_BASE}/api/${API_PATH}/cart/${delCartId}`
        :
        `${API_BASE}/api/${API_PATH}/carts`;

      const response = await axios.delete(url);

      alert("產品刪除成功！");
      // 關閉 Modal 並重新載入資料
      closeModal();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      alert("刪除失敗：" + errorMsg);
    }
  };

  return (
    <div
      id="deleteCheckModal"
      className="modal fade"
      tabIndex="-1"
      aria-labelledby="deleteCheckModal"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-xl">
        <div className="modal-content border-0">
          <div
            className={`modal-header bg-danger text-white`}
          >
            <h5 id="deleteCheckModalLabel" className="modal-title">
              <span>
                {
                  deleteModalType == "delCart" ?
                  "刪除商品"
                  :
                  "清空購物車"
                }
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
            
            <p className="h4">
                確定要刪除嗎?
            </p>

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
            <div>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => delCart()}
                >
                  刪除
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteCheckModal
