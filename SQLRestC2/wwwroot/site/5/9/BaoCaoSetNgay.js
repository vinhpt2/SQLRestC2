var BaoCaoSetNgay = {
	run: function (p) {
		BaoCaoSetNgay.url = NUT.services[5].url;
		var now=new Date();
		NUT.w2popup.open({
			title: '📃 <i>Báo cáo sét theo ngày</i>',
			modal: true,
			width: 360,
			height: 180,
			body: "<table style='margin:auto'><tr><td align='right'>Ngày</td><td><input type='date' id='datNgay' class='w2ui-input' value='"+now.getFullYear()+"-"+(now.getMonth+1)+"-"+now.getDate()+"'/></td></tr><tr><td align='right'>Loại sét</td><td><select id='cboLoaiSet'><option></option><option value='CG'>Sét xuống đất</option><option value='CP'>Sét trong mây</option></select></td></tr></table>",
			actions: {
				"_Cancel": function () {
					NUT.w2popup.close();
				}, "_Ok": function () {
					var date=datNgay.valueAsDate;
					var nam=date.getFullYear();
					var thang=date.getMonth()+1;
					var ngay=date.getDate();
					var where=[["nam","=",nam],["thang","=",thang],["ngay","=",ngay]];
					if(cboLoaiSet.value)where.push(["loaiset","=",cboLoaiSet.value]);

					NUT.ds.select({url:NUT.services[6].url+"data/gio_sethistory_v",limit:100000, where:where},function (res) {
						if (res.success&&res.result.length) {
							var win = window.open("site/" + n$.user.siteid + "/" + n$.app.appid + "/BaoCaoSetNgay.html");
							win.onload = function () {
								this.labThangNam.innerHTML = thang+"/"+ngay+"/"+nam;
								this.labNgayBaoCao.innerHTML = (new Date()).toLocaleString();
								var thongke={};var total={};
								for (var i = 0; i < res.result.length; i++) {
									var rec=res.result[i];
									var kv=rec.hanoi;
									var gio=rec.gio;
									if(thongke[kv]===undefined)thongke[kv]={};
									if(thongke[kv][gio]===undefined)thongke[kv][gio]=0;
									if(total[gio]===undefined)total[gio]=0;
									thongke[kv][gio]+=rec.tong;
								}
								for(var kv in thongke)if(thongke.hasOwnProperty(kv)){
									var row = this.tblData.insertRow();
									row.innerHTML = "<th>HN-"+kv+"</th><td align='center'></td>";
									var tk=thongke[kv];var sum=0
									for(var gio=0;gio<=23;gio++){
										row.insertCell().align='center';
										var val=tk[gio]||0;
										row.cells[gio+1].innerHTML=val.toLocaleString();
										sum+=val;
										total[gio]+=val;
									}
									row.cells[25].innerHTML="<b>"+sum.toLocaleString()+"</b>";
								}
								var row = this.tblData.insertRow();
								row.innerHTML = "<th>TỔNG CỘNG</th><td align='center'></td>";
								var grand=0;
								for(var gio=0;gio<=23;gio++){
									row.insertCell().align='center';
									var val=total[gio]||0;
									row.cells[gio+1].innerHTML="<b>"+val.toLocaleString()+"</b>";
									grand+=val;
								}
								row.cells[25].innerHTML="<b>"+grand.toLocaleString()+"</b>";
							};
						} else NUT.notify("⚠️ No data to report!", "yellow");
					});

				}
			}
		});
	}
}