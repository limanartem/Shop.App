USE Catalog;
-- Categories
INSERT INTO Categories (id, parentCategoryId, name) VALUES
-- 1st level
(1, NULL, 'Electronics'),
(2, NULL, 'Clothes'),
(3, NULL, 'Toys'),
(4, NULL, 'PC Accessories'),
(5, NULL, 'Home & Furniture'),
-- 2nd level
(6, 1, 'Smartphones'),
(7, 1, 'Laptops'),
(8, 1, 'Accessories'),
(9, 2, 'Men''s Clothing'),
(10, 2, 'Women''s Clothing'),
(11, 2, 'Footwear'),
(12, 3, 'Action Figures'),
(13, 3, 'Board Games'),
(14, 3, 'Outdoor Toys'),
(15, 4, 'Keyboards'),
(16, 4, 'Mice'),
(17, 4, 'Monitors'),
(18, 5, 'Living Room'),
(19, 5, 'Bedroom'),
(20, 5, 'Kitchen'),
-- 3rd level
(21, 6, 'High-End Smartphones'),
(22, 6, 'Budget Smartphones'),
(23, 7, 'Gaming Laptops'),
(24, 7, 'Business Laptops'),
(25, 9, 'Men''s Shirts'),
(26, 9, 'Men''s Pants'),
(27, 10, 'Women''s Dresses'),
(28, 10, 'Women''s Skirts'),
(29, 12, 'Superhero Action Figures'),
(30, 12, 'Animal Toy Figures'),
(31, 13, 'Strategic Board Games'),
(32, 13, 'Family Board Games'),
(33, 15, 'Mechanical Keyboards'),
(34, 15, 'Wireless Keyboards'),
(35, 16, 'Wired Mice'),
(36, 16, 'Wireless Mice'),
(37, 18, 'Living Room Sofas'),
(38, 18, 'Living Room Coffee Tables'),
(39, 19, 'Bedroom Beds'),
(40, 19, 'Bedroom Wardrobes'),
(41, 20, 'Kitchen Cookware'),
(42, 20, 'Kitchen Utensils'),
(43, 21, 'Premium Smartphones'),
(44, 21, 'Budget Smartphones'),
(45, 22, 'Gaming Laptops'),
(46, 22, 'Business Laptops'),
(47, 23, 'Casual Men''s Shirts'),
(48, 23, 'Formal Men''s Shirts'),
(49, 24, 'Summer Dresses'),
(50, 24, 'Evening Gowns'),
(51, 25, 'Superhero Shirts'),
(52, 25, 'Casual Men''s Pants'),
(53, 26, 'Formal Women''s Dresses');


-- Continue the script with product insertion...

INSERT INTO Products (id, categoryId, title, description, price, currency, previewImageUrls) VALUES
('a9358e49-6eb8-4f93-85f8-d446b0ed9a9b', 21, 'Flagship Smartphone', 'Top-of-the-line smartphone with cutting-edge features', 999.99, 'USD', '["flagship_phone_image.jpg"]'),
('7f8618fb-7075-45a5-95b5-5bb5eb7f678a', 21, 'Premium Camera Phone', 'Smartphone with high-quality camera for photography enthusiasts', 1099.99, 'USD', '["camera_phone_image.jpg"]'),
('2e20dcd1-2cb5-4ff8-bc01-bbf0a63205c3', 23, 'Powerful Gaming Laptop', 'Gaming laptop with high-performance graphics and processing power', 1299.99, 'USD', '["gaming_laptop_image.jpg"]'),
('10c525ff-8c91-46b2-8812-3a6feab49e1e', 23, 'Business Laptop', 'Laptop designed for professional use with business-friendly features', 899.99, 'USD', '["business_laptop_image.jpg"]'),
('a0f3a9d8-9ce1-4c57-8d6b-2c8c9973486f', 22, 'Budget Friendly Phone', 'Affordable smartphone with essential features', 299.99, 'USD', '["budget_phone_image.jpg"]'),
('9e862689-31a5-4c9b-b072-d46d743e1f8c', 22, 'Entry-Level Smartphone', 'Basic smartphone for everyday use', 199.99, 'USD', '["entry_level_phone_image.jpg"]'),
('56d8e6c7-8e1d-44e5-a98a-0cb6a156a013', 25, 'Casual Shirt', 'Comfortable and stylish shirt for casual occasions', 29.99, 'USD', '["casual_shirt_image.jpg"]'),
('d5b67ab4-2f9f-4d76-ae8a-6fc2c47df7b3', 25, 'Formal Shirt', 'Classic formal shirt for professional attire', 39.99, 'USD', '["formal_shirt_image.jpg"]'),
('4185b5e1-f2f2-4e0b-9fe7-c0f567d4eb13', 27, 'Summer Dress', 'Light and breezy dress for summer events', 49.99, 'USD', '["summer_dress_image.jpg"]'),
('da8247d5-1295-4b43-8c05-8e005ac73e0d', 27, 'Evening Gown', 'Elegant evening gown for special occasions', 99.99, 'USD', '["evening_gown_image.jpg"]'),
('ecd1b8c5-ea41-4bc2-b968-b601330b5f45', 29, 'Superhero Action Figure', 'Collectible superhero action figure for fans', 15.99, 'USD', '["superhero_figure_image.jpg"]'),
('e5af8e25-d674-4ef6-b70e-015bd9e570b4', 29, 'Animal Toy Set', 'Set of cute animal toys for imaginative play', 19.99, 'USD', '["animal_toy_set_image.jpg"]'),
('dc52c2d5-b869-4be6-bd7c-c4f1b9c4f827', 31, 'Strategic Board Game', 'Board game that requires strategic thinking and planning', 34.99, 'USD', '["strategic_board_game_image.jpg"]'),
('86463be3-5dbb-4b21-8bfc-5a34ec4a481d', 31, 'Family Fun Game', 'Enjoyable board game for the whole family', 24.99, 'USD', '["family_fun_game_image.jpg"]'),
('a534bf8b-d56c-4ba9-ae1f-185cd871d25f', 33, 'Outdoor Play Set', 'Set of toys for outdoor play and activities', 49.99, 'USD', '["outdoor_play_set_image.jpg"]'),
('0c58acbb-34b8-4a07-ae5a-3f95e6f93e8d', 33, 'Kids Bicycle', 'Colorful bicycle for kids with training wheels', 79.99, 'USD', '["kids_bicycle_image.jpg"]'),
('3a2315da-5e43-44c2-b287-3a5010f16743', 35, 'Mechanical Gaming Keyboard', 'High-performance mechanical keyboard for gaming enthusiasts', 79.99, 'USD', '["mechanical_keyboard_image.jpg"]'),
('d3b1db7d-c047-4cc9-bb95-5e54df8f2c3c', 35, 'Wireless Gaming Mouse', 'Wireless mouse designed for precise gaming control', 59.99, 'USD', '["wireless_gaming_mouse_image.jpg"]'),
('edcf2147-dde8-4f48-91a4-336b5ec7757d', 37, 'Comfortable Sofa', 'Spacious and comfortable sofa for the living room', 499.99, 'USD', '["comfortable_sofa_image.jpg"]'),
('e4973e4e-6abf-4b97-a6e6-081b84768f4d', 37, 'Modern Coffee Table', 'Sleek and modern coffee table for the living room', 149.99, 'USD', '["modern_coffee_table_image.jpg"]'),
('e84de3e4-8efc-4fb0-a6e5-efa258d243b8', 39, 'Queen Size Bed', 'Stylish queen-size bed for a comfortable night''s sleep', 699.99, 'USD', '["queen_size_bed_image.jpg"]'),
('c2f3ea19-2fc8-4b59-af9d-2f3de9ac4f64', 39, 'Wardrobe with Mirror', 'Spacious wardrobe with a built-in mirror', 349.99, 'USD', '["wardrobe_with_mirror_image.jpg"]'),
('9c9bbd2b-aa62-4df4-bb5e-02da8a9447ef', 41, 'Non-Stick Cookware Set', 'Complete set of non-stick cookware for the kitchen', 79.99, 'USD', '["non_stick_cookware_set_image.jpg"]'),
('b20c579b-91b3-4f0a-96db-2d2b24e63a72', 41, 'Stainless Steel Utensil Set', 'Durable stainless steel utensils for cooking and serving', 39.99, 'USD', '["stainless_steel_utensil_set_image.jpg"]'),
('5a997bea-65d5-48e9-8a9a-c18a6b93658d', 23, 'Ultra-Thin Laptop', 'Sleek and lightweight laptop for on-the-go professionals', 1099.99, 'USD', '["ultra_thin_laptop_image.jpg"]'),
('fe9a281b-9cb6-4594-9127-c1d4cb553b8b', 23, 'Convertible Touchscreen Laptop', 'Versatile laptop with a touchscreen for various use modes', 1299.99, 'USD', '["convertible_laptop_image.jpg"]'),
('0a26d52a-5a6c-4de3-a4ea-1f9d137537d5', 22, 'Mid-Range Smartphone', 'Balanced smartphone with good features at an affordable price', 449.99, 'USD', '["mid_range_phone_image.jpg"]'),
('f99e3c56-924e-4ec8-9f9e-1ec9631d5b27', 22, 'Basic Phone', 'Simple and reliable phone for essential communication', 149.99, 'USD', '["basic_phone_image.jpg"]'),
('a7c4d9a7-8e58-4a9f-a38f-9d50e6ef3ccf', 25, 'Casual T-Shirt', 'Comfortable and casual t-shirt for everyday wear', 14.99, 'USD', '["casual_tshirt_image.jpg"]'),
('4f9f54fb-e65c-431a-9d8c-6e9df7c100d7', 25, 'Denim Jeans', 'Classic denim jeans for a timeless look', 34.99, 'USD', '["denim_jeans_image.jpg"]'),
('96db9294-e4e3-470d-b7e3-6f354f4143bd', 27, 'Maxi Dress', 'Elegant and stylish maxi dress for special occasions', 59.99, 'USD', '["maxi_dress_image.jpg"]'),
('e2c6f7f2-1fb7-4eac-b856-8cf995c8f720', 27, 'Printed Skirt', 'Fashionable printed skirt for a trendy look', 24.99, 'USD', '["printed_skirt_image.jpg"]'),
('1f8a4c9b-31c2-4757-b0f4-437f2ce08cb8', 29, 'Dinosaur Action Figure Set', 'Set of dinosaur action figures for young enthusiasts', 19.99, 'USD', '["dinosaur_action_figure_set_image.jpg"]'),
('ac27a019-3ef9-45cd-8f7d-07c6b4e06eb4', 29, 'Construction Vehicle Toy Set', 'Collection of construction vehicle toys for imaginative play', 29.99, 'USD', '["construction_vehicle_toy_set_image.jpg"]'),
('cd8f0c97-91d5-4d72-84cd-e781666afda0', 31, 'Classic Chess Set', 'Traditional chess set for strategic and intellectual play', 44.99, 'USD', '["classic_chess_set_image.jpg"]'),
('6f88b982-4461-4a01-8f38-e74ba086cf1d', 31, 'Party Card Game', 'Fun and entertaining card game for social gatherings', 14.99, 'USD', '["party_card_game_image.jpg"]'),
('e52d720e-4a6d-4df2-bc3a-bd10c09412aa', 33, 'Inflatable Pool', 'Large inflatable pool for outdoor summer fun', 79.99, 'USD', '["inflatable_pool_image.jpg"]'),
('2f0643e4-55db-4a7e-9d29-2f7913adfbf0', 33, 'Remote Control Car', 'Remote control car for exciting races and maneuvers', 39.99, 'USD', '["remote_control_car_image.jpg"]'),
('6f232152-7f0f-4d7e-80c6-857d1cc0370b', 35, 'RGB Backlit Gaming Keyboard', 'Gaming keyboard with customizable RGB backlighting', 89.99, 'USD', '["rgb_backlit_gaming_keyboard_image.jpg"]'),
('2a8f7e69-b7d7-47e7-86e9-8d080f321ccf', 35, 'Wireless Gaming Headset', 'Wireless headset for immersive gaming audio experience', 69.99, 'USD', '["wireless_gaming_headset_image.jpg"]'),
('dcb047f3-2ad9-4909-8e6f-0ad1e8d30a2f', 37, 'Leather Recliner', 'Luxurious leather recliner for ultimate relaxation', 799.99, 'USD', '["leather_recliner_image.jpg"]'),
('c8d82aef-b3b7-4f7f-bd2f-70c6a0aa1f56', 37, 'Modern Side Table', 'Stylish side table to complement your living room furniture', 59.99, 'USD', '["modern_side_table_image.jpg"]'),
('5b19313e-8a84-4ef9-b28c-fc20aaf25836', 39, 'King Size Bed', 'Spacious king-size bed for a luxurious bedroom setup', 999.99, 'USD', '["king_size_bed_image.jpg"]'),
('df09a489-fcd6-4a33-8a15-aa46e3f9b95e', 39, 'Dresser with Mirror', 'Functional dresser with a built-in mirror for your bedroom', 349.99, 'USD', '["dresser_with_mirror_image.jpg"]'),
('08b2a32e-0e77-4214-895d-79376801d0bf', 41, 'Stainless Steel Cookware Set', 'High-quality stainless steel cookware set for versatile cooking', 119.99, 'USD', '["stainless_steel_cookware_set_image.jpg"]'),
('a87c31d2-7c14-4da4-8be9-b7e87057dbd3', 41, 'Wooden Utensil Set', 'Durable wooden utensils for a natural and rustic kitchen', 29.99, 'USD', '["wooden_utensil_set_image.jpg"]'),
('d7522c01-0b1d-4e03-9f1f-6b25e77f5f1c', 43, 'UltraWide Curved Monitor', 'Immersive UltraWide curved monitor for enhanced productivity', 499.99, 'USD', '["ultrawide_curved_monitor_image.jpg"]'),
('c4d24b3c-dc7a-41f4-9db6-6d9a24eb915a', 43, 'Dual Monitor Stand', 'Adjustable dual monitor stand for a clutter-free workspace', 89.99, 'USD', '["dual_monitor_stand_image.jpg"]'),
('9e9cf36a-09ea-4f37-b2fb-1b6a442399d4', 45, 'Cozy Sectional Sofa', 'Comfortable sectional sofa for spacious living rooms', 899.99, 'USD', '["cozy_sectional_sofa_image.jpg"]'),
('f14a59a3-5db2-4b9d-b9dd-f307d35d951c', 45, 'Glass Coffee Table', 'Modern glass coffee table to add elegance to your living space', 149.99, 'USD', '["glass_coffee_table_image.jpg"]'),
('b61f56c0-5b0e-4772-8f4d-4f94d115ab17', 47, 'Adjustable Standing Desk', 'Ergonomic standing desk for a flexible and healthy workspace', 299.99, 'USD', '["adjustable_standing_desk_image.jpg"]'),
('e5a53bd7-7b2d-45a2-b9b4-5701bd8b1782', 47, 'Office Chair with Lumbar Support', 'Office chair designed for comfort with lumbar support', 129.99, 'USD', '["office_chair_with_lumbar_support_image.jpg"]'),
('a0c15b7d-7b57-4011-86e1-fd9e3a944cf9', 49, 'Rustic Dining Table', 'Rustic-style dining table for a charming dining area', 399.99, 'USD', '["rustic_dining_table_image.jpg"]'),
('f8b10516-8f5b-4a63-b5cd-8920f1b4ee18', 49, 'Upholstered Dining Chairs', 'Comfortable upholstered dining chairs for stylish seating', 69.99, 'USD', '["upholstered_dining_chairs_image.jpg"]'),
('b60baa9a-9bc1-4f3a-87f4-7f148f4a1cd4', 51, 'Smart LED TV', 'High-quality smart LED TV for an immersive entertainment experience', 799.99, 'USD', '["smart_led_tv_image.jpg"]'),
('d0d1e28b-0e1d-46d1-8eb2-5a7cb69613f2', 51, 'Media Console with Storage', 'Media console with ample storage space for your entertainment setup', 299.99, 'USD', '["media_console_with_storage_image.jpg"]'),
('94e60cf0-0b1e-4e2a-80d5-775db963b9c2', 53, 'Non-Stick Bakeware Set', 'Complete set of non-stick bakeware for delicious baking', 59.99, 'USD', '["non_stick_bakeware_set_image.jpg"]'),
('fa25595d-2b47-49a3-99df-7ebe7d075534', 53, 'Chef''s Knife Set', 'Professional chef''s knife set for precision cutting and chopping', 89.99, 'USD', '["chefs_knife_set_image.jpg"]'),
('bcf15234-cd8f-4dbd-bbb0-3f0e3c5e8e72', 29, 'Interactive Dinosaur Toy Set with Play Mat', 'Interactive dinosaur toy set with a play mat for kids', 39.99, 'USD', '["interactive_dinosaur_toy_set_play_mat_image.jpg"]'),
('0e80d628-5e25-46c8-99c2-d0a5e7e1b06b', 29, 'Realistic Construction Crane Toy', 'Realistic construction crane toy for imaginative play', 24.99, 'USD', '["realistic_construction_crane_toy_image.jpg"]'),
('ac9153af-d0e1-464c-80f5-3be365e92e10', 31, 'Classic Wooden Chess Board', 'High-quality wooden chess board for classic and strategic play', 59.99, 'USD', '["classic_wooden_chess_board_image.jpg"]'),
('ecdcf2b5-3a17-4b5a-9ac6-1a3b9b4c1c7b', 31, 'Family Card Game Set for Fun Evenings', 'Set of card games for family-friendly entertainment', 19.99, 'USD', '["family_card_game_set_image.jpg"]'),
('a8cb6ed9-22f2-4e4a-b9f9-83ac265a94ab', 33, 'Inflatable Kiddie Pool for Toddlers', 'Safe and fun inflatable kiddie pool for toddlers', 29.99, 'USD', '["inflatable_kiddie_pool_for_toddlers_image.jpg"]'),
('cb7c42d0-3018-4e54-9cf9-7248ec3b07dd', 33, 'Remote Control Racing Car for Kids', 'Fast and agile remote control racing car for kids', 19.99, 'USD', '["remote_control_racing_car_for_kids_image.jpg"]'),
('d7a1c1b3-91ec-4a66-9f16-0367bce36689', 35, 'Mechanical Gaming Keyboard for Gamers', 'High-performance mechanical gaming keyboard for gamers', 79.99, 'USD', '["mechanical_gaming_keyboard_for_gamers_image.jpg"]'),
('b6e0f6a3-438d-4905-bcd3-6d4749aa9712', 35, 'Wireless Gaming Mouse with Precision', 'Responsive and precise wireless gaming mouse for gamers', 49.99, 'USD', '["wireless_gaming_mouse_with_precision_image.jpg"]'),
('55fcfc89-9658-4d18-9c98-4c27b8f02b2d', 37, 'Luxurious Leather Sectional Sofa', 'Luxurious leather sectional sofa for spacious living rooms', 1199.99, 'USD', '["luxurious_leather_sectional_sofa_image.jpg"]'),
('9c064c17-13fe-4e07-8f23-bca0bf2dd47e', 37, 'Sleek Glass Top Coffee Table', 'Modern glass top coffee table for a sleek living room', 179.99, 'USD', '["sleek_glass_top_coffee_table_image.jpg"]'),
('96d90554-6e69-4f1d-a825-39b10b1bba1b', 39, 'California King Size Bed for a Luxurious Bedroom', 'Spacious California king-size bed for a luxurious bedroom', 1299.99, 'USD', '["california_king_size_bed_luxurious_bedroom_image.jpg"]'),
('feb26220-9a5f-4cbf-a8ae-847aa0192ae0', 39, 'Elegant Mirrored Dresser for a Glamorous Setup', 'Elegant mirrored dresser for a glamorous bedroom setup', 499.99, 'USD', '["elegant_mirrored_dresser_glamorous_bedroom_setup_image.jpg"]'),
('82a45236-bfd6-49da-8d42-2f0518c97221', 41, 'Stainless Steel Cookware Set for Professional Cooking', 'Professional-grade stainless steel cookware set for the kitchen', 149.99, 'USD', '["stainless_steel_cookware_set_professional_cooking_image.jpg"]'),
('3a9f5f5b-51f5-44f0-b348-1b914f5d0a18', 41, 'Eco-Friendly Bamboo Utensil Set for Sustainable Cooking', 'Eco-friendly bamboo utensil set for sustainable cooking', 29.99, 'USD', '["eco_friendly_bamboo_utensil_set_sustainable_cooking_image.jpg"]'),
('5402b6e9-f3ac-4a0b-9da5-61e64739c61d', 21, 'iPhone 13 Pro Max', 'The latest iPhone with a stunning Pro Max display', 1299.99, 'USD', '["iphone_13_pro_max_image.jpg"]'),
('3b14b513-7bbf-448e-b16c-43b27e058d7e', 21, 'Samsung Galaxy Z Fold 3', 'Foldable smartphone for ultimate multitasking', 1799.99, 'USD', '["samsung_galaxy_z_fold_3_image.jpg"]'),
('c242d5c0-0a14-45d6-bc5f-8cc621f1d098', 23, 'Alienware m15 R6 Gaming Laptop', 'Powerful gaming laptop with high refresh rate display', 1999.99, 'USD', '["alienware_m15_r6_gaming_laptop_image.jpg"]'),
('a6dbbdc8-50cc-4b8f-88b5-583e876ac498', 23, 'Dell XPS 13', 'Compact and powerful ultrabook for everyday use', 1299.99, 'USD', '["dell_xps_13_ultrabook_image.jpg"]'),
('f5de38f2-7a52-4ec0-bc05-870c3cbbe4e7', 8, 'Logitech MX Anywhere 3 Mouse', 'Versatile and compact wireless mouse for on-the-go use', 79.99, 'USD', '["logitech_mx_anywhere_3_mouse_image.jpg"]'),
('c9010591-5de4-4db5-b568-835ff6a7a004', 8, 'Anker PowerCore Slim 10000', 'Ultra-slim portable charger for smartphones and devices', 29.99, 'USD', '["anker_powercore_slim_10000_image.jpg"]'),
('8e8e4f3c-4b80-4a9d-bf35-570e11965d23', 47, 'Casual Slim Fit Men''s Shirt', 'Comfortable and stylish casual shirt for men', 39.99, 'USD', '["casual_slim_fit_mens_shirt_image.jpg"]'),
('c89c5f7d-b72d-45a4-9946-17ea5b378ea0', 47, 'Formal Business Men''s Shirt', 'Classic formal shirt for a professional look', 49.99, 'USD', '["formal_business_mens_shirt_image.jpg"]'),
('f619d6ae-6f99-493a-8d90-b899923abfe5', 48, 'Summer Floral Women''s Dress', 'Light and breezy summer dress with floral print', 59.99, 'USD', '["summer_floral_womens_dress_image.jpg"]'),
('ab93c110-2658-4d5b-9b4e-31aae0c3431d', 48, 'Formal Evening Gown', 'Elegant evening gown for special occasions', 149.99, 'USD', '["formal_evening_gown_image.jpg"]'),
('d4f0e0c2-20d9-4e53-a2ec-5ab4fb4d1d98', 29, 'Marvel Legends Iron Man Action Figure', 'Highly detailed Iron Man action figure for collectors', 29.99, 'USD', '["marvel_legends_iron_man_action_figure_image.jpg"]'),
('de0b071c-8aa2-43a1-9a7c-58e46048be6d', 29, 'DC Multiverse Batman Action Figure', 'Batman action figure with multiple points of articulation', 24.99, 'USD', '["dc_multiverse_batman_action_figure_image.jpg"]');

-- Toys -> Board Games
INSERT INTO Products (id, categoryId, title, description, price, currency, previewImageUrls) VALUES
('50885b0c-9f14-4fc0-b2fe-1c90e8eb1f0c', 31, 'Ticket to Ride Board Game', 'Strategy board game for train enthusiasts', 39.99, 'USD', '["ticket_to_ride_board_game_image.jpg"]'),
('f18c5ed1-ae7e-4f0b-97c3-3f3db8a07e2f', 31, 'Settlers of Catan Board Game', 'Classic board game of resource management and strategy', 44.99, 'USD', '["settlers_of_catan_board_game_image.jpg"]');

-- PC Accessories -> Keyboards
INSERT INTO Products (id, categoryId, title, description, price, currency, previewImageUrls) VALUES
('6e11e12b-57e9-4cda-84f0-0e3e06d2fb2a', 33, 'Corsair K95 RGB Platinum XT Keyboard', 'High-performance RGB mechanical gaming keyboard', 199.99, 'USD', '["corsair_k95_rgb_platinum_xt_keyboard_image.jpg"]'),
('a0e1f00d-3c24-4a47-9839-00f7dd19b1d4', 33, 'Logitech K380 Bluetooth Keyboard', 'Compact and versatile Bluetooth keyboard for multiple devices', 39.99, 'USD', '["logitech_k380_bluetooth_keyboard_image.jpg"]');

-- PC Accessories -> Mice
INSERT INTO Products (id, categoryId, title, description, price, currency, previewImageUrls) VALUES
('e7c70a49-9a8e-4c8b-b87a-c10ac799e964', 34, 'SteelSeries Rival 600 Gaming Mouse', 'Dual sensor gaming mouse for precise tracking', 79.99, 'USD', '["steelseries_rival_600_gaming_mouse_image.jpg"]'),
('e12a9f63-5a54-48a9-8ea5-6a3cf1a43225', 34, 'Logitech MX Vertical Ergonomic Mouse', 'Ergonomic vertical mouse for comfortable use and reduced strain', 99.99, 'USD', '["logitech_mx_vertical_ergonomic_mouse_image.jpg"]');

-- Home & Furniture -> Living Room
INSERT INTO Products (id, categoryId, title, description, price, currency, previewImageUrls) VALUES
('1a9b2b2d-3b3d-4b7c-90aa-ae0a5b3a3b92', 37, 'IKEA Karlstad Sofa', 'Simple and comfortable sofa for a cozy living room', 299.00, 'USD', '["ikea_karlstad_sofa_image.jpg"]'),
('6309cecf-5bb8-4a3c-b7cd-2fb45a9942c5', 37, 'West Elm Andes Sectional', 'Modern sectional sofa for spacious living rooms', 1499.00, 'USD', '["west_elm_andes_sectional_image.jpg"]');

-- Home & Furniture -> Bedroom
INSERT INTO Products (id, categoryId, title, description, price, currency, previewImageUrls) VALUES
('06f3e3f7-098e-40a3-9f8a-08c83aa847f7', 39, 'IKEA Hemnes Bed Frame', 'Classic bed frame for a comfortable night''s sleep', 249.00, 'USD', '["ikea_hemnes_bed_frame_image.jpg"]'),
('4d02b5a7-197d-4a58-b2cf-c91cd9a27b21', 39, 'Zinus Modern Upholstered Headboard', 'Stylish upholstered headboard for a modern bedroom', 99.00, 'USD', '["zinus_modern_upholstered_headboard_image.jpg"]');

-- Home & Furniture -> Kitchen
INSERT INTO Products (id, categoryId, title, description, price, currency, previewImageUrls) VALUES
('8f7d8f16-b9c9-4c4a-a1d4-6a5cd17f6bfe', 41, 'Cuisinart Stainless Steel Cookware Set', 'Complete stainless steel cookware set for the kitchen', 249.99, 'USD', '["cuisinart_stainless_steel_cookware_set_image.jpg"]'),
('a77c5589-ae9a-4e64-bc21-4e1306be2086', 41, 'Instant Pot Duo Evo Plus', 'Versatile electric pressure cooker for quick and easy meals', 119.99, 'USD', '["instant_pot_duo_evo_plus_image.jpg"]');

-- Category_E Exclusive Product
INSERT INTO Products (id, categoryId, title, description, price, currency, previewImageUrls) VALUES
('ba303a34-526f-42b5-9d4a-1a2c8bf33a91', 47, 'Luxury Leather Men''s Wallet', 'Handcrafted leather wallet for a touch of luxury', 79.99, 'USD', '["luxury_leather_mens_wallet_image.jpg"]'),
('f40de763-0425-446f-8812-2b5b1ef4ab46', 47, 'Designer Men''s Watch', 'Elegant designer watch for a sophisticated look', 149.99, 'USD', '["designer_mens_watch_image.jpg"]');

-- Category_F Signature Product
INSERT INTO Products (id, categoryId, title, description, price, currency, previewImageUrls) VALUES
('82c9a6f0-3fe0-4e9a-b37c-21f090d45338', 48, 'Signature Collection Women''s Handbag', 'Exquisite handbag from the Signature Collection', 129.99, 'USD', '["signature_collection_womens_handbag_image.jpg"]'),
('2e17b1c3-21cb-40ea-a688-153c070f450b', 48, 'Premium Women''s Sunglasses', 'Fashionable sunglasses with premium UV protection', 89.99, 'USD', '["premium_womens_sunglasses_image.jpg"]');

-- Category_G Prestige Product
INSERT INTO Products (id, categoryId, title, description, price, currency, previewImageUrls) VALUES
('8e52dd07-2549-4c39-87de-34d173a6d0c4', 49, 'Prestige Leather Men''s Shoes', 'Handcrafted leather shoes for a touch of prestige', 169.99, 'USD', '["prestige_leather_mens_shoes_image.jpg"]'),
('b2b7c7a1-7b98-46f0-9f88-5e4a8ec47b8f', 49, 'Luxury Women''s Handcrafted Necklace', 'Exquisite handcrafted necklace for a luxurious touch', 199.99, 'USD', '["luxury_womens_handcrafted_necklace_image.jpg"]');

-- Category_H Supreme Product
INSERT INTO Products (id, categoryId, title, description, price, currency, previewImageUrls) VALUES
('2d28f6e2-5b3c-4bda-8316-3875a9e16a6a', 50, 'Supreme Quality Men''s Suit', 'High-quality suit for a supreme and refined look', 399.99, 'USD', '["supreme_quality_mens_suit_image.jpg"]'),
('53949e89-7ed1-4e0c-ae96-49512c99a2bf', 50, 'Elegant Women''s Evening Gown', 'Elegance personified in this evening gown for women', 299.99, 'USD', '["elegant_womens_evening_gown_image.jpg"]');


-- Category_I Premium Product
INSERT INTO Products (id, categoryId, title, description, price, currency, previewImageUrls) VALUES
('d04ff5ea-fc87-4347-8edf-c1a192727aff', 51, 'Premium Leather Men''s Jacket', 'Stylish and durable leather jacket for a premium look', 249.99, 'USD', '["premium_leather_mens_jacket_image.jpg"]'),
('a13a3db4-25a2-4c0a-865d-dc601ea187d5', 51, 'Designer Women''s Handbag', 'Fashionable handbag designed for a premium touch', 179.99, 'USD', '["designer_womens_handbag_image.jpg"]');

-- Category_J Luxury Product
INSERT INTO Products (id, categoryId, title, description, price, currency, previewImageUrls) VALUES
('712a7b25-7578-4c1c-b4f5-aa86220f6d5d', 52, 'Luxury Men''s Watch', 'Exquisite timepiece crafted for a touch of luxury', 349.99, 'USD', '["luxury_mens_watch_image.jpg"]'),
('3df97f86-cce8-4eb1-8cf0-d8ed8e52fc67', 52, 'Premium Women''s Diamond Earrings', 'Elegant diamond earrings designed for a luxurious look', 499.99, 'USD', '["premium_womens_diamond_earrings_image.jpg"]');

-- Category_K Exclusive Product
INSERT INTO Products (id, categoryId, title, description, price, currency, previewImageUrls) VALUES
('1b5e1ac4-249e-46ef-9431-2bcab0ee7c17', 53, 'Exclusive Men''s Leather Briefcase', 'Handcrafted leather briefcase for an exclusive touch', 299.99, 'USD', '["exclusive_mens_leather_briefcase_image.jpg"]'),
('8e3a150e-946b-4d7b-b1b9-c02d4a1dfec0', 53, 'High-End Women''s Diamond Necklace', 'Exquisite diamond necklace designed for an exclusive look', 699.99, 'USD', '["high_end_womens_diamond_necklace_image.jpg"]');


INSERT INTO Products (id, categoryId, title, description, price, currency, previewImageUrls) VALUES
('6c5bf97a-7ee3-4bda-ae03-ef75c4e5c212', 21, 'Samsung Galaxy S21', 'Powerful flagship smartphone with a stunning display', 899.99, 'USD', '["samsung_galaxy_s21_image.jpg"]'),
('c44f10c4-7a82-4424-bc9a-df45069e3bc4', 21, 'iPhone 13', 'The latest iPhone with advanced camera capabilities', 999.99, 'USD', '["iphone_13_image.jpg"]'),
('7892ae38-4d79-4e53-8950-9b6a95168bf2', 21, 'Google Pixel 6 Pro', 'High-end Android smartphone with exceptional camera performance', 1099.99, 'USD', '["google_pixel_6_pro_image.jpg"]'),
('da4cc39b-c693-47c0-9f69-efc5af2b8c4a', 21, 'OnePlus 9 Pro', 'Flagship killer with fast performance and smooth display', 899.99, 'USD', '["oneplus_9_pro_image.jpg"]'),
('f59ea5e2-d5bb-4ad8-8e37-cc1f88db52f0', 21, 'Sony Xperia 1 III', 'Premium smartphone with a 4K HDR OLED display', 1199.99, 'USD', '["sony_xperia_1_iii_image.jpg"]'),
('8c1e1314-41c1-4294-8ce3-6c80f4ef7a2b', 21, 'Xiaomi Mi 11 Ultra', 'Feature-packed smartphone with a powerful camera system', 1099.99, 'USD', '["xiaomi_mi_11_ultra_image.jpg"]'),
('b5e5e3fe-5b95-40d0-bb4e-7c35c3f29f29', 21, 'LG Wing 5G', 'Innovative swivel design with dual screens for multitasking', 899.99, 'USD', '["lg_wing_5g_image.jpg"]'),
('3e35f048-7fe4-49c0-9825-3f3c57d09112', 21, 'Asus ROG Phone 6', 'Gaming-centric smartphone with high refresh rate display', 1299.99, 'USD', '["asus_rog_phone_6_image.jpg"]'),
('7e6bb77e-447b-4bfc-bef0-e16d92c9e36f', 21, 'Motorola Edge+ 2022', 'Powerful Motorola flagship with edge-to-edge display', 999.99, 'USD', '["motorola_edge_plus_2022_image.jpg"]'),
('b8943083-d3a3-44ec-b9b5-ea652d4c30cc', 21, 'Oppo Find X4 Pro', 'Sleek and stylish smartphone with advanced camera features', 1099.99, 'USD', '["oppo_find_x4_pro_image.jpg"]');

