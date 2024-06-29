document.addEventListener('DOMContentLoaded', () => {
  const apiEndpoint = 'https://fakestoreapi.com/products';
  let products = [];
  let filteredProducts = [];
  let currentIndex = 0;
  const itemsPerLoad = 10;

  const productList = document.getElementById('product-list');
  const loadMoreButton = document.getElementById('load-more');
  const searchInput = document.getElementById('search');
  const sortSelect = document.getElementById('sort');
  const categoriesContainer = document.getElementById('categories');
  const sidebar = document.getElementById('sidebar');
  const hamburger = document.getElementById('hamburger');

  const fetchProducts = async () => {
    showLoading();
    try {
      const response = await fetch(apiEndpoint);
      if (!response.ok) throw new Error('Failed to fetch products');
      products = await response.json();
      filteredProducts = products;
      extractCategories();
      displayProducts();
    } catch (error) {
      console.error(error);
      showError('Failed to load products. Please try again later.');
    } finally {
      hideLoading();
    }
  };

  const extractCategories = () => {
    const categories = [
      ...new Set(products.map((product) => product.category)),
    ];
    categories.forEach((category) => {
      const categoryDiv = document.createElement('div');
      categoryDiv.innerHTML = `
        <input type="checkbox" id="category-${category}" name="category" value="${category}">
        <label for="category-${category}">${category}</label>
      `;
      categoriesContainer.appendChild(categoryDiv);
    });
    document.querySelectorAll('input[name="category"]').forEach((checkbox) => {
      checkbox.addEventListener('change', filterProducts);
    });
  };

  const displayProducts = () => {
    const fragment = document.createDocumentFragment();
    const loadCount = Math.min(
      itemsPerLoad,
      filteredProducts.length - currentIndex
    );
    for (let i = 0; i < loadCount; i++) {
      const product = filteredProducts[currentIndex + i];
      const productElement = createProductElement(product);
      fragment.appendChild(productElement);
    }
    productList.appendChild(fragment);
    currentIndex += loadCount;
    loadMoreButton.style.display =
      currentIndex < filteredProducts.length ? 'block' : 'none';
  };

  const createProductElement = (product) => {
    const productDiv = document.createElement('div');
    productDiv.className = 'product-item';

    // the Image container implementing with shimmer effect
    const imageContainer = document.createElement('div');
    imageContainer.className = 'shimmer';
    imageContainer.style.height = '200px';

    const img = document.createElement('img');
    img.src = product.image;
    img.alt = product.title;
    img.style.display = 'none';

    // Removing shimmer effect and showing here image once loaded
    img.onload = () => {
      imageContainer.classList.remove('shimmer');
      img.style.display = 'block';
    };

    imageContainer.appendChild(img);

    productDiv.innerHTML = `
      <h3>${product.title}</h3>
      <p>$${product.price}</p>
      <button class="favorite-btn">Like</button>
    `;
    // font awesome icons were not working for me with this editor So I hav eadded Button text "Like" 

    productDiv.insertBefore(imageContainer, productDiv.firstChild);

    const favoriteBtn = productDiv.querySelector('.favorite-btn');
    favoriteBtn.addEventListener('click', () => {
      favoriteBtn.classList.toggle('active');
    });

    return productDiv;
  };

  const filterProducts = () => {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategories = Array.from(
      document.querySelectorAll('input[name="category"]:checked')
    ).map((cb) => cb.value);
    filteredProducts = products.filter(
      (product) =>
        (selectedCategories.length === 0 ||
          selectedCategories.includes(product.category)) &&
        product.title.toLowerCase().includes(searchTerm)
    );
    currentIndex = 0;
    productList.innerHTML = '';
    displayProducts();
  };

  const sortProducts = () => {
    const sortValue = sortSelect.value;
    filteredProducts.sort((a, b) => {
      if (sortValue === 'price-asc') return a.price - b.price;
      if (sortValue === 'price-desc') return b.price - a.price;
    });
    currentIndex = 0;
    productList.innerHTML = '';
    displayProducts();
  };

  //Error hadling here, shows error incase of API failure
  const showError = (message) => {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    productList.appendChild(errorDiv);
  };

  const showLoading = () => {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.textContent = 'Loading...';
    productList.appendChild(loadingDiv);
  };

  const hideLoading = () => {
    const loadingDiv = document.querySelector('.loading');
    if (loadingDiv) productList.removeChild(loadingDiv);
  };

  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });

  searchInput.addEventListener('input', filterProducts);
  sortSelect.addEventListener('change', sortProducts);
  loadMoreButton.addEventListener('click', displayProducts);

  fetchProducts();
});
