import React from "react";

const Home = () => {
  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg font-sans">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Halo, saya Idan!</h1>
      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Perkenalan Diri</h2>
        <p className="text-gray-600 dark:text-gray-300">Nama saya Idan Fathullah. Saya seorang pengembang web yang antusias dengan teknologi dan pembelajaran hal baru.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Latar Belakang</h2>
        <p className="text-gray-600 dark:text-gray-300">Saya memiliki latar belakang di bidang Informatika dan telah mengerjakan berbagai proyek pengembangan web, baik frontend maupun backend.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Hal yang Disukai</h2>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
          <li>Ngoding dan eksplorasi teknologi baru</li>
          <li>Mendengarkan musik</li>
          <li>Bermain game</li>
          <li>Berkumpul dengan teman</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Hal yang Tidak Disukai</h2>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
          <li>Menunda pekerjaan</li>
          <li>Lingkungan yang tidak kondusif</li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Info Lainnya</h2>
        <p className="text-gray-600 dark:text-gray-300">Saya selalu terbuka untuk kolaborasi dan diskusi seputar teknologi!</p>
      </section>
    </div>
  );
};

export default Home;
