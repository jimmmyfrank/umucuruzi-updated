-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 24, 2026 at 12:19 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `umucuruzi`
--

-- --------------------------------------------------------

--
-- Table structure for table `advertisements`
--

CREATE TABLE `advertisements` (
  `id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `link_url` varchar(255) DEFAULT NULL,
  `placement` enum('homepage','product_detail','market','all') DEFAULT 'homepage',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `clicks` int(11) DEFAULT 0,
  `impressions` int(11) DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `advertiser_image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `advertisements`
--

INSERT INTO `advertisements` (`id`, `title`, `image_url`, `link_url`, `placement`, `start_date`, `end_date`, `is_active`, `clicks`, `impressions`, `created_at`, `updated_at`, `subtitle`, `description`, `advertiser_image`) VALUES
(1, 'Welcome to Umucuruzi!', '/uploads/image-1787191415480-513886550.jpg', '', 'homepage', NULL, NULL, 1, 0, 0, '2026-08-12 20:36:40', '2026-08-20 02:03:39', '', 'Enjoy thousands of products from different traders', '/uploads/image-1787191402250-877856244.jpg'),
(2, '505 Made off', '/uploads/image-1787191319618-538899053.jpg', '', 'homepage', NULL, NULL, 1, 0, 0, '2026-08-15 03:50:24', '2026-08-20 02:02:11', '', '', '/uploads/image-1787191327066-742885238.jpg'),
(3, '50% Made off', '/uploads/image-1787191351259-715797604.jpg', 'http://localhost:8081/home', 'homepage', NULL, NULL, 1, 0, 0, '2026-08-15 04:06:32', '2026-08-20 02:02:36', 'only 5 remainig ', 'Get offer before 2 days as you will get this exceptional order', '/uploads/image-1786766755377-473541530.svg'),
(4, 'Premium Wireless Earbuds', '/uploads/image-1787191487250-998900380.jpg', 'http://localhost:8081/home', 'homepage', NULL, NULL, 1, 0, 0, '2026-08-16 20:57:33', '2026-08-20 02:04:49', 'Great Sound, Great Price', 'Price\nEnjoy clear sound and comfortable wireless listening. Available now from a trusted local trader.', '/uploads/image-1786913836012-491867496.jpg'),
(5, 'Modern Sneakers', '/uploads/image-1786914172283-828739768.jpg', 'http://localhost:8081/home', 'homepage', NULL, NULL, 1, 0, 0, '2026-08-16 21:02:59', '2026-08-16 21:02:59', 'Step Into Something New', 'Stylish and comfortable sneakers for everyday use. Check the available sizes and order today.', '/uploads/image-1786914162271-492617922.jpg'),
(6, 'Smartphone Deal', '/uploads/image-1787191444649-796844084.jpg', '', 'homepage', NULL, NULL, 1, 0, 0, '2026-08-16 21:03:58', '2026-08-20 02:04:07', 'Upgrade Your Phone', 'Discover this smartphone with useful features, reliable performance, and an affordable local pric', '/uploads/image-1786914230598-812560138.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `app_settings`
--

CREATE TABLE `app_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(50) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 1,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `icon`, `created_at`) VALUES
(1, 'Food', 'Ibiribwa bitandukanye', 'F', '2026-08-10 15:45:27'),
(2, 'Imyambaro', 'amashati,amapantaro,amakote,imipira,ibiryamirwa nibindi', 'default', '2026-08-15 03:48:34'),
(3, 'Electronics', 'amatelefone,amaradio,amateleviziyo,ama ekuteri,nibindi', 'default', '2026-08-15 03:49:55'),
(4, 'Fashion & Clothing', 'Clothing, footwear, and fashion accessories for men, women, and children.', 'default', '2026-08-20 00:59:40'),
(5, 'Phones & Telecommunications', 'Mobile phones, accessories, and telecommunications equipment.', 'default', '2026-08-20 01:00:06'),
(6, 'Computers & Technology', 'Computers, peripherals, networking equipment, and technology accessories.', 'default', '2026-08-20 01:00:34'),
(7, 'Home & Living', 'Products used for furnishing, decorating, and maintaining homes.', 'default', '2026-08-20 01:01:04'),
(8, 'Kitchen & Dining', 'Products used for cooking, food preparation, storage, and dining.', 'default', '2026-08-20 01:01:26'),
(9, 'Beauty & Personal Care', 'Products for personal hygiene, grooming, skincare, and cosmetics.', 'default', '2026-08-20 01:02:02'),
(10, '. Baby & Kids', 'Products for babies, children, and parents.', 'default', '2026-08-20 01:02:27'),
(11, 'Sports & Fitness', 'Equipment, clothing, and accessories for sports and physical activities.', 'default', '2026-08-20 01:05:05'),
(12, '. Jewelry & Accessories', 'Jewelry, watches, and personal fashion accessories', 'default', '2026-08-20 01:05:38'),
(13, 'Bags & Luggage', 'Products for carrying personal belongings, business items, and travel equipment.', 'default', '2026-08-20 01:06:03'),
(14, 'Furniture', 'Furniture for homes, offices, schools, restaurants, and businesses.', 'default', '2026-08-20 01:06:36');

-- --------------------------------------------------------

--
-- Table structure for table `customer_trader_loyalty`
--

CREATE TABLE `customer_trader_loyalty` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `trader_id` int(11) NOT NULL,
  `points` int(11) DEFAULT 0,
  `last_order_date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer_trader_loyalty`
--

INSERT INTO `customer_trader_loyalty` (`id`, `customer_id`, `trader_id`, `points`, `last_order_date`) VALUES
(1, 1, 5, 15, NULL),
(2, 1, 3, 10, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `delivery_assignments`
--

CREATE TABLE `delivery_assignments` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `agent_id` int(11) NOT NULL,
  `assigned_at` datetime NOT NULL,
  `status` enum('pending','accepted','picked_up','in_transit','delivered') DEFAULT 'pending',
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `delivery_assignments`
--

INSERT INTO `delivery_assignments` (`id`, `order_id`, `agent_id`, `assigned_at`, `status`, `updated_at`) VALUES
(1, 7, 18, '2026-08-17 09:23:46', 'delivered', '2026-08-17 10:17:00'),
(2, 9, 18, '2026-08-17 10:49:06', 'delivered', '2026-08-17 10:51:27');

-- --------------------------------------------------------

--
-- Table structure for table `markets`
--

CREATE TABLE `markets` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `district` varchar(50) DEFAULT NULL,
  `sector` varchar(50) DEFAULT NULL,
  `cell` varchar(50) DEFAULT NULL,
  `village` varchar(50) DEFAULT NULL,
  `coordinates` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `days_active` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`days_active`)),
  `created_by` int(11) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `logo_image` varchar(255) DEFAULT NULL,
  `banner_image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `markets`
--

INSERT INTO `markets` (`id`, `name`, `district`, `sector`, `cell`, `village`, `coordinates`, `description`, `days_active`, `created_by`, `is_active`, `created_at`, `updated_at`, `logo_image`, `banner_image`) VALUES
(5, 'Kimironko Market', 'Gasabo', 'Kimironko', 'Kibagabaga', '', '', 'Famous market for fresh produce and clothes.', '\"[\\\"Monday\\\",\\\"Tuesday\\\",\\\"Wednesday\\\",\\\"Thursday\\\",\\\"Friday\\\",\\\"Saturday\\\",\\\"Sunday\\\"]\"', 14, 1, '2026-08-12 20:55:13', '2026-08-20 00:57:58', '/uploads/image-1787187473451-74529837.jpg', '/uploads/image-1787187453601-719395203.jpg'),
(6, 'Gasiza Market', 'Rulindo', 'Bushoki', 'Gasiza', 'Gasiza', '', 'Famous market located in gasiza bus station', '\"[\\\"Tuesday\\\",\\\"Saturday\\\"]\"', 16, 1, '2026-08-15 03:27:36', '2026-08-20 00:57:19', '/uploads/image-1786910280191-712793728.jpg', '/uploads/image-1787187433882-235175901.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `market_memberships`
--

CREATE TABLE `market_memberships` (
  `id` int(11) NOT NULL,
  `market_id` int(11) NOT NULL,
  `trader_id` int(11) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `joined_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `market_memberships`
--

INSERT INTO `market_memberships` (`id`, `market_id`, `trader_id`, `is_active`, `joined_at`) VALUES
(1, 5, 5, 1, '2026-08-15 10:48:57'),
(2, 5, 17, 1, '2026-08-15 17:22:28'),
(3, 5, 6, 1, '2026-08-18 12:47:38'),
(4, 6, 5, 1, '2026-08-18 15:28:24');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` enum('email','sms','push') NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `is_read`, `created_at`) VALUES
(1, 5, 'push', 'New Order', 'You have a new order from Mugisha', 0, '2026-08-15 08:54:47'),
(2, 5, 'push', 'New Order', 'You have a new order from Mugisha', 0, '2026-08-15 09:04:38'),
(3, 5, 'push', 'New Order', 'You have a new order from Mugisha', 0, '2026-08-17 07:18:42'),
(4, 5, 'push', 'New Order', 'You have a new order from Mugisha', 0, '2026-08-17 07:22:21'),
(5, 5, 'push', 'New Order', 'You have a new order from Mugisha', 0, '2026-08-17 07:23:02'),
(6, 5, 'push', 'New Order', 'You have a new order from Mugisha', 0, '2026-08-17 07:26:49'),
(7, 5, 'push', 'New Order', 'You have a new order from Mugisha', 0, '2026-08-17 08:42:52'),
(8, 1, 'push', 'Delivery Accepted', 'Your order 7 has been accepted by agent Alice', 0, '2026-08-17 09:41:40'),
(9, 1, 'push', 'Delivery picked_up', 'Your order 7 is now picked_up', 0, '2026-08-17 09:59:01'),
(10, 1, 'push', 'Delivery in_transit', 'Your order 7 is now in_transit', 0, '2026-08-17 10:16:55'),
(11, 1, 'push', 'Delivery delivered', 'Your order 7 is now delivered', 0, '2026-08-17 10:17:00'),
(12, 5, 'push', 'New Order', 'You have a new order from Mugisha', 1, '2026-08-17 10:40:38'),
(13, 5, 'push', 'New Order', 'You have a new order from Mugisha', 0, '2026-08-17 10:47:37'),
(14, 1, 'push', 'Delivery Accepted', 'Your order 9 has been accepted by agent Alice', 0, '2026-08-17 10:50:14'),
(15, 1, 'push', 'Delivery picked_up', 'Your order 9 is now picked_up', 0, '2026-08-17 10:50:20'),
(16, 1, 'push', 'Delivery in_transit', 'Your order 9 is now in_transit', 0, '2026-08-17 10:50:27'),
(17, 5, 'push', 'Order Confirmed', 'Order #9 has been confirmed as received by the customer.', 1, '2026-08-17 10:51:27'),
(18, 5, 'push', 'New Order', 'You have a new order from Mugisha', 1, '2026-08-20 00:01:08'),
(19, 3, 'push', 'New Order', 'You have a new order from Mugisha', 0, '2026-08-22 18:30:57'),
(20, 3, 'push', 'New Order', 'You have a new order from Mugisha', 0, '2026-08-22 20:02:25'),
(21, 1, 'push', 'Order #12 updated', 'Your order status is now: processing', 0, '2026-08-22 20:35:40'),
(22, 1, 'push', 'Order #12 updated', 'Your order status is now: ready', 1, '2026-08-22 20:35:58'),
(23, 5, 'push', 'New Order', 'You have a new order from Mugisha', 0, '2026-08-22 22:30:38'),
(24, 1, 'push', 'Order #13 updated', 'Your order status is now: processing', 0, '2026-08-22 22:31:03'),
(25, 1, 'push', 'Order #13 updated', 'Your order status is now: PROCESSING', 0, '2026-08-22 22:40:36'),
(26, 3, 'push', 'New Order', 'You have a new order from Mugisha', 0, '2026-08-22 23:05:36'),
(27, 5, 'push', 'New Order', 'You have a new order from Mugisha', 0, '2026-08-22 23:05:36'),
(28, 1, 'push', 'Order #15 updated', 'Your order status is now: PROCESSING', 0, '2026-08-22 23:31:13'),
(29, 1, 'push', 'Order #15 updated', 'Your order status is now: READY', 0, '2026-08-22 23:31:32'),
(30, 1, 'push', 'Order #15 updated', 'Your order status is now: DELIVERED', 0, '2026-08-22 23:31:40');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `trader_id` int(11) NOT NULL,
  `delivery_type` enum('direct','pickup','delivery') NOT NULL,
  `delivery_agent_id` int(11) DEFAULT NULL,
  `delivery_address` text DEFAULT NULL,
  `delivery_fee` decimal(10,2) DEFAULT 0.00,
  `total_amount` decimal(10,2) NOT NULL,
  `promo_code_id` int(11) DEFAULT NULL,
  `discount_amount` decimal(10,2) DEFAULT 0.00,
  `final_amount` decimal(10,2) NOT NULL,
  `order_status` enum('pending','processing','ready','in_transit','delivered','cancelled') DEFAULT 'pending',
  `payment_status` enum('pending','paid') DEFAULT 'pending',
  `payment_method` enum('online','pay_on_store','pay_on_delivery') DEFAULT 'pay_on_delivery',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `customer_id`, `trader_id`, `delivery_type`, `delivery_agent_id`, `delivery_address`, `delivery_fee`, `total_amount`, `promo_code_id`, `discount_amount`, `final_amount`, `order_status`, `payment_status`, `payment_method`, `created_at`, `updated_at`) VALUES
(1, 1, 5, 'direct', NULL, NULL, 0.00, 5000.00, NULL, 0.00, 5000.00, 'delivered', 'pending', 'pay_on_store', '2026-08-15 08:54:47', '2026-08-15 19:33:35'),
(2, 1, 5, 'direct', NULL, NULL, 0.00, 40000.00, NULL, 0.00, 40000.00, 'in_transit', 'pending', 'pay_on_store', '2026-08-15 09:04:38', '2026-08-15 19:33:20'),
(3, 1, 5, 'direct', NULL, NULL, 0.00, 1600.00, NULL, 0.00, 1600.00, 'pending', 'pending', 'pay_on_store', '2026-08-17 07:18:42', '2026-08-17 07:18:42'),
(4, 1, 5, 'direct', NULL, NULL, 0.00, 500.00, NULL, 0.00, 500.00, 'pending', 'pending', 'online', '2026-08-17 07:22:21', '2026-08-17 07:22:21'),
(5, 1, 5, 'direct', NULL, NULL, 0.00, 200000.00, NULL, 0.00, 200000.00, 'cancelled', 'pending', 'pay_on_delivery', '2026-08-17 07:23:02', '2026-08-17 08:35:30'),
(6, 1, 5, 'direct', NULL, NULL, 0.00, 500.00, NULL, 0.00, 500.00, 'processing', 'pending', 'pay_on_delivery', '2026-08-17 07:26:49', '2026-08-17 08:25:11'),
(7, 1, 5, 'delivery', 18, 'Kigali , kimisagara , maison des geneus', 0.00, 400500.00, NULL, 0.00, 400500.00, 'delivered', 'pending', 'pay_on_delivery', '2026-08-17 08:42:52', '2026-08-17 10:17:00'),
(8, 1, 5, 'delivery', NULL, 'Kigali , nyabugogo', 0.00, 200000.00, NULL, 0.00, 200000.00, 'delivered', 'pending', 'pay_on_delivery', '2026-08-17 10:40:38', '2026-08-17 10:41:48'),
(9, 1, 5, 'delivery', 18, 'musanze', 0.00, 400000.00, NULL, 0.00, 400000.00, 'delivered', 'pending', 'pay_on_delivery', '2026-08-17 10:47:37', '2026-08-17 10:51:27'),
(10, 1, 5, 'direct', NULL, NULL, 0.00, 500.00, NULL, 0.00, 500.00, 'ready', 'pending', 'pay_on_delivery', '2026-08-20 00:01:08', '2026-08-20 00:02:20'),
(11, 1, 3, 'direct', NULL, NULL, 0.00, 15000.00, NULL, 0.00, 15000.00, 'delivered', 'pending', 'pay_on_delivery', '2026-08-22 18:30:56', '2026-08-22 19:52:32'),
(12, 1, 3, 'direct', NULL, NULL, 0.00, 12000.00, NULL, 0.00, 12000.00, 'ready', 'pending', 'pay_on_delivery', '2026-08-22 20:02:25', '2026-08-22 20:35:58'),
(13, 1, 5, 'direct', NULL, NULL, 0.00, 70000.00, NULL, 0.00, 70000.00, 'processing', 'pending', 'pay_on_delivery', '2026-08-22 22:30:38', '2026-08-22 22:31:03'),
(14, 1, 3, 'direct', NULL, NULL, 0.00, 15000.00, NULL, 0.00, 15000.00, 'pending', 'pending', 'pay_on_delivery', '2026-08-22 23:05:36', '2026-08-22 23:05:36'),
(15, 1, 5, 'direct', NULL, NULL, 0.00, 70000.00, NULL, 0.00, 70000.00, 'delivered', 'pending', 'pay_on_delivery', '2026-08-22 23:05:36', '2026-08-22 23:31:40');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price_at_time` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price_at_time`, `subtotal`) VALUES
(5, 4, 19, 1, 500.00, 500.00),
(7, 6, 19, 1, 500.00, 500.00),
(8, 7, 19, 1, 500.00, 500.00),
(12, 10, 19, 1, 500.00, 500.00),
(13, 11, 24, 1, 15000.00, 15000.00),
(14, 12, 23, 1, 12000.00, 12000.00),
(15, 13, 22, 1, 70000.00, 70000.00),
(16, 14, 24, 1, 15000.00, 15000.00),
(17, 15, 22, 1, 70000.00, 70000.00);

-- --------------------------------------------------------

--
-- Table structure for table `price_table_items`
--

CREATE TABLE `price_table_items` (
  `id` int(11) NOT NULL,
  `trader_id` int(11) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `unit` varchar(20) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `sort_order` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `price_table_items`
--

INSERT INTO `price_table_items` (`id`, `trader_id`, `product_name`, `unit`, `price`, `sort_order`) VALUES
(1, 5, 'Umuceri', '1kg', 1200.00, 0),
(2, 5, 'Umugati', '1', 1000.00, 0),
(3, 5, 'Shirt', '1', 15000.00, 0);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `trader_id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `stock_quantity` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `trader_id`, `category_id`, `name`, `description`, `price`, `images`, `stock_quantity`, `is_active`, `created_at`, `updated_at`) VALUES
(19, 5, 1, 'Olima jiuce', 'Ikozwe mu biribwa biryoshye cyane', 500.00, '[\"/uploads/images-1786909156184-420174294.jpg\",\"/uploads/images-1786909156738-102468951.jpg\"]', 10, 1, '2026-08-16 19:39:17', '2026-08-16 19:39:17'),
(20, 5, 2, 'Smart Basket', 'Smart basket used to carry products from shop or anywhere', 2000.00, '[\"/uploads/images-1787061790378-347398945.png\"]', 20, 1, '2026-08-18 14:03:10', '2026-08-18 14:03:10'),
(21, 5, 3, 'Samsung Galaxy A15 128GB 4GB RAM', 'Affordable smartphone with a 6.5-inch Super AMOLED display, 128GB storage, 4GB RAM, 50MP main camera and 5000mAh battery.', 260000.00, '[\"/uploads/images-1787190595945-185432077.jpg\"]', 10, 1, '2026-08-20 01:49:58', '2026-08-20 01:49:58'),
(22, 5, 3, 'Samsung Galaxy Watch 7 40mm', 'Modern Samsung smartwatch with health and fitness tracking, notifications, apps and a compact design. The listed Rwanda starting price is RWF 318,320.', 70000.00, '[\"/uploads/images-1787190865489-86270922.jpg\"]', 5, 1, '2026-08-20 01:54:25', '2026-08-20 01:54:25'),
(23, 3, 2, 'Classic Black Knit Jumper', 'A simple black knitted jumper with long sleeves, a round neckline, and ribbed cuffs and hem. Easy to pair with jeans or trousers for everyday wear.', 12000.00, '[\"/uploads/images-1787191022124-901395306.jpg\"]', 5, 1, '2026-08-20 01:57:02', '2026-08-20 01:57:02'),
(24, 3, 3, 'Black Bluetooth HeadPhones', 'Comfortable over-ear wireless headphones with Bluetooth connectivity, built-in microphone, rechargeable battery, and clear sound for music, calls, and videos.', 15000.00, '[\"/uploads/images-1787191138496-792927292.jpg\"]', 5, 1, '2026-08-20 01:58:58', '2026-08-20 01:58:58'),
(25, 6, 4, 'Classic Black Leather Shoes', 'Elegant black leather-style shoes with a classic design, suitable for office wear, formal events, and everyday professional outfits.', 20000.00, '[\"/uploads/images-1787191268970-924443215.jpg\"]', 5, 1, '2026-08-20 02:01:09', '2026-08-20 02:01:09');

-- --------------------------------------------------------

--
-- Table structure for table `promo_codes`
--

CREATE TABLE `promo_codes` (
  `id` int(11) NOT NULL,
  `trader_id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `discount_type` enum('percentage','fixed') NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `usage_limit` int(11) DEFAULT NULL,
  `used_count` int(11) DEFAULT 0,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `promo_code_usage`
--

CREATE TABLE `promo_code_usage` (
  `id` int(11) NOT NULL,
  `promo_code_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `used_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `referral_rewards`
--

CREATE TABLE `referral_rewards` (
  `id` int(11) NOT NULL,
  `referrer_id` int(11) NOT NULL,
  `referred_user_id` int(11) NOT NULL,
  `points_awarded` int(11) NOT NULL,
  `awarded_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `target_type` enum('product','trader') NOT NULL,
  `target_id` int(11) NOT NULL,
  `rating` int(11) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `customer_id`, `target_type`, `target_id`, `rating`, `comment`, `created_at`) VALUES
(1, 1, 'product', 19, 4, 'nice juice', '2026-08-16 20:25:39');

-- --------------------------------------------------------

--
-- Table structure for table `trader_profiles`
--

CREATE TABLE `trader_profiles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `shop_name` varchar(100) NOT NULL,
  `district` varchar(50) DEFAULT NULL,
  `sector` varchar(50) DEFAULT NULL,
  `cell` varchar(50) DEFAULT NULL,
  `village` varchar(50) DEFAULT NULL,
  `coordinates` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `business_category` varchar(100) DEFAULT NULL,
  `payment_code` varchar(50) DEFAULT NULL,
  `payment_phone` varchar(20) DEFAULT NULL,
  `is_paid` tinyint(1) DEFAULT 1,
  `rating_avg` decimal(2,1) DEFAULT 0.0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trader_profiles`
--

INSERT INTO `trader_profiles` (`id`, `user_id`, `shop_name`, `district`, `sector`, `cell`, `village`, `coordinates`, `description`, `business_category`, `payment_code`, `payment_phone`, `is_paid`, `rating_avg`, `created_at`, `updated_at`) VALUES
(1, 2, '', '', '', '', '', '', '', '', '', '', 1, 0.0, '2026-08-10 14:19:15', '2026-08-20 00:47:13'),
(2, 3, '', '', '', '', '', '', '', '', '', '', 1, 0.0, '2026-08-10 19:02:56', '2026-08-20 00:48:07'),
(3, 4, '', '', '', '', '', '', 'Iam trader at Gaseke', '', '', '', 1, 0.0, '2026-08-10 19:31:55', '2026-08-20 00:49:04'),
(4, 5, '	Green Valley Organic Market', 'Rulindo', 'Bushoki', 'Gasiza', 'Gasiza', '-1.6825, 29.8112', 'I sell fresh organic vegetables and local fruits directly from my farm in Northern Province. Quality guaranteed.', '	Agriculture / Organic Produce', ' 0788123456 ', ' 0788123456 ', 1, 0.0, '2026-08-11 11:13:12', '2026-08-16 21:47:07'),
(5, 6, 'Gallery shop ', 'Gasabo', 'Kimisgara', 'Nyabugogo', 'Nyabugogo', '', 'I provide you with high quality products including phones, laptops', 'Electronics', '', '', 1, 0.0, '2026-08-11 14:48:45', '2026-08-18 13:27:47'),
(7, 17, 'Keza\'s Shop', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.0, '2026-08-15 17:21:49', '2026-08-15 17:21:49');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `role` enum('customer','trader','agent','admin') DEFAULT 'customer',
  `google_id` varchar(255) DEFAULT NULL,
  `referral_code` varchar(20) NOT NULL,
  `referred_by` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `push_token` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `username`, `email`, `phone`, `password_hash`, `profile_image`, `description`, `role`, `google_id`, `referral_code`, `referred_by`, `is_active`, `created_at`, `updated_at`, `push_token`) VALUES
(1, 'Mugisha', 'mugisha', 'mugisha@gmail.com', '0783821838', '$2b$10$nwYjiGQQs4b0Jx33x0yS8uSI4GGG6BbZ151Nf5Vk9ySqIf7Xjdqnm', '/uploads/profile-1786916113916-234716556.png', '', 'customer', NULL, 'UMC-2026', NULL, 1, '2026-08-10 12:05:20', '2026-08-16 21:35:13', NULL),
(2, 'Jimmy Frank', 'jimmy', 'tjimmyfrank@gmail.com', '0796310037', '$2b$10$qsGdc8fbVVtFmeitp2Dq1OK9GArUECkSzsQ07vcyMpLKgpg0X1rOO', '/uploads/profile-1787186833060-860307264.jpeg', '', 'trader', NULL, 'UMUC-2026', NULL, 1, '2026-08-10 14:19:14', '2026-08-20 00:47:13', NULL),
(3, 'Jiseline', 'jose', 'joselineuwineza64@gmail.com', '0783821835', '$2b$10$bbfi8edvNpr8Br6sDEq0We3sqmGcFgkOCv7zTNFQ.R1QT58uskg6.', '/uploads/profile-1787186886986-643672636.jpeg', '', 'trader', NULL, 'UMUNK74V7', NULL, 1, '2026-08-10 19:02:56', '2026-08-20 00:48:06', NULL),
(4, 'Migabo', 'mugabo123', 'jeanboscohitimana256@gmail.com', '0728438396', '$2b$10$SdO6s5PSN766qmTWs1BV3ugnkzdAiRn6LVclm5/PjQpvjqyENEkiS', '/uploads/profile-1787186944492-96382901.jpeg', 'Iam trader at Gaseke', 'trader', NULL, 'UMU3ULEQD', NULL, 1, '2026-08-10 19:31:55', '2026-08-20 00:49:04', NULL),
(5, 'saja', 'sam', 'samjacksonnzayirambaho@gmail.com', '0728010374', '$2b$10$vZ3afis9ntXcp4vJgaYcBuurdUNSvR9SVgOiqXWRGCSn3wG8bBZg.', '/uploads/profile-1786916937765-156838515.jpeg', 'I sell fresh organic vegetables and local fruits directly from my farm in Northern Province. Quality guaranteed.', 'trader', NULL, 'UMUG1ACH9', NULL, 1, '2026-08-11 11:13:12', '2026-08-16 21:48:57', NULL),
(6, 'Man', 'man', 'man@gmail.com', '0785236943', '$2b$10$.18ZDxIYMlU9i16mlyTWfO2se2kcbTa9n750uV3ZT.Rn74CRwUXAu', '/uploads/profile-1787057550204-63705753.png', 'I provide you with high quality products including phones, laptops', 'trader', NULL, 'UMU3UQVPH', NULL, 1, '2026-08-11 14:48:45', '2026-08-18 12:52:30', NULL),
(14, 'System Administrator', 'admin', 'admin@umucuruzi.rw', '0780000000', '$2b$10$9jvZb/ybzA5M2dk701mNEOSgr3J4c6xJkitk0IbU6yyYELgUqBwqa', NULL, NULL, 'admin', NULL, 'ADMIN-2026', NULL, 1, '2026-08-12 20:55:12', '2026-08-12 20:55:12', NULL),
(16, 'jimmyf', 'jimmyf', 'jimmyfrank@gmail.com', '0796310034', '$2b$10$Cg09dYbsFuJAFSWM3ywAqOuAqoeqRef5YJEgNaXPRyc5iYYjX/F2S', NULL, NULL, 'admin', NULL, 'ADMIN-E8IJSP', NULL, 1, '2026-08-12 21:14:37', '2026-08-12 21:14:37', NULL),
(17, 'Keza', 'keza', 'keza@gmail.com', '0786543212', '$2b$10$U3XT1in1vEPxZeDf6SWz4uwin1C1c05DJBtOBIuqAM4SNCKeoSSEu', '/uploads/profile-1786814509542-509481206.jpg', 'Amashati , amapnataro,imipira,inkweto nibindi', 'trader', NULL, 'UMUVU5J3I', NULL, 1, '2026-08-15 17:21:49', '2026-08-15 17:21:49', NULL),
(18, 'Alice', 'alice', 'alice@gmail.com', '0788987654', '$2b$10$4q9TgWth85NYDW3x9XrQjOtwI.wXEZSGtAj4Z8/IxrV2iAbZpvWHe', '/uploads/profile-1787220579123-918672312.jpeg', 'I am agent , makeing safe delivery of products to customer home', 'agent', NULL, 'UMULKN808', NULL, 1, '2026-08-16 20:44:14', '2026-08-20 10:09:39', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `advertisements`
--
ALTER TABLE `advertisements`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `app_settings`
--
ALTER TABLE `app_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`),
  ADD UNIQUE KEY `setting_key_2` (`setting_key`),
  ADD UNIQUE KEY `setting_key_3` (`setting_key`),
  ADD UNIQUE KEY `setting_key_4` (`setting_key`),
  ADD UNIQUE KEY `setting_key_5` (`setting_key`),
  ADD UNIQUE KEY `setting_key_6` (`setting_key`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customer_trader_loyalty`
--
ALTER TABLE `customer_trader_loyalty`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `customer_id` (`customer_id`,`trader_id`),
  ADD KEY `trader_id` (`trader_id`);

--
-- Indexes for table `delivery_assignments`
--
ALTER TABLE `delivery_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `agent_id` (`agent_id`);

--
-- Indexes for table `markets`
--
ALTER TABLE `markets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `market_memberships`
--
ALTER TABLE `market_memberships`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `market_id` (`market_id`,`trader_id`),
  ADD KEY `trader_id` (`trader_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `trader_id` (`trader_id`),
  ADD KEY `delivery_agent_id` (`delivery_agent_id`),
  ADD KEY `promo_code_id` (`promo_code_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `price_table_items`
--
ALTER TABLE `price_table_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trader_id` (`trader_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trader_id` (`trader_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `promo_codes`
--
ALTER TABLE `promo_codes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `code_2` (`code`),
  ADD UNIQUE KEY `code_3` (`code`),
  ADD UNIQUE KEY `code_4` (`code`),
  ADD UNIQUE KEY `code_5` (`code`),
  ADD UNIQUE KEY `code_6` (`code`),
  ADD KEY `trader_id` (`trader_id`);

--
-- Indexes for table `promo_code_usage`
--
ALTER TABLE `promo_code_usage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `promo_code_id` (`promo_code_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `referral_rewards`
--
ALTER TABLE `referral_rewards`
  ADD PRIMARY KEY (`id`),
  ADD KEY `referrer_id` (`referrer_id`),
  ADD KEY `referred_user_id` (`referred_user_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `trader_profiles`
--
ALTER TABLE `trader_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD UNIQUE KEY `referral_code` (`referral_code`),
  ADD UNIQUE KEY `username_2` (`username`),
  ADD UNIQUE KEY `phone_2` (`phone`),
  ADD UNIQUE KEY `referral_code_2` (`referral_code`),
  ADD UNIQUE KEY `username_3` (`username`),
  ADD UNIQUE KEY `phone_3` (`phone`),
  ADD UNIQUE KEY `referral_code_3` (`referral_code`),
  ADD UNIQUE KEY `username_4` (`username`),
  ADD UNIQUE KEY `phone_4` (`phone`),
  ADD UNIQUE KEY `referral_code_4` (`referral_code`),
  ADD UNIQUE KEY `username_5` (`username`),
  ADD UNIQUE KEY `phone_5` (`phone`),
  ADD UNIQUE KEY `referral_code_5` (`referral_code`),
  ADD UNIQUE KEY `username_6` (`username`),
  ADD UNIQUE KEY `phone_6` (`phone`),
  ADD UNIQUE KEY `referral_code_6` (`referral_code`),
  ADD UNIQUE KEY `username_7` (`username`),
  ADD UNIQUE KEY `phone_7` (`phone`),
  ADD UNIQUE KEY `referral_code_7` (`referral_code`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `google_id` (`google_id`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `google_id_2` (`google_id`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `google_id_3` (`google_id`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `google_id_4` (`google_id`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `google_id_5` (`google_id`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `google_id_6` (`google_id`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `google_id_7` (`google_id`),
  ADD KEY `referred_by` (`referred_by`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `advertisements`
--
ALTER TABLE `advertisements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `app_settings`
--
ALTER TABLE `app_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `customer_trader_loyalty`
--
ALTER TABLE `customer_trader_loyalty`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `delivery_assignments`
--
ALTER TABLE `delivery_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `markets`
--
ALTER TABLE `markets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `market_memberships`
--
ALTER TABLE `market_memberships`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `price_table_items`
--
ALTER TABLE `price_table_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `promo_codes`
--
ALTER TABLE `promo_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `promo_code_usage`
--
ALTER TABLE `promo_code_usage`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `referral_rewards`
--
ALTER TABLE `referral_rewards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `trader_profiles`
--
ALTER TABLE `trader_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_11` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `cart_items_ibfk_12` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `customer_trader_loyalty`
--
ALTER TABLE `customer_trader_loyalty`
  ADD CONSTRAINT `customer_trader_loyalty_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customer_trader_loyalty_ibfk_2` FOREIGN KEY (`trader_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `delivery_assignments`
--
ALTER TABLE `delivery_assignments`
  ADD CONSTRAINT `delivery_assignments_ibfk_11` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `delivery_assignments_ibfk_12` FOREIGN KEY (`agent_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `markets`
--
ALTER TABLE `markets`
  ADD CONSTRAINT `markets_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `market_memberships`
--
ALTER TABLE `market_memberships`
  ADD CONSTRAINT `market_memberships_ibfk_11` FOREIGN KEY (`market_id`) REFERENCES `markets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `market_memberships_ibfk_12` FOREIGN KEY (`trader_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_21` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_22` FOREIGN KEY (`trader_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_23` FOREIGN KEY (`delivery_agent_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_24` FOREIGN KEY (`promo_code_id`) REFERENCES `promo_codes` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_11` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_12` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `price_table_items`
--
ALTER TABLE `price_table_items`
  ADD CONSTRAINT `price_table_items_ibfk_1` FOREIGN KEY (`trader_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_13` FOREIGN KEY (`trader_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_14` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `promo_codes`
--
ALTER TABLE `promo_codes`
  ADD CONSTRAINT `promo_codes_ibfk_1` FOREIGN KEY (`trader_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `promo_code_usage`
--
ALTER TABLE `promo_code_usage`
  ADD CONSTRAINT `promo_code_usage_ibfk_16` FOREIGN KEY (`promo_code_id`) REFERENCES `promo_codes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `promo_code_usage_ibfk_17` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `promo_code_usage_ibfk_18` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `referral_rewards`
--
ALTER TABLE `referral_rewards`
  ADD CONSTRAINT `referral_rewards_ibfk_1` FOREIGN KEY (`referrer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `referral_rewards_ibfk_2` FOREIGN KEY (`referred_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `trader_profiles`
--
ALTER TABLE `trader_profiles`
  ADD CONSTRAINT `trader_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`referred_by`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
