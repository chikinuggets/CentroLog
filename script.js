// Global Variables (camelCase format)
let currentPage = 'homePage';
let currentEditingProductId = null;
let selectedProducts = [];
let stockThreshold = 10;
let hasInitializedApp = false;
let salesChart = null;
let topProductsChart = null;

// Brand configurations for each appliance
const brandConfig = {
    'TV': ['Samsung', 'LG'],
    'Speaker': ['JBL', 'Sony'],
    'Electric Fan': ['Kolin', 'Asahi'],
    'Food Processor': ['Hamilton Beach', 'Cuisinart'],
    'Blender': ['NutriBullet', 'Oster'],
    'Washing Machine': ['Whirlpool', 'Panasonic']
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    bootstrapApp();
});

function bootstrapApp() {
    if (sessionStorage.getItem('isAuthenticated') !== 'true') {
        window.location.href = 'login/index.html';
        return;
    }

    const splashScreen = document.getElementById('splashScreen');
    const appContainer = document.querySelector('.app-container');

    if (!splashScreen || !appContainer) {
        initializeApp();
        return;
    }

    const startApp = () => {
        if (hasInitializedApp) return;
        hasInitializedApp = true;
        setTimeout(() => {
            splashScreen.classList.add('hidden');
            appContainer.classList.remove('app-hidden');
            initializeApp();
        }, 1600);
    };

    const splashLogo = splashScreen.querySelector('img');
    if (splashLogo && !splashLogo.complete) {
        splashLogo.addEventListener('load', startApp);
        splashLogo.addEventListener('error', startApp);
    } else {
        startApp();
    }
}

function initializeApp() {
    // Initialize localStorage data if empty
    if (!localStorage.getItem('inventory')) {
        initializeInventory();
    }
    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', JSON.stringify([]));
    }
    if (!localStorage.getItem('profile')) {
        initializeProfile();
    }
    if (!localStorage.getItem('settings')) {
        initializeSettings();
    }

    // Set default order date to today
    const orderDateInput = document.getElementById('orderDate');
    if (orderDateInput) {
        const today = new Date().toISOString().split('T')[0];
        orderDateInput.value = today;
    }

    // Load initial data
    loadDashboard();
    loadInventory();
    loadOrders();
    loadTrackSales();
    loadProfile();

    // Setup event listeners
    setupEventListeners();
}

// Initialize Pre-populated Inventory
function initializeInventory() {
    const inventory = [
        // TV
        { id: '1', applianceType: 'TV', brand: 'Samsung', productName: 'Samsung 55" 4K Smart TV', unitPrice: 35000, quantity: 15 },
        { id: '2', applianceType: 'TV', brand: 'LG', productName: 'LG 50" OLED TV', unitPrice: 45000, quantity: 8 },
        
        // Speaker
        { id: '3', applianceType: 'Speaker', brand: 'JBL', productName: 'JBL Flip 6 Portable Speaker', unitPrice: 5500, quantity: 25 },
        { id: '4', applianceType: 'Speaker', brand: 'Sony', productName: 'Sony SRS-XB43 Wireless Speaker', unitPrice: 8500, quantity: 12 },
        
        // Electric Fan
        { id: '5', applianceType: 'Electric Fan', brand: 'Kolin', productName: 'Kolin 16" Stand Fan', unitPrice: 2500, quantity: 30 },
        { id: '6', applianceType: 'Electric Fan', brand: 'Asahi', productName: 'Asahi 18" Tower Fan', unitPrice: 3200, quantity: 5 },
        
        // Food Processor
        { id: '7', applianceType: 'Food Processor', brand: 'Hamilton Beach', productName: 'Hamilton Beach Food Processor 10-Cup', unitPrice: 4500, quantity: 18 },
        { id: '8', applianceType: 'Food Processor', brand: 'Cuisinart', productName: 'Cuisinart DFP-14BCNY Food Processor', unitPrice: 6500, quantity: 7 },
        
        // Blender
        { id: '9', applianceType: 'Blender', brand: 'NutriBullet', productName: 'NutriBullet Pro 900 Blender', unitPrice: 3500, quantity: 22 },
        { id: '10', applianceType: 'Blender', brand: 'Oster', productName: 'Oster Classic Blender', unitPrice: 2800, quantity: 4 },
        
        // Washing Machine
        { id: '11', applianceType: 'Washing Machine', brand: 'Whirlpool', productName: 'Whirlpool 8kg Top Load Washer', unitPrice: 18000, quantity: 10 },
        { id: '12', applianceType: 'Washing Machine', brand: 'Panasonic', productName: 'Panasonic 7kg Front Load Washer', unitPrice: 22000, quantity: 6 }
    ];
    
    localStorage.setItem('inventory', JSON.stringify(inventory));
}

function initializeProfile() {
    const profile = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'Sales Manager'
    };
    localStorage.setItem('profile', JSON.stringify(profile));
}

function initializeSettings() {
    const settings = {
        notifications: true,
        stockThreshold: 10,
        currency: 'PHP'
    };
    localStorage.setItem('settings', JSON.stringify(settings));
    stockThreshold = settings.stockThreshold;
}

// Navigation Functions
function navigateToPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeNavItem = document.querySelector(`.nav-item[data-page="${pageId}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
    
    // Update current page
    currentPage = pageId;
    
    // Reload page-specific data
    if (pageId === 'homePage') {
        loadDashboard();
    } else if (pageId === 'inventoryPage') {
        loadInventory();
    } else if (pageId === 'ordersPage') {
        loadOrders();
    } else if (pageId === 'trackSalesPage') {
        loadTrackSales();
    } else if (pageId === 'profilePage') {
        loadProfile();
    }
}

// Dashboard Functions
function loadDashboard() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    stockThreshold = settings.stockThreshold || 10;
    
    // Calculate today's sales
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(order => {
        const orderDate = new Date(order.orderDate).toISOString().split('T')[0];
        return orderDate === today && order.status === 'Completed';
    });
    const todaySales = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Calculate total orders
    const totalOrders = orders.length;
    
    // Calculate pending orders
    const pendingOrders = orders.filter(order => order.status === 'Pending').length;
    
    // Calculate low stock alerts
    const lowStockAlerts = inventory.filter(item => item.quantity <= stockThreshold).length;
    
    // Update dashboard metrics
    document.getElementById('todaySales').textContent = formatCurrency(todaySales);
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('lowStockAlerts').textContent = lowStockAlerts;

    // Update sales chart
    const monthlySummary = getMonthlySalesSummary(orders);
    renderSalesChart(monthlySummary.labels, monthlySummary.totals);

    // Update top product display
    const topProductDisplay = document.getElementById('topProductValue');
    if (topProductDisplay) {
        const topProduct = getTopSellingProduct(orders);
        topProductDisplay.textContent = topProduct || 'No sales yet';
    }

    const topProductsData = getTopProductsData(orders);
    renderTopProductsChart(topProductsData.labels, topProductsData.quantities);
}

// Inventory Functions
function loadInventory() {
    const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    const inventoryList = document.getElementById('inventoryList');
    const searchInput = document.getElementById('inventorySearchInput');
    const filterSelect = document.getElementById('inventoryFilterSelect');
    const statusFilter = filterSelect ? filterSelect.value : 'all';
    
    let filteredInventory = inventory;
    
    // Apply search filter
    if (searchInput) {
        const searchTerm = searchInput.value.toLowerCase();
        filteredInventory = filteredInventory.filter(item => {
            const searchText = `${item.productName} ${item.brand} ${item.applianceType}`.toLowerCase();
            return searchText.includes(searchTerm);
        });
    }
    
    // Apply status filter
    filteredInventory = filteredInventory.filter(item => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'inStock') return item.quantity > stockThreshold;
        if (statusFilter === 'lowStock') return item.quantity > 0 && item.quantity <= stockThreshold;
        if (statusFilter === 'outOfStock') return item.quantity === 0;
        return true;
    });
    
    // Display inventory
    if (inventoryList) {
        inventoryList.innerHTML = '';
        
        if (filteredInventory.length === 0) {
            inventoryList.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">No products found</div>';
            return;
        }
        
        filteredInventory.forEach(item => {
            const stockStatus = getStockStatus(item.quantity);
            const inventoryItem = document.createElement('div');
            inventoryItem.className = 'inventory-item';
            inventoryItem.innerHTML = `
                <div class="inventory-item-info">
                    <div class="inventory-item-name">${item.productName}</div>
                    <div class="inventory-item-details">${item.applianceType} - ${item.brand}</div>
                    <div class="inventory-item-stock">
                        Stock: ${item.quantity} units
                        <span class="stock-badge ${stockStatus.class}">${stockStatus.label}</span>
                    </div>
                </div>
                <div class="inventory-item-actions">
                    <button class="btn-icon" onclick="editProduct('${item.id}')" title="Edit" aria-label="Edit product">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-icon danger" onclick="deleteProduct('${item.id}')" title="Delete" aria-label="Delete product">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
            inventoryList.appendChild(inventoryItem);
        });
    }
    
    // Show/hide low stock banner
    const lowStockBanner = document.getElementById('lowStockBanner');
    const hasVisibleLowStock = filteredInventory.some(item => item.quantity > 0 && item.quantity <= stockThreshold);
    if (lowStockBanner) {
        if (hasVisibleLowStock) {
            lowStockBanner.classList.remove('hidden');
        } else {
            lowStockBanner.classList.add('hidden');
        }
    }
}

function getStockStatus(quantity) {
    if (quantity === 0) {
        return { class: 'out-of-stock', label: 'Out of Stock' };
    } else if (quantity <= stockThreshold) {
        return { class: 'low-stock', label: 'Low Stock' };
    } else {
        return { class: 'in-stock', label: 'In Stock' };
    }
}

function filterInventory() {
    loadInventory();
}

function showAddProductModal() {
    document.getElementById('addProductModal').classList.add('active');
    // Reset form
    document.getElementById('productApplianceType').value = '';
    document.getElementById('productBrand').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productQuantity').value = '';
}

function updateBrandOptions() {
    const applianceType = document.getElementById('productApplianceType').value;
    const brandSelect = document.getElementById('productBrand');
    
    brandSelect.innerHTML = '<option value="">Select brand</option>';
    
    if (applianceType && brandConfig[applianceType]) {
        brandConfig[applianceType].forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            brandSelect.appendChild(option);
        });
    }
}

function saveProduct() {
    const applianceType = document.getElementById('productApplianceType').value;
    const brand = document.getElementById('productBrand').value;
    const productName = document.getElementById('productName').value;
    const unitPrice = parseFloat(document.getElementById('productPrice').value);
    const quantity = parseInt(document.getElementById('productQuantity').value);
    
    if (!applianceType || !brand || !productName || !unitPrice || isNaN(quantity)) {
        alert('Please fill in all fields');
        return;
    }
    
    const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    const newId = (inventory.length > 0 ? Math.max(...inventory.map(item => parseInt(item.id))) + 1 : 1).toString();
    
    const newProduct = {
        id: newId,
        applianceType: applianceType,
        brand: brand,
        productName: productName,
        unitPrice: unitPrice,
        quantity: quantity
    };
    
    inventory.push(newProduct);
    localStorage.setItem('inventory', JSON.stringify(inventory));
    
    closeModal('addProductModal');
    loadInventory();
    loadDashboard();
}

function editProduct(productId) {
    const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    const product = inventory.find(item => item.id === productId);
    
    if (!product) return;
    
    currentEditingProductId = productId;
    document.getElementById('editProductName').value = product.productName;
    document.getElementById('editProductPrice').value = product.unitPrice;
    document.getElementById('editProductQuantity').value = product.quantity;
    
    document.getElementById('editProductModal').classList.add('active');
}

function updateProduct() {
    if (!currentEditingProductId) return;
    
    const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    const productIndex = inventory.findIndex(item => item.id === currentEditingProductId);
    
    if (productIndex === -1) return;
    
    inventory[productIndex].productName = document.getElementById('editProductName').value;
    inventory[productIndex].unitPrice = parseFloat(document.getElementById('editProductPrice').value);
    inventory[productIndex].quantity = parseInt(document.getElementById('editProductQuantity').value);
    
    localStorage.setItem('inventory', JSON.stringify(inventory));
    
    closeModal('editProductModal');
    currentEditingProductId = null;
    loadInventory();
    loadDashboard();
}

function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    const filteredInventory = inventory.filter(item => item.id !== productId);
    
    localStorage.setItem('inventory', JSON.stringify(filteredInventory));
    loadInventory();
    loadDashboard();
}

// Orders Functions
function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const ordersList = document.getElementById('ordersList');
    const searchInput = document.getElementById('ordersSearchInput');
    const filterSelect = document.getElementById('ordersFilterSelect');
    
    let filteredOrders = orders;
    
    // Apply search filter
    if (searchInput) {
        const searchTerm = searchInput.value.toLowerCase();
        filteredOrders = filteredOrders.filter(order => {
            const searchText = `${order.orderId} ${order.customerName}`.toLowerCase();
            return searchText.includes(searchTerm);
        });
    }
    
    // Apply status filter
    if (filterSelect) {
        const statusFilter = filterSelect.value;
        if (statusFilter !== 'all') {
            filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
        }
    }
    
    // Sort by date (newest first)
    filteredOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    
    // Display orders
    if (ordersList) {
        ordersList.innerHTML = '';
        
        if (filteredOrders.length === 0) {
            ordersList.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">No orders found</div>';
            return;
        }
        
        filteredOrders.forEach(order => {
            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';
            orderItem.onclick = () => viewOrderDetails(order.orderId);
            orderItem.innerHTML = `
                <div class="order-item-header">
                    <div class="order-item-id">Order #${order.orderId}</div>
                    <span class="status-badge ${order.status.toLowerCase()}">${order.status}</span>
                </div>
                <div class="order-item-details">${order.customerName}</div>
                <div class="order-item-details">${formatDate(order.orderDate)}</div>
                <div class="order-item-amount">${formatCurrency(order.totalAmount)}</div>
            `;
            ordersList.appendChild(orderItem);
        });
    }
}

function filterOrders() {
    loadOrders();
}

function showAddOrderModal() {
    selectedProducts = [];
    document.getElementById('addOrderModal').classList.add('active');
    loadProductsForOrder();
    updateOrderTotal();
}

function loadProductsForOrder() {
    const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    const productsList = document.getElementById('orderProductsList');
    
    if (productsList) {
        productsList.innerHTML = '';
        
        inventory.forEach(product => {
            if (product.quantity > 0) {
                const productItem = document.createElement('div');
                productItem.className = 'product-selection-item';
                productItem.innerHTML = `
                    <input type="checkbox" id="product-${product.id}" onchange="toggleProductSelection('${product.id}')" aria-label="Select ${product.productName}">
                    <div class="product-selection-info">
                        <div class="product-selection-name">${product.productName}</div>
                        <div class="product-selection-price">${formatCurrency(product.unitPrice)}</div>
                    </div>
                    <input type="number" class="product-selection-quantity" id="qty-${product.id}" 
                           min="1" max="${product.quantity}" value="1" 
                           onchange="updateProductQuantity('${product.id}')" 
                           aria-label="Quantity for ${product.productName}"
                           disabled>
                `;
                productsList.appendChild(productItem);
            }
        });
    }
}

function toggleProductSelection(productId) {
    const checkbox = document.getElementById(`product-${productId}`);
    const quantityInput = document.getElementById(`qty-${productId}`);
    
    if (checkbox.checked) {
        quantityInput.disabled = false;
        const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
        const product = inventory.find(item => item.id === productId);
        if (product) {
            selectedProducts.push({
                productId: productId,
                productName: product.productName,
                unitPrice: product.unitPrice,
                quantity: 1
            });
        }
    } else {
        quantityInput.disabled = true;
        quantityInput.value = 1;
        selectedProducts = selectedProducts.filter(item => item.productId !== productId);
    }
    
    updateOrderTotal();
}

function updateProductQuantity(productId) {
    const quantityInput = document.getElementById(`qty-${productId}`);
    const quantity = parseInt(quantityInput.value) || 1;
    
    const productIndex = selectedProducts.findIndex(item => item.productId === productId);
    if (productIndex !== -1) {
        selectedProducts[productIndex].quantity = quantity;
    }
    
    updateOrderTotal();
}

function updateOrderTotal() {
    const total = selectedProducts.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    document.getElementById('orderTotalAmount').textContent = formatCurrency(total);
}

function saveOrder() {
    const customerName = document.getElementById('orderCustomerName').value.trim();
    const orderDate = document.getElementById('orderDate').value;
    const status = document.getElementById('orderStatus').value;
    const notes = document.getElementById('orderNotes').value.trim();
    
    if (!customerName) {
        alert('Please enter customer name');
        return;
    }
    
    if (selectedProducts.length === 0) {
        alert('Please select at least one product');
        return;
    }
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const orderId = 'ORD' + String(orders.length + 1).padStart(4, '0');
    
    const totalAmount = selectedProducts.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    
    const newOrder = {
        orderId: orderId,
        customerName: customerName,
        orderDate: orderDate,
        status: status,
        products: selectedProducts.map(item => ({
            productId: item.productId,
            productName: item.productName,
            unitPrice: item.unitPrice,
            quantity: item.quantity
        })),
        totalAmount: totalAmount,
        notes: notes
    };
    
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Update inventory quantities
    const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    selectedProducts.forEach(selectedProduct => {
        const inventoryItem = inventory.find(item => item.id === selectedProduct.productId);
        if (inventoryItem) {
            inventoryItem.quantity -= selectedProduct.quantity;
            if (inventoryItem.quantity < 0) inventoryItem.quantity = 0;
        }
    });
    localStorage.setItem('inventory', JSON.stringify(inventory));
    
    closeModal('addOrderModal');
    loadOrders();
    loadInventory();
    loadDashboard();
    loadTrackSales();
}

function viewOrderDetails(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(item => item.orderId === orderId);
    
    if (!order) return;
    
    const detailsContainer = document.getElementById('viewOrderDetails');
    detailsContainer.innerHTML = `
        <div class="order-details-item">
            <div class="order-details-label">Order ID</div>
            <div class="order-details-value">${order.orderId}</div>
        </div>
        <div class="order-details-item">
            <div class="order-details-label">Customer Name</div>
            <div class="order-details-value">${order.customerName}</div>
        </div>
        <div class="order-details-item">
            <div class="order-details-label">Order Date</div>
            <div class="order-details-value">${formatDate(order.orderDate)}</div>
        </div>
        <div class="order-details-item">
            <div class="order-details-label">Status</div>
            <div class="order-details-value">
                <span class="status-badge ${order.status.toLowerCase()}">${order.status}</span>
            </div>
        </div>
        <div class="order-details-item">
            <div class="order-details-label">Products</div>
            <div class="order-products-list">
                ${order.products.map(product => `
                    <div class="order-product-item">
                        <div>
                            <div class="order-product-name">${product.productName}</div>
                            <div class="order-product-quantity">Qty: ${product.quantity}</div>
                        </div>
                        <div class="order-product-price">${formatCurrency(product.unitPrice * product.quantity)}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="order-details-item">
            <div class="order-details-label">Total Amount</div>
            <div class="order-details-value" style="font-size: 1.2rem; color: var(--success-color);">${formatCurrency(order.totalAmount)}</div>
        </div>
        ${order.notes ? `
        <div class="order-details-item">
            <div class="order-details-label">Notes</div>
            <div class="order-details-value">${order.notes}</div>
        </div>
        ` : ''}
    `;
    
    document.getElementById('viewOrderModal').classList.add('active');
}

// Track Sales Functions
function loadTrackSales() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const salesList = document.getElementById('salesList');
    const searchInput = document.getElementById('salesSearchInput');
    
    // Filter completed orders only
    let filteredOrders = orders.filter(order => order.status === 'Completed');
    
    // Apply search filter
    if (searchInput) {
        const searchTerm = searchInput.value.toLowerCase();
        filteredOrders = filteredOrders.filter(order => {
            const searchText = `${order.orderId} ${order.customerName}`.toLowerCase();
            return searchText.includes(searchTerm);
        });
    }
    
    // Sort by date (newest first)
    filteredOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    
    // Calculate summary
    const totalSalesAmount = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalSalesOrders = filteredOrders.length;
    const averageOrderValue = totalSalesOrders > 0 ? totalSalesAmount / totalSalesOrders : 0;
    
    document.getElementById('totalSalesAmount').textContent = formatCurrency(totalSalesAmount);
    document.getElementById('totalSalesOrders').textContent = totalSalesOrders;
    document.getElementById('averageOrderValue').textContent = formatCurrency(averageOrderValue);
    
    // Display sales list
    if (salesList) {
        salesList.innerHTML = '';
        
        if (filteredOrders.length === 0) {
            salesList.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">No sales records found</div>';
            return;
        }
        
        filteredOrders.forEach(order => {
            const salesItem = document.createElement('div');
            salesItem.className = 'sales-item';
            salesItem.innerHTML = `
                <div class="sales-item-info">
                    <div class="sales-item-id">Order #${order.orderId}</div>
                    <div class="sales-item-customer">${order.customerName}</div>
                    <div class="sales-item-date">${formatDate(order.orderDate)}</div>
                </div>
                <div class="sales-item-amount">${formatCurrency(order.totalAmount)}</div>
            `;
            salesList.appendChild(salesItem);
        });
    }
}

function filterSales(period) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const salesList = document.getElementById('salesList');
    
    let filteredOrders = orders.filter(order => order.status === 'Completed');
    
    if (period !== 'all') {
        const now = new Date();
        filteredOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.orderDate);
            if (period === 'today') {
                return orderDate.toDateString() === now.toDateString();
            } else if (period === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return orderDate >= weekAgo;
            } else if (period === 'month') {
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return orderDate >= monthAgo;
            }
            return true;
        });
    }
    
    // Sort by date (newest first)
    filteredOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    
    // Calculate summary
    const totalSalesAmount = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalSalesOrders = filteredOrders.length;
    const averageOrderValue = totalSalesOrders > 0 ? totalSalesAmount / totalSalesOrders : 0;
    
    document.getElementById('totalSalesAmount').textContent = formatCurrency(totalSalesAmount);
    document.getElementById('totalSalesOrders').textContent = totalSalesOrders;
    document.getElementById('averageOrderValue').textContent = formatCurrency(averageOrderValue);
    
    // Display sales list
    if (salesList) {
        salesList.innerHTML = '';
        
        if (filteredOrders.length === 0) {
            salesList.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">No sales records found</div>';
            return;
        }
        
        filteredOrders.forEach(order => {
            const salesItem = document.createElement('div');
            salesItem.className = 'sales-item';
            salesItem.innerHTML = `
                <div class="sales-item-info">
                    <div class="sales-item-id">Order #${order.orderId}</div>
                    <div class="sales-item-customer">${order.customerName}</div>
                    <div class="sales-item-date">${formatDate(order.orderDate)}</div>
                </div>
                <div class="sales-item-amount">${formatCurrency(order.totalAmount)}</div>
            `;
            salesList.appendChild(salesItem);
        });
    }
}

function getMonthlySalesSummary(orders) {
    const totalsMap = {};
    orders.forEach(order => {
        if (order.status !== 'Completed') return;
        const orderDate = new Date(order.orderDate);
        if (isNaN(orderDate)) return;
        const key = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;
        totalsMap[key] = (totalsMap[key] || 0) + order.totalAmount;
    });

    const labels = [];
    const totals = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        labels.push(`${monthNames[date.getMonth()]} ${String(date.getFullYear()).slice(-2)}`);
        totals.push(totalsMap[key] || 0);
    }

    return { labels, totals };
}

function getTopSellingProduct(orders) {
    const productTotals = {};
    orders.forEach(order => {
        if (order.status !== 'Completed') return;
        (order.products || []).forEach(product => {
            productTotals[product.productName] = (productTotals[product.productName] || 0) + product.quantity;
        });
    });

    let topProduct = null;
    let topQty = 0;
    Object.entries(productTotals).forEach(([name, qty]) => {
        if (qty > topQty) {
            topProduct = name;
            topQty = qty;
        }
    });

    return topProduct ? `${topProduct} (${topQty})` : null;
}

function getTopProductsData(orders, limit = 5) {
    const now = new Date();
    const targetMonth = now.getMonth();
    const targetYear = now.getFullYear();
    const totals = {};

    orders.forEach(order => {
        if (order.status !== 'Completed') return;
        const orderDate = new Date(order.orderDate);
        if (orderDate.getMonth() !== targetMonth || orderDate.getFullYear() !== targetYear) return;
        (order.products || []).forEach(product => {
            totals[product.productName] = (totals[product.productName] || 0) + product.quantity;
        });
    });

    const sorted = Object.entries(totals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);

    return {
        labels: sorted.map(([name]) => name),
        quantities: sorted.map(([, qty]) => qty)
    };
}

function renderSalesChart(labels, totals) {
    const canvas = document.getElementById('salesTrendChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');
    const borderColor = '#8B0F10';
    const backgroundColor = 'rgba(139, 15, 16, 0.18)';

    if (salesChart) {
        salesChart.data.labels = labels;
        salesChart.data.datasets[0].data = totals;
        salesChart.update();
        return;
    }

    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Monthly Sales',
                data: totals,
                borderColor: borderColor,
                backgroundColor: backgroundColor,
                fill: true,
                tension: 0.35,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: borderColor,
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: context => `Sales: ${formatCurrency(context.parsed.y || 0)}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => formatCurrency(value)
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function renderTopProductsChart(labels, quantities) {
    const canvas = document.getElementById('topProductsChart');
    if (!canvas || typeof Chart === 'undefined') return;
    const ctx = canvas.getContext('2d');

    if (topProductsChart) {
        topProductsChart.data.labels = labels;
        topProductsChart.data.datasets[0].data = quantities;
        topProductsChart.update();
        return;
    }

    topProductsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Units Sold',
                data: quantities,
                backgroundColor: 'rgba(47, 42, 42, 0.8)',
                borderRadius: 6,
                maxBarThickness: 32
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: context => `Units: ${context.parsed.y || 0}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Profile Functions
function loadProfile() {
    const profile = JSON.parse(localStorage.getItem('profile') || '{}');
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    
    document.getElementById('profileName').textContent = profile.name || 'John Doe';
    document.getElementById('profileEmail').textContent = profile.email || 'john.doe@example.com';
    document.getElementById('profileRole').textContent = profile.role || 'Sales Manager';
    
    document.getElementById('notificationsToggle').checked = settings.notifications !== false;
    document.getElementById('stockThresholdInput').value = settings.stockThreshold || 10;
    document.getElementById('currencySelect').value = settings.currency || 'PHP';
}

function showEditProfileModal() {
    const profile = JSON.parse(localStorage.getItem('profile') || '{}');
    
    document.getElementById('editProfileName').value = profile.name || '';
    document.getElementById('editProfileEmail').value = profile.email || '';
    document.getElementById('editProfileRole').value = profile.role || '';
    
    document.getElementById('editProfileModal').classList.add('active');
}

function updateProfile() {
    const profile = {
        name: document.getElementById('editProfileName').value.trim(),
        email: document.getElementById('editProfileEmail').value.trim(),
        role: document.getElementById('editProfileRole').value.trim()
    };
    
    if (!profile.name || !profile.email || !profile.role) {
        alert('Please fill in all fields');
        return;
    }
    
    localStorage.setItem('profile', JSON.stringify(profile));
    closeModal('editProfileModal');
    loadProfile();
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('isAuthenticated');
        window.location.href = 'login/index.html';
    }
}

// Settings Functions
function setupEventListeners() {
    // Search inputs
    const inventorySearchInput = document.getElementById('inventorySearchInput');
    if (inventorySearchInput) {
        inventorySearchInput.addEventListener('input', loadInventory);
    }
    
    const ordersSearchInput = document.getElementById('ordersSearchInput');
    if (ordersSearchInput) {
        ordersSearchInput.addEventListener('input', loadOrders);
    }
    
    const salesSearchInput = document.getElementById('salesSearchInput');
    if (salesSearchInput) {
        salesSearchInput.addEventListener('input', loadTrackSales);
    }
    
    // Settings
    const stockThresholdInput = document.getElementById('stockThresholdInput');
    if (stockThresholdInput) {
        stockThresholdInput.addEventListener('change', function() {
            const settings = JSON.parse(localStorage.getItem('settings') || '{}');
            settings.stockThreshold = parseInt(this.value) || 10;
            stockThreshold = settings.stockThreshold;
            localStorage.setItem('settings', JSON.stringify(settings));
            loadInventory();
            loadDashboard();
        });
    }
    
    const currencySelect = document.getElementById('currencySelect');
    if (currencySelect) {
        currencySelect.addEventListener('change', function() {
            const settings = JSON.parse(localStorage.getItem('settings') || '{}');
            settings.currency = this.value;
            localStorage.setItem('settings', JSON.stringify(settings));
        });
    }
    
    const notificationsToggle = document.getElementById('notificationsToggle');
    if (notificationsToggle) {
        notificationsToggle.addEventListener('change', function() {
            const settings = JSON.parse(localStorage.getItem('settings') || '{}');
            settings.notifications = this.checked;
            localStorage.setItem('settings', JSON.stringify(settings));
        });
    }
}

// Utility Functions
function formatCurrency(amount) {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    const currency = settings.currency || 'PHP';
    
    if (currency === 'USD') {
        return '$' + amount.toFixed(2);
    } else {
        return '₱' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
});
