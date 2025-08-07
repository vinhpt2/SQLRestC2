var MonthlyMS02Report={
	run:function(p){
		MonthlyMS02Report.url = NUT.services[2].url;
		var now=new Date();
		NUT.w2popup.open({
			title: '📜 <i>Monthly MS02-Chấm công Report</i>',
			modal:true,
			width: 360,
			height: 220,
			body: "<table style='margin:auto'><tr><td>Năm</td><td><input id='num_Year' style='width:60px' type='number' value='"+now.getFullYear()+"'/></td><td>Tháng</td><td><input id='num_Month' style='width:60px' type='number' value='"+(now.getMonth()+1)+"'/></td></tr><tr><td>Đối tác</td><td>HABECO</td>"+(n$.user.orgs.length?"<td></td><td>":"<td>Thị trường</td><td><select id='cbo_ThiTruong'><option value='ĐBSH' selected>ĐBSH</option><option value='ĐTBB'>ĐTBB</option></select>")+"</td></tr><tr><td>Vị trí</td><td colspan='3'><select id='cbo_ViTriLv'><option value='BA' selected>BA</option><option value='BA_'>BA_PartTime</option><option value='SM'>SM</option></select></td></tr><tr><td></td><td colspan='3'><input id='chk_Edit' type='checkbox'/><label for='chk_Edit'>Dùng dữ liệu Hiệu chỉnh</label></td></tr></table>",
			buttons: '<button class="w2ui-btn" onclick="NUT.w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="MonthlyMS02Report.runReport()">✔️ Report</button>'
		})
	},
	runReport:function(){
		if(num_Year.value&&num_Month.value){
			var nam=num_Year.value;
			var thang=num_Month.value;
			var date=nam+"-"+thang+"-15";
			NUT.ds.select({ url: MonthlyMS02Report.url +"data/chucvuhabeco",where:[["machucvu","in","TF','TL','GDCN"],["or",["ngaybatdau","is",null],["ngaybatdau","<=",date]],["or",["ngayketthuc","is",null],["ngayketthuc",">=",date]]]},function(res2){
				var lookupTL={},lookupTF={},gdcn=null;
				for(var i=0;i<res2.result.length;i++){
					var cv=res2.result[i];
					if(cv.machucvu=="TL")lookupTL[cv.makhuvuc]=cv.hoten;
					else if(cv.machucvu=="TF")lookupTF[cv.makhuvuc]=cv.hoten;
					else if(cv.machucvu=="GDCN")gdcn=cv.hoten;
				}
				var vitrilv=cbo_ViTriLv.value;
				var isSM=(vitrilv=="SM");
				NUT.ds.select({url:MonthlyMS02Report.url+"data/chamcong_v",limit:20000,orderby:"sttkv,stt,madiemban",where:[["nam","=",nam],["thang","=",thang],["madoitac","=","HABECO"],(n$.user.orgs.length?["makhuvuc","in",n$.user.orgs]:["thitruong","=",cbo_ThiTruong.value]),(vitrilv=="SM"||vitrilv=="BA"?["vitrilv","=",vitrilv]:["vitrilv","like",vitrilv+"*"]),["dulieu","=",isSM?-1:(chk_Edit.checked?1:0)]]},function(res){
					if(res.success&&res.result.length){
						var win=window.open("site/"+n$.user.siteid+"/"+n$.app.appid+"/MonthlyMS02Report"+(isSM?"SM":"BA")+".html");
						win.onload=function(){
							this.labGDCN.innerHTML=gdcn;
							this.labThangNam.innerHTML="THÁNG "+thang+" NĂM "+nam;
							this.labThiTruong.innerHTML=cbo_ThiTruong.value;
							this.labNgayBaoCao.innerHTML=(new Date()).toLocaleString();
							var oldMaNhanVien=null;
							var oldMaDiemBan=null;
							var row=null;
							var lookupCol={KL:3,KLO:4,N:5,NL:6,S:7,E:8};
							var sum=[0,0,0,0,0,0,0,0,0];
							var total=[];
							var grandTotal=[0,0,0,0,0,0,0,0,0];
							var stt=0,ngaycong=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
							for(var i=0;i<res.result.length;i++){
								var rec=res.result[i];
								if(rec.manhanvien!=oldMaNhanVien){
									if(row){
										for(var j=0;j<ngaycong.length;j++){
											sum[0]+=ngaycong[j];
											sum[2]+=ngaycong[j];
											total[rec.ngay]+=ngaycong[j];
										}
										for(var j=0;j<sum.length;j++){
											row.cells[(isSM?37:41)+j].innerHTML=sum[j];
											grandTotal[j]+=sum[j];
										}
									}
									row=this.tblData.insertRow();
									row.innerHTML="<td align='center'>"+(++stt)+"</td><td>"+(lookupTF[rec.makhuvuc]||lookupTL[rec.makhuvuc])+"</td><td class='frozen'>"+rec.hoten+"</td>"+(isSM?"<td align='center' class='frozen2'>"+rec.manhanvien+"</td><td>"+rec.kenhbanhang+"</td>":"<td align='center'>"+rec.sohoso+"</td><td>"+rec.loaihinh+"</td><td class='frozen2'>"+rec.tendiemban+"</td><td>"+rec.sonha+"</td><td>"+rec.duong+"</td><td>"+rec.huyen)+"</td><td>"+rec.tenkhuvuc+"</td>";
									for(var j=0;j<=41;j++)row.insertCell().align="center";
									oldMaNhanVien=rec.manhanvien;
									oldMaDiemBan=rec.madiemban;
									ngaycong=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
									sum=[0,0,0,0,0,0,0,0,0];
								}
								
								if(rec.ngay){
									if(total[rec.ngay]==undefined)total[rec.ngay]=0;
									if(rec.cong){
										ngaycong[rec.ngay]+=rec.cong;
										if(ngaycong[rec.ngay]>1)ngaycong[rec.ngay]=1;
										row.cells[rec.ngay+(isSM?5:9)].innerHTML=ngaycong[rec.ngay];
									}
									if(rec.chamcong){
										row.cells[rec.ngay+9].innerHTML=rec.chamcong;
										sum[lookupCol[rec.chamcong]]++;
									}
								}
								if(oldMaDiemBan!=rec.madiemban){
									row.cells[4].innerHTML+="<br/>"+rec.loaihinh;
									row.cells[5].innerHTML+="<br/>"+rec.tendiemban;
									row.cells[6].innerHTML+="<br/>"+rec.sonha;
									row.cells[7].innerHTML+="<br/>"+rec.duong;
									row.cells[8].innerHTML+="<br/>"+rec.huyen;
									oldMaDiemBan=rec.madiemban;
								}
							}
							if(row){
								for(var j=0;j<sum.length;j++){
									row.cells[(isSM?37:41)+j].innerHTML=sum[j];
									grandTotal[j]+=sum[j];
								}
							}
							row=this.tblData.insertRow();
							row.innerHTML="<td colspan='"+(isSM?6:10)+"' align='right'><b>Tổng cộng: </b></td>";
							for(var i=1;i<32;i++){
								var cell=row.insertCell();
								cell.align="center";
								cell.innerHTML="<b>"+(total[i]?total[i]:0)+"</b>";
							}
							for(var i=0;i<sum.length;i++){
								var cell=row.insertCell();
								cell.align="center";
								cell.innerHTML="<b>"+(grandTotal[i]?grandTotal[i]:0)+"</b>";
							}
							row.insertCell();row.insertCell();
						}
					} else NUT.alert("No data to report!","yellow");
				});
			});
		} else NUT.alert("Nhập năm, tháng trước khi thực hiện!","yellow");
	}
}