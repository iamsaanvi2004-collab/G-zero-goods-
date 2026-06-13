/**
 * G-Zero Goods Storefront JavaScript
 * Handles interactive anti-gravity controller, cart operations, and visual metrics.
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const body = document.body;
    const cartBtn = document.getElementById('cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartCountBadge = document.getElementById('cart-count');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Control Room Panel Elements
    const togglePanelBtn = document.getElementById('toggle-panel-btn');
    const closePanelBtn = document.getElementById('close-panel-btn');
    const controlPanel = document.getElementById('control-panel');
    const gravitySlider = document.getElementById('gravity-slider');
    const gravityValLabel = document.getElementById('gravity-val');
    const fluxSlider = document.getElementById('flux-intensity');
    const fluxValLabel = document.getElementById('flux-val');
    const toggleInversionBtn = document.getElementById('toggle-inversion');
    const heroGravityBtn = document.getElementById('hero-gravity-toggle');

    // Metrics Display Elements
    const metricAltitude = document.getElementById('metric-altitude');
    const metricFlux = document.getElementById('metric-flux');

    // Cart State
    let cart = [];

    // --- CART CONTROLLER ---

    function openCart() {
        cartDrawer.setAttribute('aria-hidden', 'false');
        cartOverlay.classList.add('active');
    }

    function closeCart() {
        cartDrawer.setAttribute('aria-hidden', 'true');
        cartOverlay.classList.remove('active');
    }

    function updateCartUI() {
        // Clear items container
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your vault is weightless. Add anti-gravity gear to begin.</p>';
            cartCountBadge.style.display = 'none';
            cartSubtotal.textContent = '$0.00 USD';
            return;
        }

        // Show badge
        cartCountBadge.style.display = 'flex';
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountBadge.textContent = totalItems;

        // Render items
        let subtotal = 0;
        cart.forEach(item => {
            subtotal += item.price * item.quantity;
            const itemEl = document.createElement('div');
            itemEl.classList.add('cart-item');
            itemEl.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toLocaleString()}.00 USD</div>
                    <div class="cart-item-qty">
                        <button class="qty-btn dec-qty" data-id="${item.id}">-</button>
                        <span class="qty-val">${item.quantity}</span>
                        <button class="qty-btn inc-qty" data-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="btn-remove" data-id="${item.id}" aria-label="Remove item">Remove</button>
            `;
            cartItemsContainer.appendChild(itemEl);
        });

        cartSubtotal.textContent = `$${subtotal.toLocaleString()}.00 USD`;

        // Bind item control event listeners
        document.querySelectorAll('.dec-qty').forEach(btn => {
            btn.addEventListener('click', (e) => adjustQuantity(e.target.dataset.id, -1));
        });
        document.querySelectorAll('.inc-qty').forEach(btn => {
            btn.addEventListener('click', (e) => adjustQuantity(e.target.dataset.id, 1));
        });
        document.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => removeFromCart(e.target.dataset.id));
        });
    }

    function addToCart(id, name, price) {
        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id, name, price, quantity: 1 });
        }
        updateCartUI();
        openCart();
    }

    function adjustQuantity(id, amount) {
        const item = cart.find(item => item.id === id);
        if (!item) return;

        item.quantity += amount;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            updateCartUI();
        }
    }

    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        updateCartUI();
    }

    // --- CONTROL ROOM PHYSICS SIMULATION ---

    function updateGravitySettings(sliderVal) {
        // Convert slider 0-100 to earth gravity percentage (9.81 down to 0)
        const gVal = (9.81 * (sliderVal / 100)).toFixed(2);
        gravityValLabel.textContent = `${gVal} m/s²`;
        
        // At 0 gravity, hover heights are maximum (50px). At 100 gravity, hover is standard (12px).
        // If slider is 100, hover is very low or grounded.
        const hoverVal = Math.round(12 + (38 * (1 - sliderVal / 100)));
        document.documentElement.style.setProperty('--g-hover-height', `${hoverVal}px`);

        // Update drift animation durations: lower gravity = slower, more majestic floating
        const durationVal = 4 + (8 * (1 - sliderVal / 100));
        document.documentElement.style.setProperty('--g-drift-duration', `${durationVal}s`);

        // Update live metrics on screen
        // Nimbus Sleeper hovers 3 feet (91.44 cm) off the ground at 100% quantum efficiency
        const maxAltitude = 91.44; 
        const currentAltitude = (maxAltitude * (1 - sliderVal / 100)).toFixed(2);
        metricAltitude.textContent = `${currentAltitude} cm`;

        // Update body state and button texts
        if (sliderVal <= 10) {
            body.classList.add('gravity-off');
            heroGravityBtn.textContent = "Restore Gravity";
        } else {
            body.classList.remove('gravity-off');
            heroGravityBtn.textContent = "Disable Gravity";
        }
    }

    function updateFluxSettings(sliderVal) {
        // Convert 10-200 slider value to Tesla (0.1T to 2.0T)
        const tVal = (sliderVal / 100).toFixed(1);
        fluxValLabel.textContent = `${tVal} Tesla`;
        metricFlux.textContent = `${tVal} T`;

        // Flux strength affects hologram spinning speed (cube rotation speed in style.css)
        const cube = document.querySelector('.hologram-cube');
        if (cube) {
            // Smaller seconds = faster spin
            const spinDuration = (12 / (sliderVal / 100)).toFixed(1);
            cube.style.animationDuration = `${spinDuration}s`;
        }

        // Flux strength also affects orb system rotation speeds in the hero section
        const orbits = document.querySelectorAll('.orb');
        orbits.forEach((orb, i) => {
            const baseSpins = [12, 18, 25];
            if (baseSpins[i]) {
                orb.style.animationDuration = `${(baseSpins[i] / (sliderVal / 100)).toFixed(1)}s`;
            }
        });
    }

    // --- EVENT LISTENERS ---

    // Cart Open/Close
    cartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // Control Room Panel Toggle
    togglePanelBtn.addEventListener('click', () => {
        controlPanel.classList.toggle('closed');
    });
    closePanelBtn.addEventListener('click', () => {
        controlPanel.classList.add('closed');
    });

    // Gravity Slider
    gravitySlider.addEventListener('input', (e) => {
        updateGravitySettings(parseInt(e.target.value));
    });

    // Flux Slider
    fluxSlider.addEventListener('input', (e) => {
        updateFluxSettings(parseInt(e.target.value));
    });

    // Inversion Button
    toggleInversionBtn.addEventListener('click', () => {
        toggleInversionBtn.classList.toggle('active');
        const statusText = document.querySelector('.status-text');
        const statusIndicator = document.querySelector('.status-indicator');

        if (toggleInversionBtn.classList.contains('active')) {
            toggleInversionBtn.textContent = "Quantum Locking (Auto)";
            statusText.textContent = "System Status: Stable";
            statusIndicator.className = "status-indicator online";
        } else {
            toggleInversionBtn.textContent = "Direct Manual Flux";
            statusText.textContent = "System Status: Fluctuating";
            statusIndicator.className = "status-indicator";
            statusIndicator.style.backgroundColor = "var(--color-coral)";
            statusIndicator.style.boxShadow = "0 0 6px var(--color-coral)";
        }
    });

    // Hero Gravity Action
    heroGravityBtn.addEventListener('click', () => {
        const isGravityOn = !body.classList.contains('gravity-off');
        if (isGravityOn) {
            gravitySlider.value = 0;
            updateGravitySettings(0);
        } else {
            gravitySlider.value = 100;
            updateGravitySettings(100);
        }
    });

    // Buy / Add to Cart Actions
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.target;
            const id = target.dataset.id;
            const name = target.dataset.name;
            const price = parseInt(target.dataset.price);

            // Change button state temporarily for micro-animation
            const originalText = target.textContent;
            target.textContent = "Securing Lock...";
            target.disabled = true;

            setTimeout(() => {
                addToCart(id, name, price);
                target.textContent = originalText;
                target.disabled = false;
            }, 600);
        });
    });

    // Checkout Beam action
    checkoutBtn.addEventListener('click', () => {
        alert("🔒 Quantum Vault Locked!\n\nInitiating Matter-Displacement Beam to your coordinates. Ensure your teleportation pad is clear.");
        cart = [];
        updateCartUI();
        closeCart();
    });

    // Initialize UI settings
    updateGravitySettings(100);
    updateFluxSettings(100);
    updateCartUI();
});
