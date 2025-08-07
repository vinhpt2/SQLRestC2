var VeVungTim = {
  run: function (p) {
    if (p.records.length) {
      VeVungTim.obj = p.records[0];
      VeVungTim.url = NUT.services[6].url;

      const parent = p.parent || {};

      NUT.w2popup.open({
        title: '📃 <i>Vẽ vùng tìm kiếm</i>',
        modal: true,
        width: 400,
        height: 500,
        body: `
              <div style='padding: 10px'>
                <table style='width:100%'>
                  <tr>
                    <td style='text-align:right;'>Phương pháp</td>
                    <td>
                      <select id='selPhuongPhap' class='w2ui-input'>
                        <option value='1'>Theo trạng thái máy bay</option>
                        <option value='2'>Theo đường bay</option>
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td style='text-align:right;'>Tọa độ (lat,lon)</td>
                    <td><input id='txtToaDo' class='w2ui-input' value='${parent.viTriCuoiCung || ""}' placeholder='21.456, 105.123'></td>
                  </tr>
                  <tr>
                    <td style='text-align:right;'>Vận tốc bay (km/h)</td>
                    <td><input id='txtVanToc' class='w2ui-input' value='${parent.vanToc || ""}'></td>
                  </tr>
                  <tr class='rowTrangThai'>
                    <td style='text-align:right;'>Hướng bay (°)</td>
                    <td><input id='txtHuongBay' class='w2ui-input' value='${parent.huongBay || ""}'></td>
                  </tr>
                  <tr class='rowDuongBay'>
                    <td style='text-align:right;'>Đường bay</td>
                    <td><input id='txtDuongBay' class='w2ui-input' value='${parent.duongBay || ""}'></td>
                  </tr>
                  <tr class='rowDuongBay'>
                    <td style='text-align:right;'>Chọn vùng mở rộng</td>
                    <td>
                      <select id='selVungMoRong' class='w2ui-input'>
                        <option value='1'>10NM</option>
                        <option value='2'>15NM</option>
                      </select>
                    </td>
                  </tr>
                   <tr class='rowDuongBay'>
                    <td style='text-align:right;'>Chọn hướng bay</td>
                    <td>
                      <select id='selHuongBayDuongBay' class='w2ui-input'>
                        <option value='1'>Thuận</option>
                        <option value='2'>Nghịch</option>
                      </select>
                    </td>
                  </tr>
                  <tr class='rowTrangThai'>
                    <td style='text-align:right;'>Hệ số an toàn</td>
                    <td><input id='txtHsAt' class='w2ui-input' value='1,6'></td>
                  </tr>
                  <tr class='rowTrangThai'>
                    <td style='text-align:right;'>Sai số máy bay gặp nạn (NM)</td>
                    <td><input id='txtSaiSoGN' class='w2ui-input' value='10'></td>
                  </tr>
                  <tr class='rowTrangThai'>
                    <td style='text-align:right;'>Sai số máy bay tìm kiếm (NM)</td>
                    <td><input id='txtSaiSoTK' class='w2ui-input' value='10'></td>
                  </tr>
                  <tr>
                    <td style='text-align:right;'>Thời gian dự kiến T1 (phút)</td>
                    <td><input id='txtTGBD' class='w2ui-input' value='5'></td>
                  </tr>
                  <tr class='rowTrangThai'>
                    <td style='text-align:right;'>Thời gian dự kiến T2 (phút)</td>
                    <td><input id='txtTGKT' class='w2ui-input' value='10'></td>
                  </tr>          
                </table>
              </div>
            `,
        actions: {
          _Cancel: function () {
            NUT.w2popup.close();
          },
          _Save: function () {
            if (!VeVungTim.lastConvex || !VeVungTim.lastData) {
              NUT.notify("Chưa có vùng tìm kiếm để lưu!", "yellow");
              return;
            }

            const round6 = (x) => Math.round(x * 1e6) / 1e6;

            const roundPoint = (point) => point.map(round6);
            const roundRings = (rings) => rings.map(roundPoint);

            const convex = VeVungTim.lastConvex;
            const rings = convex.rings?.[0] || [];
            if (!rings.length) {
              NUT.notify("Vùng tìm kiếm không hợp lệ!", "yellow");
              return;
            }

            const d = VeVungTim.lastData || {};
            const obj = VeVungTim.obj || {};

            const data = {
              vungTimKiem: JSON.stringify(roundRings(rings)),
              thoiGianDuKienT1: d.T1 || null,
              thoiGianDuKienT2: d.T2 || null,
              saiSoMayBayGapNan: d.saiSoGN || null,
              saiSoMayBayTimKiem: d.saiSoTK || null,
              heSoAnToan: d.hsAt || null,
              toaDoLKP: d.diemP1 ? JSON.stringify([roundPoint(d.diemP1)]) : null,
              diemDenD1: d.diemP2 ? JSON.stringify([roundPoint(d.diemP2)]) : null,
              diemDenD2: d.diemP3 ? JSON.stringify([roundPoint(d.diemP3)]) : null,
              phuongPhapXacDinh: parseInt(d.phuongPhap) || null,
              duongBay: d.tenDuongBay || null,
              huongBay: d.huongBay || null
            };

            NUT.ds.update({
              url: NUT.services[6].url + "data/KhuVucTimKiem",
              data: data,
              where: ["id", "=", obj.id]
            }, function (res) {
              if (res.success) {
                NUT.notify("Đã lưu vùng tìm kiếm!", "green");
                NUT.w2popup.close();
              } else {
                NUT.notify("Lỗi khi lưu: " + res.result, "red");
                console.error("Chi tiết lỗi:", res);
              }
            });
          },
          _Draw: function () {
            const toaDoStr = document.getElementById("txtToaDo").value.trim();
            let lat, lon;

            try {
              const parsed = JSON.parse(toaDoStr);

              if (
                Array.isArray(parsed) &&
                parsed.length === 1 &&
                Array.isArray(parsed[0]) &&
                parsed[0].length === 2
              ) {
                lat = parseFloat(parsed[0][0]);
                lon = parseFloat(parsed[0][1]);
                [lon, lat] = [lat, lon];
              } else {
                throw new Error("Tọa độ không đúng định dạng [[lat, lon]]");
              }
            } catch (err) {
              NUT.notify("Tọa độ không đúng định dạng [[lat, lon]]", "yellow");
              return;
            }

            const vanToc = parseFloat(document.getElementById("txtVanToc").value);
            const huongBay = parseFloat(document.getElementById("txtHuongBay").value);
            const hsAt = parseFloat(document.getElementById("txtHsAt").value);
            const saiSoGN = parseFloat(document.getElementById("txtSaiSoGN").value) * 1852;
            const saiSoTK = parseFloat(document.getElementById("txtSaiSoTK").value) * 1852;
            const T1 = parseFloat(document.getElementById("txtTGBD").value);
            const T2 = parseFloat(document.getElementById("txtTGKT").value);
            const phuongPhap = document.getElementById("selPhuongPhap").value;
            const tenDuongBay = document.getElementById("txtDuongBay").value.trim();

            if (phuongPhap === "1") {
              if ([lat, lon, vanToc, huongBay, hsAt, saiSoGN, saiSoTK, T1, T2].every(x => !isNaN(x))) {
                VeVungTim.veVungTheoTrangThaiMayBay({ lon, lat, vanToc, huongBay, hsAt, saiSoGN, saiSoTK, T1, T2, phuongPhap });
              } else {
                NUT.notify("Vui lòng nhập hợp lệ các giá trị số!", "yellow");
              }
            } else {
              if (tenDuongBay) {
                VeVungTim.VeVungTheoDuongBay({ tenDuongBay, phuongPhap, T1 });
              } else {
                NUT.notify("Vui lòng nhập tên đường bay!", "yellow");
              }
            }

          }

        }
      });
    } else {
      NUT.notify("No record selected!", "yellow");
    }

    setTimeout(() => {
      const sel = document.getElementById("selPhuongPhap");

      const toggleVisibility = () => {
        const val = sel.value;

        document.querySelectorAll(".rowTrangThai").forEach(row => {
          row.style.display = (val === "1") ? "" : "none";
        });

        document.querySelectorAll(".rowDuongBay").forEach(row => {
          row.style.display = (val === "2") ? "" : "none";
        });
      };

      sel.addEventListener("change", toggleVisibility);
      toggleVisibility();
    }, 100);

  },

  veVungTheoTrangThaiMayBay: function (data) {
    const { lon, lat, vanToc, huongBay, hsAt, saiSoGN, saiSoTK, T1, T2 } = data;

    function toaDoMoi(lon0, lat0, dMet, goc) {
      const R = 6371000;// bán kính trái đất
      const rad = Math.PI / 180;
      const latRad = lat0 * rad;
      const lonRad = lon0 * rad;
      const bearing = goc * rad;
      const dOverR = dMet / R;

      const lat2 = Math.asin(Math.sin(latRad) * Math.cos(dOverR) +
        Math.cos(latRad) * Math.sin(dOverR) * Math.cos(bearing));

      const lon2 = lonRad + Math.atan2(Math.sin(bearing) * Math.sin(dOverR) * Math.cos(latRad),
        Math.cos(dOverR) - Math.sin(latRad) * Math.sin(lat2));

      return [lon2 / rad, lat2 / rad];
    }

    const D1 = vanToc * 16.67 * T1;
    const D2 = vanToc * 16.67 * T2;

    const P1 = [lon, lat];
    const P2 = toaDoMoi(lon, lat, D1, huongBay);
    const P3 = toaDoMoi(lon, lat, D1 + D2, huongBay);

    VeVungTim.lastData = {
      ...data,
      diemP1: P1,
      diemP2: P2,
      diemP3: P3
    };
    const tinhR = X => Math.ceil(hsAt * Math.sqrt(X * X + saiSoTK * saiSoTK));

    const R1 = tinhR(saiSoGN);
    const R2 = tinhR(saiSoGN + 0.1 * D1);
    const R3 = tinhR(saiSoGN + 0.1 * (D1 + D2));

    const centers = [P1, P2, P3];
    const radii = [R1, R2, R3];
    const colors = ["#33ccffaa", "#33ccffaa", "#33ccffaa"];
    const num = 30;
    const allRingPoints = [];

    const createRing = (lon0, lat0, radiusM) => {
      const ring = [];
      for (let i = 0; i <= num; i++) {
        const angle = (i / num) * 2 * Math.PI;
        const dx = (radiusM / 111320) * Math.cos(angle) / Math.cos(lat0 * Math.PI / 180);
        const dy = (radiusM / 111320) * Math.sin(angle);
        const point = [lon0 + dx, lat0 + dy];
        ring.push(point);
        allRingPoints.push(point);
      }
      return ring;
    };

    if (NUT.AGMap && NUT.AGMap.Polygon && NUT.AGMap.view) {
      NUT.AGMap.view.graphics.removeAll();

      for (let i = 0; i < centers.length; i++) {
        const ring = createRing(centers[i][0], centers[i][1], radii[i]);
        const polygon = new NUT.AGMap.Polygon({ rings: [ring] });

        NUT.AGMap.view.graphics.add({ geometry: polygon, symbol: { type: "simple-fill", color: colors[i], outline: { color: "#0000ff", width: 1.5 } } });
        NUT.AGMap.view.graphics.add({ geometry: { type: "point", longitude: centers[i][0], latitude: centers[i][1] }, symbol: { type: "text", text: `P${i + 1}`, color: "black", font: { size: 12, weight: "bold" }, haloColor: "white", haloSize: 1 } });
        NUT.AGMap.view.graphics.add({ geometry: { type: "point", longitude: centers[i][0], latitude: centers[i][1] + (radii[i] / 111320) }, symbol: { type: "text", text: `R = ${radii[i]} m`, color: "black", font: { size: 11 }, haloColor: "white", haloSize: 1 } });
      }

      NUT.AGMap.view.graphics.add({ geometry: { type: "polyline", paths: [P1, P2, P3], spatialReference: { wkid: 4326 } }, symbol: { type: "simple-line", color: "red", width: 2 } });

      const multipoint = new NUT.AGMap.Multipoint({ points: allRingPoints, spatialReference: { wkid: 4326 } });
      const convex = NUT.AGMap.geometryEngine.convexHull(multipoint);
      if (convex) {
        NUT.AGMap.view.graphics.add({ geometry: convex, symbol: { type: "simple-fill", color: "#0000ff88", outline: { color: "#0000ff", width: 2 } } });
        NUT.AGMap.view.goTo({ target: convex.extent.expand(1.5) });
      }
      VeVungTim.lastConvex = convex;
      VeVungTim.lastData = {
        ...data,
        diemP1: P1,
        diemP2: P2,
        diemP3: P3
      };
      VeVungTim.lastGeometry = convex;


    } else {
      NUT.notify("AGMap chưa sẵn sàng!", "yellow");
    }
  },

  VeVungTheoDuongBay: function (data) {
    const { tenDuongBay } = data;
    const latLonStr = document.getElementById("txtToaDo").value.trim();
    const vanToc = parseFloat(document.getElementById("txtVanToc").value);
    const T1 = parseFloat(document.getElementById("txtTGBD").value);
    const moRongNM = document.getElementById("selVungMoRong").value === "2" ? 15 : 10;
    const moRong = moRongNM * 1852;
    const moRongDauCuoi = moRong;
    const huongBayOption = document.getElementById("selHuongBayDuongBay")?.value;
    const huongBayThuan = huongBayOption !== "2";

    let lat, lon;
    try {
      const parsed = JSON.parse(latLonStr);
      if (Array.isArray(parsed) && parsed.length === 1 && parsed[0].length === 2) {
        [lon, lat] = [parseFloat(parsed[0][1]), parseFloat(parsed[0][0])];

      } else throw new Error("Sai định dạng");
    } catch (err) {
      NUT.notify("Tọa độ không đúng định dạng [[lat, lon]]", "yellow");
      return;
    }

    const D1 = vanToc * 16.67 * T1; // m

    const featureLayer = new NUT.AGMap.FeatureLayer({
      url: "https://services.arcgis.com/EaQ3hSM51DBnlwMq/arcgis/rest/services/TKCN2_WFL1/FeatureServer/9"
    });

    const query = {
      where: `tenDuongBay = '${tenDuongBay}'`,
      returnGeometry: true,
      outFields: ["*"],
      outSpatialReference: { wkid: 4326 }
    };

    featureLayer.queryFeatures(query).then(function (results) {
      if (!results.features.length) return NUT.notify("Không tìm thấy đường bay", "yellow");

      const geometry = results.features[0].geometry;
      const path = geometry.paths?.[0];
      console.log("Đường bay geometry:", geometry);
      if (!path || path.length < 2) return NUT.notify("Đường bay không hợp lệ", "yellow");

      let huongBay = tinhHuongBay(path);
      if (!huongBayThuan) {
        huongBay = (huongBay + 180) % 360;
      }

      const nearest = NUT.AGMap.geometryEngine.nearestCoordinate(geometry, {
        type: "point",
        x: lon,
        y: lat,
        spatialReference: { wkid: 4326 }
      });

      if (!nearest || !nearest.coordinate) {
        NUT.notify("Không tìm được điểm gần nhất đến đường bay!", "red");
        return;
      }

      const pointStart = nearest.coordinate;
      const pointEnd = toaDoMoi(pointStart.x, pointStart.y, D1, huongBay);

      // Mở rộng đầu-cuối
      const pointStartExt = toaDoMoi(pointStart.x, pointStart.y, -moRongDauCuoi, huongBay);
      const pointEndExt = toaDoMoi(pointEnd[0], pointEnd[1], moRongDauCuoi, huongBay);

      //Mở rộng vuông góc trái phải 
      const p0_trai = lechVuongGoc(pointStartExt[0], pointStartExt[1], moRong, huongBay - 90);
      const p0_phai = lechVuongGoc(pointStartExt[0], pointStartExt[1], moRong, huongBay + 90);
      const p3_trai = lechVuongGoc(pointEndExt[0], pointEndExt[1], moRong, huongBay - 90);
      const p3_phai = lechVuongGoc(pointEndExt[0], pointEndExt[1], moRong, huongBay + 90);

      const polygon = new NUT.AGMap.Polygon({
        rings: [[p0_trai, p3_trai, p3_phai, p0_phai, p0_trai]],
        spatialReference: { wkid: 4326 }
      });

      if (NUT.AGMap && NUT.AGMap.view) {
        NUT.AGMap.view.graphics.removeAll();

        const graphics = [];

        graphics.push({
          geometry: polygon,
          symbol: {
            type: "simple-fill",
            color: "#33ccffaa",
            outline: { color: "#0000ff", width: 2 }
          }
        });

        graphics.push({
          geometry: {
            type: "polyline",
            paths: [[[pointStart.x, pointStart.y], pointEnd]],
            spatialReference: { wkid: 4326 }
          },
          symbol: {
            type: "simple-line",
            color: "red",
            width: 2
          }
        });

        graphics.push({
          geometry: { type: "polyline", paths: [[p0_trai, p0_phai]], spatialReference: { wkid: 4326 } },
          symbol: { type: "simple-line", color: "green", width: 2 }
        });
        graphics.push({
          geometry: { type: "polyline", paths: [[p3_trai, p3_phai]], spatialReference: { wkid: 4326 } },
          symbol: { type: "simple-line", color: "green", width: 2 }
        });

        graphics.forEach(g => NUT.AGMap.view.graphics.add(g));
        NUT.AGMap.view.goTo(polygon.extent.expand(1.5));

        VeVungTim.lastConvex = polygon;
        VeVungTim.lastData = {
          ...data,
          diemP1: [pointStart.x, pointStart.y],
          diemP2: pointEnd,
          phuongPhap: "2",
          huongBay: huongBay,
          tenDuongBay: tenDuongBay
        };
      } else {
        NUT.notify("AGMap chưa sẵn sàng!", "yellow");
      }
    });

    function toaDoMoi(lon0, lat0, dMet, goc) {
      const R = 6371000;
      const rad = Math.PI / 180;
      const latRad = lat0 * rad;
      const lonRad = lon0 * rad;
      const bearing = goc * rad;
      const d = dMet / R;

      const lat2 = Math.asin(Math.sin(latRad) * Math.cos(d) +
        Math.cos(latRad) * Math.sin(d) * Math.cos(bearing));
      const lon2 = lonRad + Math.atan2(Math.sin(bearing) * Math.sin(d) * Math.cos(latRad),
        Math.cos(d) - Math.sin(latRad) * Math.sin(lat2));
      return [lon2 / rad, lat2 / rad];
    }

    function lechVuongGoc(lon, lat, dMet, goc) {
      return toaDoMoi(lon, lat, dMet, goc);
    }

    function tinhHuongBay(path) {
      const [lon1, lat1] = path[0];
      const [lon2, lat2] = path.at(-1);
      const rad = Math.PI / 180;
      const dLon = (lon2 - lon1) * rad;
      const y = Math.sin(dLon) * Math.cos(lat2 * rad);
      const x = Math.cos(lat1 * rad) * Math.sin(lat2 * rad) -
        Math.sin(lat1 * rad) * Math.cos(lat2 * rad) * Math.cos(dLon);
      const goc = Math.atan2(y, x) * 180 / Math.PI;
      return (goc + 360) % 360;
    }
  }
};

