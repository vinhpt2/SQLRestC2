var BcSanLuongBan = {
	run: function (p) {
		BcSanLuongBan.url = NUT.services[2].url;
		var now = (new Date()).toISOString().substring(0,10);
		var dmKhuVuc = NUT.domains[81];
		var cbo = document.createElement("select");
		cbo.id = "cbo_MaKhuVuc";
		for (var i = 0; i < dmKhuVuc.items.length; i++) {
			var itm = dmKhuVuc.items[i];
			var opt = document.createElement("option");
			opt.value = itm.id;
			opt.innerHTML = itm.text;
			cbo.options.add(opt);
		}
		NUT.w2popup.open({
			title: '📃 <i>Báo cáo sản lượng bán</i>',
			modal: true,
			width: 360,
			height: 190,
			body: "<table style='margin:auto'><tr><td align='center'>Từ ngày</td><td align='center'><input id='dat_FromDate' type='date' value='" + now + "'/></td></tr><td align='center'>Đến ngày</td><td align='center'><input id='dat_ToDate' type='date' value='" + now+ "'/></td></tr><tr><td align='center'>Khu vực</td><td colspan='3'>" + cbo.outerHTML + "</td></tr></table>",
			actions: {
				"_Cancel": function () {
					NUT.w2popup.close();
				}, "_Ok": function () {
					if (dat_FromDate.value && dat_ToDate.value && cbo_MaKhuVuc.value) {
						var where = [["DATEFROMPARTS(nam,thang,ngay)", "between", "'" + dat_FromDate.value + "' and '" + dat_ToDate.value +"'"], ["makhuvuc", "=", cbo_MaKhuVuc.value]];
						NUT.ds.select({ url: BcSanLuongBan.url + "data/chamcong", select:"sum(bold) bold,sum(boldl) boldl,sum(light) light,sum(lightl) lightl,sum(trucbach) trucbach,sum(trucbachl) trucbachl,sum(hanoipre) hanoipre,sum(hanoiprel) hanoiprel", where: where }, function (res) {
							if (res.success&&res.result.length) {
								var win = window.open("site/" + n$.user.siteid + "/" + n$.app.appid + "/BcSanLuongBan.html");
								win.onload = function () {
									this.labThangNam.innerHTML = " Từ " + dat_FromDate.value + " đến " + dat_ToDate.value;
									this.labKhuVuc.innerHTML = cbo_MaKhuVuc.options[cbo_MaKhuVuc.selectedIndex].text;
									this.labNgayBaoCao.innerHTML = (new Date()).toLocaleString();
									for (var i = 0; i < res.result.length; i++) {
										var rec = res.result[i];
										var row = this.tbl1.insertRow();
										var sum = rec.bold + rec.light + rec.hanoipre + rec.trucbach;
										row.innerHTML = "<th rowspan='2'>SẢN LƯỢNG<br/>BÁN</th><th>Chai</th><th>" + sum + "</th><td align='center'>" + rec.bold + "</td><td align='center'>" + rec.light + "</td><td align='center'>" + rec.hanoipre + "</td><td align='center'>" + rec.trucbach + "</td>";
										row = this.tbl1.insertRow();
										var sum2 = rec.bold/20 + rec.light/20 + rec.hanoipre/20 + rec.trucbach/20;
										row.innerHTML = "<th>Két</th><th>" + sum2.toFixed(1) + "</th><td align='center'>" + (rec.bold/20).toFixed(1) + "</td><td align='center'>" + (rec.light/20).toFixed(1) + "</td><td align='center'>" + (rec.hanoipre/20).toFixed(1) + "</td><td align='center'>" + (rec.trucbach/20).toFixed(1) + "</td>";
										row = this.tbl1.insertRow();
										row.innerHTML = "<th colspan='2'>TỶ TRỌNG</th><th>100%</th><td align='center'>" + (100*rec.bold/sum).toFixed(1) + "%</td><td align='center'>" + (100*rec.light/sum).toFixed(1) + "%</td><td align='center'>" + (100*rec.hanoipre/sum).toFixed(1) + "%</td><td align='center'>" + (100*rec.trucbach/sum).toFixed(1) + "%</td>";

										row = this.tbl2.insertRow();
										sum = rec.boldl + rec.lightl + rec.hanoiprel + rec.trucbachl;
										row.innerHTML = "<th rowspan='2'>SẢN LƯỢNG<br/>BÁN</th><th>Lon</th><th>" + sum + "</th><td align='center'>" + rec.boldl + "</td><td align='center'>" + rec.lightl + "</td><td align='center'>" + rec.hanoiprel + "</td><td align='center'>" + rec.trucbachl + "</td>";
										row = this.tbl2.insertRow();
										sum2 = rec.boldl/24 + rec.lightl/24 + rec.hanoiprel/24 + rec.trucbachl/24;
										row.innerHTML = "<th>Thùng</th><th>" + sum2.toFixed(1) + "</th><td align='center'>" + (rec.boldl/24).toFixed(1) + "</td><td align='center'>" + (rec.lightl/24).toFixed(1) + "</td><td align='center'>" + (rec.hanoiprel/24).toFixed(1) + "</td><td align='center'>" + (rec.trucbachl/24).toFixed(1) + "</td>";
										row = this.tbl2.insertRow();
										row.innerHTML = "<th colspan='2'>TỶ TRỌNG</th><th>100%</th><td align='center'>" + (100*rec.boldl/sum).toFixed(1) + "%</td><td align='center'>" + (100*rec.lightl/sum).toFixed(1) + "%</td><td align='center'>" + (100*rec.hanoiprel/sum).toFixed(1) + "%</td><td align='center'>" + (100*rec.trucbachl/sum).toFixed(1) + "%</td>";
									}
								};
							} else NUT.notify("⚠️ No data to report!", "yellow");
						});
					} else NUT.notify("⚠️ Nhập Từ ngày, Đến ngày, Khu vực trước khi thực hiện!", "yellow");
				}
			}
		});
	}
}