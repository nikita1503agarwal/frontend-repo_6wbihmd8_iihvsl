'use strict';

const PAGES = ['login','home','menus','basket','contact'];
let state = {
  user: null,
  cart: [],
  driver: { progress: 0, moving: false, x:10, y:70 },
};

// Routing
function show(page){
  for(const p of PAGES){
    const el = document.getElementById(`page-${p}`);
    if(el) el.style.display = (p===page)?'block':'none';
  }
  // set active nav
  document.querySelectorAll('.nav .links a').forEach(a=>{
    a.classList.toggle('active', a.dataset.page===page);
  });
  // persist current page
  localStorage.setItem('page', page);
}

// Utils
function formatIDR(n){
  return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR'}).format(n);
}
function toast(msg){
  const t=document.createElement('div');
  t.textContent=msg; t.style.position='fixed'; t.style.bottom='20px';t.style.left='50%';t.style.transform='translateX(-50%)'; t.style.background='#111';t.style.color:'#fff';t.style.padding='10px 14px';t.style.borderRadius='10px';t.style.zIndex='9999'; t.style.opacity='0'; t.style.transition='.2s';
  document.body.appendChild(t); requestAnimationFrame(()=>{t.style.opacity='1'});
  setTimeout(()=>{t.style.opacity='0'; setTimeout(()=>t.remove(),200)},1800);
}

// Auth
function handleLogin(e){
  e.preventDefault();
  const name = document.getElementById('login-name').value.trim();
  const pass = document.getElementById('login-pass').value.trim();
  if(!name || !pass){ toast('Please fill all fields'); return; }
  state.user = { name };
  localStorage.setItem('user', JSON.stringify(state.user));
  toast(`Welcome, ${name}!`);
  show('home');
  document.getElementById('nav-username').textContent = name;
}
function handleLogout(){
  state.user=null; localStorage.removeItem('user');
  toast('Logged out'); show('login');
}

// Menu data
const MENUS = [
  {id:1,name:'Nasi Goreng',price:18000,img:'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=1200&auto=format&fit=crop'},
  {id:2,name:'Sate Ayam',price:25000,img:'https://images.unsplash.com/photo-1592861956120-e524fc739696?q=80&w=1200&auto=format&fit=crop'},
  {id:3,name:'Bakso',price:15000,img:'https://images.unsplash.com/photo-1550317138-10000687a72b?q=80&w=1200&auto=format&fit=crop'},
  {id:4,name:'Mie Ayam',price:14000,img:'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=1200&auto=format&fit=crop'},
  {id:5,name:'Es Teh',price:6000,img:'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=1200&auto=format&fit=crop'},
  {id:6,name:'Jus Alpukat',price:12000,img:'https://images.unsplash.com/photo-1567337710282-00832b415979?q=80&w=1200&auto=format&fit=crop'},
];

function renderMenus(){
  const list = document.getElementById('menu-list');
  list.innerHTML = '';
  MENUS.forEach(m=>{
    const card = document.createElement('div');
    card.className='card menu-card';
    card.innerHTML = `
      <img src="${m.img}" alt="${m.name}" style="height:140px;width:100%;object-fit:cover;border-radius:.75rem"/>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:.6rem">
        <div>
          <div class="title">${m.name}</div>
          <div class="price">${formatIDR(m.price)}</div>
        </div>
        <button class="btn" data-add="${m.id}">Add</button>
      </div>
    `;
    list.appendChild(card);
  });
}

// Cart
function addToCart(id){
  const item = MENUS.find(m=>m.id==id);
  const found = state.cart.find(c=>c.id==id);
  if(found){ found.qty++; }
  else{ state.cart.push({id:item.id,name:item.name,price:item.price,qty:1}); }
  persistCart(); renderCart(); toast(`${item.name} added`);
}
function updateQty(id,delta){
  const idx = state.cart.findIndex(c=>c.id==id);
  if(idx<0) return;
  state.cart[idx].qty += delta;
  if(state.cart[idx].qty<=0){ state.cart.splice(idx,1); }
  persistCart(); renderCart();
}
function persistCart(){ localStorage.setItem('cart', JSON.stringify(state.cart)); }
function loadCart(){ state.cart = JSON.parse(localStorage.getItem('cart')||'[]'); }

function renderCart(){
  const tbody = document.getElementById('cart-body');
  tbody.innerHTML = '';
  let total = 0;
  state.cart.forEach(c=>{
    total += c.price * c.qty;
    const tr = document.createElement('tr');
    tr.className='tr';
    tr.innerHTML = `
      <td>${c.name}</td>
      <td>${formatIDR(c.price)}</td>
      <td>
        <div class="qty">
          <button data-dec="${c.id}">-</button>
          <span>${c.qty}</span>
          <button data-inc="${c.id}">+</button>
        </div>
      </td>
      <td style="text-align:right">${formatIDR(c.price*c.qty)}</td>
    `;
    tbody.appendChild(tr);
  })
  document.getElementById('cart-total').textContent = formatIDR(total);
}

// Driver tracker simulation
let trackerTimer=null;
function startTracking(){
  if(trackerTimer) clearInterval(trackerTimer);
  state.driver = { progress:0, moving:true, x:10, y:70 };
  updateMap();
  trackerTimer = setInterval(()=>{
    if(!state.driver.moving) return;
    state.driver.progress = Math.min(100, state.driver.progress + Math.random()*8);
    state.driver.x = 10 + state.driver.progress*0.7; // move across
    state.driver.y = 70 - Math.sin(state.driver.progress/10)*8; // wiggle
    updateMap();
    if(state.driver.progress>=100){
      state.driver.moving=false; clearInterval(trackerTimer); toast('Driver arrived!');
    }
  }, 900);
}
function updateMap(){
  const bar = document.querySelector('.progress .bar');
  bar.style.width = state.driver.progress+'%';
  const bike = document.getElementById('bike');
  const pin = document.getElementById('pin');
  if(bike){ bike.style.left = state.driver.x+'%'; bike.style.top = state.driver.y+'%'; }
  if(pin){ /* static */ }
}

// Contact form
function handleContact(e){
  e.preventDefault();
  const name = document.getElementById('c-name').value.trim();
  const email = document.getElementById('c-email').value.trim();
  const msg = document.getElementById('c-msg').value.trim();
  if(!name||!email||!msg){ toast('Please fill all fields'); return; }
  toast('Thanks! We will contact you soon.');
  e.target.reset();
}

// Event delegation
function setupEvents(){
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  document.getElementById('contact-form').addEventListener('submit', handleContact);
  document.getElementById('menu-list').addEventListener('click', (e)=>{
    const id = e.target.getAttribute('data-add'); if(id) addToCart(+id);
  });
  document.getElementById('cart-body').addEventListener('click', (e)=>{
    const inc = e.target.getAttribute('data-inc'); if(inc) updateQty(+inc, +1);
    const dec = e.target.getAttribute('data-dec'); if(dec) updateQty(+dec, -1);
  });
  document.querySelectorAll('[data-goto]').forEach(a=>a.addEventListener('click', (e)=>{
    e.preventDefault(); show(e.currentTarget.dataset.goto);
  }));
  document.getElementById('start-track').addEventListener('click', startTracking);
}

// Init
function init(){
  renderMenus();
  loadCart();
  renderCart();
  const savedUser = localStorage.getItem('user');
  if(savedUser){ state.user = JSON.parse(savedUser); document.getElementById('nav-username').textContent = state.user.name; }
  const initial = state.user ? (localStorage.getItem('page')||'home') : 'login';
  show(initial);
  setupEvents();
}

window.addEventListener('DOMContentLoaded', init);
