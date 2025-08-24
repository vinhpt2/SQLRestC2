var ImportDuLieuSet = {
	run: function (p) {
		ImportDuLieuSet.url = NUT.services[6].url;
		NUT.ds.select({url:ImportDuLieuSet.url+"data/sethistory",select:"max(thoigian) maxtg"},function (res2) {
			if (res2.success&&res2.result.length) {
				var maxtg=new Date(res2.result[0].maxtg);
				NUT.w2popup.open({
					title: '📥 <i>Import dữ liệu sét</i>',
					modal: true,
					width: 360,
					height: 220,
					body: "<table style='margin:auto'><tr><td align='right'>Từ ngày</td><td><input type='date' id='txtTuNgay' class='w2ui-input' value='"+maxtg.toISOString().substring(0,10)+"'/></td></tr><tr><td align='right'>Đến ngày</td><td><input type='date' id='txtDenNgay' class='w2ui-input' value='"+(new Date().toISOString().substring(0,10))+"'/></td></tr><tr><td align='right'>Loại sét</td><td><select id='cboLoaiSet'><option></option><option value='CG'>Sét xuống đất</option><option value='CP'>Sét trong mây</option></select></td></tr></table>",
					actions: {
						"_Cancel": function () {
							NUT.w2popup.close();
						}, "_Ok": function () {
							var date=datNgay.valueAsDate;
							var nam=date.getFullYear();
							var thang=date.getMonth()+1;
							var ngay=date.getDate();

							NUT.ds.get({url:URL_PROXY+"https://set.evnhanoi.vn/rest/proxy?http://10.2.60.1:8080/cp4/dbserver/LdQuery.php?format=default&s="+txtThoiDiem.value+"&e="+txtThoiDiem2.value+"&ll=20.510958&ul=21.459775&lg=105.163522&ug=106.078134&nocloud=checked"},function(res){
								if(res.success){
									var data=[];
									for(var i=0;i<res.result.length;i++){
										var rec=res.result[i].split('\t');
										var tg=new Date(rec[0]);
										data.push({loaiset:'CG',thoigian:tg,lat:rec[1],lng:rec[2],giatri:rec[3],nam:tg.getFullYear(),thang:tg.getMonth()+1,ngay:tg.getDate(),gio:tg.getHours()});
									}
									NUT.ds.insert({url:ImportDuLieuSet.url+"data/sethistory",data:data},function(res3){
										if(res3.success)NUT.notify("Import dữ liệu sét thành công", "lime");
										else NUT.notify("🛑 ERROR: " + res3.result, "red");
									});
								}else NUT.notify("🛑 ERROR: " + res.result, "red");
							});
						}
					}
				});
			}
		});
	}
}