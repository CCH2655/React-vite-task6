import { Outlet, Link } from "react-router";

function FrontendLayout(params) {
  return (
    <>
      <header>
        <nav className="nav">
            <Link className="nav-link" to="/">
              首頁
            </Link>
            <Link className="nav-link" to="/product">
              產品列表
            </Link>
            <Link className="nav-link" to="/cart">
              購物車
            </Link>
            <Link className="nav-link" to="/checkout">
              結帳
            </Link>
            <Link className="nav-link" to="/login">
              登入
            </Link>
        </nav>

      </header>
      <main>
        <Outlet />
      </main>
      <footer className="mt-5 text-center">
        <p>© 2026 我的網站</p>
      </footer>
    </>
  )
}

export default FrontendLayout;