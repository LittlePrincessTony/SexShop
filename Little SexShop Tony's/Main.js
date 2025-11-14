const PRODUCTS = [
    {
        id: 1,
        title: 'Dildo',
        price: 60000,
        images: ['https://picsum.photos/seed/1/600/400'],
        sizes: ['S','M','L','XL'],
        colors: ['Negro','Blanco','Azul']
    },
    {
        id: 2,
        title: 'Dildo Articulado',
        price: 59990,
        images: ['https://picsum.photos/seed/2/600/400'],
        sizes: ['S','M','L'],
        colors: ['Gris','Negro']
    },
    {
        id: 3,
        title: 'Pantalón Eclipse',
        price: 44990,
        images: ['https://picsum.photos/seed/3/600/400'],
        sizes: ['28','30','32','34'],
        colors: ['Negro','Caqui']
    }
];

let cart = [];

const $products = document.getElementById('products');
const $cartItems = document.getElementById('cartItems');
const $totalPrice = document.getElementById('totalPrice');
const $cartCount = document.getElementById('cartCount');

function fmt(n) {
    return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
}

// Render de productos
function renderProducts() {
    $products.innerHTML = PRODUCTS.map(p => `
        <div class="card">
            <img src="${p.images[0]}" alt="${p.title}">
            <div>
                <strong>${p.title}</strong>
                <small>${fmt(p.price)}</small>

                <div style="display:flex;gap:8px;margin-top:6px">
                    <select data-id="${p.id}" class="size">
                        ${p.sizes.map(s => `<option value="${s}">${s}</option>`).join('')}
                    </select>

                    <select data-id="${p.id}" class="color">
                        ${p.colors.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                </div>

                <div style="display:flex;gap:8px;margin-top:8px">
                    <button data-id="${p.id}" class="add">Agregar</button>
                    <button data-id="${p.id}" class="details">Detalles</button>
                </div>
            </div>
        </div>
    `).join('');

    // Listeners
    document.querySelectorAll('.add').forEach(btn =>
        btn.addEventListener('click', e => {
            const id = Number(e.currentTarget.dataset.id);
            const size = document.querySelector(`select.size[data-id='${id}']`).value;
            const color = document.querySelector(`select.color[data-id='${id}']`).value;
            addToCart(id, size, color);
        })
    );

    document.querySelectorAll('.details').forEach(btn =>
        btn.addEventListener('click', e => {
            const id = Number(e.currentTarget.dataset.id);
            const p = PRODUCTS.find(x => x.id === id);
            alert(
                p.title + '\n' +
                'Tallas: ' + p.sizes.join(', ') + '\n' +
                'Colores: ' + p.colors.join(', ') + "\n" +
                "Precio: " + fmt(p.price)
            );
        })
    );
}

function addToCart(id, size, color) {
    const p = PRODUCTS.find(x => x.id === id);
    const key = `${id}_${size}_${color}`;

    const existing = cart.find(i => i.key === key);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            key,
            productId: id,
            title: p.title,
            price: p.price,
            size,
            color,
            qty: 1
        });
    }

    renderCart();
}

// Render del carrito
function renderCart() {
    $cartItems.innerHTML = cart.map(i => `
        <div class="cart-item">
            <div style="flex:1">
                <strong>${i.title}</strong>
                <div><small>${i.size} · ${i.color}</small></div>
            </div>

            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
                <div>
                    <button class="minus" data-key="${i.key}">-</button>
                    <span style="margin:0 8px">${i.qty}</span>
                    <button class="plus" data-key="${i.key}">+</button>
                </div>

                <div>${fmt(i.price * i.qty)}</div>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.minus').forEach(b =>
        b.addEventListener('click', e => {
            const key = e.currentTarget.dataset.key;
            const item = cart.find(x => x.key === key);

            if (item) {
                item.qty--;
                if (item.qty <= 0) {
                    cart = cart.filter(x => x.key !== key);
                }
                renderCart();
            }
        })
    );

    document.querySelectorAll('.plus').forEach(b =>
        b.addEventListener('click', e => {
            const key = e.currentTarget.dataset.key;
            const item = cart.find(x => x.key === key);
            if (item) {
                item.qty++;
                renderCart();
            }
        })
    );

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

    $totalPrice.textContent = fmt(total);
    $cartCount.textContent = cart.reduce((s, i) => s + i.qty, 0);
}

// Vaciar carrito
document.getElementById('clearBtn').addEventListener('click', () => {
    cart = [];
    renderCart();
});

// Scroll al carrito
document.getElementById('viewCartBtn').addEventListener('click', () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
});

renderProducts();
renderCart();


// 🔵 **PAYPAL BUTTON**

paypal.Buttons({
    createOrder: function(data, actions) {
        const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: (total / 1000).toFixed(2)  
                }
            }]
        });
    },

    onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
            alert('Pago completado por ' + details.payer.name.given_name);
            cart = [];
            renderCart();
        });
    }

}).render('#paypal-button-container');