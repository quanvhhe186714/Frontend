import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllClubs } from "../../services/club";
import Card from "../../components/Card";
import "./club.scss"
const ClubList = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await getAllClubs();
        setClubs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="club-list-page">
      <div className="club-grid ">
        {clubs.map((club) => (
          <Card
            key={club._id}
            image={club.logo}
            title={club.name}
            subtitle={club.category}
            description={club.description}
            status={club.status}
            onClick={() => navigate(`/club/${club._id}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default ClubList;
