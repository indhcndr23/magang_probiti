document.addEventListener("DOMContentLoaded", () => {
    const data = window.petaData || { opd: [], jaringan: [], geojsonUrl: null, kecamatanFolderUrl: null };

    const warnaStatus = {
        hijau: '#2bb35e',
        kuning: '#d4b106',
        merah: '#e14343',
        abu: '#9e9e9e'
    };

    const pusatMagelang = [-7.4285, 110.2169];
    const ZOOM_AWAL = 11;

    const map = L.map('peta-map', { zoomControl: true }).setView(pusatMagelang, ZOOM_AWAL);
    window.dashboardMap = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    map.setMinZoom(9);
    map.setMaxZoom(18);

    const clusterGroup = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        iconCreateFunction: (cluster) => {
            const count = cluster.getChildCount();
            return L.divIcon({
                html: `<div style="background:#3b82f6;color:#fff;border-radius:50%;width:44px;height:44px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:bold;box-shadow:0 0 0 4px rgba(59,130,246,0.3);line-height:1.1;">
                          <span style="font-size:13px;">${count}</span>
                          <i class="bx bx-buildings" style="font-size:12px;opacity:0.9;"></i>
                       </div>`,
                className: '',
                iconSize: [44, 44]
            });
        }
    });

    const escapeHTML = (str) => {
        if (str === null || str === undefined) return '';
        return String(str).replace(/[&<>'"]/g,
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag])
        );
    };

    const renderBadgeIndex = (nilai, status) => {
        const warna = {
            hijau: { bg: '#d1fae5', text: '#065f46' },
            kuning: { bg: '#fef9c3', text: '#713f12' },
            merah: { bg: '#fee2e2', text: '#991b1b' },
            abu: { bg: '#f3f4f6', text: '#6b7280' },
        };
        const w = warna[status] || warna.abu;
        const nilaiTeks = escapeHTML(nilai);
        return `<span style="background:${w.bg}; color:${w.text}; padding:2px 8px; border-radius:20px; font-size:12px; font-weight:500">${nilaiTeks || '-'}</span>`;
    };

    // Fungsi Paginasi Barang Khusus Peta
    window.changePageBarangPeta = (direction) => {
        const container = document.getElementById('barang-pagination-container-peta');
        if (!container) return;

        let currentPage = parseInt(container.getAttribute('data-page') || '1');
        const totalPages = parseInt(container.getAttribute('data-total-pages') || '1');

        currentPage += direction;
        if (currentPage < 1 || currentPage > totalPages) return;

        container.setAttribute('data-page', currentPage);

        document.querySelectorAll('.barang-page-item-peta').forEach(el => el.classList.add('d-none'));
        document.querySelectorAll(`.barang-page-peta-${currentPage}`).forEach(el => el.classList.remove('d-none'));

        const pageInfo = document.getElementById('page-info-peta');
        if (pageInfo) pageInfo.textContent = `${currentPage} / ${totalPages}`;
    };

    let currentModalId = null;

    const bukaDetailPeta = async (marker, idOpd, namaOpd) => {
        currentModalId = idOpd;

        const modalEl = document.getElementById('modalDetailPeta');
        const labelEl = document.getElementById('modalDetailPetaLabel');
        const bodyEl = document.getElementById('modalDetailPetaBody');

        if (labelEl) labelEl.textContent = `Detail — ${namaOpd || ''}`;
        if (bodyEl) bodyEl.innerHTML = '<div class="text-center py-3"><i class="bx bx-loader-alt bx-spin fs-3 text-primary"></i><br>Memuat data...</div>';

        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
        modalInstance.show();

        const rawBaseUrl = window.baseUrl || `${window.location.origin}/`;
        const rootUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;

        try {
            const fetchWithCheck = async (url) => {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Gagal memuat data (Status: ${response.status})`);
                return response.json();
            };

            const [detailResult, histResult] = await Promise.all([
                fetchWithCheck(`${rootUrl}dashboard/detail/${idOpd}`),
                fetchWithCheck(`${rootUrl}dashboard/histori-index/${idOpd}`)
            ]);

            if (currentModalId !== idOpd) return;

            const opd = detailResult.opd || {};
            const barangList = detailResult.barang || [];
            const aktif = histResult.aktif || {};
            const histori = histResult.histori || [];

            let barangRows = '';
            const itemsPerPage = 5;
            const totalPages = Math.ceil(barangList.length / itemsPerPage) || 1;

            if (barangList.length === 0) {
                barangRows = '<tr><td colspan="8" class="text-center text-muted py-3">Belum ada perangkat terdaftar</td></tr>';
            } else {
                barangList.forEach((b, index) => {
                    const pageNum = Math.floor(index / itemsPerPage) + 1;
                    const hideClass = pageNum > 1 ? 'd-none' : '';

                    const fotoBtn = b.foto_bukti
                        ? `<a href="${rootUrl}uploads/kepemilikan/${escapeHTML(b.foto_bukti)}" target="_blank" class="btn btn-xs btn-outline-primary py-0 px-2" style="font-size:11px"><i class="bx bx-image-alt"></i> Foto</a>`
                        : '<span class="text-muted" style="font-size:11px">-</span>';

                    barangRows += `
                        <tr class="barang-page-item-peta barang-page-peta-${pageNum} ${hideClass}">
                            <td><strong>${escapeHTML(b.jenis_barang)}</strong></td>
                            <td>${escapeHTML(b.merk || '-')}</td>
                            <td>${escapeHTML(b.tahun) || '-'}</td>
                            <td><span class="badge ${b.kondisi === 'Baik' ? 'bg-success' : 'bg-warning text-dark'}">${escapeHTML(b.kondisi) || '-'}</span></td>
                            <td>${escapeHTML(b.lat) || '-'}</td>
                            <td>${escapeHTML(b.lng) || '-'}</td>
                            <td>${escapeHTML(b.keterangan) || '-'}</td>
                            <td class="text-center">${fotoBtn}</td>
                        </tr>`;
                });
            }

            const rawNilaiAktif = aktif.nilai_index !== null && aktif.nilai_index !== undefined ? Number(aktif.nilai_index) : null;
            const nilaiAktif = rawNilaiAktif !== null ? Math.round(rawNilaiAktif) : '-';

            const statusAktif = nilaiAktif >= 80 ? 'hijau' : nilaiAktif >= 50 ? 'kuning' : 'merah';
            const badgeAktif = renderBadgeIndex(nilaiAktif, statusAktif);

            let historiRows = '';
            if (histori.length === 0) {
                historiRows = '<tr><td colspan="4" class="text-center text-muted">Belum ada histori perubahan</td></tr>';
            } else {
                histori.forEach((h, i) => {
                    const nilaiH = Math.round(Number(h.nilai_index));
                    let nilaiNext = null;
                    if (i < histori.length - 1) {
                        nilaiNext = Math.round(Number(histori[i + 1].nilai_index));
                    }

                    const statusH = nilaiH >= 80 ? 'hijau' : nilaiH >= 50 ? 'kuning' : 'merah';
                    const badgeH = renderBadgeIndex(nilaiH, statusH);

                    let perubahan = '';
                    if (nilaiNext !== null && !isNaN(nilaiNext) && !isNaN(nilaiH)) {
                        const selisih = nilaiH - nilaiNext;
                        if (selisih > 0) perubahan = `<span style="color:#1a6b3a; font-weight:500">▲ +${selisih} dari ${nilaiNext}</span>`;
                        else if (selisih < 0) perubahan = `<span style="color:#dc3545; font-weight:500">▼ ${selisih} dari ${nilaiNext}</span>`;
                        else perubahan = `<span style="color:#6c757d">— sama</span>`;
                    } else {
                        perubahan = '<span style="color:#6c757d; font-size:11px">data awal</span>';
                    }

                    const tgl = h.created_at
                        ? new Date(h.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '-';

                    historiRows += `
                        <tr>
                            <td style="color:#6c757d; font-size:12px">${tgl}</td>
                            <td>${badgeH}</td>
                            <td>${escapeHTML(h.jenis_kabel || opd.jenis_kabel || '-')}</td>
                            <td>${perubahan}</td>
                        </tr>`;
                });
            }

            if (bodyEl) {
                bodyEl.innerHTML = `
                    <ul class="nav nav-tabs mb-3" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#tab-info-opd" type="button">Info OPD</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-info-barang" type="button">Info Barang</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" data-bs-target="#tab-info-index" data-bs-toggle="tab" type="button">Info Index</button>
                        </li>
                    </ul>

                    <div class="tab-content">
                        <!-- TAB 1: INFO OPD -->
                        <div class="tab-pane fade show active" id="tab-info-opd">
                            <table class="table table-sm align-middle mb-0">
                                <tbody>
                                    <tr><th style="width:35%; font-weight:600; color:#495057;">Nama OPD</th><td style="color:#212529;">${escapeHTML(opd.nama_opd) || '-'}</td></tr>
                                    <tr><th style="font-weight:600; color:#495057;">Alamat</th><td style="color:#212529;">${escapeHTML(opd.alamat) || '-'}</td></tr>
                                    <tr><th style="font-weight:600; color:#495057;">PIC / No. HP</th><td style="color:#212529;">${escapeHTML(opd.nama_pic) || '-'} (${escapeHTML(opd.no_hp_pic) || '-'})</td></tr>
                                    <tr><th style="font-weight:600; color:#495057;">Jumlah Pegawai</th><td style="color:#212529;">${opd.jumlah_pegawai ?? 0} Orang</td></tr>
                                    <tr><th style="font-weight:600; color:#495057;">Jumlah Perangkat</th><td style="color:#212529;">${opd.jumlah_perangkat ?? 0} Unit</td></tr>
                                    <tr><th style="font-weight:600; color:#495057;">Rata-rata Tamu</th><td style="color:#212529;">${opd.rata_tamu ?? 0} Orang / Hari</td></tr>
                                    <tr><th style="font-weight:600; color:#495057;">Luas Bangunan</th><td style="color:#212529;">${opd.luas_ruangan ?? 0} m²</td></tr>
                                    <tr><th style="font-weight:600; color:#495057;">Jenis Dinding</th><td style="color:#212529;">${escapeHTML(opd.jenis_dinding) || '-'}</td></tr>
                                    <tr><th style="font-weight:600; color:#495057;">Jumlah Lantai / Ruangan</th><td style="color:#212529;">${opd.jumlah_lantai ?? 0} Lantai / ${opd.jumlah_ruangan ?? 0} Ruangan</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <!-- TAB 2: INFO BARANG -->
                        <div class="tab-pane fade" id="tab-info-barang">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h6 class="fw-bold mb-0">Inventaris Perangkat</h6>
                                ${barangList.length > itemsPerPage ? `
                                <div id="barang-pagination-container-peta" data-page="1" data-total-pages="${totalPages}" class="d-flex align-items-center gap-1">
                                    <button class="btn btn-xs btn-outline-secondary py-0 px-2" onclick="changePageBarangPeta(-1)">&laquo;</button>
                                    <span id="page-info-peta" class="small fw-semibold px-1">1 / ${totalPages}</span>
                                    <button class="btn btn-xs btn-outline-secondary py-0 px-2" onclick="changePageBarangPeta(1)">&raquo;</button>
                                </div>` : ''}
                            </div>
                            <div class="table-responsive">
                                <table class="table table-sm table-custom align-middle mb-0">
                                    <thead>
                                        <tr>
                                            <th>Jenis Perangkat</th>
                                            <th>Merk</th>
                                            <th>Tahun</th>
                                            <th>Kondisi</th>
                                            <th>Lat</th>
                                            <th>Lng</th>
                                            <th>Keterangan</th>
                                            <th class="text-center">Bukti</th>
                                        </tr>
                                    </thead>
                                    <tbody>${barangRows}</tbody>
                                </table>
                            </div>
                        </div>

                        <!-- TAB 3: INFO INDEX -->
                        <div class="tab-pane fade" id="tab-info-index">
                            <table class="table table-sm align-middle mb-3">
                                <tbody>
                                    <tr><th style="width:30%; font-weight:600; color:#495057;">Index Saat Ini</th><td>${badgeAktif}</td></tr>
                                </tbody>
                            </table>

                            <h6 class="fw-bold mb-2">Riwayat Changes</h6>
                            <p class="text-muted mb-2" style="font-size:12px">
                                <i class="bx bx-info-circle"></i> Riwayat perubahan nilai index — tersimpan otomatis setiap kali data diedit.
                            </p>
                            <div class="table-responsive">
                                <table class="table table-sm table-custom align-middle mb-0">
                                    <thead>
                                        <tr>
                                            <th>Tanggal</th><th>Nilai Index</th><th>Jenis Koneksi</th><th>Perubahan</th>
                                        </tr>
                                    </thead>
                                    <tbody>${historiRows}</tbody>
                                </table>
                            </div>
                        </div>
                    </div>`;
            }
        } catch (err) {
            if (currentModalId !== idOpd) return;
            if (bodyEl) {
                bodyEl.innerHTML = `<div class="text-danger text-center py-3">Gagal memuat data: ${escapeHTML(err.message)}</div>`;
            }
        }
    };

    const renderMarkerOpd = () => {
        data.opd.forEach(opd => {
            if (!opd.latitude || !opd.longitude) return;

            const warna = warnaStatus[opd.status] || warnaStatus.abu;

            const customIcon = L.divIcon({
                className: 'custom-opd-icon',
                html: `<div style="background-color:${warna};width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2.5px solid #ffffff;box-shadow:0 2px 6px rgba(0,0,0,0.3);color:#ffffff;font-size:16px;">
                          <i class="bx bxs-institution"></i>
                       </div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });

            const marker = L.marker([opd.latitude, opd.longitude], { icon: customIcon });
            marker.bindTooltip(opd.nama_opd, { direction: 'top', offset: [0, -12] });
            marker.on('click', () => bukaDetailPeta(marker, opd.id_opd, opd.nama_opd));

            clusterGroup.addLayer(marker);
        });

        map.addLayer(clusterGroup);

        // KEMBALIKAN RENDER GARIS JARINGAN (FO & BROADBAND)
        data.jaringan.forEach(j => {
            if (!j.asal_lat || !j.tujuan_lat) return;

            const isFO = j.jenis_kabel === 'FO';
            L.polyline(
                [[j.asal_lat, j.asal_lng], [j.tujuan_lat, j.tujuan_lng]],
                { color: '#4e73df', weight: 3, dashArray: isFO ? null : '6, 6' }
            ).addTo(map);
        });
    };

    const renderBatasKabMagelang = async () => {
        if (!data.geojsonUrl) return;

        try {
            const res = await fetch(data.geojsonUrl);
            if (!res.ok) throw new Error(`Status ${res.status}`);
            const geo = await res.json();

            L.geoJSON(geo, {
                style: { color: '#4e73df', weight: 2, fillOpacity: 0, dashArray: '4, 4' },
                interactive: false
            }).addTo(map);

            const outerRing = [[-85, -180], [-85, 180], [85, 180], [85, -180]];
            const holes = [];

            geo.features.forEach(f => {
                const geom = f.geometry;
                const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
                polys.forEach(poly => {
                    poly.forEach(ring => holes.push(ring.map(c => [c[1], c[0]])));
                });
            });

            L.polygon([outerRing].concat(holes), {
                stroke: false, fillColor: '#ffffff', fillOpacity: 1, interactive: false
            }).addTo(map);
        } catch (err) {
            console.error('Gagal load batas Kab. Magelang:', err);
        }
    };

    const renderKecamatan = async () => {
        if (!data.kecamatanFolderUrl) return;

        const daftarKecamatan = [
            'bandongan', 'borobudur', 'candimulyo', 'dukun', 'grabag', 'kajoran',
            'kaliangkrik', 'mertoyudan', 'mungkid', 'muntilan', 'ngablak', 'ngluwar',
            'pakis', 'salam', 'salaman', 'sawangan', 'secang', 'srumbung',
            'tegalrejo', 'tempuran', 'windusari'
        ];

        const kecamatanLayerGroup = L.layerGroup();
        const capitalize = (str) => str.replace(/(^|\s)\S/g, (t) => t.toUpperCase());

        const semuaFetch = daftarKecamatan.map(async (slug) => {
            try {
                const res = await fetch(`${data.kecamatanFolderUrl}${slug}.geojson`);
                if (!res.ok) throw new Error(`status ${res.status}`);
                const geo = await res.json();
                return { slug, geo };
            } catch (err) {
                return null;
            }
        });

        const results = await Promise.all(semuaFetch);
        results.forEach(item => {
            if (!item) return;

            let namaKecamatan = capitalize(item.slug);
            const props = item.geo.features?.[0]?.properties;
            if (props && (props.name || props.NAMOBJ || props.nama)) {
                namaKecamatan = props.name || props.NAMOBJ || props.nama;
            }

            const isBorobudur = item.slug.toLowerCase() === 'borobudur';
            const defaultStyle = isBorobudur
                ? { color: '#dc2626', weight: 2, fillColor: '#ef4444', fillOpacity: 0.35 }
                : { color: '#8a8a8a', weight: 1, fillColor: '#8a8a8a', fillOpacity: 0.03 };

            const hoverStyle = isBorobudur
                ? { color: '#b91c1c', weight: 2.5, fillColor: '#dc2626', fillOpacity: 0.55 }
                : { fillOpacity: 0.15, weight: 2 };

            const layer = L.geoJSON(item.geo, {
                style: defaultStyle,
                interactive: true
            });

            layer.on('mouseover', (e) => e.target.setStyle(hoverStyle));
            layer.on('mouseout', (e) => e.target.setStyle(defaultStyle));
            layer.bindTooltip(isBorobudur ? `<b>${namaKecamatan}</b> (Zona Merah)` : namaKecamatan, { sticky: true });

            kecamatanLayerGroup.addLayer(layer);
        });

        const toggleKecamatanVisibility = () => {
            if (map.getZoom() >= 11) {
                if (!map.hasLayer(kecamatanLayerGroup)) map.addLayer(kecamatanLayerGroup);
            } else {
                if (map.hasLayer(kecamatanLayerGroup)) map.removeLayer(kecamatanLayerGroup);
            }
        };

        map.on('zoomend', toggleKecamatanVisibility);
        toggleKecamatanVisibility();
    };

    // FUNGSI MODAL DETAIL SENTRA PRODUKSI BARANG CANDIREJO
    window.bukaDetailProduksiCandirejo = () => {
        const modalEl = document.getElementById('modalDetailPeta');
        const labelEl = document.getElementById('modalDetailPetaLabel');
        const bodyEl  = document.getElementById('modalDetailPetaBody');

        if (labelEl) labelEl.innerHTML = '<i class="bx bx-package text-warning me-1"></i> Detail Sentra Produksi Barang — Desa Candirejo (Borobudur)';

        const rawBaseUrl = window.baseUrl || `${window.location.origin}/`;
        const rootUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;

        if (bodyEl) {
            bodyEl.innerHTML = `
                <div class="row g-3">
                    <div class="col-lg-5">
                        <div class="card border h-100 shadow-none">
                            <img src="${rootUrl}uploads/candirejo_produksi.jpg" class="card-img-top" style="height:230px;object-fit:cover;border-radius:6px 6px 0 0;" alt="Sentra Kerajinan Candirejo">
                            <div class="card-body p-3">
                                <div class="d-flex align-items-center gap-2 mb-2">
                                    <span class="badge bg-warning text-dark"><i class="bx bx-package"></i> Produksi Barang</span>
                                    <span class="badge bg-danger">Kec. Borobudur</span>
                                    <span class="badge bg-success">Aktif Berproduksi</span>
                                </div>
                                <h5 class="fw-bold mb-1" style="color:#1e293b;">Sentra UMKM & Kerajinan Candirejo</h5>
                                <p class="text-muted small mb-3"><i class="bx bx-map text-danger"></i> Desa Wisata Candirejo, Kec. Borobudur, Kab. Magelang, Jawa Tengah</p>
                                
                                <table class="table table-sm table-bordered mb-0 small">
                                    <tbody>
                                        <tr><th class="bg-light" style="width:42%;">Titik Koordinat</th><td>-7.6253, 110.2244</td></tr>
                                        <tr><th class="bg-light">Pengelola Sentra</th><td>Pokdarwis & Koperasi Desa Candirejo</td></tr>
                                        <tr><th class="bg-light">Kontak / PIC</th><td>+62 812-2879-1122 (Bpk. Bambang)</td></tr>
                                        <tr><th class="bg-light">Jam Operasional</th><td>Setiap Hari (08.00 - 17.00 WIB)</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-7">
                        <ul class="nav nav-tabs mb-3" role="tablist">
                            <li class="nav-item" role="presentation">
                                <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#tab-prod-info" type="button"><i class="bx bx-info-circle me-1"></i> Informasi Produksi</button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-prod-barang" type="button"><i class="bx bx-list-ul me-1"></i> Produk Unggulan</button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-prod-fasilitas" type="button"><i class="bx bx-wifi me-1"></i> Fasilitas & Jaringan</button>
                            </li>
                        </ul>

                        <div class="tab-content">
                            <!-- TAB 1: INFO UMUM -->
                            <div class="tab-pane fade show active" id="tab-prod-info">
                                <h6 class="fw-bold mb-2">Profil & Potensi Industri Desa Candirejo</h6>
                                <p style="font-size:13px;line-height:1.6;color:#334155;">
                                    Desa Candirejo merupakan desa wisata berbasis kebudayaan dan kerajinan lokal di kawasan Borobudur. Sentra ini menjadi pusat industri kreatif warga dengan keahlian turun-temurun dalam pembuatan <strong>gerabah tradisional</strong>, <strong>kerajinan anyaman bambu</strong>, serta <strong>seni pahat batu alam Merapi</strong>.
                                </p>
                                <div class="row g-2 mt-2">
                                    <div class="col-sm-6">
                                        <div class="p-3 border rounded bg-light">
                                            <div class="text-muted small">Total Unit Pengrajin</div>
                                            <div class="fw-bold fs-5 text-primary">45 Unit Usaha / Pengrajin</div>
                                            <div class="text-muted" style="font-size:11px;">Terbagi di 5 dusun produksi</div>
                                        </div>
                                    </div>
                                    <div class="col-sm-6">
                                        <div class="p-3 border rounded bg-light">
                                            <div class="text-muted small">Kapasitas Produksi</div>
                                            <div class="fw-bold fs-5 text-success">~3.500 Pcs / Bulan</div>
                                            <div class="text-muted" style="font-size:11px;">Suplai wisata & distributor</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- TAB 2: DAFTAR BARANG -->
                            <div class="tab-pane fade" id="tab-prod-barang">
                                <div class="table-responsive">
                                    <table class="table table-sm table-custom align-middle mb-0">
                                        <thead>
                                            <tr>
                                                <th>Komoditas / Barang</th>
                                                <th>Bahan Baku</th>
                                                <th>Kapasitas / Bln</th>
                                                <th>Jangkauan Pasar</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td><strong>Gerabah & Pot Keramik</strong></td>
                                                <td>Tanah Liat Lokal</td>
                                                <td>1.200 unit</td>
                                                <td><span class="badge bg-success">Wisatawan & Ekspor</span></td>
                                            </tr>
                                            <tr>
                                                <td><strong>Anyaman Bambu & Besek</strong></td>
                                                <td>Bambu Apus / Petung</td>
                                                <td>1.500 unit</td>
                                                <td><span class="badge bg-primary">Jawa Tengah & DIY</span></td>
                                            </tr>
                                            <tr>
                                                <td><strong>Pahat Batu Candi & Cobek</strong></td>
                                                <td>Batu Andesit Merapi</td>
                                                <td>500 unit</td>
                                                <td><span class="badge bg-primary">Nasional</span></td>
                                            </tr>
                                            <tr>
                                                <td><strong>Keripik & Olahan Singkong</strong></td>
                                                <td>Hasil Tani Desa</td>
                                                <td>350 kg</td>
                                                <td><span class="badge bg-info">Oleh-oleh Lokal</span></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <!-- TAB 3: FASILITAS -->
                            <div class="tab-pane fade" id="tab-prod-fasilitas">
                                <table class="table table-sm align-middle mb-0">
                                    <tbody>
                                        <tr><th style="width:38%;font-weight:600;color:#495057;">Jaringan Internet & Sinyal</th><td><span class="badge bg-success"><i class="bx bx-check"></i> Fiber Optik Desa & 4G Stabil</span></td></tr>
                                        <tr><th style="font-weight:600;color:#495057;">Pemasaran Digital</th><td>Toko Daring, QRIS, & Media Sosial Pokdarwis</td></tr>
                                        <tr><th style="font-weight:600;color:#495057;">Galeri & Workshop</th><td>Tersedia Rumah Produksi Terbuka untuk Wisatawan</td></tr>
                                        <tr><th style="font-weight:600;color:#495057;">Akses Transportasi</th><td>Dapat dilalui Bus Pariwisata, Mobil, dan Truk Ekspedisi</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
        modalInstance.show();
    };

    const renderProduksiBarang = () => {
        // Koordinat Desa Candirejo, Kecamatan Borobudur
        const candirejoCoord = [-7.6253, 110.2244];

        const triangleIcon = L.divIcon({
            className: 'custom-candirejo-triangle',
            html: `
                <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
                    <svg width="34" height="34" viewBox="0 0 24 24" style="filter: drop-shadow(0 3px 5px rgba(0,0,0,0.45));">
                        <polygon points="12,2 23,21 1,21" fill="#ea580c" stroke="#ffffff" stroke-width="2" stroke-linejoin="round" />
                        <text x="12" y="17.5" font-size="8.5" font-weight="900" fill="#ffffff" text-anchor="middle">★</text>
                    </svg>
                    <span style="background:#ea580c;color:#fff;font-size:10.5px;font-weight:700;padding:2px 7px;border-radius:12px;white-space:nowrap;margin-top:2px;box-shadow:0 2px 4px rgba(0,0,0,0.3);border:1.5px solid #fff;">
                        Candirejo (Produksi Barang)
                    </span>
                </div>
            `,
            iconSize: [160, 56],
            iconAnchor: [80, 18]
        });

        const rawBaseUrl = window.baseUrl || `${window.location.origin}/`;
        const rootUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;

        const markerCandirejo = L.marker(candirejoCoord, { icon: triangleIcon, zIndexOffset: 1000 }).addTo(map);

        markerCandirejo.bindTooltip('<b>Daerah Candirejo</b><br><span style="color:#ea580c;font-weight:600;">▲ Produksi Barang (Klik untuk Detail & Foto)</span>', {
            direction: 'top',
            offset: [0, -18]
        });

        // POPUP DI PETA DENGAN GAMBAR & KETERANGAN DETAIL
        markerCandirejo.bindPopup(`
            <div class="card border-0 shadow-none" style="width:280px;margin:-14px -20px -15px -20px;border-radius:10px;overflow:hidden;">
                <div style="position:relative;">
                    <img src="${rootUrl}uploads/candirejo_produksi.jpg" alt="Sentra Kerajinan Candirejo" style="width:100%;height:140px;object-fit:cover;display:block;">
                    <span class="badge bg-warning text-dark" style="position:absolute;bottom:8px;left:8px;font-size:11px;font-weight:700;box-shadow:0 2px 4px rgba(0,0,0,0.3);">
                        <i class="bx bx-package"></i> Produksi Barang
                    </span>
                    <span class="badge bg-danger" style="position:absolute;bottom:8px;right:8px;font-size:11px;font-weight:600;box-shadow:0 2px 4px rgba(0,0,0,0.3);">
                        Borobudur
                    </span>
                </div>
                <div class="p-3" style="font-size:12px;color:#334155;">
                    <h6 class="fw-bold mb-1" style="color:#0f172a;font-size:14px;">Sentra Kerajinan & Produksi Candirejo</h6>
                    <p class="text-muted mb-2" style="font-size:11.5px;line-height:1.4;">
                        Pusat pembuatan kerajinan gerabah tanah liat, anyaman bambu, pahat batu, dan olahan pangan lokal.
                    </p>
                    <div style="background:#f8fafc;border-radius:6px;padding:6px 8px;margin-bottom:10px;font-size:11px;line-height:1.6;border:1px solid #e2e8f0;">
                        <div><strong>📍 Lokasi:</strong> Desa Candirejo, Kec. Borobudur</div>
                        <div><strong>🏺 Produk:</strong> Gerabah, Pahat Batu, Anyaman</div>
                        <div><strong>👥 Pengrajin:</strong> ~45 Unit Usaha Aktif</div>
                    </div>
                    <button type="button" class="btn btn-sm btn-primary w-100 fw-semibold" onclick="bukaDetailProduksiCandirejo()">
                        <i class="bx bx-show-alt me-1"></i> Buka Detail Lengkap
                    </button>
                </div>
            </div>
        `, { maxWidth: 300 });
    };

    renderMarkerOpd();
    renderBatasKabMagelang();
    renderKecamatan();
    renderProduksiBarang();

    window.addEventListener('resize', () => map?.invalidateSize());

    const petaContainer = document.getElementById('peta-map');
    if (petaContainer && window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(() => map?.invalidateSize());
        resizeObserver.observe(petaContainer);
    }
});