import PropTypes from 'prop-types';
import './index.css';
import { useState } from 'react';
export const Header = ({ options = [] }) => {

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    };

    return (
        <header className="main-header">
            <h1 className="logo">Portfolio</h1>
            <button className="menu-button" onClick={toggleMenu}>
                ☰
            </button>
            <nav className={isMenuOpen ? "nav-active" : "nav-links"}>
                <ul className="nav-links">
                    {options.map((option, index) => (
                        <li key={index}><a href={option?.url}>{option?.name}</a></li>
                    ))}
                </ul>
            </nav>
        </header>
    )
}

Header.propTypes = {
    options: PropTypes.array.isRequired
}