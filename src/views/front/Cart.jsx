import { useState, useEffect } from "react";
import axios from "axios";
import { currency } from "../../utils/filter";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

const Cart = () => {
  const [cart, setCart] = useState({});

  const getCart = async () => {
    try {
      const url = `${API_BASE}/api/${API_PATH}/cart`;
      const response = await axios.get(url);
      setCart(response.data.data);
    } catch (error) {
      // console.log(error.response.data);
    }
  };

  const updateCart = async (cartId, productId, qty = 1) => {
    try {
      const url = `${API_BASE}/api/${API_PATH}/cart/${cartId}`;
      const data = {
        product_id: productId,
        qty,
      };
      const response = await axios.put(url, { data });
      getCart();
    } catch (error) {
      // console.log(error.response.data);
    }
  };

  // 刪除單一購物車
  const delCart = async (cartId) => {
    try {
      const url = `${API_BASE}/api/${API_PATH}/cart/${cartId}`;
      const response = await axios.delete(url);
      getCart();
    } catch (error) {
      // console.log(error.response.data);
    }
  };

  // 刪除所有購物車
  const delCarts = async () => {
    try {
      const url = `${API_BASE}/api/${API_PATH}/carts`;
      const response = await axios.delete(url);
      getCart();
    } catch (error) {
      // console.log(error.response.data);
    }
  };


  useEffect(() => {
    getCart();
  }, []);

  return (
    <>
      <div className="container">
        <h2>購物車列表</h2>
        <div className="text-end mt-4">
          <button 
            type="button"
            className="btn btn-outline-danger"
            onClick={() => delCarts()}
            disabled={!cart.carts?.length}
          >
            清空購物車
          </button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th scope="col"></th>
              <th scope="col">品名</th>
              <th scope="col">數量/單位</th>
              <th scope="col">小計</th>
            </tr>
          </thead>
          <tbody>
            {cart?.carts?.map((cartItem) => (
              <tr key={cartItem.id}>
                <td>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => delCart(cartItem.id)}
                  >
                    刪除
                  </button>
                </td>
                <td scope="row">{cartItem.product.title}</td>
                <td>
                  <div className="input-group input-group-sm mb-3">
                    <input
                      type="number"
                      className="form-control"
                      aria-label="Sizing example input"
                      aria-describedby="inputGroup-sizing-sm"
                      defaultValue={cartItem.qty}
                      onChange={(e) => updateCart(cartItem.id, cartItem.product_id, Number(e.target.value))}
                    />
                    <span
                      className="input-group-text"
                      id="inputGroup-sizing-sm"
                    >
                      {cartItem.product.unit}
                    </span>
                  </div>
                </td>
                <td className="text-end">{ currency(cartItem.final_total)}</td>
              </tr>
            ))}
            { !cart.carts?.length &&
              <tr>
                <td colSpan="4" className="py-4 text-center">
                  你的購物車還是空的
                </td>
              </tr>
            }
          </tbody>
          <tfoot>
            <tr>
              <td className="text-end" colSpan="3">
                總計
              </td>
              <td className="text-end">{currency(cart.final_total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
};

export default Cart;
