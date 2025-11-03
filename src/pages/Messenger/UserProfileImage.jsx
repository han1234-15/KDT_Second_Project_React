// src/components/common/UserProfileImage.jsx
import React, { useEffect, useState } from "react";
import { caxios } from "../../config/config";

/**
 * ✅ 공통 프로필 이미지 컴포넌트
 * - /member/userInfo API에서 프로필 이미지를 불러와 표시
 * - optional: memberId prop을 주면 특정 유저 프로필 표시
 * - 없으면 로그인 유저의 프로필 표시
 */
const UserProfileImage = ({ memberId, size = 50, className = "" }) => {
  const [imgUrl, setImgUrl] = useState("/defaultprofile.png");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) return;

        let url = "/member/userInfo";
        if (memberId) {
          // 특정 유저 ID 프로필
          url += `?memberId=${memberId}`;
        }

        const resp = await caxios.get(url);
        const data = resp.data;

        if (data?.profileImage_servName) {
          setImgUrl(
            `https://storage.googleapis.com/yj_study/${data.profileImage_servName}`
          );
        } else {
          setImgUrl("/defaultprofile.png");
        }
      } catch (err) {
        console.error("프로필 이미지 불러오기 실패:", err);
        setImgUrl("/defaultprofile.png");
      }
    };

    fetchProfile();
  }, [memberId]);

  return (
    <img
      src={imgUrl}
      alt="프로필"
      className={className}
      width={size}
      height={size}
      style={{
        borderRadius: "50%",
        objectFit: "cover",
      }}
      onError={(e) => {
        if (e.target.src !== "/defaultprofile.png") {
          e.target.src = "/defaultprofile.png";
        }
      }}
    />
  );
};

export default UserProfileImage;
