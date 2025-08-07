var BcTongHopHinhAnh = {
	run: function (p) {
		BcTongHopHinhAnh.url = NUT.services[2].url;
		var now = new Date();
		var dmKhuVuc = NUT.domains[81];
		var cbo = document.createElement("select");
		cbo.id = "cbo_MaKhuVuc";
		cbo.innerHTML = "<option value=''></option>";
		for (var i = 0; i < dmKhuVuc.items.length; i++) {
			var itm = dmKhuVuc.items[i];
			var opt = document.createElement("option");
			opt.value = itm.id;
			opt.innerHTML = itm.text;
			cbo.options.add(opt);
		}
		cbo.setAttribute("onchange", "BcTongHopHinhAnh.cboMaKhuVuc_onChange(this.value)");
		NUT.w2popup.open({
			title: '📃 <i>Báo cáo tổng hợp hình ảnh</i>',
			modal: true,
			width: 360,
			height: 210,
			body: "<table style='margin:auto'><tr><td><label for='chk_TeamLead'>Team Lead</label></td><td><input type='checkbox' id='chk_TeamLead'/></td></tr><tr><td>Năm</td><td><input id='num_Year' style='width:60px' type='number' value='" + now.getFullYear() + "'/></td><td>Tháng</td><td><input id='num_Month' style='width:60px' type='number' value='" + (now.getMonth() + 1) + "'/></td></tr><tr><td>Khu vực</td><td colspan='3'>" + cbo.outerHTML + "</td></tr><tr><td>Điểm bán</td><td colspan='3'><select id='cboMaDiemBan'></select></td></tr></table>",
			actions: {
				"_Cancel": function () {
					NUT.w2popup.close();
				}, "_Ok": function () {
					if (num_Year.value && num_Month.value && cbo_MaKhuVuc.value) {
						var isTL = chk_TeamLead.checked;
						var nam = num_Year.value;
						var thang = num_Month.value;
						var where = [["nam", "=", nam], ["thang", "=", thang], ["makhuvuc", "=", cbo_MaKhuVuc.value], ["vitrilv", "=", isTL?"TL_Act":"PG_Act"]];
						if (!isTL&&cboMaDiemBan.value) where.push(["madiemban", "=", cboMaDiemBan.value]);
						NUT.ds.select({ url: BcTongHopHinhAnh.url + "data/chamcong_v", orderby: (isTL ? "manhanvien,ngay" :"madiemban,ngay"), where: where }, function (res) {
							if (res.success&&res.result.length) {
								var win = window.open("site/" + n$.user.siteid + "/" + n$.app.appid + "/BcTongHopHinhAnh.html");
								win.onload = function () {
									var origin = location.origin + "/";
									this.labThangNam.innerHTML = thang + "/" + nam;
									this.labKhuVuc.innerHTML = cbo_MaKhuVuc.options[cbo_MaKhuVuc.selectedIndex].text;
									this.labNgayBaoCao.innerHTML = (new Date()).toLocaleString();
									var count = 0; var old = null; var old2 = null;
									var row = null; var row2 = null; var row3 = null;
									var cell = null; var cell2 = null; var cell3 = null;
									for (var i = 0; i < res.result.length; i++) {
										var rec = res.result[i];
										if (isTL) {
											if (old != rec.manhanvien) {
												row = this.tblData.insertRow();
												row.innerHTML = "<th colspan='2' style='color:white;background-color:navy'>TEAMLEAD: " + rec.hoten + "</th>";
												old = rec.manhanvien;
												old2 = null;
												count = 0;
											}
											if (old2 != rec.ngay) {
												row = this.tblData.insertRow();
												row.innerHTML = "<th colspan='2' style='color:white;background-color:navy'>NGÀY: " + rec.ngay + "/" + rec.thang + "/" + rec.nam + "</th>";
												old2 = rec.ngay;
												count = 0;
											}
											if (count<4 && count++ % 2 == 0) {
												row = this.tblData.insertRow();
												row2 = this.tblData.insertRow();
											}
											cell = row.insertCell();
											cell.align = "center";
											cell.innerHTML = "<b>" + rec.tendiemban + "</b>";

											cell2 = row2.insertCell();
											cell2.tag = JSON.parse(rec.hinhanh);
											cell2.count = 0;
											cell2.innerHTML = "<img width='300' height='300' src='" + (rec.hinhanh ? origin + cell2.tag[1] : "") + "' onclick='this.src=`https://cloud.zilcode.vn/`+this.parentNode.tag[this.parentNode.count++%2]'/>";
										} else {
											if (old != rec.madiemban) {
												row = this.tblData.insertRow();
												var str = "<th colspan='3' style='color:white;background-color:navy'>Điểm bán: " + rec.tendiemban + " - " + (rec.sonha || "") + " " + (rec.duong || "") + " " + (rec.huyen || "") + "</th>";
												row.innerHTML = str.toUpperCase();
												old = rec.madiemban;
												count = 0;
											}
											if (count++ % 3 == 0) {
												row = this.tblData.insertRow();
												row2 = this.tblData.insertRow();
												row3 = this.tblData.insertRow();
											}
											cell = row.insertCell();
											cell.align = "center";
											cell.innerHTML = "<b>Ngày " + rec.ngay + "/" + rec.thang + "/" + rec.nam + "</b>";

											cell2 = row2.insertCell();
											cell2.tag = JSON.parse(rec.hinhanh);
											cell2.count = 0;
											cell2.innerHTML = "<img width='300' height='300' src='" + (rec.hinhanh ? origin + cell2.tag[1] : "") + "' onclick='this.src=`"+origin+"`+this.parentNode.tag[this.parentNode.count++%2]'/>";

											cell3 = row3.insertCell();
											cell3.tag = JSON.parse(rec.hinhanh2);
											cell3.count = 0;
											cell3.innerHTML = "<img width='300' height='300' src='" + (rec.hinhanh2 ? origin + cell3.tag[1] : "") + "' onclick='this.src=`" + origin +"`+this.parentNode.tag[this.parentNode.count++%2]'/>";
										}
									}
								};
							} else NUT.notify("⚠️ No data to report!", "yellow");
						});
					} else NUT.notify("⚠️ Nhập Năm, Tháng, Khu vực trước khi thực hiện!", "yellow");
				}
			}
		});
	},
	cboMaKhuVuc_onChange: function (val) {
		cboMaDiemBan.innerHTML = "<option value=''></option>";
		if (val&&!chk_TeamLead.checked) NUT.ds.select({ url: BcTongHopHinhAnh.url + "data/diemban", select: "madiemban,tendiemban", where: ["makhuvuc", "=", val] }, function (res) {
			if (res.success) {
				for (var i = 0; i < res.result.length; i++) {
					var data = res.result[i];
					var opt = document.createElement("option");
					opt.value = data.madiemban;
					opt.innerHTML = data.tendiemban;
					cboMaDiemBan.options.add(opt);
				}
			} else NUT.notify("⛔ ERROR: " + res.result, "red");
		})
	}
}