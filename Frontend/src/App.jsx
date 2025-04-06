import React, { useState } from 'react';
import Customizer from './components/Customizer';
import logo from '../public/LOGO/INDIANIME.png';

// Header Component
const Header = ({ currentPage, setCurrentPage }) => {
  const [searchActive, setSearchActive] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="header">
      <div className="container">
        <div className="navbar">
          <div className="logo">
            <img 
              src={logo} 
              width="200px" 
              alt="INDIANIME"
              onClick={() => setCurrentPage('home')}
              style={{ cursor: 'pointer' }}
            />
          </div>
          <nav>
            <ul>
              <li>
                <a onClick={() => setCurrentPage('home')} style={{ cursor: 'pointer' }}>
                  <i className="fa-solid fa-house" style={{ fontSize: '25px' }}></i>
                </a>
              </li>
              <li 
                className="dropdown"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <a onClick={() => setCurrentPage('products')} className="dropbtn" style={{ cursor: 'pointer' }}>
                  <i className="fa-solid fa-shirt" style={{ fontSize: '25px' }}></i>
                </a>
                {dropdownOpen && (
                  <div className="dropdown-content">
                    <a onClick={() => setCurrentPage('products')}>ATTACK ON TITAN</a>
                    <a onClick={() => setCurrentPage('products')}>DEMON SLAYER</a>
                    <a onClick={() => setCurrentPage('products')}>JUJUTSU KAISEN</a>
                    <a onClick={() => setCurrentPage('products')}>NARUTO</a>
                    <a onClick={() => setCurrentPage('products')}>ONE PIECE</a>
                    <a onClick={() => setCurrentPage('products')}>DEATHNOTE</a>
                  </div>
                )}
              </li>
              <li>
                <a onClick={() => setCurrentPage('contact')} style={{ cursor: 'pointer' }}>
                  <i className="fa-solid fa-phone" style={{ fontSize: '25px' }}></i>
                </a>
              </li>
              <li>
                <a onClick={() => setCurrentPage('login')} style={{ cursor: 'pointer' }}>
                  <i className="fa-solid fa-user" style={{ fontSize: '25px' }}></i>
                </a>
              </li>
              <li>
                <div className="search-bar-container">
                  <i 
                    className="fa-solid fa-magnifying-glass" 
                    id="searchIcon" 
                    style={{ fontSize: '25px', cursor: 'pointer' }}
                    onClick={() => setSearchActive(!searchActive)}
                  ></i>
                  <input 
                    type="text" 
                    className={`search-bar ${searchActive ? 'active' : ''}`}
                    placeholder="Search..."
                  />
                </div>
              </li>
              <li>
                <a onClick={() => setCurrentPage('cart')} style={{ cursor: 'pointer' }}>
                  <i className="fa-solid fa-bag-shopping" style={{ fontSize: '25px' }}></i>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

// Footer Component
const Footer = () => {
  return (
    <div className="footer">
      <div className="container">
        <div className="row">
          <div className="footer-col-1">
            <h3>Download our App</h3>
            <p>Download App for Android and ios mobile phone.</p>
            <div className="app-logo">
              <img src="https://via.placeholder.com/140x40/4285F4/FFFFFF?text=Play+Store" alt="Play Store" />
              <img src="https://via.placeholder.com/140x40/000000/FFFFFF?text=App+Store" alt="App Store" />
            </div>
          </div>
          <div className="footer-col-2">
            <img src="https://via.placeholder.com/180x50/8B0000/FFFFFF?text=INDIANIME" alt="INDIANIME" />
            <p>Wear your anime spirit, made for India – Unleash your fandom with Indianime!</p>
          </div>
          <div className="footer-col-3">
            <h3>Useful links</h3>
            <ul>
              <li>Coupons</li>
              <li>Blog post</li>
              <li>Return policy</li>
              <li>Contact us</li>
            </ul>
          </div>
          <div className="footer-col-4">
            <h3>Follow us</h3>
            <ul>
              <li>Facebook</li>
              <li>Instagram</li>
              <li>Twitter</li>
              <li>YouTube</li>
            </ul>
          </div>
        </div>
        <hr />
        <p className="Copyright">Copyright 2025 - INDIANIME</p>
      </div>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ image, hoverImage, title, price, rating = 4, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="col-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="image-container">
        <img 
          src={isHovered && hoverImage ? hoverImage : image} 
          alt={title}
          style={{ width: '100%' }}
        />
      </div>
      <h4>{title}</h4>
      <div className="rating">
        {[...Array(5)].map((_, i) => (
          <i 
            key={i}
            className={i < rating ? "fa-solid fa-star" : "fa-regular fa-star"}
          ></i>
        ))}
      </div>
      <p>{price}</p>
    </div>
  );
};

// Home Page
const HomePage = ({ setCurrentPage, setSelectedProduct }) => {
  const featuredProducts = [
    {
      id: 1,
      image: '/images/gear3.jpeg',
      hoverImage: '/images/gear2.jpeg',
      title: 'LUFFY Gear 5 T-Shirt',
      price: '₹1999.0',
      rating: 4
    },
    {
      id: 2,
      image: '/images/zoro3.jpeg',
      hoverImage: '/images/zoro2.jpeg',
      title: 'ZORO - King of Hell T-Shirt',
      price: '₹1999.0',
      rating: 4
    },
    {
      id: 3,
      image: '/images/mahagora3.jpeg',
      hoverImage: '/images/mahagora1.jpeg',
      title: 'MAHORAGA FUSHIGURO T-Shirt',
      price: '₹1999.0',
      rating: 5
    },
    {
      id: 4,
      image: '/images/baryon3.jpeg',
      hoverImage: '/images/baryon4.jpeg',
      title: 'NARUTO - Baryon Mode T-Shirt',
      price: '₹1999.0',
      rating: 4
    }
  ];

  return (
    <>
      <div className="header-hero">
        <div className="container">
          <div className="row">
            <div className="col-2">
              <h1>Give Yourself <br /> A New Look!</h1>
              <p style={{ color: '#fff' }}>Wear your anime spirit, made for India – Unleash your fandom with Indianime!</p>
              <button onClick={() => setCurrentPage('products')} className="btn">Explore Now →</button>
            </div>
            <div className="col-2">
              <div className="image-container">
                <img src="/images/Warrior_of_Liberation_1_6780b2db-94ad-4440-8cf0-e034831d984b.png" alt="Hero" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="categories">
        <div className="small-container">
          <div className="row">
            <div className="col-3">
              <div className="image-container" onClick={() => { setSelectedProduct(1); setCurrentPage('product-detail'); }} style={{ cursor: 'pointer' }}>
                <img src="/images/1733491332_7660478.jpg" alt="Product 1" style={{ width: '100%' }} />
              </div>
            </div>
            <div className="col-3">
              <div className="image-container" onClick={() => { setSelectedProduct(2); setCurrentPage('product-detail'); }} style={{ cursor: 'pointer' }}>
                <img src="/images/1734158281_2484950.jpg" alt="Product 2" style={{ width: '100%' }} />
              </div>
            </div>
            <div className="col-3">
              <div className="image-container" onClick={() => { setSelectedProduct(3); setCurrentPage('product-detail'); }} style={{ cursor: 'pointer' }}>
                <img src="/images/1733540863_3606730.jpg" alt="Product 3" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="small-container">
        <h2 className="title">Featured Products</h2>
        <div className="row">
          {featuredProducts.map(product => (
            <ProductCard 
              key={product.id}
              {...product}
              onClick={() => {
                setSelectedProduct(product.id);
                setCurrentPage('product-detail');
              }}
            />
          ))}
        </div>
      </div>

      <div className="offer">
        <div className="small-container">
          <div className="row">
            <div className="col-2">
              <img src="/images/black_aa7f3fe8-653a-4112-a1aa-520eef2c7c09.png" className="offer-img" alt="Custom Design" style={{ padding: '50px' }} />
            </div>
            <div className="col-2">
              <h2 style={{ color: '#fff' }}>Exclusively Available on INDIANIME</h2>
              <h1 style={{ color: '#fff' }}>UPLOAD YOUR OWN DESIGN!</h1>
              <small style={{ color: '#fff' }}>Bring your ideas to life – Upload your design and let us craft it flawlessly!</small>
              <br />
              <button onClick={() => setCurrentPage('upload-design')} className="btn">UPLOAD →</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Products Page
const ProductsPage = ({ setCurrentPage, setSelectedProduct }) => {
  const products = [
    { id: 5, image: '/images/68061211_0 (1).jpg', title: 'MY HERO ACADEMIA : Izuku Black Hoodie', price: '₹4999.0', rating: 4 },
    { id: 6, image: '/images/59645499_0.jpg', title: 'NARUTO SHIPPUDEN : Madara Uchiha Black Hoodie', price: '₹7999.0', rating: 4 },
    { id: 7, image: '/images/26518150_0.jpg', title: 'DRAGON BALL : Goku Grey Hoodie', price: '₹3999.0', rating: 4 },
    { id: 8, image: '/images/212249_1.jpg', title: 'NARUTO : Kakashi Black Hoodie', price: '₹4999.0', rating: 4 },
    { id: 9, image: '/images/61672194_0.jpg', title: 'BLEACH : Jushiro Red Hoodie', price: '₹4999.0', rating: 4 },
    { id: 10, image: '/images/67641939_0 (1).jpg', title: 'NARUTO : Sasuke Blue Hoodie', price: '₹4999.0', rating: 4 },
    { id: 11, image: '/images/13992063_0.jpg', title: 'DEMON SLAYER Black Hoodie', price: '₹4999.0', rating: 4 },
    { id: 12, image: '/images/67423716_0.jpg', title: 'NARUTO Black Hoodie', price: '₹4999.0', rating: 4 }
  ];

  return (
    <div className="small-container" style={{ minHeight: '60vh', paddingTop: '50px' }}>
      <div className="row row-2">
        <h2 className="title">HOODIES & T-SHIRTS</h2>
      </div>

      <div className="row">
        {products.map(product => (
          <ProductCard 
            key={product.id}
            {...product}
            onClick={() => {
              setSelectedProduct(product.id);
              setCurrentPage('product-detail');
            }}
          />
        ))}
      </div>

      <div className="page-btn">
        <span style={{ cursor: 'pointer', display: 'inline-block', border: '1px solid #ff523b', margin: '0 5px', width: '40px', height: '40px', textAlign: 'center', lineHeight: '40px' }}>1</span>
        <span style={{ cursor: 'pointer', display: 'inline-block', border: '1px solid #ff523b', margin: '0 5px', width: '40px', height: '40px', textAlign: 'center', lineHeight: '40px' }}>2</span>
        <span style={{ cursor: 'pointer', display: 'inline-block', border: '1px solid #ff523b', margin: '0 5px', width: '40px', height: '40px', textAlign: 'center', lineHeight: '40px' }}>3</span>
        <span style={{ cursor: 'pointer', display: 'inline-block', border: '1px solid #ff523b', margin: '0 5px', width: '40px', height: '40px', textAlign: 'center', lineHeight: '40px' }}>→</span>
      </div>
    </div>
  );
};

// Product Detail Page
const ProductDetailPage = ({ productId }) => {
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('');

  return (
    <div className="small-container single-product" style={{ minHeight: '60vh', paddingTop: '50px' }}>
      <div className="row">
        <div className="col-2">
          <img src={`https://via.placeholder.com/500x600/8B0000/FFFFFF?text=Product+${productId}`} width="70%" alt="Product" />
        </div>
        <div className="col-2">
          <p>Home / T-shirt</p>
          <h1>KAKASHI ACID-WASH TEE</h1>
          <h4>₹1999.0</h4>
          <select value={size} onChange={(e) => setSize(e.target.value)} style={{ display: 'block', padding: '10px', marginTop: '20px', marginBottom: '20px', border: '1px solid #ff523b' }}>
            <option value="">Select size</option>
            <option value="XXL">XXL</option>
            <option value="XL">XL</option>
            <option value="L">Large</option>
            <option value="M">Medium</option>
            <option value="S">Small</option>
          </select>
          <input 
            type="number" 
            value={quantity} 
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            style={{ width: '50px', height: '40px', paddingLeft: '10px', fontSize: '20px', marginRight: '10px', border: '1px solid #ff523b' }}
          />
          <button className="btn" style={{ display: 'inline-block' }}>Add to cart</button>
          <h3>Product details <i className="fa fa-indent"></i></h3>
          <br />
          <ul style={{ lineHeight: '1.8' }}>
            <li>Material: Premium quality, breathable 100% cotton for comfort and durability.</li>
            <li>Design: Features a vibrant, high-definition graphic showcasing iconic anime characters.</li>
            <li>Color: Deep black with fade-resistant printing.</li>
            <li>Fit: Available in unisex sizes; regular fit for casual wear.</li>
            <li>Care Instructions: Machine wash cold, inside-out. Do not bleach or tumble dry.</li>
          </ul>
        </div>
      </div>

      <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Similar Products</h2>
      <div className="row">
        <ProductCard 
          image="https://via.placeholder.com/300x400/000080/FFFFFF?text=AOT"
          title="ATTACK ON TITAN T-Shirt"
          price="₹1499.0"
          rating={4}
        />
        <ProductCard 
          image="https://via.placeholder.com/300x400/8B4513/FFFFFF?text=FMA"
          title="FULLMETAL ALCHEMIST T-Shirt"
          price="₹1999.0"
          rating={4}
        />
        <ProductCard 
          image="https://via.placeholder.com/300x400/DC143C/FFFFFF?text=Bleach"
          title="BLEACH : Jushiro Red Hoodie"
          price="₹1999.0"
          rating={4}
        />
      </div>
    </div>
  );
};

// Contact Page
const ContactPage = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Form submitted! We will get back to you soon.');
  };

  return (
    <main style={{ minHeight: '60vh' }}>
      <section className="contact-container">
        <h1>Contact Us</h1>
        <p>We're here to help! Fill out the form below, and our team will get back to you as soon as possible.</p>
        
        <div style={{ marginTop: '30px' }}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input type="text" id="name" placeholder="Enter your full name" style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '4px', marginTop: '5px' }} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" placeholder="Enter your email" style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '4px', marginTop: '5px' }} />
          </div>
          <div className="form-group">
            <label htmlFor="query">Query Type:</label>
            <select id="query" style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '4px', marginTop: '5px' }}>
              <option value="">-- Select --</option>
              <option value="order">Order Related</option>
              <option value="product">Product Inquiry</option>
              <option value="exchange">Exchange policy</option>
              <option value="refund">Refund/Returns</option>
              <option value="general">General Query</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="message">Message:</label>
            <textarea id="message" placeholder="Write your message here..." rows="6" style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '4px', marginTop: '5px' }}></textarea>
          </div>
          <button onClick={handleSubmit} className="btn" style={{ marginTop: '10px' }}>Submit</button>
        </div>
      </section>

      <section className="faq-container" style={{ maxWidth: '800px', margin: '50px auto', background: 'white', padding: '20px', borderRadius: '8px' }}>
        <h2>Frequently Asked Questions</h2>
        <div className="faq" style={{ marginBottom: '20px' }}>
          <h3>Q: How can I track my order?</h3>
          <p style={{ textAlign: 'left' }}>A: You can track your order by visiting the "Order Tracking" page and entering your order ID.</p>
        </div>
        <div className="faq">
          <h3>Q: What is the return policy?</h3>
          <p style={{ textAlign: 'left' }}>A: We offer a 15-day return policy for unused and undamaged items.</p>
        </div>
        <div className="faq">
          <h3>Q: Can I cancel my order?</h3>
          <p style={{ textAlign: 'left' }}>A: Yes, orders can be canceled before they are shipped.</p>
        </div>
      </section>

      <section className="details-container" style={{ maxWidth: '800px', margin: '50px auto', background: 'white', padding: '20px', borderRadius: '8px' }}>
        <h2>Company Details</h2>
        <p><strong>Address:</strong> INDIANIME Pvt. Ltd., Anime Towers, 2nd Floor, Plot No. 42, Sector 18, Silicon Valley Tech Park, Bangalore - 560100, Karnataka, India</p>
        <p><strong>Email:</strong> support@INDIANIME.com</p>
        <p><strong>Phone:</strong> +91-123-456-7890</p>
        <div className="social-media" style={{ marginTop: '15px' }}>
          <h3>Follow Us:</h3>
          <a href="https://facebook.com" target="_blank" rel="noreferrer" style={{ color: '#007BFF', marginRight: '10px' }}>Facebook</a> |
          <a href="https://twitter.com" target="_blank" rel="noreferrer" style={{ color: '#007BFF', margin: '0 10px' }}>Twitter</a> |
          <a href="https://instagram.com" target="_blank" rel="noreferrer" style={{ color: '#007BFF', marginLeft: '10px' }}>Instagram</a>
        </div>
      </section>
    </main>
  );
};

// Login Page
const LoginPage = ({ setCurrentPage }) => {
  return (
    <div style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: 'linear-gradient(to right, #ff523b, #39161b)',
      padding: '50px 0'
    }}>
      <div style={{
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '40px',
        borderRadius: '15px',
        width: '400px',
        color: '#fff'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>
        <input 
          type="email" 
          placeholder="Email" 
          style={{
            width: '100%',
            padding: '15px',
            marginBottom: '20px',
            border: 'none',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.2)',
            color: '#fff'
          }}
        />
        <input 
          type="password" 
          placeholder="Password" 
          style={{
            width: '100%',
            padding: '15px',
            marginBottom: '20px',
            border: 'none',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.2)',
            color: '#fff'
          }}
        />
        <button 
          onClick={() => alert('Login successful!')}
          style={{
            width: '100%',
            padding: '15px',
            border: 'none',
            borderRadius: '10px',
            background: '#ff523b',
            color: '#fff',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Login
        </button>
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          Don't have an account? <span onClick={() => setCurrentPage('register')} style={{ color: '#ff523b', cursor: 'pointer' }}>Register</span>
        </p>
      </div>
    </div>
  );
};

// 3D T-Shirt Viewer Component
const ThreeScene = ({ color, logoTexture }) => {
  const mountRef = React.useRef(null);
  const sceneRef = React.useRef(null);
  const rendererRef = React.useRef(null);
  const frameRef = React.useRef(null);
  const tshirtMeshRef = React.useRef(null);
  const logoMeshRef = React.useRef(null);
  
  React.useEffect(() => {
    if (!mountRef.current || typeof window === 'undefined') return;
    
    const THREE = window.THREE;
    if (!THREE) return;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 8);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-5, 5, -5);
    scene.add(pointLight);
    
    const shape = new THREE.Shape();
    shape.moveTo(-2, 2);
    shape.lineTo(-2, 0.5);
    shape.lineTo(-3, 0.5);
    shape.lineTo(-3, -0.5);
    shape.lineTo(-2, -0.5);
    shape.lineTo(-2, -3);
    shape.lineTo(2, -3);
    shape.lineTo(2, -0.5);
    shape.lineTo(3, -0.5);
    shape.lineTo(3, 0.5);
    shape.lineTo(2, 0.5);
    shape.lineTo(2, 2);
    shape.lineTo(0.8, 2);
    shape.bezierCurveTo(0.8, 1.5, -0.8, 1.5, -0.8, 2);
    shape.closePath();
    
    const extrudeSettings = {
      depth: 0.4,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 2,
      bevelSize: 0.05,
      bevelThickness: 0.05
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();
    
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(color),
      side: THREE.DoubleSide,
      flatShading: false
    });
    
    const tshirtMesh = new THREE.Mesh(geometry, material);
    tshirtMesh.castShadow = true;
    scene.add(tshirtMesh);
    tshirtMeshRef.current = tshirtMesh;
    
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.2 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -4;
    plane.receiveShadow = true;
    scene.add(plane);
    
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let mouseDown = false;
    
    const handleMouseMove = (event) => {
      if (!mouseDown) return;
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
      targetRotationY = mouseX * Math.PI;
      targetRotationX = mouseY * Math.PI / 4;
    };
    
    const handleMouseDown = () => { mouseDown = true; };
    const handleMouseUp = () => { mouseDown = false; };
    
    const handleWheel = (event) => {
      camera.position.z += event.deltaY * 0.01;
      camera.position.z = Math.max(5, Math.min(15, camera.position.z));
    };
    
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('mouseleave', handleMouseUp);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('wheel', handleWheel);
    
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      if (tshirtMesh) {
        tshirtMesh.rotation.y += (targetRotationY - tshirtMesh.rotation.y) * 0.05;
        tshirtMesh.rotation.x += (targetRotationX - tshirtMesh.rotation.x) * 0.05;
        
        if (!mouseDown) {
          tshirtMesh.rotation.y += 0.005;
        }
      }
      
      renderer.render(scene, camera);
    };
    animate();
    
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('mouseleave', handleMouseUp);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);
  
  React.useEffect(() => {
    if (tshirtMeshRef.current && window.THREE) {
      tshirtMeshRef.current.material.color = new window.THREE.Color(color);
    }
  }, [color]);
  
  React.useEffect(() => {
    if (!sceneRef.current || !window.THREE) return;
    
    if (logoMeshRef.current) {
      sceneRef.current.remove(logoMeshRef.current);
      logoMeshRef.current = null;
    }
    
    if (logoTexture) {
      const logoGeometry = new window.THREE.PlaneGeometry(1.5, 1.5);
      const logoMaterial = new window.THREE.MeshBasicMaterial({
        map: logoTexture,
        transparent: true,
        alphaTest: 0.5
      });
      const logoMesh = new window.THREE.Mesh(logoGeometry, logoMaterial);
      logoMesh.position.set(0, 0, 0.25);
      sceneRef.current.add(logoMesh);
      logoMeshRef.current = logoMesh;
    }
  }, [logoTexture]);
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'move' }} />
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(4px)',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#666'
      }}>
        🔄 Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
};

// Upload Design Page with 3D Customizer
const UploadDesignPage = () => {
  const [tshirtColor, setTshirtColor] = useState('#b30000');
  const [size, setSize] = useState('M');
  const [fabric, setFabric] = useState('cotton');
  const [logoTexture, setLogoTexture] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [printSide, setPrintSide] = useState('front');
  const fileInputRef = React.useRef();
  
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        if (window.THREE) {
          const textureLoader = new window.THREE.TextureLoader();
          textureLoader.load(e.target.result, (texture) => {
            texture.needsUpdate = true;
            setLogoTexture(texture);
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const colorOptions = [
    { name: 'Red', value: '#b30000' },
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Gray', value: '#6B7280' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Yellow', value: '#FDE047' },
    { name: 'Orange', value: '#FB923C' }
  ];
  
  const fabricInfo = {
    cotton: { name: '100% Cotton', description: 'Soft, breathable, and comfortable' },
    polyester: { name: '100% Polyester', description: 'Durable, wrinkle-resistant' },
    'cotton-poly': { name: 'Cotton-Poly Blend', description: 'Best of both worlds' },
    organic: { name: 'Organic Cotton', description: 'Sustainable and eco-friendly' }
  };

  React.useEffect(() => {
    // Load Three.js dynamically
    if (!window.THREE) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to br, #f9fafb, #f3f4f6)', padding: '20px' }}>
      
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            🎨 3D T-Shirt Customizer
          </h1>
          <p style={{ color: '#6b7280' }}>Design your perfect custom t-shirt with our interactive 3D preview</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* 3D View */}
          <div style={{
            height: '600px',
            background: 'linear-gradient(to br, #dbeafe, #fae8ff)',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <ThreeScene color={tshirtColor} logoTexture={logoTexture} />
          </div>
          
          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Color Picker */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>🎨 T-Shirt Color</h3>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>Choose your preferred color</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '16px' }}>
                {colorOptions.map((colorOption) => (
                  <button
                    key={colorOption.value}
                    onClick={() => setTshirtColor(colorOption.value)}
                    style={{
                      width: '100%',
                      height: '48px',
                      borderRadius: '8px',
                      border: tshirtColor === colorOption.value ? '3px solid #1f2937' : '2px solid #d1d5db',
                      backgroundColor: colorOption.value,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: tshirtColor === colorOption.value ? '0 4px 6px rgba(0, 0, 0, 0.2)' : 'none'
                    }}
                    title={colorOption.name}
                  />
                ))}
              </div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Custom Color</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="color"
                  value={tshirtColor}
                  onChange={(e) => setTshirtColor(e.target.value)}
                  style={{ width: '100%', height: '40px', borderRadius: '6px', cursor: 'pointer', border: '1px solid #d1d5db' }}
                />
                <input
                  type="text"
                  value={tshirtColor}
                  onChange={(e) => setTshirtColor(e.target.value)}
                  style={{ width: '96px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                  placeholder="#000000"
                />
              </div>
            </div>
            
            {/* Size & Fabric */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>📏 Size & Fabric</h3>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Size</label>
              <select 
                value={size} 
                onChange={(e) => setSize(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="XS">Extra Small (XS)</option>
                <option value="S">Small (S)</option>
                <option value="M">Medium (M)</option>
                <option value="L">Large (L)</option>
                <option value="XL">Extra Large (XL)</option>
                <option value="XXL">Double XL (XXL)</option>
              </select>
              
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Fabric Type</label>
              <select 
                value={fabric} 
                onChange={(e) => setFabric(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                {Object.entries(fabricInfo).map(([key, info]) => (
                  <option key={key} value={key}>{info.name}</option>
                ))}
              </select>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>{fabricInfo[fabric].description}</p>
            </div>
            
            {/* Logo Upload */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>📤 Design Upload</h3>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>Upload your logo or design</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current.click()}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'white',
                  border: '2px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                📤 Choose Image
              </button>
              {uploadedImage && (
                <div style={{ marginTop: '16px' }}>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Preview:</p>
                  <img
                    src={uploadedImage}
                    alt="Uploaded design"
                    style={{
                      width: '100%',
                      height: '128px',
                      objectFit: 'contain',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      background: 'repeating-conic-gradient(#f0f0f0 0% 25%, white 0% 50%) 50% / 20px 20px'
                    }}
                  />
                  <button
                    onClick={() => {
                      setUploadedImage(null);
                      setLogoTexture(null);
                    }}
                    style={{
                      width: '100%',
                      marginTop: '8px',
                      padding: '8px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Remove Design
                  </button>
                </div>
              )}
            </div>
            
            {/* Additional Options */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>⚙️ Options</h3>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Print Side</label>
              <select 
                value={printSide} 
                onChange={(e) => setPrintSide(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="front">Front</option>
                <option value="back">Back</option>
                <option value="both">Both Sides</option>
              </select>
              
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Quantity</label>
              <input 
                type="number" 
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)}
                min="1" 
                max="100"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            {/* Summary */}
            <div style={{
              background: 'linear-gradient(to r, #dbeafe, #fae8ff)',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>📋 Current Selection</h3>
              <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '500' }}>Color:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: tshirtColor }} />
                    <span>{tshirtColor}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '500' }}>Size:</span>
                  <span>{size}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '500' }}>Fabric:</span>
                  <span>{fabricInfo[fabric].name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '500' }}>Print Side:</span>
                  <span>{printSide}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '500' }}>Quantity:</span>
                  <span>{quantity}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '500' }}>Design:</span>
                  <span style={{ color: uploadedImage ? '#10b981' : '#6b7280' }}>
                    {uploadedImage ? '✓ Uploaded' : 'None'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => alert('Design submitted successfully! Our team will contact you soon.')}
                style={{
                  width: '100%',
                  marginTop: '16px',
                  padding: '12px',
                  background: '#b30000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                Submit Design
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const renderPage = () => {
    switch(currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} setSelectedProduct={setSelectedProduct} />;
      case 'products':
        return <ProductsPage setCurrentPage={setCurrentPage} setSelectedProduct={setSelectedProduct} />;
      case 'product-detail':
        return <ProductDetailPage productId={selectedProduct} />;
      case 'contact':
        return <ContactPage />;
      case 'login':
        return <LoginPage setCurrentPage={setCurrentPage} />;
      case 'upload-design':
        return <Customizer />;
      case 'cart':
        return (
          <div style={{ minHeight: '60vh', textAlign: 'center', paddingTop: '100px' }}>
            <h1>Shopping Cart</h1>
            <p>Your cart is empty</p>
          </div>
        );
      default:
        return <HomePage setCurrentPage={setCurrentPage} setSelectedProduct={setSelectedProduct} />;
    }
  };

  return (
    <div className="App">
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" 
        integrity="sha512-Kc323vGBEqzTmouAECnVceyQqyqdsSiqLQISBL29aUW4U/M7pSPA/gEUZQqv1cwx4OnYxTxve5UMg5GT6L4JJg==" 
        crossOrigin="anonymous" 
        referrerPolicy="no-referrer" 
      />
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Poppins', sans-serif;
        }

        .container {
          max-width: 1300px;
          margin: auto;
          padding-left: 25px;
          padding-right: 25px;
        }

        .row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          justify-content: space-around;
        }

        .col-2 {
          flex-basis: 50%;
          min-width: 300px;
        }

        .col-2 img {
          max-width: 100%;
          padding: 50px 0;
        }

        .col-2 h1 {
          font-size: 50px;
          line-height: 60px;
          margin: 25px 0;
        }

        .col-3 {
          flex-basis: 30%;
          min-width: 250px;
          margin-bottom: 30px;
        }

        .col-3 img {
          width: 100%;
        }

        .col-4 {
          flex-basis: 25%;
          padding: 10px;
          min-width: 200px;
          margin-bottom: 50px;
          transition: transform 0.5s;
          text-align: center;
        }

        .col-4:hover {
          transform: translateY(-5px);
        }

        .col-4 img {
          width: 100%;
        }

        .btn {
          display: inline-block;
          background: #b30000;
          color: #fff;
          padding: 8px 30px;
          margin: 30px 0;
          border-radius: 30px;
          transition: background 0.5s;
          text-decoration: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
        }

        .btn:hover {
          background: #563434;
        }

        .title {
          text-align: center;
          margin: 0 auto 80px;
          position: relative;
          line-height: 60px;
          color: #555;
          font-size: 35px;
        }

        .title::after {
          content: '';
          background: #ff523b;
          width: 80px;
          height: 5px;
          border-radius: 5px;
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
        }

        h4 {
          color: #555;
          font-weight: normal;
        }

        .rating .fa,
        .rating .fa-solid {
          color: #ff523b;
        }

        .small-container {
          max-width: 100%;
          margin: 0px;
          padding-left: 25px;
          padding-right: 25px;
        }

        a {
          text-decoration: none;
          color: #010000;
        }

        p {
          color: #555;
        }

        .navbar {
          display: flex;
          align-items: center;
          padding: 20px;
        }

        nav {
          flex: 1;
          text-align: right;
        }

        nav ul {
          display: inline-block;
          list-style-type: none;
        }

        nav ul li {
          display: inline-block;
          margin-right: 20px;
        }

        .dropdown {
          position: relative;
          display: inline-block;
        }

        .dropbtn {
          text-decoration: none;
          color: black;
          padding: 10px 15px;
          display: block;
          font-size: 16px;
        }

        .dropdown-content {
          display: none;
          position: absolute;
          background-color: white;
          min-width: 160px;
          box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
          z-index: 1;
        }

        .dropdown-content a {
          color: black;
          padding: 10px 15px;
          text-decoration: none;
          display: block;
          font-size: 14px;
          text-align: left;
          cursor: pointer;
        }

        .dropdown-content a:hover {
          background-color: #ddd;
        }

        .dropdown:hover .dropdown-content {
          display: block;
        }

        .search-bar-container {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .search-bar {
          display: none;
          margin-left: 10px;
          padding: 8px;
          font-size: 16px;
          border: 2px solid #007BFF;
          border-radius: 5px;
          width: 200px;
        }

        .search-bar.active {
          display: inline-block;
        }

        .header {
          background: radial-gradient(#871313, #181616);
        }

        .header-hero {
          background: radial-gradient(#871313, #181616);
          padding-bottom: 50px;
        }

        .categories {
          margin: 70px 0;
        }

        .offer {
          background: radial-gradient(#871313, #181616);
          margin-top: 80px;
          padding: 50px 0;
        }

        .offer .row {
          margin: 0;
          padding: 0;
          justify-content: space-between;
        }

        .offer-img {
          max-width: 100%;
        }

        .footer {
          background: #000;
          color: #8a8a8a;
          font-size: 14px;
          padding: 60px 0 20px;
        }

        .footer p {
          color: #8a8a8a;
        }

        .footer h3 {
          color: #fff;
          margin-bottom: 20px;
        }

        .footer-col-1, .footer-col-2, .footer-col-3, .footer-col-4 {
          min-width: 250px;
          margin-bottom: 20px;
        }

        .footer-col-1 {
          flex-basis: 30%;
        }

        .footer-col-2 {
          flex: 1;
          text-align: center;
        }

        .footer-col-2 img {
          width: 180px;
          margin-bottom: 20px;
        }

        .footer-col-3, .footer-col-4 {
          flex-basis: 12%;
          text-align: center;
        }

        ul {
          list-style-type: none;
        }

        .app-logo {
          margin-top: 20px;
        }

        .app-logo img {
          width: 140px;
          margin: 10px;
        }

        .footer hr {
          border: none;
          background: #b5b5b5;
          height: 1px;
          margin: 20px 0;
        }

        .Copyright {
          text-align: center;
        }

        .image-container {
          position: relative;
          overflow: hidden;
        }

        .page-btn {
          text-align: center;
          margin: 50px auto;
        }

        .row-2 {
          justify-content: space-between;
          margin: 50px auto;
        }

        .contact-container, .faq-container, .details-container {
          max-width: 800px;
          margin: 50px auto;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .form-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .faq {
          margin-bottom: 20px;
        }

        .faq h3 {
          font-size: 18px;
          color: #333;
          margin-bottom: 5px;
        }

        .social-media a {
          color: #007BFF;
          text-decoration: none;
        }

        .social-media a:hover {
          text-decoration: underline;
        }

        @media screen and (max-width: 768px) {
          .col-2 h1 {
            font-size: 35px;
            line-height: 45px;
          }

          .col-2, .col-3, .col-4 {
            flex-basis: 100%;
          }
        }
      `}</style>
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {renderPage()}
      <Footer />
    </div>
  );
}

export default App;