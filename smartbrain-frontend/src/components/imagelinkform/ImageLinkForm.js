import React from "react";
import './ImageLinkForm.css';

const ImageLinkForm = ({ onInputChange, onButtonSubmit, onSample }) => {
    return (
        <div>
           <p className="f3">
            {"This Magic Brain will detect faces in your pictures, give it a try!"}
           </p>
           <div className="center">
                <div className="form center pa4 br3 shadow-5">
                    <input className="f4 pa2 w-70 center" type="text" onChange={onInputChange} placeholder="Direct image URL"/>
                    <button className="w-30 grow f4 link ph3 pv2 dib white bg-light-purple" onClick={onButtonSubmit}> Detect</button>
                </div>
           </div>
           <p onClick={onSample} className="f5 pointer link dim black">Try a sample photo</p>
        </div>
    )
}

export default ImageLinkForm;