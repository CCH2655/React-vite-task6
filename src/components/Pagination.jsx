function Pagination({ pagination, changePage }) {

   const handleClick = (event, page) => {
    event.preventDefault();
    changePage(page);
  };


  return (
    <nav aria-label="Page navigation example">
      <ul className="pagination">
        <li className="page-item">
          <a
            herf="/"
            aria-label="Previous"
            className={`page-link ${pagination.has_pre ? 'cursor-pointer' : 'disabled'}`}
            onClick={(event) => handleClick(event, pagination.current_page - 1)}
          >
            <span aria-hidden="true">«</span>
          </a>
        </li>

        {
          Array.from({ length: pagination.total_pages }, (_, i) => (
            <li className="page-item" key={`${i}_page`}>
              <a
                className={`page-link ${
                  i + 1 === pagination.current_page && 'active'
                }`}
                href="/"
                onClick={(event) => handleClick(event, i + 1)}
              >
                {i + 1}
              </a>
            </li>
          ))
        }

        <li className="page-item">
          <a 
            herf="/"
            aria-label="Next"
            className={`page-link ${pagination.has_next ? 'cursor-pointer' : 'disabled'}`}
            onClick={(event) => handleClick(event, pagination.current_page + 1)}
          >
            <span aria-hidden="true">»</span>
          </a>
        </li>
      </ul>
    </nav>
	);
}

export default Pagination