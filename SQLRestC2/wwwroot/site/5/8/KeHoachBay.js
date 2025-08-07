var KeHoachBay = {
    run: function (p) {
        const record = p?.records?.[0] || {};
        KeHoachBay.obj = record;

        const idPhuongAn = record.idPhuongAn;
        if (!idPhuongAn) return NUT.notify("❌ Không có ID phương án!", "red");

        KeHoachBay.url = NUT.services[6].url;

        NUT.ds.select({
            url: `${KeHoachBay.url}data/PhuongAnTimKiem`,
            where: ["id", "=", idPhuongAn]
        }, function (res) {
            const data = res?.result?.[0];
            if (!res.success || !data) return NUT.notify("❌ Không tìm thấy phương án tìm kiếm!", "red");

            const idKhuVuc = data.idKhuVuc;
            NUT.ds.select({
                url: `${KeHoachBay.url}data/KhuVucTimKiem`,
                where: ["id", "=", idKhuVuc]
            }, function (resKV) {
                const khuVuc = resKV?.result?.[0];
                if (!resKV.success || !khuVuc) return NUT.notify("❌ Không tìm thấy khu vực tìm kiếm!", "red");

                let geometryVungTim = null;
                try {
                    geometryVungTim = new NUT.AGMap.Polygon({
                        rings: [JSON.parse(khuVuc.vungTimKiem)],
                        spatialReference: { wkid: 4326 }
                    });

                    VeVungTim.lastConvex = geometryVungTim;
                    VeVungTim.lastData = {
                        ...data,
                        huongBay: khuVuc.huongBay || 90,
                        phuongPhap: khuVuc.phuongPhapXacDinh
                    };
                } catch (e) {
                    return NUT.notify("❌ Khu vực chưa có dữ liệu!", "yellow");
                }

                const phuongPhapText = (khuVuc.phuongPhapXacDinh == 1)
                    ? "Theo trạng thái máy bay"
                    : "Theo đường bay";

                NUT.w2popup.open({
                    title: '📌 <i>Kế hoạch bay</i>',
                    width: 420,
                    height: 310,
                    body: `
                        <div style="padding:15px">
                            <table class="w2ui-form-table" style="width:100%">
                                <tr><td style="text-align:right;width:40%">Phương pháp</td>
                                    <td><input id="txtPhuongPhap" class="w2ui-input" value="${phuongPhapText}" disabled></td></tr>
                                <tr><td style="text-align:right">Chọn kiểu đường bay</td>
                                    <td><select id="selLoaiPhuongPhap" class="w2ui-input"><option value="TS">TS</option><option value="PS">PS</option></select></td></tr>
                                <tr class="rowTS"><td style="text-align:right">Kiểu kế hoạch</td>
                                    <td><select id="selKieuKeHoachTS" class="w2ui-input"><option value="return">Return</option><option value="non-return">Non Return</option></select></td></tr>
                            </table>
                        </div>
                    `,
                    actions: {
                        Cancel: function () { NUT.w2popup.close() },
                        Draw: function () {
                            const loai = document.getElementById("selLoaiPhuongPhap").value;
                            const kieu = document.getElementById("selKieuKeHoachTS")?.value;
                            if (loai === "TS") KeHoachBay.VeTheoTS(kieu, VeVungTim.lastData, geometryVungTim);
                            else KeHoachBay.VeTheoPS(VeVungTim.lastData, geometryVungTim);
                        },
                        Save: function () {
                            const dataSave = KeHoachBay.lastData;
                            const lines = dataSave?.lines || [];
                            const obj = KeHoachBay.obj || {};

                            if (!lines.length) return NUT.notify("❌ Chưa có đường bay để lưu!", "red");
                            if (!obj.id) return NUT.notify("❌ Không tìm thấy kế hoạch bay để cập nhật!", "red");

                            const round6 = (x) => +parseFloat(x).toFixed(6);
                            const polyline = lines[0] || [];
                            const mergedLine = polyline.map(([x, y]) => [round6(x), round6(y)]);

                            NUT.ds.update({
                                url: `${KeHoachBay.url}data/KeHoachBay`,
                                data: {
                                    thoiGianCatCanh: dataSave.thoiGianCatCanh || new Date(),
                                    duongBay: dataSave.duongBay || "",
                                    doCaoBay: dataSave.doCao || "",
                                    sanBayDuBi: dataSave.sanBayDuBi || "",
                                    baiBayTimKiem: JSON.stringify(mergedLine),
                                    khuVucBayTimKiem: khuVuc.id || "",
                                    tanSoLienLac: dataSave.tanSoLienLac || "",
                                    noiDungKhac: dataSave.noiDungKhac || "",
                                },
                                where: ["id", "=", obj.id]
                            }, function (res) {
                                if (res.success) {
                                    NUT.notify("✅ Đã cập nhật kế hoạch bay!", "green");
                                    NUT.w2popup.close();
                                } else {
                                    NUT.notify("❌ Lỗi khi cập nhật: " + res.result, "red");
                                    console.error("Chi tiết lỗi:", res);
                                }
                            });
                        }
                    }
                });

                setTimeout(() => {
                    const selLoai = document.getElementById("selLoaiPhuongPhap");
                    const rowTS = document.querySelector(".rowTS");
                    selLoai.addEventListener("change", () => {
                        rowTS.style.display = (selLoai.value === "TS") ? "" : "none";
                    });
                    selLoai.dispatchEvent(new Event("change"));
                }, 100);
            });
        });
    },

    VeTheoTS: function (kieu = "return", data, geometryVungTim) {
        const view = NUT.AGMap.view;
        const Graphic = NUT.AGMap.Graphic;
        const Polyline = NUT.AGMap.Polyline;

        if (!geometryVungTim || geometryVungTim.type !== "polygon") {
            NUT.notify("❌ Không có vùng tìm kiếm hợp lệ!", "red");
            return;
        }

        const ring = geometryVungTim.rings?.[0];
        const spatialRef = geometryVungTim.spatialReference;

        if (!Array.isArray(ring) || ring.length < 2) {
            NUT.notify("❌ Vùng tìm kiếm không hợp lệ!", "red");
            return;
        }

        const huongBay = Number(data?.huongBay);
        console.log("✅ Hướng bay từ dữ liệu:", data.huongBay);
        if (isNaN(huongBay)) {
            NUT.notify("❌ Hướng bay không hợp lệ!", "red");
            return;
        }

        // Vector hướng bay và pháp tuyến
        const rad = (90 - huongBay) * Math.PI / 180;
        const dx = Math.cos(rad);
        const dy = Math.sin(rad);
        const nx = -dy;
        const ny = dx;

        // Tính điểm min/max theo pháp tuyến
        let minProj = Infinity, maxProj = -Infinity;
        let minPoint = null, maxPoint = null;
        ring.forEach(([x, y]) => {
            const proj = x * nx + y * ny;
            if (proj < minProj) {
                minProj = proj;
                minPoint = [x, y];
            }
            if (proj > maxProj) {
                maxProj = proj;
                maxPoint = [x, y];
            }
        });

        // Tính độ dài đường bay dọc hướng bay
        let minAlong = Infinity, maxAlong = -Infinity;
        ring.forEach(([x, y]) => {
            const proj = x * dx + y * dy;
            if (proj < minAlong) minAlong = proj;
            if (proj > maxAlong) maxAlong = proj;
        });

        const spatialReference = spatialRef;

        const totalLength = maxAlong - minAlong;
        function createLine(basePoint) {
            const [x0, y0] = basePoint;
            const proj = x0 * dx + y0 * dy;
            const start = [x0 + dx * (minAlong - proj), y0 + dy * (minAlong - proj)];
            const end = [start[0] + dx * totalLength, start[1] + dy * totalLength];
            return {
                line: new Polyline({ paths: [[start, end]], spatialReference }),
                startPoint: start,
                endPoint: end
            };
        }

        view.graphics.removeAll();

        if (kieu === "return") {
            const { line: line1, endPoint: end1 } = createLine(minPoint);
            const { line: line2, startPoint: start2, endPoint: end2 } = createLine(maxPoint);

            [line1, line2].forEach(line => {
                view.graphics.add(new Graphic({
                    geometry: line,
                    symbol: {
                        type: "simple-line",
                        color: "red",
                        width: 2
                    },
                    //attributes: { isMainLine: true }
                }));
            });

            const closingLine = new Polyline({
                paths: [[end1, end2]],
                spatialReference
            });
            view.graphics.add(new Graphic({
                geometry: closingLine,
                symbol: {
                    type: "simple-line",
                    color: "red",
                    width: 2
                },
                // attributes: { isMainLine: true }
            }));

            view.graphics.add(new Graphic({
                geometry: {
                    type: "point",
                    x: start2[0],
                    y: start2[1],
                    spatialReference
                },
                symbol: {
                    type: "simple-marker",
                    style: "triangle",
                    color: "red",
                    size: 10,
                    angle: (huongBay + 180) % 360
                }
            }));
        }

        if (kieu === "non-return") {
            const centerPoint = [
                (minPoint[0] + maxPoint[0]) / 2,
                (minPoint[1] + maxPoint[1]) / 2
            ];

            const { line: line1, startPoint: start1, endPoint: end1 } = createLine(minPoint);
            const { line: line2, startPoint: start2, endPoint: end2 } = createLine(maxPoint);
            const { line: lineMid, startPoint: midStart, endPoint: midEnd } = createLine(centerPoint);

            [line1, lineMid, line2].forEach(line => {
                view.graphics.add(new Graphic({
                    geometry: line,
                    symbol: {
                        type: "simple-line",
                        color: "red",
                        width: 2
                    },
                    // attributes: { isMainLine: true }
                }));
            });

            const lineLeft = new Polyline({
                paths: [[start2, midStart, start1]],
                spatialReference
            });
            const lineRight = new Polyline({
                paths: [[midEnd, end1]],
                spatialReference
            });

            [lineLeft, lineRight].forEach(line => {
                view.graphics.add(new Graphic({
                    geometry: line,
                    symbol: {
                        type: "simple-line",
                        color: "red",
                        width: 2
                    },
                    //attributes: { isMainLine: true }
                }));
            });

            function addArrowSymbol(start, end, angleDeg) {
                const mid = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
                view.graphics.add(new Graphic({
                    geometry: {
                        type: "point",
                        x: mid[0],
                        y: mid[1],
                        spatialReference
                    },
                    symbol: {
                        type: "simple-marker",
                        style: "triangle",
                        color: "red",
                        size: 10,
                        angle: angleDeg
                    }
                }));
            }

            addArrowSymbol(start1, end1, (huongBay + 180) % 360);
            addArrowSymbol(midStart, midEnd, huongBay);
            addArrowSymbol(start2, end2, huongBay);

            view.graphics.add(new Graphic({
                geometry: {
                    type: "point",
                    x: end2[0],
                    y: end2[1],
                    spatialReference
                },
                symbol: {
                    type: "simple-marker",
                    style: "triangle",
                    color: "red",
                    size: 8,
                    angle: huongBay
                }
            }));
        }

        view.graphics.add(new Graphic({
            geometry: geometryVungTim,
            symbol: {
                type: "simple-fill",
                color: [0, 255, 255, 0.1],
                outline: { color: "blue", width: 2 }
            }
        }));

        KeHoachBay.lastData = {
            ...data,
            loaiDuongBay: "TS",
            kieuKeHoach: kieu,
            lines: view.graphics.items
                .filter(g => g.geometry?.type === "polyline")
                .map(g => g.geometry.paths[0])
        };

        view.goTo(geometryVungTim.extent.expand(1.5));
        NUT.notify("✅ Đã vẽ kế hoạch bay kiểu " + kieu.toUpperCase(), "green");
    },


    VeTheoPS: function (data, geometryVungTim) {
        const view = NUT.AGMap.view;
        const Graphic = NUT.AGMap.Graphic;
        const Polyline = NUT.AGMap.Polyline;

        if (!geometryVungTim || geometryVungTim.type !== "polygon") {
            NUT.notify("❌ Không có vùng tìm kiếm hợp lệ!", "red");
            return;
        }

        const ring = geometryVungTim.rings[0];
        const spatialReference = geometryVungTim.spatialReference;
        const huongBay = Number(data.huongBay);

        if (isNaN(huongBay)) {
            NUT.notify("❌ Hướng bay không hợp lệ!", "red");
            return;
        }

        const rad = (90 - huongBay) * Math.PI / 180;
        const dx = Math.cos(rad); // hướng bay
        const dy = Math.sin(rad);
        const nx = -dy; // pháp tuyến
        const ny = dx;

        // Tính chiều dài dọc theo hướng bay
        let minAlong = Infinity, maxAlong = -Infinity;
        let minPerp = Infinity, maxPerp = -Infinity;

        ring.forEach(([x, y]) => {
            const along = x * dx + y * dy;
            const perp = x * nx + y * ny;
            if (along < minAlong) minAlong = along;
            if (along > maxAlong) maxAlong = along;
            if (perp < minPerp) minPerp = perp;
            if (perp > maxPerp) maxPerp = perp;
        });

        const totalLength = maxAlong - minAlong;
        const totalWidth = maxPerp - minPerp;
        const numLines = 5;
        const spacing = totalWidth / (numLines - 1);

        view.graphics.removeAll();

        view.graphics.add(new Graphic({
            geometry: geometryVungTim,
            symbol: {
                type: "simple-fill",
                color: [0, 255, 255, 0.1],
                outline: { color: "blue", width: 2 }
            }
        }));

        const allLines = [];

        for (let i = 0; i < numLines; i++) {
            const offsetPerp = minPerp + i * spacing;
            const offsetX = nx * offsetPerp;
            const offsetY = ny * offsetPerp;

            const proj = offsetX * dx + offsetY * dy;

            const startX = offsetX + dx * (minAlong - proj);
            const startY = offsetY + dy * (minAlong - proj);
            const endX = startX + dx * totalLength;
            const endY = startY + dy * totalLength;

            const line = new Polyline({
                paths: [[[startX, startY], [endX, endY]]],
                spatialReference
            });

            view.graphics.add(new Graphic({
                geometry: line,
                symbol: {
                    type: "simple-line",
                    color: "red",
                    width: 2
                },
                //attributes: { isMainLine: true }
            }));

            allLines.push({ start: [startX, startY], end: [endX, endY] });

            const arrowAngle = (i % 2 === 1) ? (huongBay + 180) % 360 : huongBay;
            const arrowPoint = (i === 0) ? [endX, endY] : [(startX + endX) / 2, (startY + endY) / 2];

            view.graphics.add(new Graphic({
                geometry: {
                    type: "point",
                    x: arrowPoint[0],
                    y: arrowPoint[1],
                    spatialReference
                },
                symbol: {
                    type: "simple-marker",
                    style: "triangle",
                    color: "red",
                    size: 8,
                    angle: arrowAngle
                }
            }));
        }

        // Vẽ các đường nối 
        for (let i = 0; i < allLines.length - 1; i++) {
            const lineA = allLines[i];
            const lineB = allLines[i + 1];
            const pA = (i % 2 === 0) ? lineA.start : lineA.end;
            const pB = (i % 2 === 0) ? lineB.start : lineB.end;

            view.graphics.add(new Graphic({
                geometry: new Polyline({
                    paths: [[pA, pB]],
                    spatialReference
                }),
                symbol: {
                    type: "simple-line",
                    color: "red",
                    width: 2
                },
                //attributes: { isMainLine: true }
            }));
        }

        KeHoachBay.lastData = {
            ...data,
            loaiDuongBay: "PS",
            lines: view.graphics.items
                .filter(g => g.geometry?.type === "polyline")
                .map(g => g.geometry.paths[0])
        };

        view.goTo(geometryVungTim.extent.expand(1.5));
        NUT.notify("✅ Đã vẽ kế hoạch bay kiểu PS", "green");
    }
};
