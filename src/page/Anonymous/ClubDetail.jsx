import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClubDetailById, joinClub } from "../../services/club";
import "./clubdetail.scss";

const ClubDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const { data } = await getClubDetailById(id);
        setClub(data);

        // Kiểm tra user đã là thành viên chưa
        const isMember = data.members.some(
          (m) => m.userId?._id === userInfo?.user?._id
        );
        setJoined(isMember);
      } catch (err) {
        console.error("Lỗi khi lấy thông tin CLB:", err);
        setMessage("Không thể tải thông tin câu lạc bộ.");
      } finally {
        setLoading(false);
      }
    };
    fetchClub();
  }, [id]);

  const handleJoinClub = async () => {
    try {
      const payload = {
        clubId: id,
        userId: userInfo?.user?._id,
      };
      await joinClub(payload);
      setMessage("Tham gia CLB thành công!");
      setJoined(true);
    } catch (error) {
      console.error(error);
      setMessage("Lỗi khi tham gia CLB.");
    }
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (!club) return <p>Không tìm thấy câu lạc bộ.</p>;

  return (
    <div className="club-detail-page">
      <div className="club-card">
        <div className="club-header">
          <img
            src={
              club.logo || "https://via.placeholder.com/400x200?text=No+Image"
            }
            alt={club.name}
            className="club-logo"
          />
          <div className="club-info">
            <h1>{club.name}</h1>
            <p className="club-category">{club.category}</p>
            <p className={`club-status ${club.status}`}>{club.status}</p>
          </div>
        </div>

        <div className="club-body">
          <h3>Giới thiệu</h3>
          <p className="club-description">{club.description}</p>

          <div className="club-meta">
            <p>
              <strong>Người quản lý:</strong>{" "}
              {club.managerId?.name || "Không rõ"}
            </p>
            <p>
              <strong>Email:</strong> {club.managerId?.email || "Chưa có email"}
            </p>
          </div>

          <h3>Thành viên ({club.members.length})</h3>
          <div className="member-list">
            {club.members.length > 0 ? (
              club.members.map((m, i) => (
                <div key={i} className="member-item">
                  <span>{m.userId?.name || "Ẩn danh"}</span>
                  <span className="join-date">
                    {new Date(m.joinedAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              ))
            ) : (
              <p>Chưa có thành viên nào.</p>
            )}
          </div>

          {!joined && (
            <button className="join-btn" onClick={handleJoinClub}>
              Tham gia CLB
            </button>
          )}
          {joined && (
            <button className="joined-btn" disabled>
              ✅ Đã tham gia
            </button>
          )}

          {message && <p className="message">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default ClubDetail;
