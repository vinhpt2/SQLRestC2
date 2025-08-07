var DailyCheckInoutReport={
	run:function(p){
		var now=new Date();
		DailyCheckInoutReport.url = NUT.services[2].url;
		NUT.w2popup.open({
			title: '📜 <i>Daily Check In-out Report</i>',
			modal:true,
			width: 360,
			height: 220,
			body: "<table style='margin:auto'><tr><td>Năm</td><td><input id='num_Year' style='width:60px' type='number' value='"+now.getFullYear()+"'/></td><td>Tháng</td><td><input id='num_Month' style='width:60px' type='number' value='"+(now.getMonth()+1)+"'/></td></tr><tr><td>Đối tác</td><td>HABECO</td>"+(n$.user.orgs.length?"<td></td><td>":"<td>Thị trường</td><td><select id='cbo_ThiTruong'><option value='ĐBSH' selected>ĐBSH</option><option value='ĐTBB'>ĐTBB</option></select>")+"</td></tr><tr><td>Vị trí</td><td colspan='3'><select id='cbo_ViTriLv'><option value='BA' selected>BA</option><option value='BA_'>BA_PartTime</option></select></td></tr><tr><td></td><td colspan='3'><input id='chk_Edit' type='checkbox'/><label for='chk_Edit'>Dùng dữ liệu Hiệu chỉnh</label></td></tr></table>",
			buttons: '<button class="w2ui-btn" onclick="NUT.w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="DailyCheckInoutReport.runReport()">✔️ Report</button>'
		})
	},
	runReport:function(){
		if(num_Year.value&&num_Month.value){
			var vitrilv=cbo_ViTriLv.value;
			var nam=num_Year.value;
			var thang=num_Month.value;
			var date=nam+"-"+thang+"-15";
			
			NUT.ds.select({ url: DailyCheckInoutReport.url +"data/chucvuhabeco",where:[["machucvu","in","TF','TL','GDCN"],["or",["ngaybatdau","is",null],["ngaybatdau","<=",date]],["or",["ngayketthuc","is",null],["ngayketthuc",">=",date]]]},function(res2){
				var lookupTL={},lookupTF={},gdcn=null;
				for(var i=0;i<res2.result.length;i++){
					var cv=res2.result[i];
					if(cv.machucvu=="TL")lookupTL[cv.makhuvuc]=cv.hoten;
					else if(cv.machucvu=="TF")lookupTF[cv.makhuvuc]=cv.hoten;
					else if(cv.machucvu=="GDCN")gdcn=cv.hoten;
				}
				NUT.ds.select({url:DailyCheckInoutReport.url+"data/chamcong_v",orderby:"sttkv,stt,madiemban,ngay",limit:20000,where:[["nam","=",nam],["thang","=",thang],["madoitac","=","HABECO"],["thitruong","=",cbo_ThiTruong.value],vitrilv=="BA"?["vitrilv","=",vitrilv]:["vitrilv","like",vitrilv+"*"],["dulieu","=",chk_Edit.checked?1:0]]},function(res){
					if(res.success&&res.result.length){
						var win=window.open("site/"+n$.user.siteid+"/"+n$.app.appid+"/DailyCheckInoutReport.html");
						win.onload=function(){
							this.labGDCN.innerHTML=gdcn;
							this.labThangNam.innerHTML=thang+"/"+nam;
							this.labThiTruong.innerHTML=n$.user.orgs.length?n$.user.kvhcnames:cbo_ThiTruong.value;
							this.labNgayBaoCao.innerHTML=(new Date()).toLocaleString();
							var oldMaNhanVien=null;
							var oldMaDiemBan=null;
							var stt=0;
							var vipham=0;
							var row=null;
							var maxi=res.result.length-1;
							for(var i=0;i<=maxi;i++){
								var rec=res.result[i];
								if(rec.manhanvien!=oldMaNhanVien||rec.madiemban!=oldMaDiemBan){
									if(row){
										row.cells[75].innerHTML=vipham;
										vipham=0;
									}
									row=this.tblData.insertRow();
									row.innerHTML="<td align='center'>"+(++stt)+"</td><td>"+(rec.dms||"")+"</td><td>"+rec.thitruong+"</td><td>"+(lookupTF[rec.makhuvuc]||lookupTL[rec.makhuvuc])+"</td><td class='frozen'>"+rec.hoten+"</td><td align='center'>"+rec.sohoso+"</td><td>"+rec.loaihinh+"</td><td class='frozen2'>"+rec.tendiemban+"</td><td>"+rec.sonha+"</td><td>"+rec.duong+"</td><td>"+rec.huyen+"</td><td>"+rec.tenkhuvuc+"</td><td>"+(rec.gioden?rec.gioden.substr(0,5):"")+(rec.giove?" - "+rec.giove.substr(0,5):"")+(rec.gioden2?"<br/>"+rec.gioden2.substr(0,5):"")+(rec.giove2?" - "+rec.giove2.substr(0,5):"")+"</td>";
									for(var j=0;j<63;j++)row.insertCell().align="center";
									oldMaNhanVien=rec.manhanvien;
									oldMaDiemBan=rec.madiemban;
								}
								row.cells[2*rec.ngay+11].innerHTML=rec.chamcong||(rec.thoigianden?(rec.lan==2?"xx":"x"):"");
								row.cells[2*rec.ngay+12].innerHTML=rec.chamcong||(rec.thoigianve?(rec.lan==2?"xx":"x"):"");
								if(!rec.chamcong&&(!rec.thoigianden||!rec.thoigianve))vipham++;
							}
							if(row)row.cells[75].innerHTML=vipham;
						}
					} else NUT.notify("No data to report!","yellow");
				});
			});
		} else NUT.notify("Nhập năm, tháng trước khi thực hiện!","yellow");
	}
}