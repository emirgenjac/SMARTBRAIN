import React from 'react';
import './FaceRecognition.css';

const FaceRecognition = ({ imageUrl, boxes, onImageLoad, onImageError }) => {
  if (!imageUrl) return null;

  return (
    <div className="center ma">
      <div className="absolute mt2">
        <img
          id="inputimage"
          alt=""
          src={imageUrl}
          width="500"
          crossOrigin="anonymous"
          onLoad={onImageLoad}
          onError={onImageError}
        />
        {boxes.map((box, index) => (
          <div
            key={`${box.left}-${box.top}-${index}`}
            className="bounding-box"
            style={{ top: box.top, left: box.left, width: box.width, height: box.height }}
          />
        ))}
      </div>
    </div>
  );
};

export default FaceRecognition;
