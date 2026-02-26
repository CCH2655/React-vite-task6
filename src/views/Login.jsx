import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Login({ setIsAuth }) {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (formData) => {
    try {
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = response.data;
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      // 設定 axios 預設 header
      axios.defaults.headers.common.Authorization = `${token}`;

      // 成功則導轉至後台product管理
      navigate(`/admin/product`);
      // setIsAuth(true);
    } catch (error) {
      // setIsAuth(false);
      // console.error(error);
      alert(error.response.data.message);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center">
      <div className="card">
        <div className="card-body py-4">
          <div className="row justify-content-center">
            <h1 className="h3 mb-3 font-weight-normal">請先登入</h1>

            <div className="col-8 mb-3">
              <form id="form" className="form-signin" onSubmit={handleSubmit(onSubmit)}>
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="username"
                    name="username"
                    autoComplete="off"
                    placeholder="name@example.com"
                    // autoFocus
                    {...register('username', {
                      required: '請輸入 Email',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Email 格式不正確",
                      },
                    })}
                  />
                  <label htmlFor="username">Email address</label>
                  {
                    errors.username && (
                      <p className="text-danger">{errors.username.message}</p>
                    )
                  }
                </div>
                <div className="form-floating">
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    placeholder="Password"
                    {...register("password", {
                      required: "請輸入密碼",
                      minLength: {
                        value: 6,
                        message: "密碼長度至少需 6 碼",
                      },
                    })}
                  />
                  <label htmlFor="password">Password</label>
                  {
                    errors.password && (
                      <p className="text-danger">{errors.password.message}</p>
                    )
                  }
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
        </div>
      </div>
    </div>
  );
}

export default Login;
