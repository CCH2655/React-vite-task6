import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { currency } from "../../utils/filter";
import { useForm } from "react-hook-form";
import { RotatingLines } from "react-loader-spinner";
import * as bootstrap from "bootstrap";
import SingleProductModal from "../../components/SingleProductModal";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

const Checkout = () => {
  const [product, setProduct] = useState({});
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [loadingCartId, setLoadingCartId] = useState(null);
  const [loadingProuctId, setLoadingProductId] = useState(null);
  const productModalRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const addCart = async (id, qty = 1) => {
    setLoadingCartId(id);
    const data = {
      product_id: id,
      qty,
    };
    try {
      const url = `${API_BASE}/api/${API_PATH}/cart`;
      await axios.post(url, { data });

      getCart();
    } catch (error) {
      // console.log(error.response.data);
    } finally {
      setLoadingCartId(null);
    }
  };

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
    const getProducts = async () => {
      try {
        const response = await axios.get(
          `${API_BASE}/api/${API_PATH}/products`,
        );
        setProducts(response.data.products);
      } catch (error) {
        // console.log(error.response);
      }
    };
    getProducts();
    getCart();

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
  }, []);

  const onSubmit = async (formData) => {
    console.log(formData);
    try {
      const data = {
        user: formData,
        message: formData.message,
      };
      const url = `${API_BASE}/api/${API_PATH}/order`;
      const response = await axios.post(url, {
        data,
      });

      getCart();
    } catch (error) {
      console.log(error.response);
    }
  };

  const handleView = async (id) => {
    setLoadingProductId(id);
    try {
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/product/${id}`,
      );
      setProduct(response.data.product);
    } catch (error) {
      // console.log(error.response);
    } finally {
      setLoadingProductId(null);
    }

    productModalRef.current.show();
  };

  const closeModal = () => {
    productModalRef.current.hide();
    getCart();
  };

  useEffect(() => {
    console.log(cart);
  }, [cart]);
  return (
    <>
      <div className="container">
        <h2>產品列表</h2>
        <table className="table align-middle">
          <thead>
            <tr>
              <th>圖片</th>
              <th>商品名稱</th>
              <th>價格</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td style={{ width: "200px" }}>
                  <div
                    style={{
                      height: "100px",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundImage: `url(${product.imageUrl})`,
                    }}
                  ></div>
                </td>
                <td>{product.title}</td>
                <td>
                  <del className="h6">原價：{product.origin_price}</del>
                  <div className="h5">特價：{product.price}</div>
                </td>
                <td>
                  <div className="btn-group btn-group-sm">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => handleView(product.id)}
                      disabled={loadingProuctId === product.id}
                    >
                      {loadingProuctId === product.id ? (
                        <RotatingLines color="grey" width={80} height={16} />
                      ) : (
                        "查看更多"
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => addCart(product.id)}
                      disabled={loadingCartId === product.id}
                    >
                      {loadingCartId === product.id ? (
                        <RotatingLines color="grey" width={80} height={16} />
                      ) : (
                        "加到購物車"
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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
                      onChange={(e) =>
                        updateCart(
                          cartItem.id,
                          cartItem.product_id,
                          Number(e.target.value),
                        )
                      }
                    />
                    <span
                      className="input-group-text"
                      id="inputGroup-sizing-sm"
                    >
                      {cartItem.product.unit}
                    </span>
                  </div>
                </td>
                <td className="text-end">{currency(cartItem.final_total)}</td>
              </tr>
            ))}
            {!cart.carts?.length && (
              <tr>
                <td colSpan="4" className="py-4 text-center">
                  你的購物車還是空的
                </td>
              </tr>
            )}
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

        {/* 結帳頁面 */}
        <div className="my-5 row justify-content-center">
          <form className="col-md-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-control"
                placeholder="請輸入 Email"
                {...register("email", {
                  required: "請輸入 Email",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Email 格式不正確",
                  },
                })}
              />
              {errors.email && (
                <p className="text-danger">{errors.email.message}</p>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                收件人姓名
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="form-control"
                placeholder="請輸入姓名"
                {...register("name", {
                  required: "請輸入姓名",
                  minLength: {
                    value: 2,
                    message: "姓名最少2個字",
                  },
                })}
              />
              {errors.name && (
                <p className="text-danger">{errors.name.message}</p>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="tel" className="form-label">
                收件人電話
              </label>
              <input
                id="tel"
                name="tel"
                type="tel"
                className="form-control"
                placeholder="請輸入電話"
                {...register("tel", {
                  required: "請輸入收件人電話",
                  minLength: { value: 8, message: "電話至少 8 碼" },
                  pattern: {
                    value: /^\d+$/,
                    message: "電話僅能輸入數字",
                  },
                })}
              />
              {errors.tel && (
                <p className="text-danger">{errors.tel.message}</p>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="address" className="form-label">
                收件人地址
              </label>
              <input
                id="address"
                name="address"
                type="text"
                className="form-control"
                placeholder="請輸入地址"
                {...register("address", {
                  required: "請輸入地址",
                })}
              />
              {errors.address && (
                <p className="text-danger">{errors.address.message}</p>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="message" className="form-label">
                留言
              </label>
              <textarea
                id="message"
                className="form-control"
                cols="30"
                rows="10"
                {...register("message")}
              ></textarea>
            </div>
            <div className="text-end">
              <button type="submit" className="btn btn-danger">
                送出訂單
              </button>
            </div>
          </form>
        </div>

        <SingleProductModal
          product={product}
          addCart={addCart}
          closeModal={closeModal}
        />
      </div>
    </>
  );
};

export default Checkout;
