<header id="page-topbar">
    <div class="navbar-header d-flex justify-content-between align-items-center">

        <!-- LEFT -->
        <div class="d-flex align-items-center">

            <!-- LOGO -->
            <div class="navbar-brand-box" style="background-color: #FAFAFA;">
                <a href="index.html" class="logo logo-dark">
                    <span class="logo-sm">
                        <img src="<?= base_url('skote/assets/images/sijaring.png') ?>" height="30">
                    </span>
                    <span class="logo-lg">
                        <img src="<?= base_url('skote/assets/images/sijaring.png') ?>" height="45">
                    </span>
                </a>
            </div>

            <!-- HAMBURGER -->
            <button type="button" class="btn btn-sm px-3 font-size-16 header-item waves-effect" id="vertical-menu-btn">
                <i class="fa fa-fw fa-bars"></i>
            </button>

            <!-- MENU TAMBAHAN -->
            <div class="d-none d-md-flex align-items-center ms-3 gap-2">

                <!-- Dashboard DROPDOWN -->
                <div class="dropdown">
                    <a href="#" class="dropdown-toggle font-size-14 px-3 py-2 rounded <?= url_is('dashboard*') ? 'fw-bold' : 'text-dark fw-medium' ?>"
                        data-bs-toggle="dropdown" aria-expanded="false"
                        <?= url_is('dashboard*') ? 'style="background-color: #E6F4EA; color: #137333;"' : '' ?>>
                        <i class="bx bx-home-circle me-1"></i> Dashboard <i class="bx bx-chevron-down ms-1"></i>
                    </a>
                    <ul class="dropdown-menu shadow-sm border-0">
                        <li>
                            <a class="dropdown-item d-flex align-items-center <?= url_is('dashboard/grafik*') ? 'fw-bold text-success' : '' ?>" href="<?= base_url('dashboard/grafik') ?>">
                                <i class="bx bx-sitemap me-2"></i> Grafik
                            </a>
                        </li>
                        <li>
                            <a class="dropdown-item d-flex align-items-center <?= url_is('dashboard/tabel*') ? 'fw-bold text-success' : '' ?>" href="<?= base_url('dashboard/tabel') ?>">
                                <i class="bx bx-table me-2"></i> Tabel
                            </a>
                        </li>
                        <li>
                            <a class="dropdown-item d-flex align-items-center <?= url_is('dashboard/peta*') ? 'fw-bold text-success' : '' ?>" href="<?= base_url('dashboard/peta') ?>">
                                <i class="bx bx-map me-2"></i> Peta
                            </a>
                        </li>
                    </ul>
                </div>

                <!-- Input DENGAN DROPDOWN -->
                <div class="dropdown">
                    <a href="#" class="dropdown-toggle font-size-14 px-3 py-2 rounded <?= url_is('input*') ? 'fw-bold' : 'text-dark fw-medium' ?>"
                        data-bs-toggle="dropdown" aria-expanded="false"
                        <?= url_is('input*') ? 'style="background-color: #E6F4EA; color: #137333;"' : '' ?>>
                        <i class="bx bx-cog me-1"></i> Input <i class="bx bx-chevron-down ms-1"></i>
                    </a>
                    <ul class="dropdown-menu shadow-sm border-0">
                        <!-- MENU BARU: DATA AWAL (Survei OPD) -->
                        <li>
                            <a class="dropdown-item d-flex align-items-center <?= url_is('input/data-awal*') ? 'fw-bold text-success' : '' ?>" href="<?= base_url('input/data-awal') ?>">
                                <i class="bx bx-edit-alt me-2"></i> Data Awal
                            </a>
                        </li>
                        <li>
                            <hr class="dropdown-divider"> <!-- PEMISAH MENU -->
                        </li>
                        <li>
                            <a class="dropdown-item d-flex align-items-center <?= url_is('input/barang*') ? 'fw-bold text-success' : '' ?>" href="<?= base_url('input/barang') ?>">
                                <i class="bx bx-package me-2"></i> Barang
                            </a>
                        </li>
                        <li>
                            <a class="dropdown-item d-flex align-items-center <?= url_is('input/index*') ? 'fw-bold text-success' : '' ?>" href="<?= base_url('input/index') ?>">
                                <i class="bx bx-line-chart me-2"></i> Index
                            </a>
                        </li>
                        <!-- DIUBAH DARI 'OPD' MENJADI 'NON OPD' -->
                        <li>
                            <a class="dropdown-item d-flex align-items-center <?= url_is('input/non-opd*') ? 'fw-bold text-success' : '' ?>" href="<?= base_url('input/non-opd') ?>">
                                <i class="bx bx-map-pin me-2"></i> Non OPD
                            </a>
                        </li>
                        <li>
                            <a class="dropdown-item d-flex align-items-center <?= url_is('input/kepemilikan*') ? 'fw-bold text-success' : '' ?>" href="<?= base_url('input/kepemilikan') ?>">
                                <i class="bx bx-key me-2"></i> Kepemilikan
                            </a>
                        </li>
                        <li>
                            <hr class="dropdown-divider">
                        </li>
                        <!-- MENU DATA PENGAWASAN DENGAN SUB MENU -->
                        <li class="dropdown-submenu dropend">
                            <a class="dropdown-item dropdown-toggle d-flex align-items-center justify-content-between <?= url_is('input/pengawasan*') ? 'fw-bold text-success' : '' ?>" href="#" data-bs-toggle="dropdown" aria-expanded="false">
                                <span><i class="bx bx-shield-quarter me-2"></i> Data Pengawasan</span>
                                <i class="bx bx-chevron-right font-size-12 ms-2"></i>
                            </a>
                            <ul class="dropdown-menu shadow-sm border-0">
                                <li>
                                    <a class="dropdown-item d-flex align-items-center <?= url_is('input/pengawasan/temuan*') ? 'fw-bold text-success' : '' ?>" href="<?= base_url('input/pengawasan/temuan') ?>">
                                        <i class="bx bx-search-alt me-2"></i> Temuan
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item d-flex align-items-center <?= url_is('input/pengawasan/tindak-lanjut*') ? 'fw-bold text-success' : '' ?>" href="<?= base_url('input/pengawasan/tindak-lanjut') ?>">
                                        <i class="bx bx-task me-2"></i> Tindak Lanjut
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item d-flex align-items-center <?= url_is('input/pengawasan/verifikasi*') ? 'fw-bold text-success' : '' ?>" href="<?= base_url('input/pengawasan/verifikasi') ?>">
                                        <i class="bx bx-check-shield me-2"></i> Verifikasi
                                    </a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>

                <!-- STATISTIK (Ditempatkan sebelum Informasi) -->
                <a href="<?= base_url('statistik') ?>" class="font-size-14 px-3 py-2 rounded <?= url_is('statistik*') ? 'fw-bold' : 'text-dark fw-medium' ?>" <?= url_is('statistik*') ? 'style="background-color: #E6F4EA; color: #137333;"' : '' ?>><i class="bx bx-bar-chart me-1"></i> Statistik</a>

                <!-- INFORMASI -->
                <a href="<?= base_url('informasi') ?>" class="font-size-14 px-3 py-2 rounded <?= url_is('informasi*') ? 'fw-bold' : 'text-dark fw-medium' ?>" <?= url_is('informasi*') ? 'style="background-color: #E6F4EA; color: #137333;"' : '' ?>><i class="bx bx-info-circle me-1"></i> Informasi</a>

            </div>

            <div id="navbar-menu" class="d-flex align-items-center ms-2"></div>
        </div>

        <!-- RIGHT -->
        <div class="d-flex align-items-center">

            <!-- DESKTOP ACTION -->
            <div class="d-none d-xl-flex gap-2">
                <div class="dropdown">
                    <button class="d-flex align-items-center btn header-item waves-effect" data-bs-toggle="dropdown">
                        <span class="username-info fw-bold"></span>
                        &nbsp;&nbsp;<i class="mdi mdi-account-circle-outline font-size-20"></i>
                    </button>

                    <div class="dropdown-menu dropdown-menu-end">
                        <a class="dropdown-item" href="/">
                            <i class="bx bx-home me-2"></i> Beranda Magelang
                        </a>

                        <div class="dropdown-divider"></div>

                        <button class="dropdown-item" data-bs-toggle="modal" data-bs-target="#modal-reset-paswd"><i class="bx bx-key me-2"></i> Reset Password</button>
                        <button class="logout-btn dropdown-item text-danger"><i class="bx bx-log-out me-2"></i> Keluar</button>
                    </div>
                </div>
            </div>

            <!-- MOBILE MENU -->
            <div class="dropdown d-xl-none">
                <button class="d-flex align-items-center btn header-item waves-effect" data-bs-toggle="dropdown">
                    <span class="username-info fw-bold"></span>
                    &nbsp;&nbsp;<i class="mdi mdi-account-circle-outline font-size-20"></i>
                </button>

                <div class="dropdown-menu dropdown-menu-end">
                    <a class="dropdown-item" href="/">
                        <i class="bx bx-home me-2"></i> Beranda Magelang
                    </a>

                    <div class="dropdown-divider"></div>

                    <button class="dropdown-item" data-bs-toggle="modal" data-bs-target="#modal-reset-paswd"><i class="bx bx-key me-2"></i> Reset Password</button>
                    <button class="logout-btn dropdown-item text-danger"><i class="bx bx-log-out me-2"></i> Keluar</button>
                </div>
            </div>
        </div>

    </div>
</header>