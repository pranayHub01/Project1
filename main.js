document.addEventListener('DOMContentLoaded', () => {
  const apiEndpoint = 'https://fakestoreapi.com/products';
  // taking let variables which gets changed once API fetches the data
  let productsArray = [];
  let filteredProducts = [];
  let visibleProducts = [];
  const productsPerPage = 10;
  let currentPage = 1;
  let activeProductId = null;

  // using html tags classes to add the respective logic
  const productGrid = document.getElementById('product-grid');
  const loadMoreButton = document.getElementById('load-more');
  const searchInput = document.getElementById('search');
  const categoryFilter = document.getElementById('category-filter');
  const priceSort = document.getElementById('price-sort');
  const loadingIndicator = document.getElementById('loading');
  const errorIndicator = document.getElementById('error');

  // Fetching products from API
  const fetchProducts = async () => {
    showLoading();
    try {
      const response = await fetch(apiEndpoint);
      productsArray = await response.json();
      filteredProducts = productsArray;
      renderCategories();
      renderProducts();
      loadMoreButton.style.display = 'block';
    } catch (error) {
      showError();
    } finally {
      hideLoading();
    }
  };

  //   product categories for filtering
  const renderCategories = () => {
    const categories = [
      ...new Set(productsArray.map((product) => product.category)),
    ];
    categories.forEach((category) => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = `${category.charAt(0).toUpperCase()}${category.slice(
        1
      )}`;
      categoryFilter.appendChild(option);
    });
  };

  // Render products
  const renderProducts = () => {
    productGrid.innerHTML = '';
    const end = currentPage * productsPerPage;
    visibleProducts = filteredProducts.slice(0, end);
    visibleProducts.forEach((product) => {
      const productElement = document.createElement('div');
      productElement.classList.add('product');
      productElement.dataset.productId = product.id;
      productElement.innerHTML = `
        <img src="${product.image}" alt="${product.title}">
        <h3 class="img-title">${product.title}</h3>
        <p>$${product.price}</p>
        <button class="more-details-btn">More Details</button>
        <div class="product-details">
          <p>${product.description}</p>
        </div>
      `;
      productGrid.appendChild(productElement);
    });

    if (end >= filteredProducts.length) {
      loadMoreButton.style.display = 'none';
    }

    document.querySelectorAll('.more-details-btn').forEach((button) => {
      button.addEventListener('click', toggleDetails);
    });
  };

  // Show loading dummy product div with shimmer effect until the api fetches values
  const showLoading = () => {
    productGrid.innerHTML = '';
    for (let i = 0; i < productsPerPage; i++) {
      const shimmerElement = document.createElement('div');
      shimmerElement.classList.add('shimmer-wrapper');
      shimmerElement.innerHTML = `
        <div class="shimmer"></div>
        <div class="shimmer"></div>
        <div class="shimmer"></div>
        <div class="shimmer"></div>
      `;
      productGrid.appendChild(shimmerElement);
    }
    loadingIndicator.style.display = 'block';
  };

  // Hiding loading indicator after async operation (fetch through API) , this will disappear incase of failure and success as well

  const hideLoading = () => {
    loadingIndicator.style.display = 'none';
  };

  //  error message incase of api fetch failure
  const showError = () => {
    errorIndicator.style.display = 'block';
  };

  //  searching implementation based on product title
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    filteredProducts = productsArray.filter((product) =>
      product.title.toLowerCase().includes(query)
    );
    currentPage = 1;
    renderProducts();
  });

  //  implementing category filtering
  categoryFilter.addEventListener('change', (e) => {
    const category = e.target.value;
    filteredProducts = category
      ? productsArray.filter((product) => product.category === category)
      : productsArray;
    currentPage = 1;
    renderProducts();
  });

  // implementing price sorting
  priceSort.addEventListener('change', (e) => {
    const sortOrder = e.target.value;
    filteredProducts.sort((a, b) =>
      sortOrder === 'asc' ? a.price - b.price : b.price - a.price
    );
    renderProducts();
  });

  //   lazy loading  on hitting loadmore button
  loadMoreButton.addEventListener('click', () => {
    currentPage++;
    renderProducts();
  });

  // detailed product information is visibile on licking the moreDetails button of the respective product, this click makes
  // 1. Opens the current product information
  // 2. closes the exiting opened toggle in case of open
  // 3. closes the current toggle incase of open

  const toggleDetails = (e) => {
    const productId = e.target.closest('.product').dataset.productId;
    if (activeProductId === productId) {
      // Closes currently opend
      document.querySelector(
        `.product[data-product-id="${productId}"] .product-details`
      ).style.display = 'none';
      activeProductId = null;
    } else {
      // Close any open details
      if (activeProductId) {
        document.querySelector(
          `.product[data-product-id="${activeProductId}"] .product-details`
        ).style.display = 'none';
      }
      // Open  details
      document.querySelector(
        `.product[data-product-id="${productId}"] .product-details`
      ).style.display = 'block';
      activeProductId = productId;
    }
  };

  showLoading();
  fetchProducts();
});
