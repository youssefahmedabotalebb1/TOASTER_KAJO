const firebaseConfig = {
  databaseURL: "https://whatsbesnes-default-rtdb.firebaseio.com/"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const categories = {
  "lp": "dolab",
  "moca": "rham",
  "soda": "zgag",
  "hlwa": "kalb",
  "wath": "wath"  // إضافة قسم المشاريب الجديد
};

let allProducts = [];

const fetchAllProducts = async () => {
  const all = [];

  for (let path in categories) {
    const prefix = categories[path];
    const snapshot = await db.ref(path).once("value");
    const data = snapshot.val();
    
    if (data) {  // التحقق من وجود البيانات
      for (let id in data) {
        const item = data[id];
        
        // حل مشكلة الوصف المختلف لكل قسم
        let description = "";
        if (item[`${prefix}_waf`]) {
          description = item[`${prefix}_waf`];
        } else if (item[`agng_waf`]) {
          description = item[`agng_waf`];
        } else if (item[`Kalb_wat`]) {
          description = item[`Kalb_wat`];
        } else if (item[`wath_desc`]) {  // إضافة حقل وصف محتمل للمشاريب
          description = item[`wath_desc`];
        }
        
        all.push({
          image: item[`${prefix}_photo`] || "",
          title: item[`${prefix}_titel`] || item[`${prefix}_title`] || item[`${prefix}_name`] || "منتج بدون اسم",
          description: description,
          price: parseFloat(item[`${prefix}_price`] || 0),
          category: path
        });
      }
    }
  }

  allProducts = all.sort(() => 0.5 - Math.random());
  renderProducts(allProducts);
};

const renderProducts = (list) => {
  const container = document.getElementById("productsGrid");
  container.innerHTML = "";
  list.forEach(product => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <img src="${product.image}" alt="${product.title}">
      <h2>${product.title}</h2>
      <p>${product.description}</p>
      <p><strong>${product.price} جنيه</strong></p>
    `;
    div.onclick = () => showPopup(product);
    container.appendChild(div);
  });
};

const filterProducts = (category) => {
  if (category === "all") {
    renderProducts(allProducts);
  } else {
    const filtered = allProducts.filter(p => p.category === category);
    renderProducts(filtered);
  }
};

let currentProduct = null;

const showPopup = (product) => {
  currentProduct = product;
  document.getElementById("popupImg").src = product.image;
  document.getElementById("popupTitle").innerText = product.title;
  document.getElementById("popupDesc").innerText = product.description;
  document.getElementById("popupPrice").innerText = product.price;
  document.getElementById("quantity").value = 1;
  document.getElementById("userAddress").value = "";
  updateTotal();
  document.getElementById("popup").classList.remove("hidden");
};

const updateTotal = () => {
  const qty = parseInt(document.getElementById("quantity").value);
  const total = qty * currentProduct.price;
  document.getElementById("totalPrice").innerText = total;
};

const closePopup = () => {
  document.getElementById("popup").classList.add("hidden");
};

fetchAllProducts();

// إضافة مستمع حدث للزر الجديد
document.addEventListener('DOMContentLoaded', function() {
  const popupContent = document.querySelector('.popup-content');
  if (popupContent) {
    const whatsappBtn = document.getElementById("whatsappBtn");
    if (whatsappBtn) {
      whatsappBtn.addEventListener("click", sendWhatsappOrder);
    }
  }
});

const sendWhatsappOrder = () => {
  const qty = parseInt(document.getElementById("quantity").value);
  const total = qty * currentProduct.price;
  const address = document.getElementById("userAddress").value;
  
  // محاولة الحصول على موقع المستخدم
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const locationLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        
        const msg = `مرحبا، اريد طلب منتج: ${currentProduct.title}
الكمية: ${qty}
الإجمالي: ${total} جنيه
العنوان: ${address}
موقعي: ${locationLink}`;

        const encodedMsg = encodeURIComponent(msg);
        window.open(`https://wa.me/201091117080?text=${encodedMsg}`, '_blank');
      },
      (error) => {
        // في حالة رفض إعطاء الموقع، نرسل الرسالة بدون رابط الموقع
        const msg = `مرحبا، اريد طلب منتج: ${currentProduct.title}
الكمية: ${qty}
الإجمالي: ${total} جنيه
العنوان: ${address}`;

        const encodedMsg = encodeURIComponent(msg);
        window.open(`https://wa.me/201091117080?text=${encodedMsg}`, '_blank');
      }
    );
  } else {
    // في حالة عدم دعم تحديد الموقع
    const msg = `مرحبا، اريد طلب منتج: ${currentProduct.title}
الكمية: ${qty}
الإجمالي: ${total} جنيه
العنوان: ${address}`;

    const encodedMsg = encodeURIComponent(msg);
    window.open(`https://wa.me/201091117080?text=${encodedMsg}`, '_blank');
  }
};

const searchProducts = () => {
  const term = document.getElementById("searchInput").value.toLowerCase();
  const filtered = allProducts.filter(p => 
    p.title.toLowerCase().includes(term) ||
    p.description.toLowerCase().includes(term)
  );
  renderProducts(filtered);
};