import Image from "next/image";

type AvatarProps = {
  image?: string; // URL ảnh từ database
  name?: string; // Tên người dùng
  size?: number;
  className?: string;
};

const Avatar = ({
  image,
  name = "",
  size = 40,
  className = "",
  ...rest
}: AvatarProps) => {
  // Lấy chữ cái đầu của tên cuối
  const getInitial = (fullName: string) => {
    const clean = fullName.trim().replace(/\s+/g, " ");
    if (!clean) return "?";
    const parts = clean.split(" ");
    return parts.at(-1)?.[0]?.toUpperCase() || "?";
  };

  const fallback = getInitial(name);

  if (image && image.trim() !== "") {
    return (
      <Image
        src={image}
        alt={name || "Avatar"}
        width={size}
        height={size}
        className={`rounded-full object-cover block ${className}`}
        {...rest}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: "#ccc",
        color: "#fff",
        fontWeight: "600",
        fontSize: size / 2.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        userSelect: "none",
      }}
      className={className}
    >
      {fallback}
    </div>
  );
};

export default Avatar;
