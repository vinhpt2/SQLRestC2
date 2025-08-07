var BaoCaoSetNam = {
	run: function (p) {
		BaoCaoSetNam.url = NUT.services[5].url;
		
		NUT.w2popup.open({
			title: '📃 <i>Báo cáo sét theo năm</i>',
			modal: true,
			width: 360,
			height: 180,
			body: "<table style='margin:auto'><tr><td align='right'>Năm</td><td><input type='number' id='numNam' class='w2ui-input' style='width:60px' value='"+(new Date().getFullYear())+"'/></td></tr><tr><td align='right'>Loại sét</td><td><select id='cboLoaiSet'><option></option><option value='CG'>Sét xuống đất</option><option value='CP'>Sét trong mây</option></select></td></tr></table>",
			actions: {
				"_Cancel": function () {
					NUT.w2popup.close();
				}, "_Ok": function () {
					var where=[["[Năm]","=",numNam.valueAsNumber]];
					if(cboLoaiSet.value)where.push(["[Loại sét]","=",cboLoaiSet.value]);

					NUT.ds.select({url:NUT.services[6].url+"data/c_sethistory_v",limit:100000, where:where},function (res) {
						if (res.success&&res.result.length) {
							var win = window.open("site/" + n$.user.siteid + "/" + n$.app.appid + "/BaoCaoSetNam.html");
							win.onload = function () {
								this.labThangNam.innerHTML = numNam.value;
								this.labNgayBaoCao.innerHTML = (new Date()).toLocaleString();
								var thongke={};var total={};
								for (var i = 0; i < res.result.length; i++) {
									var rec=res.result[i];
									var kv=rec['Khu vực HN'];
									var thang=rec['Tháng'];
									if(thongke[kv]===undefined)thongke[kv]={};
									if(thongke[kv][thang]===undefined)thongke[kv][thang]=0;
									if(total[thang]===undefined)total[thang]=0;
									thongke[kv][thang]+=rec['Tổng'];
								}
								for(var kv in thongke)if(thongke.hasOwnProperty(kv)){
									var row = this.tblData.insertRow();
									row.innerHTML = "<th>HN-"+kv+"</th><td align='center'></td>";
									var tk=thongke[kv];var sum=0
									for(var thang=1;thang<=12;thang++){
										row.insertCell().align='center';
										var val=tk[thang]||0;
										row.cells[thang].innerHTML=val.toLocaleString();
										sum+=val;
										total[thang]+=val;
									}
									row.cells[13].innerHTML="<b>"+sum.toLocaleString()+"</b>";
								}
								var row = this.tblData.insertRow();
								row.innerHTML = "<th>TỔNG CỘNG</th><td align='center'></td>";
								var grand=0;
								for(var thang=1;thang<=12;thang++){
									row.insertCell().align='center';
									var val=total[thang]||0;
									row.cells[thang].innerHTML="<b>"+val.toLocaleString()+"</b>";
									grand+=val;
								}
								row.cells[13].innerHTML="<b>"+grand.toLocaleString()+"</b>";
							};
						} else NUT.notify("⚠️ No data to report!", "yellow");
					});

				}
			}
		});
	}
}