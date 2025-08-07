var HrmsCheckInOut = {
	run: function (p) {
		var now = new Date();
		HrmsCheckInOut.nam = now.getFullYear();
		HrmsCheckInOut.thang = now.getMonth() + 1;
		HrmsCheckInOut.ngay = now.getDate();
		HrmsCheckInOut.url = NUT.services[2].url;
		NUT.ds.select({ url: HrmsCheckInOut.url + "data/nhanvien_v", select: "makhuvuc,madoitac,vitrilv", where: ["manhanvien", "=", n$.user.username] }, function (res2) {
			if (res2.success && res2.result.length) {
				var nv = res2.result[0];
				HrmsCheckInOut.isPG_Act = (nv.vitrilv == "PG_Act" || nv.vitrilv == "TL_Act");
				HrmsCheckInOut.isTL_Act = (nv.vitrilv == "TL_Act");
				HrmsCheckInOut.dlgWidth = NUT.isMobile ? screen.width : 600;
				HrmsCheckInOut.dlgHeight = HrmsCheckInOut.isPG_Act ? 600 : 500;
				HrmsCheckInOut.makhuvuc = nv.makhuvuc;
				HrmsCheckInOut.madoitac = nv.madoitac;
				NUT.ds.select({ url: HrmsCheckInOut.url + "data/chamcong", orderby: "lan", where: [["nam", "=", HrmsCheckInOut.nam], ["thang", "=", HrmsCheckInOut.thang], ["ngay", "=", HrmsCheckInOut.ngay], ["dulieu", "=", 0], ["manhanvien", "=", n$.user.username]] }, function (res) {
					if (res.success) {
						HrmsCheckInOut.lookupData = {};
						var html = '<table style="margin:auto">';
						if (res.result.length) {
							for (var i = 0; i < res.result.length; i++) {
								var data = res.result[i];
								var lan = data.lan;
								var id = data.idchamcong;
								HrmsCheckInOut.lookupData[id] = data;
								html += '<tr><td colspan="3"><h2 class="nut-link">Lần ' + lan + ' - <i>' + (data.ca ? "Ca gãy" : "Ca thẳng") + '</i></h2></td></tr><tr>';
								if (data.thoigianden) {
									data.thoigianden = new Date(data.thoigianden + "Z").toLocaleTimeString();
									html += '<td><div id="divInOut_IN' + lan + '" class="nut-tile" style="background:green" onclick="HrmsCheckInOut.divInOut_InfoIn(this,' + id + ')"><img src="site/2/5/in.ico"><br/><b>' + data.madiemban + '<br/>' + data.thoigianden + '</b></div></td>';
									if (data.thoigianve) {
										data.thoigianve = new Date(data.thoigianve + "Z").toLocaleTimeString();
										html += '<td><div id="divInOut_OUT' + lan + '" class="nut-tile" style="background:orange" onclick="HrmsCheckInOut.divInOut_InfoOut(this,' + id + ')"><img src="site/2/5/out.ico"><br/><b>OUT<br/>' + data.thoigianve + '</b></div></td>';
										if (data.thoigiansanluong) {
											data.thoigiansanluong = new Date(data.thoigiansanluong + "Z").toLocaleTimeString();
											html += '<td><div id="divInOut_SL' + lan + '" class="nut-tile" style="background:brown" onclick="HrmsCheckInOut.divInOut_InfoSL(this,' + id + ')"><img src="site/2/5/factory.ico"><br/><b>SẢN LƯỢNG<br/>' + data.thoigiansanluong + '</b></div></td>';
										} else if (!HrmsCheckInOut.isTL_Act) html += '<td><div id="divInOut_SL' + lan + '" class="nut-tile" style="background:white;border:1px solid;color:brown" onclick="HrmsCheckInOut.divInOutSL_onClick(this,' + id + ',\'' + data.madiemban + '\')"><img src="site/2/5/factory.ico"><br/><b>Check SANLUONG</b></div></td>';
										if (data.ca && res.result.length==lan) html += '<tr><td><h2 class="nut-link">Lần '+(lan+1)+' - <i>' + (data.ca ? "Ca gãy" : "Ca thẳng") + '</i></h2></td></tr><tr><td><div id="divInOut_IN0" class="nut-tile" style="background:white;border:1px solid;color:green" onclick="HrmsCheckInOut.divInOut_onClick(this,'+(lan+1)+')"><img src="site/2/5/in.ico"><br/><b>Check IN</b></div></td></tr>';
									} else
										html += '<td><div id="divInOut_OUT' + lan + '" class="nut-tile" style="background:white;border:1px solid;color:orange" onclick="HrmsCheckInOut.divInOut2_onClick(this,' + id + ',' + lan + ')"><img src="site/2/5/out.ico"><br/><b>Check OUT</b></div></td>';
								} else {
									html += '<td><div class="nut-tile" style="background:grey"><b>' + data.chamcong + '</b><br/>' + data.madiemban + '</div><td/><td>' + data.lydo + '<td/>';
								}
								html += "</tr>";
							}
						} else {
							html += '<tr><td colspan="3"><h2 class="nut-link">Lần 1</h2></td></tr><tr><td><div id="divInOut_IN1" class="nut-tile" style="background:white;border:1px solid;color:green" onclick="HrmsCheckInOut.divInOut_onClick(this,1)"><img src="site/2/5/in.ico"><br/><b>Check IN</b></div></td></tr>';
						}
						NUT.w2popup.open({
							title: '🚪 <i>Check IN-OUT</i> - <b>Ngày #<i>' + HrmsCheckInOut.nam + '-' + HrmsCheckInOut.thang + '-' + HrmsCheckInOut.ngay + '</i></b>',
							modal: true,
							width: HrmsCheckInOut.dlgWidth,
							height: HrmsCheckInOut.dlgHeight,
							body: html + "</table>",
							buttons: '<button class="w2ui-btn" onclick="NUT.w2popup.close()">⛌ Close</button>'
						});
					} else NUT.notify("⛔ ERROR: " + res.result, "red");
				});
			} else NUT.notify("⚠️ Không tìm thấy nhân viên " + n$.user.username, "yellow");
		});
	},
	divInOut_InfoIn: function (elm, id) {
		var data = HrmsCheckInOut.lookupData[id];
		var hinhanh = JSON.parse(data.hinhanh);
		var html = "<table border='1px' cellspacing='0px' style='margin:auto'><caption style='color:green'><b>Check IN <i>#" + data.nam + "-" + data.thang + "-" + data.ngay + "</i></b></caption><tr><td><b><i>Thời gian đến:</i></b></td><td>" + data.thoigianden + "</td></tr><tr><td><b><i>Khu vực:</i></b></td><td>" + data.makhuvuc + "</td></tr><tr><td><b><i>Điểm bán:</i></b></td><td>" + data.madiemban + "</td></tr><tr><td><b><i>Ca làm việc:</i></b></td><td>" + (data.ca ? "Ca gãy" : "Ca thẳng") + "</td></tr></table>";
		if (HrmsCheckInOut.isPG_Act) html += '<br/><hr/><br/><table style="margin:auto;width:100%"><tr><th>Ảnh CÓ Timestamp</th><th>Ảnh KO Timestamp</th></tr><tr><td align="center"><img width="290" src="' + hinhanh[0] + '"/></td><td align="center"><img width="290" src="' + hinhanh[1] + '"/></td></tr></table>';
		NUT.w2popup.message({
			speed: 0,
			width: HrmsCheckInOut.dlgWidth,
			height: HrmsCheckInOut.dlgHeight,
			body: html,
			buttons: '<button class="w2ui-btn" onclick="NUT.w2popup.message()">Ok</button>'
		});
	},
	divInOut_InfoOut: function (elm, id) {
		var data = HrmsCheckInOut.lookupData[id];
		var hinhanh2 = JSON.parse(data.hinhanh2);
		var html = "<table border='1px' cellspacing='0px' style='margin:auto'><caption style='color:orange'><b>Check OUT <i>#" + data.nam + "-" + data.thang + "-" + data.ngay + "</i></b></caption><tr><td><b><i>Thời gian về:</i></b></td><td>" + data.thoigianve + "</td></tr><tr><td><b><i>Khu vực:</i></b></td><td>" + data.makhuvuc + "</td></tr><tr><td><b><i>Điểm bán:</i></b></td><td>" + data.madiemban + "</td></tr><tr><td><b><i>Ca làm việc:</i></b></td><td>" + (data.ca ? "Ca gãy" : "Ca thẳng") + "</td></tr><tr><td><b><i>Ghi chú:</i></b></td><td>" + data.ghichu + "</td></tr></table>";
		if (HrmsCheckInOut.isPG_Act) html += '<br/><hr/><br/><table style="margin:auto;width:100%"><tr><th>Ảnh CÓ Timestamp</th><th>Ảnh KO Timestamp</th></tr><tr><td align="center"><img width="290" src="' + hinhanh2[0] + '"/></td><td align="center"><img width="290" src="' + hinhanh2[1] + '"/></td></tr></table>';
		NUT.w2popup.message({
			speed: 0,
			width: HrmsCheckInOut.dlgWidth,
			height: HrmsCheckInOut.dlgHeight,
			body: html,
			buttons: '<button class="w2ui-btn" onclick="NUT.w2popup.message()">Ok</button>'
		});
	},
	divInOut_InfoSL: function (elm, id) {
		var data = HrmsCheckInOut.lookupData[id];
		var html = "<table border='1px' cellspacing='0px' style='text-align:center;margin:auto'><caption style='color:brown'><b>"+data.madiemban+" - <i> Lần " + data.lan +
			"</i></b></caption><tr><th style='color:brown'>HABECO Tổng</th><th>Bold<br/>chai</th><th>Bold<br/>lon</th><th>Light<br/>chai</th><th>Light<br/>lon</th><th>Trúc<br/>Bạch</th><th>Pre Sleek<br/>lon</th><th>HN Pre<br/>chai</th>"+(HrmsCheckInOut.isPG_Act?"<th>HN Xanh<br/>lon</th><th>HN Vàng<br/>lon</th><th>HN 1890<br/>chai</th>":"") +
			"</tr><tr><th>Tồn đầu ca</th><td>" + data.bold1 + "</td><td>" + data.boldl1 + "</td><td>" + data.light1 + "</td><td>" + data.lightl1 + "</td><td>" + data.trucbachl1 + "</td><td>" + data.hanoiprel1 + "</td><td>" + data.hanoipre1 + "</td>"+(HrmsCheckInOut.isPG_Act?"<td>" + data.hnxanh1 + "</td><td>" + data.hnvang1 + "</td><td>" + data.hn18901 + "</td>":"") +
			"</tr><tr><th>Nhập NPP</th><td>" + data.bold2 + "</td><td>" + data.boldl2 + "</td><td>" + data.light2 + "</td><td>" + data.lightl2 + "</td><td>" + data.trucbachl2 + "</td><td>" + data.hanoiprel2 + "</td><td>" + data.hanoipre2 + "</td>"+(HrmsCheckInOut.isPG_Act?"<td>" + data.hnxanh2 + "</td><td>" + data.hnvang2 + "</td><td>" + data.hn18902 + "</td>":"") +
			"</tr><tr style='background:yellow'><th>SL Bán ra</th><td>" + data.bold + "</td><td>" + data.boldl + "</td><td>" + data.light + "</td><td>" + data.lightl + "</td><td>" + data.trucbachl + "</td><td>" + data.hanoiprel + "</td><td>" + data.hanoipre + "</td>"+(HrmsCheckInOut.isPG_Act?"<td>" + data.hnxanh + "</td><td>" + data.hnvang + "</td><td>" + data.hn1890 + "</td>":"")+"</tr></table>";
		if (HrmsCheckInOut.isPG_Act) html += '<br/><hr/><br/><table border="1px" cellspacing="0px" style="margin:auto;text-align:center"><caption style="background:pink"><b><i>Sản lượng đối thủ (lon/chai)' +
			'</b></caption><tr><th style="color:brown">ĐỐI THỦ</th><th>SG Special</th><th>SG Lager</th><th>Heniken</th><th>Carlsberg</th><th>Bud weiser</th><th>Hạ Long</th><th>Huda</th></tr>' +
			'<tr><th>Số PG đối thủ</th><td>' + data.special2 + '</td><td>' + data.lager2 + '</td><td>' + data.heniken2 + '</td><td>' + data.carlsberg2 + '</td><td>' + data.budweiser2 + '</td><td>' + data.halong2 + '</td><td>' + data.huda2 + '</td></tr>' +
			'<tr style="background:yellow"><th>SL đối thủ bán</th><td>' + data.special + '</td><td>' + data.lager + '</td><td>' + data.heniken + '</td><td>' + data.carlsberg + '</td><td>' + data.budweiser + '</td><td>' + data.halong + '</td><td>' + data.huda + '</td></tr></table>' +
			'<br/><br/><table border="1px" cellspacing="0px" style="margin:auto;text-align:center"><caption style="background:pink"><b><i>Số lượng khách vào quán (người)' +
			'</b></caption><tr><th>Số khách vào quán</th><th>Số khách PG tiếp</th><th>Khách dùng HNB</th><th>Khách chuyển HNB</th></tr>' +
			'<tr><td>' + data.sl_khach + '</td><td>' + data.sl_pg + '</td><td>' + data.sl_dunghnb + '</td><td>' + data.sl_chuyenhnb + '</td></tr></table>';

		NUT.w2popup.message({
			speed: 0,
			width: HrmsCheckInOut.dlgWidth,
			height: HrmsCheckInOut.dlgHeight,
			body: html,
			buttons: '<button class="w2ui-btn" onclick="NUT.w2popup.message()">Ok</button>'
		});
	},
	file_onChange: function (file, img) {
		if (file.type.startsWith("image")) img.src = URL.createObjectURL(file);
		else NUT.notify("⚠️ Chọn ảnh để upload", "yellow");
	},
	divInOut_onClick: function (elm, lan) {
		var dmkhuvuc = NUT.dmlinks[131];
		var items = dmkhuvuc.items;
		var cbo = document.createElement("select");
		cbo.id = "cboMaKhuVuc";
		cbo.innerHTML = "<option value='" + HrmsCheckInOut.makhuvuc + "' selected>" + dmkhuvuc.lookup[HrmsCheckInOut.makhuvuc] + "</option>";
		for (var i = 0; i < items.length; i++) {
			if (items[i].id != HrmsCheckInOut.makhuvuc) {
				var opt = document.createElement("option");
				opt.value = items[i].id;
				opt.innerHTML = items[i].text;
				cbo.options.add(opt);
			}
		}
		cbo.setAttribute("onchange", "HrmsCheckInOut.cboMaKhuVuc_onChange(this.value)");
		var html = '<table style="margin:auto;width:100%"><caption style="background:lime"><b><i>Check IN</i> - Địa điểm</b></caption><tr><td align="right">Khu vực*:</td><td>' + cbo.outerHTML + '</td></tr><tr><td align="right">Điểm bán*:</td><td><select id="cboMaDiemBan"></select></td></tr></tr></table>';
		if (HrmsCheckInOut.isPG_Act) html += '<br/><hr/><br/><table style="margin:auto;width:100%"><tr><th>Ảnh CÓ Timestamp</th><th>Ảnh KO Timestamp</th></tr><tr><th><input id="fileAnh" type="file" onchange="HrmsCheckInOut.file_onChange(this.files[0],imgAnh)"/></th><th><input id="fileAnh2" type="file" onchange="HrmsCheckInOut.file_onChange(this.files[0],imgAnh2)"/></tr><tr><td><img id="imgAnh" width="300"/></td><td><img id="imgAnh2" width="300"/></td></tr></table>';
		NUT.w2popup.message({
			speed: 0,
			width: HrmsCheckInOut.dlgWidth,
			height: HrmsCheckInOut.dlgHeight,
			body: html,
			buttons: '<button class="w2ui-btn" onclick="NUT.w2popup.message()">Cancel</button><button class="w2ui-btn" onclick="HrmsCheckInOut.doCheckIn(' + elm.id + ',' + lan + ',this)">✔️ Ok</button>'
		});
		HrmsCheckInOut.cboMaKhuVuc_onChange(HrmsCheckInOut.makhuvuc);
	},
	divInOut2_onClick: function (elm, id, lan, but) {
		if (lan >= 1) {
			var html = '<table style="margin:auto;width:100%"><caption style="background:orange"><b><i>Check OUT</i></b></caption><tr><td align="right">Ca làm việc*</td><td><select id="cboInOut_Ca" ' + (HrmsCheckInOut.isPG_Act?"disabled":"") + '><option value="0">Ca thẳng</option><option value="1">Ca gãy</option></select></td></tr><tr><td align="right">Ghi chú</td><td><textarea id="txtGhiChuPG"></textarea></td></tr></table>';
			if (HrmsCheckInOut.isPG_Act) html += '<br/><hr/><br/><table style="margin:auto;width:100%"><tr><th>Ảnh CÓ Timestamp</th><th>Ảnh KO Timestamp</th></tr><tr><th><input id="file2Anh" type="file" onchange="HrmsCheckInOut.file_onChange(this.files[0],img2Anh)"/></th><th><input id="file2Anh2" type="file" onchange="HrmsCheckInOut.file_onChange(this.files[0],img2Anh2)"/></tr><tr><td><img id="img2Anh" width="300"/></td><td><img id="img2Anh2" width="300"/></td></tr></table>';
			NUT.w2popup.message({
				speed: 0,
				width: HrmsCheckInOut.dlgWidth,
				height: HrmsCheckInOut.dlgHeight,
				body: html,
				buttons: '<button class="w2ui-btn" onclick="NUT.w2popup.message()">Cancel</button><button class="w2ui-btn" onclick="HrmsCheckInOut.doCheckOut(' + elm.id + ',' + id + ',' + lan + ',this)">✔️ Ok</button>'
			});
		} else HrmsCheckInOut.doCheckOut(elm, id, lan, but);
	},
	divInOutSL_onClick: function (elm, id, madiemban) {
		NUT.ds.select({ url: HrmsCheckInOut.url + "data/chamcong", select: "bold1%2Bbold2-bold bold,boldl1%2Bboldl2-boldl boldl,light1%2Blight2-light light,lightl1%2Blightl2-lightl lightl,trucbachl1%2Btrucbachl2-trucbachl trucbachl,hanoipre1%2Bhanoipre2-hanoipre hanoipre,hanoiprel1%2Bhanoiprel2-hanoiprel hanoiprel",limit:1,orderby:"idchamcong desc", where: [["manhanvien", "=", n$.user.username],["madiemban", "=",madiemban],["nam", "=",HrmsCheckInOut.nam],["thang", "=",HrmsCheckInOut.thang],["idchamcong","<>",id]] }, function (res) {
			if (res.success) {
				var data=res.result[0]||{};		
				var html = '&nbsp;<input type="checkbox" id="chkInOut_ZeroDauCa"><label for="chkInOut_ZeroDauCa">Không tồn chai nào</label><br/><br/><table border="1px" cellspacing="0px" style="margin:auto;text-align:center"><caption style="background:pink"><b><i>Check Sản lượng (chai/lon)</i> - ' + madiemban +
					'</b></caption><tr><th style="color:brown">HABECO</th><th>Bold<br/>chai</th><th>Bold<br/>lon</th><th>Light<br/>chai</th><th>Light<br/>lon</th><th>Trúc<br/>Bạch</th><th>Pre Sleek<br/>lon</th><th>HN Pre<br/>chai</th>'+(HrmsCheckInOut.isPG_Act?'<th>HN Xanh<br/>lon</th><th>HN Vàng<br/>lon</th><th>HN 1890<br/>chai</th>':'') +
					'</tr><tr><th>Tồn đầu</th><td><input type="number" id="num_bold1" style="width:50px" value="'+(data.bold||0)+'"></td><td><input type="number" id="num_boldl1" style="width:50px" value="'+(data.boldl||0)+'"></td><td><input type="number" id="num_light1" style="width:50px" value="'+(data.light||0)+'"></td><td><input type="number" id="num_lightl1" style="width:50px" value="'+(data.lightl||0)+'"></td><td><input type="number" id="num_trucbachl1" style="width:50px" value="'+(data.trucbachl||0)+'"></td><td><input type="number" id="num_hanoiprel1" style="width:50px" value="'+(data.hanoiprel||0)+'"></td><td><input type="number" id="num_hanoipre1" style="width:50px" value="'+(data.hanoipre||0)+'"></td>'+(HrmsCheckInOut.isPG_Act?'<td><input type="number" id="num_hnxanh1" style="width:50px"></td><td><input type="number" id="num_hnvang1" style="width:50px"></td><td><input type="number" id="num_hn18901" style="width:50px"></td>':'') +
					'</tr><tr><th>Nhập NPP</th><td><input type="number" id="num_bold2" style="width:50px"></td><td><input type="number" id="num_boldl2" style="width:50px"></td><td><input type="number" id="num_light2" style="width:50px"></td><td><input type="number" id="num_lightl2" style="width:50px"></td><td><input type="number" id="num_trucbachl2" style="width:50px"></td><td><input type="number" id="num_hanoiprel2" style="width:50px"></td><td><input type="number" id="num_hanoipre2" style="width:50px"></td>'+(HrmsCheckInOut.isPG_Act?'<td><input type="number" id="num_hnxanh2" style="width:50px"></td><td><input type="number" id="num_hnvang2" style="width:50px"></td><td><input type="number" id="num_hn18902" style="width:50px"></td>':'') +
					'</tr><tr style="background:yellow"><th>SL Bán ra</th><td><input type="number" id="num_bold" style="width:50px"></td><td><input type="number" id="num_boldl" style="width:50px"></td><td><input type="number" id="num_light" style="width:50px"></td><td><input type="number" id="num_lightl" style="width:50px"></td><td><input type="number" id="num_trucbachl" style="width:50px"></td><td><input type="number" id="num_hanoiprel" style="width:50px"></td><td><input type="number" id="num_hanoipre" style="width:50px"></td>'+(HrmsCheckInOut.isPG_Act?'<td><input type="number" id="num_hnxanh" style="width:50px"></td><td><input type="number" id="num_hnvang" style="width:50px"></td><td><input type="number" id="num_hn1890" style="width:50px"></td>':'')+'</tr></table><br/>&nbsp;<input type="checkbox" id="chkInOut_ZeroSanLuong"><label for="chkInOut_ZeroSanLuong">Không bán được</label>';
				if (HrmsCheckInOut.isPG_Act) html += '<br/><hr/><br/><table border="1px" cellspacing="0px" style="margin:auto;text-align:center"><caption style="background:pink"><b><i>Sản lượng đối thủ (lon/chai)' +
					'</b></caption><tr><th style="color:brown">ĐỐI THỦ</th><th>SG Special</th><th>SG Lager</th><th>Heniken</th><th>Carlsberg</th><th>Bud weiser</th><th>Hạ Long</th><th>Huda</th></tr>' +
					'<tr><th>Số PG đối thủ</th><td><input type="number" id="num_special2" style="width:50px"></td><td><input type="number" id="num_lager2" style="width:50px"></td><td><input type="number" id="num_heniken2" style="width:50px"></td><td><input type="number" id="num_carlsberg2" style="width:50px"></td><td><input type="number" id="num_budweiser2" style="width:50px"></td><td><input type="number" id="num_halong2" style="width:50px"></td><td><input type="number" id="num_huda2" style="width:50px"></td></tr>' +
					'<tr style="background:yellow"><th>SL đối thủ bán</th><td><input type="number" id="num_special" style="width:50px"></td><td><input type="number" id="num_lager" style="width:50px"></td><td><input type="number" id="num_heniken" style="width:50px"></td><td><input type="number" id="num_carlsberg" style="width:50px"></td><td><input type="number" id="num_budweiser" style="width:50px"></td><td><input type="number" id="num_halong" style="width:50px"></td><td><input type="number" id="num_huda" style="width:50px"></td></tr></table>' +
					'<br/><br/><table border="1px" cellspacing="0px" style="margin:auto;text-align:center"><caption style="background:pink"><b><i>Số lượng khách vào quán (người)' +
					'</b></caption><tr><th>Số khách vào quán</th><th>Số khách PG tiếp</th><th>Khách dùng HNB</th><th>Khách chuyển HNB</th></tr>' +
					'<tr><td><input type="number" id="num_khach" style="width:60px"></td><td><input type="number" id="num_pg" style="width:60px"></td><td><input type="number" id="num_dunghnb" style="width:60px"></td><td><input type="number" id="num_chuyenhnb" style="width:60px"></td></tr></table>';

				NUT.w2popup.message({
					speed: 0,
					width: HrmsCheckInOut.dlgWidth,
					height: HrmsCheckInOut.dlgHeight,
					body: html,
					buttons: '<button class="w2ui-btn" onclick="NUT.w2popup.message()">Cancel</button><button class="w2ui-btn" onclick="HrmsCheckInOut.doCheckSanLuong(' + elm.id + ',' + id + ',this)">✔️ Ok</button>'
				});
			} else NUT.notify("⛔ ERROR: " + res.result, "red");
		});
	},
	cboMaKhuVuc_onChange: function (val) {
		cboMaDiemBan.innerHTML = "<option value=''></option>";
		if (val) NUT.ds.select({ url: HrmsCheckInOut.url + "data/diemban", select: "madiemban,tendiemban", where: ["makhuvuc", "=", val] }, function (res) {
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
	},
	colorElement: function (elm, color, time) {
		elm.style.color = "white";
		elm.style.background = color;
		elm.setAttribute("onclick", "");
		elm.lastChild.innerHTML = time.toLocaleTimeString();
	},
	doCheckIn: function (elm, lan, but) {
		if (cboMaDiemBan.value && cboMaKhuVuc.value) {
			if (HrmsCheckInOut.isPG_Act && (!fileAnh.value || !fileAnh2.value)) {
				NUT.notify("⚠️ Chụp 2 ảnh khác nhau để Check IN", "yellow");
				return;
			}
			var now = new Date();
			var nam = now.getFullYear();
			var thang = now.getMonth() + 1;
			var ngay = now.getDate();
			var data = {
				thoigianden: now,
				madiemban: cboMaDiemBan.value,
				makhuvuc: cboMaKhuVuc.value,
				manhanvien: n$.user.username,
				madoitac: HrmsCheckInOut.madoitac,
				nam: nam,
				thang: thang,
				ngay: ngay,
				lan: lan,
				dulieu: 0
			}
			but.disabled = true;
			NUT.ds.insert({ url: HrmsCheckInOut.url + "data/chamcong", data: data, returnid: true }, function (res) {
				if (res.success) {
					var newid = res.result[0];
					if (HrmsCheckInOut.isPG_Act) NUT.uploadFile(141, newid, [fileAnh.files[0], fileAnh2.files[0]], function (res2) {
						if (res2.success) {
							var data2 = { hinhanh: JSON.stringify(res2.result) };
							NUT.ds.update({ url: HrmsCheckInOut.url + "data/chamcong", data: data2, where: [["idchamcong", "=", newid]] }, function (res3) {
								if (res3.success) {
									NUT.notify("Check IN thành công.", "lime");
									NUT.w2popup.message();
									HrmsCheckInOut.colorElement(elm, "green", now);
								} else {
									but.disabled = false;
									NUT.notify("⛔ ERROR: " + res3.result, "red");
								}
							});
						} else {
							but.disabled = false;
							NUT.notify("⛔ ERROR: " + res2.result, "red");
						}
					}); else {
						NUT.notify("Check IN thành công.", "lime");
						NUT.w2popup.message();
						HrmsCheckInOut.colorElement(elm, "green", now);
					}
				} else {
					but.disabled = false;
					NUT.notify("⛔ ERROR: " + res.result, "red");
				}
			});
		} else NUT.notify("⚠️ Chọn Khu vực và Điểm bán và Ca làm việc để Check IN!", "yellow");
	},
	doCheckOut: function (elm, id, lan, but) {
		if (HrmsCheckInOut.isPG_Act && (!file2Anh.value || !file2Anh2.value)) {
			NUT.notify("⚠️ Chụp 2 ảnh khác nhau để Check OUT", "yellow");
			return;
		}
		but.disabled = true;
		var now = new Date();
		var data = {
			thoigianve: now,
			ca: (lan >= 2 || HrmsCheckInOut.isTL_Act ? 1 : cboInOut_Ca.value),
			ghichu: txtGhiChuPG.value
		};
		if (HrmsCheckInOut.isPG_Act) NUT.uploadFile(141, id, [file2Anh.files[0], file2Anh2.files[0]], function (res2) {
			if (res2.success) {
				data.hinhanh2 = JSON.stringify(res2.result);
				NUT.ds.update({ url: HrmsCheckInOut.url + "data/chamcong", data: data, where: [["idchamcong", "=", id]] }, function (res) {
					if (res.success) {
						NUT.notify("Check OUT thành công!", "lime");
						NUT.w2popup.message();
						HrmsCheckInOut.colorElement(elm, "orange", now);
					} else {
						but.disabled = false;
						NUT.notify("⛔ ERROR: " + res.result, "red");
					}
				});
			} else {
				but.disabled = false;
				NUT.notify("⛔ ERROR: " + res2.result, "red");
			}
		}); else {
			NUT.ds.update({ url: HrmsCheckInOut.url + "data/chamcong", data: data, where: [["idchamcong", "=", id]] }, function (res) {
				if (res.success) {
					NUT.notify("Check OUT thành công!", "lime");
					NUT.w2popup.message();
					HrmsCheckInOut.colorElement(elm, "orange", now);
				} else {
					but.disabled = false;
					NUT.notify("⛔ ERROR: " + res.result, "red");
				}
			});
		}
	},
	doCheckSanLuong: function (elm, id, but) {
		var now = new Date();
		var data = { thoigiansanluong: now };
		var sum1 = 0;
		if (!chkInOut_ZeroDauCa.checked) {
			data.bold1=num_bold1.value?num_bold1.valueAsNumber:0; sum1 += data.bold1;
			data.boldl1 = num_boldl1.value?num_boldl1.valueAsNumber:0; sum1 += data.boldl1;
			data.light1 = num_light1.value?num_light1.valueAsNumber:0; sum1 += data.light1;
			data.lightl1 = num_lightl1.value?num_lightl1.valueAsNumber:0; sum1 += data.lightl1;
			//data.trucbach1 = num_trucbach1.value?num_trucbach1.valueAsNumber:0; sum1 += data.trucbach1;
			data.trucbachl1 = num_trucbachl1.value?num_trucbachl1.valueAsNumber:0; sum1 += data.trucbachl1;
			data.hanoipre1 = num_hanoipre1.value?num_hanoipre1.valueAsNumber:0; sum1 += data.hanoipre1;
			data.hanoiprel1 = num_hanoiprel1.value?num_hanoiprel1.valueAsNumber:0; sum1 += data.hanoiprel1;
			if(HrmsCheckInOut.isPG_Act){
				data.hnxanh1 = num_hnxanh1.value?num_hnxanh1.valueAsNumber:0; sum1 += data.hnxanh1;
				data.hnvang1 = num_hnvang1.value?num_hnvang1.valueAsNumber:0; sum1 += data.hnvang1;
				data.hn18901 = num_hn18901.value?num_hn18901.valueAsNumber:0; sum1 += data.hn18901;
			}
			if (sum1 == 0) {
				NUT.notify("⚠️ Nhập số lượng tồn đầu ca để Check Sản lượng!", "yellow");
				return;
			}
		}

		data.bold2 = num_bold2.value?num_bold2.valueAsNumber:0;
		data.boldl2 = num_boldl2.value?num_boldl2.valueAsNumber:0;
		data.light2 = num_light2.value?num_light2.valueAsNumber:0;
		data.lightl2 = num_lightl2.value?num_lightl2.valueAsNumber:0;
		//data.trucbach2 = num_trucbach2.value? num_trucbach2.valueAsNumber:0;
		data.trucbachl2 = num_trucbachl2.value? num_trucbachl2.valueAsNumber:0;
		data.hanoipre2 = num_hanoipre2.value? num_hanoipre2.valueAsNumber:0;
		data.hanoiprel2 = num_hanoiprel2.value? num_hanoiprel2.valueAsNumber:0;
		if(HrmsCheckInOut.isPG_Act){
			data.hnxanh2 = num_hnxanh2.value? num_hnxanh2.valueAsNumber:0;
			data.hnvang2 = num_hnvang2.value? num_hnvang2.valueAsNumber:0;
			data.hn18902 = num_hn18902.value? num_hn18902.valueAsNumber:0;
		}
		var sum = 0;
		if (!chkInOut_ZeroSanLuong.checked) {
			data.bold = num_bold.value?num_bold.valueAsNumber:0; sum += data.bold;
			data.boldl = num_boldl.value?num_boldl.valueAsNumber:0; sum += data.boldl;
			data.light = num_light.value?num_light.valueAsNumber:0; sum += data.light;
			data.lightl = num_lightl.value?num_lightl.valueAsNumber:0; sum += data.lightl;
			//data.trucbach = num_trucbach.value?num_trucbach.valueAsNumber:0; sum += data.trucbach;
			data.trucbachl = num_trucbachl.value?num_trucbachl.valueAsNumber:0; sum += data.trucbachl;
			data.hanoipre = num_hanoipre.value?num_hanoipre.valueAsNumber:0; sum += data.hanoipre;
			data.hanoiprel = num_hanoiprel.value?num_hanoiprel.valueAsNumber:0; sum += data.hanoiprel;
			if(HrmsCheckInOut.isPG_Act){
				data.hnxanh = num_hnxanh.value?num_hnxanh.valueAsNumber:0; sum += data.hnxanh;
				data.hnvang = num_hnvang.value?num_hnvang.valueAsNumber:0; sum += data.hnvang;
				data.hn1890 = num_hn1890.value?num_hn1890.valueAsNumber:0; sum += data.hn1890;
			}
			if (sum == 0) {
				NUT.notify("⚠️ Nhập số lượng bán ra để Check Sản lượng!", "yellow");
				return;
			}
		}

		if (HrmsCheckInOut.isPG_Act) {
			var sumdt = 0;
			if (num_special.value) { data.special = num_special.valueAsNumber; sumdt += data.special }
			if (num_lager.value) { data.lager = num_lager.valueAsNumber; sumdt += data.lager }
			if (num_heniken.value) { data.heniken = num_heniken.valueAsNumber; sumdt += data.heniken }
			if (num_carlsberg.value) { data.carlsberg = num_carlsberg.valueAsNumber; sumdt += data.carlsberg }
			if (num_budweiser.value) { data.budweiser = num_budweiser.valueAsNumber; sumdt += data.budweiser }
			if (num_halong.value) { data.halong = num_halong.valueAsNumber; sumdt += data.halong }
			if (num_huda.value) { data.huda = num_huda.valueAsNumber; sumdt += data.huda }
			if (sumdt == 0) {
				NUT.notify("⚠️ Nhập số lượng bán của đối thủ để Check Sản lượng!", "yellow");
				return;
			}

			if (num_special2.value) data.special2 = num_special2.valueAsNumber;
			if (num_lager2.value) data.lager2 = num_lager2.valueAsNumber;
			if (num_heniken2.value) data.heniken2 = num_heniken2.valueAsNumber;
			if (num_carlsberg2.value) data.carlsberg2 = num_carlsberg2.valueAsNumber;
			if (num_budweiser2.value) data.budweiser2 = num_budweiser2.valueAsNumber;
			if (num_halong2.value) data.halong2 = num_halong2.valueAsNumber;
			if (num_huda2.value) data.huda2 = num_huda2.valueAsNumber;

			var sumkh = 0;
			if (num_khach.value) { data.sl_khach = num_khach.valueAsNumber; sumkh += data.sl_khach }
			if (num_pg.value) { data.sl_pg = num_pg.valueAsNumber; sumkh += data.sl_pg }
			if (num_dunghnb.value) { data.sl_dunghnb = num_dunghnb.valueAsNumber; sumkh += data.sl_dunghnb }
			if (num_chuyenhnb.value) { data.sl_chuyenhnb = num_chuyenhnb.valueAsNumber; sumkh += data.sl_chuyen }
			if (sumkh == 0) {
				NUT.notify("⚠️ Nhập số lượng khách vào quán để Check Sản lượng!", "yellow");
				return;
			}
		}
		if (data.bold1 + data.bold2 - data.bold < 0 || data.boldl1 + data.boldl2 - data.boldl < 0 || data.light1 + data.light2 - data.light < 0 || data.lightl1 + data.lightl2 - data.lightl < 0 || data.trucbachl1 + data.trucbachl2 - data.trucbachl < 0 || data.hanoipre1 + data.hanoipre2 - data.hanoipre < 0 || data.hanoiprel1 + data.hanoiprel2 - data.hanoiprel < 0 || (HrmsCheckInOut.isPG_Act&&(data.hnxanh1 + data.hnxanh2 - data.hnxanh < 0 || data.hnvang1 + data.hnvang2 - data.hnvang < 0 || data.hn18901 + data.hn18902 - data.hn1890 < 0)))
			NUT.notify("⚠️ Tồn cuối ca là số âm. Nhập số lượng nhập NPP!", "yellow");
		else {
			but.disabled = true;
			NUT.ds.update({ url: HrmsCheckInOut.url + "data/chamcong", data: data, where: [["idchamcong", "=", id]] }, function (res) {
				if (res.success) {
					NUT.notify("Check SANLUONG thành công!", "lime");
					NUT.w2popup.message();
					HrmsCheckInOut.colorElement(elm, "brown", now);
				} else {
					but.disabled = false;
					NUT.notify("⛔ ERROR: " + res.result, "red");
				}
			});
		}
	}
}