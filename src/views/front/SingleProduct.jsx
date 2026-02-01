import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function SingleProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState();

  useEffect(() => {
    const handleView = async (id) => {
      try {
        const response = await axios.get(`${API_BASE}/api/${API_PATH}/product/${id}`);
        setProduct(response.data.product);
      } catch (error) {
        console.log(error.response);
      }
    };
    handleView(id)
  }, [id]);

  const addCart = async (id, num = 1) => {
    const data = {
      product_id: id,
      qty: num,
    };
    try {
      const url = `${API_BASE}/api/${API_PATH}/cart`;
      await axios.post(url, { data });
    } catch (error) {
      console.log(error.response.data);
    }
  };

  return (
    <>
      {
        !product ? 
          <h2>查無產品</h2>
          :
          <div className="container mt-3">
            <div className="card" style={{ width: '18rem' }}>
              <img
                src={product.imageUrl}
                className="card-img-top"
                alt={product.title}
              />
              <div className="card-body">
                <h5 className="card-title">{product.title}</h5>
                <p className="card-text">
                  {product.description}
                </p>
                <p className="card-text">
                  <strong>分類:</strong> {product.category}
                </p>
                <p className="card-text">
                   <strong>單位:</strong> {product.unit}
                </p>
                <p className="card-text">
                  <strong>原價:</strong> {product.origin_price} 元
                </p>
                <p className="card-text">
                  <strong>現價:</strong> {product.price} 元
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => addCart(product.id)}
                >
                  加入購物車
                </button>
              </div>
            </div>
          </div>
      }
    </>
  )
}

export default SingleProduct;