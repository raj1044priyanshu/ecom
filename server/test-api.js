async function test() {
  const res = await fetch('http://127.0.0.1:5000/api/products?limit=2');
  const data = await res.json();
  console.log(JSON.stringify(data.products.map(p => ({
    name: p.name,
    stock: p.stock,
    price: p.price,
    discountPrice: p.discountPrice
  })), null, 2));
}
test();
