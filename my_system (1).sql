-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th2 05, 2026 lúc 02:29 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `my_system`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` text NOT NULL,
  `role` enum('admin','user') NOT NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `role`, `created_at`, `updated_at`) VALUES
(1, 'admin@gmail.com', '$2b$10$QJiez17HSCgGCfVJei79DupVUTEDGG3XDB0l/sl.8dZS0dXTdxDUm', 'user', '2026-01-26 15:24:33', '2026-01-26 15:24:33'),
(2, 'test@gmail.com', '$2a$10$Oj2bn3Ej8qTvs4JwAOjf0e.7slSLNFgRJlH0u0nLVA4gq.98H5mDC', 'user', '2026-02-02 07:13:31', '2026-02-02 07:13:31');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_databases`
--

CREATE TABLE `user_databases` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `db_host` varchar(255) NOT NULL,
  `db_port` int(11) NOT NULL DEFAULT 3306,
  `db_name` varchar(255) NOT NULL,
  `db_user` varchar(255) NOT NULL,
  `db_password_encrypted` text NOT NULL,
  `schema_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `schema_version` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `user_databases`
--

INSERT INTO `user_databases` (`id`, `user_id`, `db_host`, `db_port`, `db_name`, `db_user`, `db_password_encrypted`, `schema_json`, `schema_version`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'localhost', 3306, 'shop_system_real', 'root', '', '{\"categories\":{\"description\":\"Table categories\",\"columns\":[\"id (int(10) unsigned) [PK]\",\"name (varchar(100))\",\"parent_id (int(10) unsigned)\",\"created_at (timestamp)\"]},\"customers\":{\"description\":\"Table customers\",\"columns\":[\"id (int(10) unsigned) [PK]\",\"name (varchar(150))\",\"email (varchar(150))\",\"phone (varchar(20))\",\"address (text)\",\"created_at (timestamp)\"]},\"orders\":{\"description\":\"Table orders\",\"columns\":[\"id (int(10) unsigned) [PK]\",\"customer_id (int(10) unsigned) [FK -> customers.id]\",\"total_amount (decimal(12,2))\",\"status (enum(\'pending\',\'paid\',\'shipped\',\'cancelled\'))\",\"created_at (timestamp)\",\"updated_at (timestamp)\"]},\"order_items\":{\"description\":\"Table order_items\",\"columns\":[\"id (int(10) unsigned) [PK]\",\"order_id (int(10) unsigned) [FK -> orders.id]\",\"product_id (int(10) unsigned) [FK -> products.id]\",\"quantity (int(10) unsigned)\",\"unit_price (decimal(12,2))\",\"total_price (decimal(12,2))\"]},\"payments\":{\"description\":\"Table payments\",\"columns\":[\"id (int(10) unsigned) [PK]\",\"order_id (int(10) unsigned) [FK -> orders.id]\",\"amount (decimal(12,2))\",\"method (enum(\'cash\',\'card\',\'online\'))\",\"status (enum(\'pending\',\'completed\',\'failed\'))\",\"created_at (timestamp)\"]},\"products\":{\"description\":\"Table products\",\"columns\":[\"id (int(10) unsigned) [PK]\",\"name (varchar(200))\",\"category_id (int(10) unsigned)\",\"price (decimal(12,2))\",\"stock (int(10) unsigned)\",\"created_at (timestamp)\",\"updated_at (timestamp)\"]}}', '1.0', 1, '2026-01-26 15:35:20', '2026-02-03 15:41:47'),
(2, 1, '127.0.0.1', 3306, 'ten_database_khach_hang', 'root', '352f5c984079ecee62fc775ae7f346bbfcfac255e5b4fa1ff00f5fd62edb2ccf', NULL, '1.0.0', 0, '2026-02-03 15:18:52', '2026-02-03 15:41:47');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Chỉ mục cho bảng `user_databases`
--
ALTER TABLE `user_databases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_user_db` (`user_id`,`db_name`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `user_databases`
--
ALTER TABLE `user_databases`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `user_databases`
--
ALTER TABLE `user_databases`
  ADD CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
