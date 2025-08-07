var MonthlyMS03Report={
	run:function(p){
		MonthlyMS03Report.url = NUT.services[2].url;
		var now=new Date();
		NUT.w2popup.open({
			title: '📜 <i>Monthly MS03 - Chỉ tiêu Sản lượng Report</i>',
			modal:true,
			width: 360,
			height: 220,
			body: "<table style='margin:auto'><tr><td>Năm</td><td><input id='num_Year' style='width:60px' type='number' value='"+now.getFullYear()+"'/></td><td>Tháng</td><td><input id='num_Month' style='width:60px' type='number' value='"+(now.getMonth()+1)+"'/></td></tr><tr><td>Đối tác</td><td>HABECO</td>"+(n$.user.orgs.length?"<td></td><td>":"<td>Thị trường</td><td><select id='cbo_ThiTruong'><option value='ĐBSH' selected>ĐBSH</option><option value='ĐTBB'>ĐTBB</option></select>")+"</td></tr><tr><td>Vị trí</td><td colspan='3'><select id='cbo_ViTriLv'><option value='BA' selected>BA</option><option value='BA_'>BA_PartTime</option></select></td></tr><tr><td></td><td colspan='3'><input id='chk_Edit' type='checkbox'/><label for='chk_Edit'>Dùng dữ liệu Hiệu chỉnh</label></td></tr></table>",
			buttons: '<button class="w2ui-btn" onclick="NUT.w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="MonthlyMS03Report.runReport()">✔️ Report</button>'
		})
	},
	runReport:function(){
		var DINHMUC_NC=26;
		if(num_Year.value&&num_Month.value){
			var nam=num_Year.value;
			var thang=num_Month.value;
			var date=nam+"-"+thang+"-15";
			NUT.ds.select({ url: MonthlyMS03Report.url +"data/chucvuhabeco",where:[["machucvu","in","TF','TL','GDCN"],["or",["ngaybatdau","is",null],["ngaybatdau","<=",date]],["or",["ngayketthuc","is",null],["ngayketthuc",">=",date]]]},function(res2){
				var lookupTL={},lookupTF={},gdcn=null;
				for(var i=0;i<res2.result.length;i++){
					var cv=res2.result[i];
					if(cv.machucvu=="TL")lookupTL[cv.makhuvuc]=cv.hoten;
					else if(cv.machucvu=="TF")lookupTF[cv.makhuvuc]=cv.hoten;
					else if(cv.machucvu=="GDCN")gdcn=cv.hoten;
				}
				var vitrilv=cbo_ViTriLv.value;
				
				var where=[["nam","=",nam],["thang","=",thang],["madoitac","=","HABECO"],(n$.user.orgs.length?["makhuvuc","in",n$.user.orgs]:["thitruong","=",cbo_ThiTruong.value])];
				NUT.ds.select({url:MonthlyMS03Report.url+"data/chitieu",where:[["nam","=",nam],["thang","=",thang],["madoitac","=","HABECO"]]},function(res3){
					if(res3.success&&res3.result.length){
						var lookupChiTieu={};
						for(var i=0;i<res3.result.length;i++){
							var ct=res3.result[i];
							lookupChiTieu[ct["manhanvien"]]=ct;
						}
						NUT.ds.select({url:MonthlyMS03Report.url+"data/tk_chamcong_v",select:"manhanvien,cong",where:[["nam","=",nam],["thang","=",thang]]},function(res4){

							var lookupCong={};
							for(var i=0;i<res4.result.length;i++){
								var data=res4.result[i];
								lookupCong[data["manhanvien"]]=data.cong;
							}
						
							NUT.ds.select({url:MonthlyMS03Report.url+"data/rpt_sanluongweekly_v",limit:20000,orderby:"sttkv,stt,madiemban",where:[["nam","=",nam],["thang","=",thang],["madoitac","=","HABECO"],(n$.user.orgs.length?["makhuvuc","in",n$.user.orgs]:["thitruong","=",cbo_ThiTruong.value]),[["nam","=",nam],["thang","=",thang],["madoitac","=","HABECO"],(n$.user.orgs.length?["makhuvuc","in",n$.user.orgs]:["thitruong","=",cbo_ThiTruong.value]),(vitrilv=="SM"||vitrilv=="BA"?["vitrilv","=",vitrilv]:["vitrilv","like",vitrilv+"*"]),["dulieu","=",vitrilv=="SM"?-1:(chk_Edit.checked?1:0)]],["dulieu","=",chk_Edit.checked?1:0]]},function(res){
								if(res.success&&res.result.length){
									var win=window.open("site/"+n$.user.siteid+"/"+n$.app.appid+"/MonthlyMS03Report.html");
									win.onload=function(){
										this.labGDCN.innerHTML=gdcn;
										this.labThangNam.innerHTML="THÁNG "+thang+" NĂM "+nam;
										this.labThiTruong.innerHTML=cbo_ThiTruong.value;
										this.labNgayBaoCao.innerHTML=(new Date()).toLocaleString();
										var oldMaNhanVien=null;
										var oldMaDiemBan=null;
										var oldTuan=null;
										var row=null;
										var total=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
										var sumSanLuong=0,sumTrongDiem=0;
										var wSanLuong=[], nvNgayCong=0;
										var stt=0,ct=null;
										for(var i=0;i<res.result.length;i++){
											var rec=res.result[i];
											if(rec.manhanvien!=oldMaNhanVien){
												if(row){
													row.cells[10].innerHTML=DINHMUC_NC;
													row.cells[11].innerHTML=nvNgayCong;
													if(ct){
														row.cells[33+5].innerHTML=ct.bold;
														row.cells[34+5].innerHTML=ct.light;
														row.cells[35+5].innerHTML=ct.trucbach;
														row.cells[36+5].innerHTML=ct.hanoiprel;
														row.cells[37+5].innerHTML=ct.hanoipre;
														row.cells[38+5].innerHTML=ct.bold+ct.light+ct.trucbach+ct.hanoipre+ct.hanoiprel;
														row.cells[39+5].innerHTML=ct.bold+ct.light;
													}
													
													if(oldMaDiemBan!=rec.madiemban){
														row.cells[4].innerHTML+="<br/>"+rec.loaihinh;
														row.cells[5].innerHTML+="<br/>"+rec.tendiemban;
														row.cells[6].innerHTML+="<br/>"+rec.sonha;
														row.cells[7].innerHTML+="<br/>"+rec.duong;
														row.cells[8].innerHTML+="<br/>"+rec.huyen;
														
													}
													var offset=0;
													for (var tuan=0;tuan<wSanLuong.length;tuan++){
														var wSL=wSanLuong[tuan];
														if(wSL){
															row.cells[12+offset].innerHTML=Math.round(10*wSL.bold)/10;
															row.cells[13+offset].innerHTML=Math.round(10*wSL.light)/10;
															row.cells[14+offset].innerHTML=Math.round(10*wSL.trucbach)/10;
															row.cells[15+offset].innerHTML=Math.round(10*wSL.hanoiprel)/10;
															row.cells[16+offset].innerHTML=Math.round(10*wSL.hanoipre)/10;
															
															total[2+offset]+=wSL.bold;
															total[3+offset]+=wSL.light;
															total[4+offset]+=wSL.trucbach;
															total[5+offset]+=wSL.hanoiprel;
															total[6+offset]+=wSL.hanoipre;									
															offset+=5;
														}
													}
													
													row.cells[32+5].innerHTML="<b>"+Math.round(sumSanLuong*10)/10+"</b>";
													total[22+5]+=sumSanLuong;
													row.cells[40+5].innerHTML="<b>"+Math.round(sumTrongDiem*10)/10+"</b>";
													row.cells[41+5].innerHTML="B&L";
													total[29+5]+=sumTrongDiem;
													total[0]+=DINHMUC_NC;
													
													
													wSanLuong=[];
												}
												row=this.tblData.insertRow();
												row.innerHTML="<td align='center'>"+(++stt)+"</td><td>"+(lookupTF[rec.makhuvuc]||lookupTL[rec.makhuvuc])+"</td><td class='frozen'>"+rec.hoten+"</td><td align='center'>"+rec.sohoso+"</td><td>"+rec.loaihinh+"</td><td class='frozen2'>"+rec.tendiemban+"</td><td>"+rec.sonha+"</td><td>"+rec.duong+"</td><td>"+rec.huyen+"</td><td>"+rec.tenkhuvuc+"</td>";
												for(var j=0;j<total.length;j++)row.insertCell().align="center";
												oldMaNhanVien=rec.manhanvien;
												sumSanLuong=0;
												sumTrongDiem=0;
												nvNgayCong=0;
												ct=lookupChiTieu[rec.manhanvien];
												oldTuan=null;
											}
											
											//console.log(offset,rec);
											var sanluong=rec.bold/20+rec.boldl/24+rec.light/20+rec.lightl/24+rec.trucbach/24+rec.hanoipre/20+rec.hanoiprel/24;
											sumSanLuong+=sanluong;
											var sltrongdiem=rec.bold/20+rec.boldl/24+rec.light/20+rec.lightl/24;
											sumTrongDiem+=sltrongdiem;
											
											if(!wSanLuong[rec.tuan]) wSanLuong[rec.tuan]={bold:0,light:0,trucbach:0,hanoipre:0,hanoiprel:0};
											wSanLuong[rec.tuan].bold+=rec.bold/20+rec.boldl/24;
											wSanLuong[rec.tuan].light+=rec.light/20+rec.lightl/24;
											wSanLuong[rec.tuan].trucbach+=rec.trucbach/24;
											wSanLuong[rec.tuan].hanoiprel+=rec.hanoiprel/20;
											wSanLuong[rec.tuan].hanoipre+=rec.hanoipre/24;
											
											nvNgayCong+=lookupCong[rec.manhanvien];
											total[1]+=nvNgayCong;
											
										}
										
										if(row){
											row.cells[10].innerHTML=DINHMUC_NC;
											row.cells[11].innerHTML=nvNgayCong;
											if(ct){
												row.cells[33+5].innerHTML=ct.bold;
												row.cells[34+5].innerHTML=ct.light;
												row.cells[35+5].innerHTML=ct.trucbach;
												row.cells[36+5].innerHTML=ct.hanoiprel;
												row.cells[37+5].innerHTML=ct.hanoipre;
											}
											row.cells[38+5].innerHTML=rec.sanluongkhoan;
											row.cells[39+5].innerHTML=rec.sltrongdiem;
											if(oldMaDiemBan!=rec.madiemban){
												row.cells[4].innerHTML+="<br/>"+rec.loaihinh;
												row.cells[5].innerHTML+="<br/>"+rec.tendiemban;
												row.cells[6].innerHTML+="<br/>"+rec.sonha;
												row.cells[7].innerHTML+="<br/>"+rec.duong;
												row.cells[8].innerHTML+="<br/>"+rec.huyen;
												
											}
											var offset=0;
											for (var tuan=0;tuan<wSanLuong.length;tuan++){
												var wSL=wSanLuong[tuan];
												if(wSL){
													row.cells[12+offset].innerHTML=Math.round(10*wSL.bold)/10;
													row.cells[13+offset].innerHTML=Math.round(10*wSL.light)/10;
													row.cells[14+offset].innerHTML=Math.round(10*wSL.trucbach)/10;
													row.cells[15+offset].innerHTML=Math.round(10*wSL.hanoiprel)/10;
													row.cells[16+offset].innerHTML=Math.round(10*wSL.hanoipre)/10;
													
													total[2+offset]+=wSL.bold;
													total[3+offset]+=wSL.light;
													total[4+offset]+=wSL.trucbach;
													total[5+offset]+=wSL.hanoiprel;
													total[6+offset]+=wSL.hanoipre;
													offset+=5;
												}
											}
											
											row.cells[32+5].innerHTML="<b>"+Math.round(sumSanLuong*10)/10+"</b>";
											total[22+5]+=sumSanLuong;
											row.cells[40+5].innerHTML="<b>"+Math.round(sumTrongDiem*10)/10+"</b>";
											row.cells[41+5].innerHTML="B&L";
											total[29+5]+=sumTrongDiem;
											total[0]+=DINHMUC_NC;
											
										}
										row=this.tblData.insertRow();
										row.innerHTML="<td colspan='10' align='right'><b>Tổng cộng: </b></td>";
										for(var i=0;i<total.length;i++){
											var cell=row.insertCell();
											cell.align="center";
											cell.innerHTML="<b>"+Math.round(total[i]*10)/10+"</b>";
										}
										
									}
								} else NUT.notify("No data to report!","yellow");
							});
						});
					}else NUT.notify("Không có dữ liệu chỉ tiêu!","yellow");
				});
			});
		} else NUT.notify("Nhập năm, tháng trước khi thực hiện!","yellow");
	}
}