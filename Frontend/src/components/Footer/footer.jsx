import React from "react";
import "./footer.css";

export default function Footer() {
  return (
    <>
      <div className="footer">
        <div className="container">
          <div className="row">
            {/* -------- Column 1 -------- */}
            <div className="footer-col-1">
              <h3>Download our App</h3>
              <p>Download App for Android and iOS mobile phones.</p>
              <div className="app-logo">
                <img
                  src="/images/playstore-removebg-preview.png"
                  alt="Playstore"
                />
                <img src="/images/pngwing.com.png" alt="App Store" />
              </div>
            </div>

            {/* -------- Column 2 -------- */}
            <div className="footer-col-2">
              <img
                src="/images/INDIANIME.png"
                alt="Indianime Logo"
              />
              <p>
                Wear your anime spirit, made for India – Unleash your fandom with
                Indianime!
              </p>
            </div>

            {/* -------- Column 3 -------- */}
            <div className="footer-col-3">
              <h3>Useful Links</h3>
              <ul>
                <li>Coupons</li>
                <li>Blog Post</li>
                <li>Return Policy</li>
                <li>Contact Us</li>
              </ul>
            </div>

            {/* -------- Column 4 -------- */}
            <div className="footer-col-4">
              <h3>Follow Us</h3>
              <ul>
                <li>Facebook</li>
                <li>Instagram</li>
                <li>Twitter</li>
                <li>YouTube</li>
              </ul>
            </div>
          </div>

          <hr />
          <p className="Copyright">Copyright © 2025 INDIANIME</p>
        </div>
      </div>
    </>
  );
}
