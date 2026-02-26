import { Outlet, Link } from "react-router";

function BackendLayout(params) {
  return (
    <>
      <header>
        <nav className="nav">
            <Link className="nav-link" to="/">
              返回前台
            </Link>
            <Link className="nav-link" to="/admin/product">
              產品管理
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

export default BackendLayout;