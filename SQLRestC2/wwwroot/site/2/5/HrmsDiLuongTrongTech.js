var HrmsDiLuongTrongTech={
	run:function(p){
		var now=new Date();
		NUT.w2popup.open({
			title: '📃 Đi lương trong TECHCOMBANK',
			width: 360,
			height: 220,
			body: "<table style='margin:auto'><tr><td align='right'>Ngày chuyển</td><td><input id='txt_Ngay' type='date' value='" + now.toISOString().substring(0, 10) + "'/></td></tr><tr><td align='right'>Lần</td><td><input type='number' id='num_Lan' style='width:60px' value='1'/></td></tr><tr><td align='right'>Nội dung chuyển</td><td colspan='5'><textarea id='txt_NoiDung'>ORIT chuyển tiền</textarea></td></tr></table>",
			actions: {
				"_Cancel": function () {
					NUT.w2popup.close();
				},
				"_Ok": function () {
					if (txt_Ngay.value) {
						NUT.ds.select({ url: NUT.services[2].url + "data/diluong_v", where: [["ngaychuyen", "=", txt_Ngay.value], ["lan", "=", num_Lan.value], ["nganhang", "=", "TECHCOMBANK"]] }, function (res) {
							if (res.success && res.result.length) {
								var win = window.open("site/" + n$.user.siteid + "/" + n$.app.appid + "/DiLuongTrongTech.html");
								win.onload = function () {
									this.labThangNam.innerHTML = txt_Ngay.value + "_" + num_Lan.value;
									this.labNgayBaoCao.innerHTML = (new Date()).toLocaleString();
									for (var i = 0; i < res.result.length; i++) {
										var rec = res.result[i];
										var row = this.tblData.insertRow();
										row.innerHTML = "<td>" + rec.sotien + "</td><td>" + NUT.loaiBoDau(rec.hoten) + "</td><td align='center'>" + rec.sotaikhoan + "</td><td>" + txt_NoiDung.value + "</td><td>" + rec.sohoso + "</td>";
									}
								}
							} else NUT.notify("⚠️ No data to report!", "yellow");
						});
					} else NUT.notify("⚠️ Nhập ngày chuyển trước khi thực hiện!", "yellow");
				}
			}
		})

	}
}