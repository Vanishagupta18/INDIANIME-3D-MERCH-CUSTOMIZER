import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./header.css";

export default function Header() {
  return (
    <>
      <div className="header">
        <div className="container">
          <div className="navbar">
            <div className="logo">
              <img
                src="/images/INDIANIME-img-removebg-preview.png"
                width="200px"
                alt="Indianime Logo"
              />
            </div>

            <nav>
              <ul>
                <li>
                  <NavLink to="/">
                    <i className="fa-solid fa-house" style={{ fontSize: "25px" }}></i>
                  </NavLink>
                </li>

                <li className="dropdown">
                  <a href="#" className="dropbtn">
                    <i className="fa-solid fa-shirt" style={{ fontSize: "25px" }}></i>
                  </a>
                  <div className="dropdown-content">
                    <NavLink to="/product/attack-on-titan">ATTACK ON TITAN</NavLink>
                    <NavLink to="/product/demon-slayer">DEMON SLAYER</NavLink>
                    <NavLink to="/product/jujutsu-kaisen">JUJUTSU KAISEN</NavLink>
                    <NavLink to="/product/naruto">NARUTO</NavLink>
                    <NavLink to="/product/one-piece">ONE PIECE</NavLink>
                    <NavLink to="/product/deathnote">DEATHNOTE</NavLink>
                  </div>
                </li>

                <li>
                  <NavLink to="/contact">
                    <i className="fa-solid fa-phone" style={{ fontSize: "25px" }}></i>
                  </NavLink>
                </li>

                <li>
                  <NavLink to="/login">
                    <i className="fa-solid fa-user" style={{ fontSize: "25px" }}></i>
                  </NavLink>
                </li>

                <li>
                  <div className="search-bar-container">
                    <i
                      className="fa-solid fa-magnifying-glass"
                      id="searchIcon"
                      style={{ fontSize: "25px" }}
                    ></i>
                    <input
                      type="text"
                      className="search-bar"
                      id="searchBar"
                      placeholder="Search..."
                    />
                  </div>
                </li>

                <li>
                  <NavLink to="/cart">
                    <i className="fa-solid fa-bag-shopping" style={{ fontSize: "25px" }}></i>
                  </NavLink>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
