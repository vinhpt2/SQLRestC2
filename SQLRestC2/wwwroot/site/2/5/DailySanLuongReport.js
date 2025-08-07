var DailySanLuongReport={
	run:function(p){		
		var now=new Date();
		DailySanLuongReport.url = NUT.services[2].url;
		NUT.w2popup.open({
			title: '📜 <i>Daily Sản lượng Report</i>',
			modal:true,
			width: 360,
			height: 220,
			body: "<table style='margin:auto'><tr><td>Năm</td><td><input id='num_Year' style='width:60px' type='number' value='"+now.getFullYear()+"'/></td><td>Tháng</td><td><input id='num_Month' style='width:60px' type='number' value='"+(now.getMonth()+1)+"'/></td></tr><tr><td>Đối tác</td><td>HABECO</td>"+(n$.user.orgid?"<td></td><td>":"<td>Thị trường</td><td><select id='cbo_ThiTruong'><option value='ĐBSH' selected>ĐBSH</option><option value='ĐTBB'>ĐTBB</option></select>")+"</td></tr><tr><td>Vị trí</td><td colspan='3'><select id='cbo_ViTriLv'><option value='BA' selected>BA</option><option value='BA_'>BA_PartTime</option></select></td></tr><tr><td></td><td colspan='3'><input id='chk_Edit' type='checkbox'/><label for='chk_Edit'>Dùng dữ liệu Hiệu chỉnh</label></td></tr></table>",
			buttons: '<button class="w2ui-btn" onclick="NUT.w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="DailySanLuongReport.runReport()">✔️ Report</button>'
		})
	},
	runReport:function(){
		if(num_Year.value&&num_Month.value){
			var vitrilv=cbo_ViTriLv.value;
			var nam=num_Year.value;
			var thang=num_Month.value;
			var date=nam+"-"+thang+"-15";
			var url=NUT.services[2].url;
			NUT.ds.select({ url: DailySanLuongReport.url +"data/chucvuhabeco",where:[["machucvu","in","TF','TL','GDCN"],["or",["ngaybatdau","is",null],["ngaybatdau","<=",date]],["or",["ngayketthuc","is",null],["ngayketthuc",">=",date]]]},function(res2){
				var lookupTL={},lookupTF={},gdcn=null;
				for(var i=0;i<res2.result.length;i++){
					var cv=res2.result[i];
					if(cv.machucvu=="TL")lookupTL[cv.makhuvuc]=cv.hoten;
					else if(cv.machucvu=="TF")lookupTF[cv.makhuvuc]=cv.hoten;
					else if(cv.machucvu=="GDCN")gdcn=cv.hoten;
				}
				
				NUT.ds.select({url:DailySanLuongReport.url+"data/chitieu",where:[["nam","=",nam],["thang","=",thang],["madoitac","=","HABECO"]]},function(res3){
					if(res3.success&&res3.result.length){
						var lookupChiTieu={};
						for(var i=0;i<res3.result.length;i++){
							var ct=res3.result[i];
							lookupChiTieu[ct["manhanvien"]]=ct;
						}
						var where=[["nam","=",nam],["thang","=",thang],["madoitac","=","HABECO"],(n$.user.orgid?["makhuvuc","in",n$.user.orgid]:["thitruong","=",cbo_ThiTruong.value]),vitrilv=="BA"?["vitrilv","=",vitrilv]:["vitrilv","like",vitrilv+"*"],["dulieu","=",chk_Edit.checked?1:0]];
						NUT.ds.select({url:DailySanLuongReport.url+"data/chamcong_v",limit:20000,orderby:"sttkv,stt,madiemban",where:where},function(res){
							if(res.success&&res.result.length){
								var win=window.open("site/"+n$.user.siteid+"/"+n$.app.appid+"/DailySanLuongReport.html");
								win.onload=function(){
									this.labGDCN.innerHTML=gdcn;
									this.labThangNam.innerHTML=thang+"/"+nam;
									this.labThiTruong.innerHTML=n$.user.orgid?n$.user.kvhcnames:cbo_ThiTruong.value;
									this.labNgayBaoCao.innerHTML=(new Date()).toLocaleString();
									var oldMaNhanVien=null;
									var oldMaDiemBan=null;
									var row=null;
									var sp=["bold","light","boldl","lightl","trucbachl","hanoiprel","hanoipre"];
									var spct=["bold","light","trucbach","hanoiprel","hanoipre"];
									var td=[true,true,true,true,false,false,false];
									var dv=[20,20,24,24,24,24,20];
									var total=[],totalsum=[0,0,0,0,0,0,0],totalct=[0,0,0,0,0,0,0,0,0,0];
									//for(var j=0;j<sp.length;j++)total[j]=0;
									var sum=[0,0,0,0,0,0,0],sumtd=0,sumct=0;
									var grandTotal=0,grandSum=0;
									var stt=0,ct=null,delta=sp.length*32+11,max=sp.length*32+11;
									var nvRow=null,nvSum=0,sumcttd=0, sumnvtd=0;

									for(var i=0;i<res.result.length;i++){
										var rec=res.result[i];
										if(rec.manhanvien!=oldMaNhanVien||rec.madiemban!=oldMaDiemBan){
											if(row){
												if(ct){
													sumcttd=ct.bold+ct.light;
													row.cells[delta+9].innerHTML=sumcttd;
													totalct[0]+=ct.bold;totalct[1]+=ct.light;totalct[2]+=ct.trucbach;totalct[3]+=ct.hanoiprel;totalct[4]+=ct.hanoipre;
													totalct[5]+=ct.bold+ct.light+ct.trucbach+ct.hanoipre+ct.hanoiprel;
													totalct[7]+=sumcttd;
													totalct[8]+=sumtd;

													for(var j=0;j<=sp.length;j++){
														row.cells[delta-sp.length+j+1].innerHTML="<b>"+Math.round((j==sp.length?grandSum:sum[j])*10)/10+"</b>";
													}
													for(var j=0;j<=spct.length;j++){
														if(ct[spct[j]]!=undefined){
															sumct+=ct[spct[j]];
															row.cells[delta+j+2].innerHTML=ct[spct[j]];
														}
													}
													row.cells[delta+j+1].innerHTML="<b>"+sumct+"</b>";
												}
												row.cells[delta+10].innerHTML=Math.round(sumtd*10)/10;
												grandTotal+=grandSum;
											}
											if(rec.manhanvien!=oldMaNhanVien){
												nvRow=row;
												if(sumct)nvRow.cells[delta+8].innerHTML="<b>"+Math.round(100*nvSum/sumct)+"%</b>";
												if(sumcttd)nvRow.cells[delta+11].innerHTML=Math.round(100*sumnvtd/sumcttd)+"%";

												sumnvtd=0;
												sumcttd=0;
												nvSum=0;
												sumct=0;
												ct=lookupChiTieu[rec.manhanvien];
											}else ct=null;
											row=this.tblData.insertRow();
											row.innerHTML="<td align='center'>"+(++stt)+"</td><td>"+rec.dms+"</td><td>"+rec.thitruong+"</td><td>"+(lookupTF[rec.makhuvuc]||lookupTL[rec.makhuvuc])+"</td><td class='frozen'>"+rec.hoten+"</td><td align='center'>"+rec.sohoso+"</td><td>"+rec.loaihinh+"</td><td class='frozen2'>"+rec.tendiemban+"</td><td>"+rec.sonha+"</td><td>"+rec.duong+"</td><td>"+rec.huyen+"</td><td>"+rec.tenkhuvuc+"</td>";													
											for(var j=0;j<max;j++)row.insertCell().align="center";
											
											oldMaNhanVien=rec.manhanvien;
											oldMaDiemBan=rec.madiemban;
											sum=[0,0,0,0,0,0,0];
											grandSum=0;
											sumtd=0;
										}
										if(rec.ngay){
											var offset=sp.length*(rec.ngay-1)+1;
											for(var j=0;j<sp.length;j++){
												if(total[offset+j]==undefined)total[offset+j]=0
												var sl=rec[sp[j]];
												if(sl){
													row.cells[offset+j+11].innerHTML=sl;
													total[offset+j]+=sl;
													var ket=sl/dv[j];
													totalsum[j]+=ket;
													sum[j]+=ket;
													grandSum+=ket;
													nvSum+=ket;
													if(td[j]){
														sumtd+=ket;
														sumnvtd+=ket;
													}
												}
											}
										}
									}
									if(row){
										ct=lookupChiTieu[rec.manhanvien];
										if(ct){
											sumcttd=ct.bold+ct.light;
											row.cells[delta+9].innerHTML=sumcttd;
											totalct[0]+=ct.bold;totalct[1]+=ct.light;totalct[2]+=ct.trucbach;totalct[3]+=ct.hanoiprel;totalct[4]+=ct.hanoipre;
											totalct[5]+=ct.bold+ct.light+ct.trucbach+ct.hanoipre+ct.hanoiprel;
											totalct[7]+=sumcttd;
											totalct[8]+=sumtd;

											for(var j=0;j<=sp.length;j++){
												row.cells[delta-sp.length+j+1].innerHTML="<b>"+Math.round((j==sp.length?grandSum:sum[j])*10)/10+"</b>";
											}
											for(var j=0;j<=spct.length;j++){
												if(ct[spct[j]]!=undefined){
													sumct+=ct[spct[j]];
													row.cells[delta+j+2].innerHTML=ct[spct[j]];
												}
											}
											row.cells[delta+j+1].innerHTML="<b>"+sumct+"</b>";
										}
										row.cells[delta+10].innerHTML=Math.round(sumtd*10)/10;
										grandTotal+=grandSum;
										nvRow=row;
										if(sumct)nvRow.cells[delta+8].innerHTML="<b>"+Math.round(100*nvSum/sumct)+"%</b>";
										if(sumcttd)nvRow.cells[delta+11].innerHTML=Math.round(100*sumnvtd/sumcttd)+"%";
									}
									row=this.tblData.insertRow();
									row.innerHTML="<td colspan='12' align='right'><b>Tổng cộng: </b></td>";

									for(var i=0;i<sp.length*31;i++){
										var cell=row.insertCell();
										cell.align="center";
										cell.innerHTML="<b>"+Math.round((total[i]||0)*10)/10+"</b>";
									}
									for(var i=0;i<=sp.length;i++){
										var cell=row.insertCell();
										cell.align="center";
										cell.innerHTML="<b>"+Math.round((i==sp.length?grandTotal:totalsum[i])*10)/10+"</b>";
									}
									totalct[6]=Math.round((grandTotal/totalct[5])*10)/10+"%";
									totalct[9]=Math.round((totalct[8]/totalct[5])*10)/10+"%";
									totalct[8]=Math.round(totalct[8]*10)/10+"%";
									for(var i=0;i<totalct.length;i++){
										var cell=row.insertCell();
										cell.align="center";
										cell.innerHTML="<b>"+totalct[i]+"</b>";
									}
								}
							} else NUT.notify("⚠️ No data to report!","yellow");
						});
					} else NUT.notify("Không có dữ liệu chỉ tiêu!","yellow");
				});
			});
		} else NUT.notify("Nhập năm, tháng trước khi thực hiện!","yellow");
	}
}