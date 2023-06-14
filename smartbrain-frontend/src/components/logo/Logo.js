import React from "react";
import Tilt from 'react-parallax-tilt';
import './Logo.css';
import logo from './logo.png';

const Logo = () => {
    return (
        <div  style={{width:'150px', height: '150px', marginLeft: '30px'}}>
            <Tilt>
                 <div className="tilt-background" style={{ height: '150px',width: '150px', backgroundColor: 'darkgreen', scale:"1.2" }}>
                    <h1 className="pa3 "> <img style={{paddingTop: '35px', scale:"1.2"}} alt="logo" src={logo}/> </h1>
                 </div>
            </Tilt>
        </div>
    )
}

export default Logo;