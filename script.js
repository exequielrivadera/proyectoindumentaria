const WHATSAPP = "5493804507584";
const STORAGE_KEY = "indumentaria_cart_v4";

// Reemplazá image: null por "img/nombre.jpg" cuando tengas las fotos reales.
// El stock está separado por talle para que cada variante pueda agotarse de forma independiente.
const PRODUCTS = [
  {id:"remera-essential", name:"Remera Essential", category:"remeras", style:"urbana", description:"Remera de algodón de corte limpio y uso diario.", price:28500, image:"img/remera_essential.jpg", sizes:{XS:2,S:5,M:8,L:6,XL:0}},
  {id:"remera-boxy", name:"Remera Boxy", category:"remeras", style:"urbana", description:"Calce amplio, hombro caído y estética contemporánea.", price:32000, image:"img/remera_boxy.jpg", sizes:{S:0,M:4,L:3,XL:2}},
  {id:"remera-sport", name:"Remera Performance", category:"remeras", style:"deportiva", description:"Tejido liviano pensado para entrenamiento y movimiento.", price:36000, image:"img/remera_performance.jpg", sizes:{S:3,M:5,L:0,XL:2,XXL:1}},
  {id:"camisa-lino", name:"Camisa Lino", category:"camisas", style:"elegante", description:"Camisa de textura liviana para looks relajados y elegantes.", price:59000, image:"img/camisa_lino.jpg", sizes:{S:2,M:0,L:4,XL:2}},
  {id:"camisa-oxford", name:"Camisa Oxford", category:"camisas", style:"elegante", description:"Clásico versátil para combinar con prendas urbanas o formales.", price:62000, image:"img/camisa_oxford.jpg", sizes:{S:1,M:3,L:3,XL:0}},
  {id:"chomba-premium", name:"Chomba Premium", category:"chombas", style:"elegante", description:"Chomba de piqué con terminación limpia y calce moderno.", price:48000, image:"img/chomba_premium.jpg", sizes:{S:2,M:5,L:4,XL:1}},
  {id:"pantalon-cargo", name:"Pantalón Cargo", category:"pantalones", style:"urbana", description:"Bolsillos funcionales y silueta urbana de inspiración utilitaria.", price:68000, image:"img/pantalon_cargo.jpg", sizes:{38:2,40:4,42:5,44:0,46:1}},
  {id:"pantalon-sastrero", name:"Pantalón Sastrero", category:"pantalones", style:"elegante", description:"Corte recto y caída limpia para una propuesta más sofisticada.", price:72000, image:"img/pantalon_sastrero.jpg", sizes:{38:1,40:0,42:3,44:2,46:0}},
  {id:"jogger-sport", name:"Jogger Essential", category:"deportiva", style:"deportiva", description:"Jogger cómodo para entrenamiento, descanso y streetwear.", price:55000, image:"img/jogger_essential.jpg", sizes:{S:3,M:5,L:2,XL:0}},
  {id:"buzo-hoodie", name:"Hoodie Essential", category:"deportiva", style:"urbana", description:"Buzo con capucha, interior suave y estética minimalista.", price:65000, image:"img/hoddie_essential.jpg", sizes:{S:0,M:4,L:4,XL:2}},
  {id:"campera-urban", name:"Campera Urban", category:"urbana", style:"urbana", description:"Capa liviana para completar looks de ciudad.", price:79000, image:"img/campera_urban.jpg", sizes:{S:1,M:2,L:0,XL:2}},
  {id:"blazer-soft", name:"Blazer Soft", category:"elegante", style:"elegante", description:"Sastrería moderna con una construcción más relajada.", price:99000, image:"img/blazer_soft.jpg", sizes:{S:1,M:2,L:1,XL:0}},
  {id:"gorra-minimal", name:"Gorra Minimal", category:"accesorios", style:"urbana", description:"Gorra de seis paneles con diseño limpio.", price:22000, image:"img/gorra_minimal.jpg", sizes:{Única:7}},
  {id:"cinturon-cuero", name:"Cinturón Cuero", category:"accesorios", style:"elegante", description:"Accesorio clásico para completar looks formales y casuales.", price:34000, image:"img/cinturon_cuero.jpg", sizes:{85:2,90:0,95:3,100:2,105:1}},
  {id:"bolso-urban", name:"Bolso Urban", category:"accesorios", style:"urbana", description:"Bolso compacto para uso diario y movimiento en la ciudad.", price:46000, image:"img/bolso_urban.jpg", sizes:{Única:3}},
  {id:"medias-sport", name:"Medias Sport", category:"accesorios", style:"deportiva", description:"Pack de medias deportivas de uso cotidiano.", price:15000, image:"img/medias_sport.jpg", sizes:{"39/42":5,"43/46":0}}
];

// Único descuento activo: 10% cuando se selecciona pago por transferencia.
const TRANSFER_DISCOUNT_RATE = 0.10;

let cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
let activeProduct = null;
let activeSize = null;
let modalQuantity = 1;
let activeCategory = "todos";
let activeSizeFilter = "todos";
let searchTerm = "";
let transferSelected = false;

const $ = id => document.getElementById(id);
const productsGrid = $("productosGrid");

function money(value){ return new Intl.NumberFormat("es-AR", {style:"currency",currency:"ARS",maximumFractionDigits:0}).format(value); }
function productById(id){ return PRODUCTS.find(p=>p.id===id); }
function stockFor(product,size){ return Number(product?.sizes?.[size] || 0); }
function totalStock(product){ return Object.values(product.sizes).reduce((a,b)=>a+Number(b),0); }
function sizeEntries(product){ return Object.entries(product.sizes); }
function categoryName(cat){ const map={remeras:"Remeras",camisas:"Camisas",chombas:"Chombas",pantalones:"Pantalones",deportiva:"Deportiva",urbana:"Urbana",elegante:"Elegante",accesorios:"Accesorios"}; return map[cat]||cat; }
function placeholder(product){
  const labels={remeras:"REMERA",camisas:"CAMISA",chombas:"CHOMBA",pantalones:"PANTALÓN",deportiva:"SPORT",urbana:"URBANA",elegante:"ELEGANTE",accesorios:"ACCESSORY"};
  return `<div class="image-placeholder ${product.style}"><span>${labels[product.category]||"INDUMENTARIA"}</span><strong>INDUMENTARIA</strong></div>`;
}
function imageMarkup(product, cls=""){ return product.image ? `<img class="${cls}" src="${product.image}" alt="${product.name}" loading="lazy">` : placeholder(product); }
function availableSizes(product){ return sizeEntries(product).filter(([,stock])=>stock>0); }

function filteredProducts(){
  return PRODUCTS.filter(product=>{
    const categoryMatch = activeCategory === "todos" || product.category===activeCategory || product.style===activeCategory;
    const sizeMatch = activeSizeFilter === "todos" || stockFor(product, activeSizeFilter)>0;
    const haystack = `${product.name} ${product.description} ${categoryName(product.category)} ${product.style}`.toLowerCase();
    const searchMatch = !searchTerm || haystack.includes(searchTerm.toLowerCase());
    return categoryMatch && sizeMatch && searchMatch;
  });
}

function renderActiveFilters(){
  const chips=[];
  if(activeCategory!=="todos") chips.push(`<span class="filter-chip">${categoryName(activeCategory)} <button data-clear-filter="category" aria-label="Quitar filtro de categoría">×</button></span>`);
  if(activeSizeFilter!=="todos") chips.push(`<span class="filter-chip">Talle ${activeSizeFilter} <button data-clear-filter="size" aria-label="Quitar filtro de talle">×</button></span>`);
  if(searchTerm) chips.push(`<span class="filter-chip">“${escapeHtml(searchTerm)}” <button data-clear-filter="search" aria-label="Quitar búsqueda">×</button></span>`);
  $("activeFilters").innerHTML=chips.join("");
}
function escapeHtml(value){return String(value).replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[char]));}

function renderProducts(){
  const list=filteredProducts();
  productsGrid.innerHTML=list.map(product=>{
    const stock=totalStock(product), available=availableSizes(product), low=stock>0&&stock<=3;
    return `<article class="product-card ${stock===0?'sold-out':''}">
      <button class="product-visual" data-open-product="${product.id}" aria-label="Ver ${product.name}">
        ${imageMarkup(product)}
        ${stock===0?'<span class="sold-badge">AGOTADO</span>':low?'<span class="low-badge">ÚLTIMAS UNIDADES</span>':''}
      </button>
      <div class="product-content">
        <span class="product-category">${categoryName(product.category)}</span>
        <h3>${product.name}</h3><p>${product.description}</p>
        <div class="product-bottom"><strong>${money(product.price)}</strong><span>${stock===0?'Sin stock':`${available.length} ${available.length===1?'talle disponible':'talles disponibles'}`}</span></div>
        <button class="quick-add" data-open-product="${product.id}" ${stock===0?'disabled':''}>${stock===0?'Sin stock':'Ver talles y agregar'}</button>
      </div>
    </article>`;
  }).join("");
  $("noResults").hidden=list.length!==0;
  renderActiveFilters();
}

function cartTotals(){
  const subtotal = Object.values(cart).reduce((sum, item) => sum + item.price * item.quantity, 0);
  const transferDiscount = transferSelected ? Math.round(subtotal * TRANSFER_DISCOUNT_RATE) : 0;
  return { subtotal, transferDiscount, total: subtotal - transferDiscount };
}

function renderCart(){
  const entries=Object.values(cart), count=entries.reduce((sum,i)=>sum+i.quantity,0), totals=cartTotals();
  $("cartCount").textContent=count;
  $("cartAmount").textContent=money(totals.total);
  $("cartSubtotal").textContent=money(totals.subtotal);
  $("cartTotal").textContent=money(totals.total);
  // Mostrar un solo descuento, únicamente cuando se selecciona transferencia.
  const transferRow = $("transferDiscountRow");
  const showTransfer = transferSelected && totals.transferDiscount > 0;
  transferRow.hidden = !showTransfer;
  transferRow.style.display = showTransfer ? "flex" : "none";
  $("transferDiscountAmount").textContent = showTransfer ? `−${money(totals.transferDiscount)}` : money(0);
  const promoRow = $("promoDiscountRow");
  promoRow.hidden = true;
  promoRow.style.display = "none";

  if(!entries.length){
    $("cartItems").innerHTML=`<div class="empty-cart"><div class="empty-icon">🛒</div><h3>Tu carrito está vacío</h3><p>Elegí una prenda y seleccioná el talle que querés.</p><button class="empty-action" id="goCatalog">Ver colección</button></div>`;
    $("checkoutWhatsApp").classList.add("disabled"); $("checkoutWhatsApp").href="#";
  }else{
    $("checkoutWhatsApp").classList.remove("disabled");
    $("cartItems").innerHTML=entries.map(item=>`<div class="cart-item">
      <div class="cart-item-thumb">${item.image?`<img src="${item.image}" alt="">`:placeholder(productById(item.productId))}</div>
      <div class="cart-item-main"><div><h3>${item.name}</h3><span>Talle ${item.size}</span></div><button class="remove-item" data-remove="${item.key}" aria-label="Eliminar">×</button><strong>${money(item.price*item.quantity)}</strong>
      <div class="cart-qty"><button data-qty="${item.key}" data-delta="-1">−</button><span>${item.quantity}</span><button data-qty="${item.key}" data-delta="1">+</button></div></div>
    </div>`).join("");
    $("checkoutWhatsApp").href=whatsappUrl();
  }
}

function saveCart(){localStorage.setItem(STORAGE_KEY,JSON.stringify(cart));renderCart();}
function openCart(){$("cartPanel").classList.add("open");$("cartOverlay").classList.add("show");$("cartPanel").setAttribute("aria-hidden","false");document.body.classList.add("no-scroll");}
function closeCart(){$("cartPanel").classList.remove("open");$("cartOverlay").classList.remove("show");$("cartPanel").setAttribute("aria-hidden","true");document.body.classList.remove("no-scroll");}

function openProduct(id){
  activeProduct=productById(id); if(!activeProduct)return;
  activeSize=availableSizes(activeProduct)[0]?.[0]||null; modalQuantity=1;
  $("modalCategory").textContent=categoryName(activeProduct.category);$("modalName").textContent=activeProduct.name;$("modalDescription").textContent=activeProduct.description;$("modalPrice").textContent=money(activeProduct.price);$("modalImage").innerHTML=imageMarkup(activeProduct);
  renderSizes();renderModalQuantity();renderStockStatus();$("productModal").classList.add("open");$("productModal").setAttribute("aria-hidden","false");document.body.classList.add("no-scroll");
}
function closeProduct(){$("productModal").classList.remove("open");$("productModal").setAttribute("aria-hidden","true");document.body.classList.remove("no-scroll");}
function renderSizes(){
  $("sizeSelector").innerHTML=sizeEntries(activeProduct).map(([size,stock])=>`<button class="size-btn ${size===activeSize?'selected':''} ${stock===0?'out':''}" data-size="${size}" ${stock===0?'disabled':''}><span>${size}</span>${stock===0?'<small>Sin stock</small>':stock<=2?'<small>Últimas</small>':''}</button>`).join("");
}
function renderModalQuantity(){$("modalQuantity").textContent=modalQuantity;}
function renderStockStatus(){
  const stock=stockFor(activeProduct,activeSize);
  if(!activeSize||stock===0){$("stockStatus").innerHTML='<span class="status-out">Este talle no tiene stock.</span>';$('addModal').disabled=true;return;}
  const inCart=cart[`${activeProduct.id}__${activeSize}`]?.quantity||0,remaining=stock-inCart;
  if(remaining<=0){$("stockStatus").innerHTML='<span class="status-out">Ya agregaste todo el stock disponible de este talle.</span>';$('addModal').disabled=true;}
  else if(remaining<=2){$("stockStatus").innerHTML=`<span class="status-low">Últimas ${remaining} ${remaining===1?'unidad':'unidades'} disponibles.</span>`;$('addModal').disabled=false;}
  else{$("stockStatus").innerHTML=`<span class="status-ok">${remaining} unidades disponibles.</span>`;$('addModal').disabled=false;}
}
function addSelected(){
  if(!activeProduct||!activeSize)return;
  const stock=stockFor(activeProduct,activeSize),key=`${activeProduct.id}__${activeSize}`,current=cart[key]?.quantity||0;
  if(current+modalQuantity>stock){showToast("No hay suficiente stock para ese talle.");return;}
  cart[key]={key,productId:activeProduct.id,name:activeProduct.name,size:activeSize,price:activeProduct.price,image:activeProduct.image,quantity:current+modalQuantity};saveCart();closeProduct();showToast(`${activeProduct.name} agregado al carrito.`);
}
function changeCartQuantity(key,delta){
  const item=cart[key];if(!item)return;const product=productById(item.productId),max=stockFor(product,item.size),next=item.quantity+delta;
  if(next<=0)delete cart[key];else if(next<=max)item.quantity=next;else{showToast("Alcanzaste el stock disponible de este talle.");return;}saveCart();
}
function whatsappUrl(){
  const entries=Object.values(cart);if(!entries.length)return "#";const totals=cartTotals();
  let text="Hola! Quiero hacer el siguiente pedido:%0A%0A";
  entries.forEach(item=>{text+=`• ${encodeURIComponent(item.name)} — Talle ${encodeURIComponent(item.size)} — ${item.quantity} x ${encodeURIComponent(money(item.price))}%0A`;});
  if(totals.transferDiscount>0)text+=`%0ADescuento por transferencia: -${encodeURIComponent(money(totals.transferDiscount))}`;
  text+=`%0A%0A*Total: ${encodeURIComponent(money(totals.total))}*%0A%0AQuedo a la espera de confirmación de disponibilidad.`;
  return `https://wa.me/${WHATSAPP}?text=${text}`;
}
function showToast(message){const toast=$("toast");toast.textContent=message;toast.classList.add("show");clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove("show"),2600);}
function resetFilters(){activeCategory="todos";activeSizeFilter="todos";searchTerm="";$("productSearch").value="";$("sizeFilter").value="todos";document.querySelectorAll(".category-btn").forEach(b=>b.classList.toggle("active",b.dataset.category==="todos"));renderProducts();}

$("categoryBar").addEventListener("click",e=>{const btn=e.target.closest("[data-category]");if(!btn)return;activeCategory=btn.dataset.category;document.querySelectorAll(".category-btn").forEach(b=>b.classList.toggle("active",b===btn));renderProducts();});
productsGrid.addEventListener("click",e=>{const btn=e.target.closest("[data-open-product]");if(btn)openProduct(btn.dataset.openProduct);});
document.querySelectorAll("[data-feature-category]").forEach(a=>a.addEventListener("click",()=>{activeCategory=a.dataset.featureCategory;document.querySelectorAll(".category-btn").forEach(b=>b.classList.toggle("active",b.dataset.category===activeCategory));renderProducts();}));
$("productSearch").addEventListener("input",e=>{searchTerm=e.target.value.trim();renderProducts();});
$("sizeFilter").addEventListener("change",e=>{activeSizeFilter=e.target.value;renderProducts();});
$("activeFilters").addEventListener("click",e=>{const btn=e.target.closest("[data-clear-filter]");if(!btn)return;const type=btn.dataset.clearFilter;if(type==="category")activeCategory="todos";if(type==="size"){$("sizeFilter").value="todos";activeSizeFilter="todos";}if(type==="search"){$("productSearch").value="";searchTerm="";}document.querySelectorAll(".category-btn").forEach(b=>b.classList.toggle("active",b.dataset.category===activeCategory));renderProducts();});
$("clearFilters").addEventListener("click",resetFilters);
$("sizeSelector").addEventListener("click",e=>{const btn=e.target.closest("[data-size]");if(!btn)return;activeSize=btn.dataset.size;modalQuantity=1;renderSizes();renderModalQuantity();renderStockStatus();});
$("addModal").addEventListener("click",addSelected);
$("modalMinus").addEventListener("click",()=>{modalQuantity=Math.max(1,modalQuantity-1);renderModalQuantity();});
$("modalPlus").addEventListener("click",()=>{if(activeProduct&&activeSize&&modalQuantity<stockFor(activeProduct,activeSize)){modalQuantity++;renderModalQuantity();}else showToast("No hay más stock disponible para ese talle.");});
$("openCart").addEventListener("click",openCart);$("closeCart").addEventListener("click",closeCart);$("cartOverlay").addEventListener("click",closeCart);
$("closeModal").addEventListener("click",closeProduct);$("modalBackdrop").addEventListener("click",closeProduct);
$("clearCart").addEventListener("click",()=>{cart={};saveCart();showToast("Carrito vaciado.");});
$("transferDiscount").addEventListener("change",e=>{transferSelected=e.target.checked;renderCart();});
$("cartItems").addEventListener("click",e=>{const q=e.target.closest("[data-qty]"),r=e.target.closest("[data-remove]");if(q)changeCartQuantity(q.dataset.qty,Number(q.dataset.delta));if(r){delete cart[r.dataset.remove];saveCart();}const go=e.target.closest("#goCatalog");if(go){closeCart();$("coleccion").scrollIntoView({behavior:"smooth"});}});
$("menuToggle").addEventListener("click",()=>{const open=$("navLinks").classList.toggle("open");$("menuToggle").setAttribute("aria-expanded",open);});
document.querySelectorAll(".nav-links a").forEach(a=>a.addEventListener("click",()=>{$("navLinks").classList.remove("open");$("menuToggle").setAttribute("aria-expanded","false");}));
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeCart();closeProduct();}});

renderProducts();renderCart();
