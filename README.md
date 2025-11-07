## Mulai aplikasi

```bash

npm install

ubah .env.example menjadi env, lalu sesuaikan dengan database mongodb

npm run seed

npm run dev

```

## Analyis Report

1.Architecture & Database Design


terintegrasi dengan backend dan frontend yang berjalan di satu server Node.js. Backend menggunakan Express.js untuk menyediakan REST API yang aman, dan frontend menggunakan Next.js App Router untuk menampilkan antarmuka pengguna (UI). Dengan menggunakan httpOnly cookie untuk autentikasi sesi, keamanan aplikasi lebih tinggi daripada localStorage. Sebelum disimpan ke database MongoDB, bcrypt juga menghash secara otomatis semua password pengguna.

Empat model utama terdiri dari arsitektur data: User, Mall, ParkingLot (lantai), dan ParkingSlot (slot individu). Logika bisnis dibagi menurut peran. Administrasi memiliki kontrol penuh atas semua data parkir, termasuk membuat dan menghapus tampilan dasbor analitik. Sebaliknya, user hanya dapat melihat ketersediaan parkir dan API membatasi mereka untuk melakukan satu booking di seluruh sistem.


![Database Schema](./public/ERD%20SmartPark12.png)

## Technology Choices


Saya menggunakan MERN
M = MongoDB Sebagai database pilihan
E = Express Sebagai server API pilihan
R = React melalui Next.js Sebagai Sebagai Frontendnya
N = Node.js Sebagai lingkunang/enviorment developtmentnya

Backend (Express.js & Node.js)
Memilih Express.js daripada Node.js adalah karena membangun ekosistem JavaScript yang terintegrasi. Dengan menggunakan React (juga JavaScript) di frontend, seluruh aplikasi, mulai dari logika server hingga antarmuka pengguna, ditulis dalam satu bahasa karena backend menggunakan Node.js. Ini mempermudah proses linting, tooling, dan pengembangan secara keseluruhan.

Database (MongoDB & Mongoose)
MongoDB sangat cocok dengan Node.js dan Express, dan sebagai database NoSQL berbasis dokumen, menyimpan data dalam format yang mirip dengan JSON (BSON). Ini menghilangkan "gesekan", atau ketidaksesuaian impedansi, yang sering terjadi saat menerjemahkan data dari objek JavaScript ke tabel relasional.

Frontend (Next.js & React)
React adalah pilihan yang tepat karena arsitektur berbasis komponen-nya. Beberapa fitur antarmuka pengguna yang kompleks, seperti dasbor administrasi dan grid slot parkir , dapat dipecah menjadi komponen kecil yang dapat digunakan kembali dan terpisah satu sama lain.

Kami memutuskan untuk menggunakan Next.js sebagai framework React karena memiliki struktur proyek yang kuat dan fitur out-of-the-box yang kuat. File-based routing-nya sangat membuat manajemen rute lebih mudah, seperti membuat /admin/reports hanya dengan membuat file page.tsx. Meskipun kami menggunakan server Express khusus, dasar Next.js memastikan bahwa aplikasi kami terstruktur dengan baik dan siap untuk pengoptimalan lanjutan.

State Management (React Hooks)
Kami secara sadar memilih untuk menghindari penggunaan repositori state global yang rumit (seperti Redux) untuk manajemen state di sisi klien. Sebaliknya, kami menggunakan Hook React bawaan. Metode ini dipilih karena "sumber kebenaran" utama aplikasi kami adalah database yang terletak di server. Sebagian besar, state di frontend bersifat sementara atau merupakan representasi dari data backend. Aplikasi ringan, cepat, dan kurang kompleks dengan hook bawaan.


## API Design


Arsitektur RESTful API adalah pendekatan standar industri untuk aplikasi ini; kita berinteraksi dengan sumber daya data seperti "users" atau "malls" dengan menggunakan metode HTTP seperti GET, POST, dan DELETE.

GET	/api/malls/public
(User) Mendapat daftar SEMUA mall dan statistik lantai.

POST	/api/users/login
Login pengguna dan mengembalikan httpOnly cookie.
Contoh payload: 
{"email":"contohemail@example", "password":"contoh123"}

PATCH	/api/parking-slots/:id/status
(Admin) Memperbarui status slot (dari modal admin).
contoh payload: {"status":"Occupied"}

DELETE	/api/parking-slots/:id	
(Admin) Menghapus satu slot individu.	



## Results & Error Handling Analysis


Di backend, keamanan sangat penting. Middleware isAdmin atau isLoggedIn pertama kali memeriksa permintaan API sensitif. Jika cookie httpOnly pengguna tidak ada atau tidak valid, permintaan akan ditolak langsung oleh server dengan status 401 Unauthorized atau 403 Forbidden. Jika ada error payload, seperti formulir yang tidak lengkap atau format email yang salah, server akan memvalidasi data dan mengembalikan status 400 Bad Request dengan pesan yang jelas. Bahkan untuk menangani konflik database khusus, server cukup pintar untuk mengembalikan status 409 Conflict jika pengguna mencoba mendaftar dengan email yang sudah ada.

Selama pengembangan, masalah teknis terbesar adalah menstabilkan dan men-debug API autentikasi pengguna. Proses pendaftaran dan login, yang dapat diakses melalui POST /api/users/login, terlihat sederhana pada awalnya, tetapi pada kenyataannya melibatkan banyak langkah yang berjalan secara asynchronous, yang dapat menyebabkan kesalahan.

Misalnya, jalur pendaftaran harus melakukan banyak tugas sekaligus, seperti validasi data, hashing password bcrypt secara asynchronous, memeriksa duplikasi email di database, menyimpan pengguna, dan membuat cookie sesi httpOnly.

Jika diberi waktu tambahan, seperti satu minggu, refactoring dan peningkatan sistem autentikasi dan keamanan data aplikasi akan menjadi fokus utama. Saat ini, aplikasi menggunakan sistem autentikasi berbasis session cookie yang aman (httpOnly), di mana server membuat cookie uid saat login. Mengubah arsitektur ini menjadi sistem JSON Web Token (JWT) yang tidak memiliki status (tanpa status) adalah prioritas refactoring, meskipun ini berfungsi dengan baik.

