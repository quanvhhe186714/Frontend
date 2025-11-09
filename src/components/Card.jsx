import React from "react";
import "./card.scss";

const Card = ({
  image,
  title,
  subtitle,
  description,
  status,
  onClick,
  children, // optional: cho phép nhét thêm nội dung tùy ý
}) => {
  return (
    <div className="app-card" onClick={onClick}>
      {image && (
        <div className="app-card__image">
          {image ? (
            <img src={image} alt={title} />
          ) : (
            <img src="../../public/logo192.png" alt="default club" />
          )}
        </div>
      )}

      <div className="app-card__body">
        {title && <h3 className="app-card__title">{title}</h3>}
        {subtitle && <p className="app-card__subtitle">{subtitle}</p>}
        {description && <p className="app-card__description">{description}</p>}

        {children && <div className="app-card__extra">{children}</div>}
      </div>

      {status && <span className="app-card__status">{status}</span>}
    </div>
  );
};

export default Card;
