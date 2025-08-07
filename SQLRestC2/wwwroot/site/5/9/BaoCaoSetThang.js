var BaoCaoSetThang = {
	run: function (p) {
		BaoCaoSetThang.url = NUT.services[5].url;
		var now=new Date();
		NUT.w2popup.open({
			title: '📃 <i>Báo cáo sét theo tháng</i>',
			modal: true,
			width: 360,
			height: 180,
			body: "<table style='margin:auto'><tr><td align='right'>Năm</td><td><input type='number' id='numNam' class='w2ui-input' style='width:60px' value='"+now.getFullYear()+"'/></td><td align='right'>Tháng</td><td><input type='number' id='numThang' class='w2ui-input' style='width:60px' value='"+(now.getMonth()+1)+"'/></td></tr><tr><td align='right'>Loại sét</td><td colspan='3'><select id='cboLoaiSet'><option></option><option value='CG'>Sét xuống đất</option><option value='CP'>Sét trong mây</option></select></td></tr></table>",
			actions: {
				"_Cancel": function () {
					NUT.w2popup.close();
				}, "_Ok": function () {
					var where=[["[Năm]","=",numNam.valueAsNumber],["[Tháng]","=",numThang.valueAsNumber]];
					if(cboLoaiSet.value)where.push(["[Loại sét]","=",cboLoaiSet.value]);

					NUT.ds.select({url:NUT.services[6].url+"data/c_sethistory_v",limit:100000, where:where},function (res) {
						if (res.success&&res.result.length) {
							var win = window.open("site/" + n$.user.siteid + "/" + n$.app.appid + "/BaoCaoSetThang.html");
							win.onload = function () {
								this.labThangNam.innerHTML = numThang.value +"/"+ numNam.value;
								this.labNgayBaoCao.innerHTML = (new Date()).toLocaleString();
								var thongke={};var total={};
								for (var i = 0; i < res.result.length; i++) {
									var rec=res.result[i];
									var kv=rec['Khu vực HN'];
									var ngay=rec['Ngày'];
									if(thongke[kv]===undefined)thongke[kv]={};
									if(thongke[kv][ngay]===undefined)thongke[kv][ngay]=0;
									if(total[ngay]===undefined)total[ngay]=0;
									thongke[kv][ngay]+=rec['Tổng'];
								}
								for(var kv in thongke)if(thongke.hasOwnProperty(kv)){
									var row = this.tblData.insertRow();
									row.innerHTML = "<th>HN-"+kv+"</th><td align='center'></td>";
									var tk=thongke[kv];var sum=0
									for(var ngay=1;ngay<=31;ngay++){
										row.insertCell().align='center';
										var val=tk[ngay]||0;
										row.cells[ngay].innerHTML=val.toLocaleString();
										sum+=val;
										total[ngay]+=val;
									}
									row.cells[32].innerHTML="<b>"+sum.toLocaleString()+"</b>";
								}
								var row = this.tblData.insertRow();
								row.innerHTML = "<th>TỔNG CỘNG</th><td align='center'></td>";
								var grand=0;
								for(var ngay=1;ngay<=31;ngay++){
									row.insertCell().align='center';
									var val=total[ngay]||0;
									row.cells[ngay].innerHTML="<b>"+val.toLocaleString()+"</b>";
									grand+=val;
								}
								row.cells[32].innerHTML="<b>"+grand.toLocaleString()+"</b>";
							};
						} else NUT.notify("⚠️ No data to report!", "yellow");
					});

				}
			}
		});
	}
}