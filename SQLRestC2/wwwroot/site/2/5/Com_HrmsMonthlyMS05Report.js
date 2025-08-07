var Com_HrmsMonthlyMS05Report={
	run:function(p){
		
		var now=new Date();
		w2popup.open({
			title: '📜 <i>Monthly MS05-Bảng lương KPI tháng</i>',
			modal:true,
			width: 500,
			height: 220,
			body: "<table style='margin:auto'><tr><td>Năm</td><td><input id='numTinhCong_Year' style='width:60px' type='number' value='"+now.getFullYear()+"'/></td><td>Tháng</td><td><input id='numTinhCong_Month' style='width:60px' type='number' value='"+(now.getMonth()+1)+"'/></td></tr><tr><td>Đối tác</td><td>HABECO</td>"+(_context.user.kvhcs.length?"<td></td><td>":"<td>Thị trường</td><td><select id='cboTinhCong_ThiTruong'><option value='ĐBSH' selected>ĐBSH</option><option value='ĐTBB'>ĐTBB</option></select>")+"</td><td>Vị trí LV</td><td><select id='cboTinhCong_ViTriLV'><option value='BA'>BA</option><option value='BA_PT'>BA_PartTime</option><option value='SM'>SM</option></select></td></tr><tr><td>Ngày nghỉ lễ</td><td><input id='datTinhCong_NgayNghiLe' type='date' style='width:100px'/></td><td>Số ngày nghỉ</td><td><input id='numTinhCong_SoNgayNghi' type='number' style='width:60px'/></td><td>Tiền thưởng lễ</td><td><input id='numTinhCong_TienThuongLe' type='number' style='width:100px'/></td></tr><tr><td></td><td colspan='3'><input id='chkTinhCong_Save' type='checkbox'/><label for='chkTinhCong_Save'>Lưu dữ liệu cho MS07, MS10</label></td><td colspan='2'><input id='chkTinhCong_Edit' type='checkbox'/><label for='chkTinhCong_Edit'>Dùng dữ liệu đã lưu</label></td></tr></table>",
			buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="Com_HrmsMonthlyMS05Report.tinhNghiLe()">✔️ Report</button>'
		})
	},
	tinhNghiLe:function(){
		if(datTinhCong_NgayNghiLe.value){
			var ngayLe=new Date(datTinhCong_NgayNghiLe.value);
			ngayLe.setDate(ngayLe.getDate()-30);
			var self=this;
			NUT_DS.select({url:_context.service["hrms"].urledit+"hopdonglaodong",select:"manhanvien",where:[["ngaybatdaulamviec","<=",ngayLe.toISOString()],["or",["ngaythoiviec","is",null],["ngaythoiviec",">",datTinhCong_NgayNghiLe.value]]]},function(res){							
				var lookupNghiLe={};
				for(var i=0;i<res.length;i++)lookupNghiLe[res[i].manhanvien]=true;
				self.runReport(lookupNghiLe);
			});
		} else this.runReport();
	},
	runReport:function(lookupNghiLe){
		if(numTinhCong_Year.value&&numTinhCong_Month.value){
			var vitrilv=cboTinhCong_ViTriLV.value;
			var prefix=(vitrilv=="SM"?"SM":"BA");
			var dulieu=chkTinhCong_Edit.checked?1:0;
			var url=_context.service["hrms"].urledit;
			var html="client/"+_context.user.clientid+"/"+_context.curApp.applicationid+"/MonthlyMS05Report"+prefix+".html";
			var nam=parseInt(numTinhCong_Year.value);
			var thang=parseInt(numTinhCong_Month.value);
			var date=nam+"-"+thang+"-15";
			NUT_DS.select({url:url+"chucvu_v",where:[["machucvu","in","TF,TL"],(_context.user.kvhcs.length?["makhuvuc","in",_context.user.kvhcs]:["thitruong","=",cboTinhCong_ThiTruong.value]),["or",["ngaybatdau","is","null"],["ngaybatdau","<=",date]],["or",["ngayketthuc","is","null"],["ngayketthuc",">=",date]]]},function(cvs){
				var lookupTL={},lookupTF={};
				for(var i=0;i<cvs.length;i++){
					var cv=cvs[i];
					cv.machucvu=="TL"?lookupTL[cv.makhuvuc]=cv.hoten:lookupTF[cv.makhuvuc]=cv.hoten;
				}
				if(!chkTinhCong_Edit.checked){
					var ngay=(thang==2?28:30);
					NUT_DS.call({url:url+"rpc/f_nsdongbhxh",data:{y:nam,m:thang,d:ngay}},function(dongbhxh){
						var lookupBHXH={};
						for(var i=0;i<dongbhxh.length;i++)lookupBHXH[dongbhxh[i].manhanvien]=dongbhxh[i];
						NUT_DS.select({url:url+"thangbangluong_v",where:[["nam","=",nam],["thang","=",thang],["vitrilv","=",prefix]]},function(phucaps){
							NUT_DS.select({url:url+"rpt_monthlysum",where:[["nam","=",nam],["thang","=",thang],["madoitac","=","HABECO"],(vitrilv=="SM"||vitrilv=="BA"?["vitrilv","=",vitrilv]:["vitrilv","like",vitrilv+"*"]),(_context.user.kvhcs.length?["makhuvuc","in",_context.user.kvhcs]:["thitruong","=",cboTinhCong_ThiTruong.value]),["dulieu","=",dulieu]]},function(res){
								NUT_DS.select({url:url+"countnguoiphuthuoc_v"},function(npt){
									var lookupNPT={};
									for(var i=0;i<npt.length;i++)lookupNPT[npt[i].idnhansu]=npt[i].songuoiphuthuoc;
									
									var ngayTinhLuong=new Date(nam+"-"+thang+"-"+ngay);
									ngayTinhLuong.setDate(ngayTinhLuong.getDate()-170);
									NUT_DS.select({url:_context.service["hrms"].urledit+"hopdonglaodong",select:"manhanvien",where:[["ngaybatdaulamviec","<=",ngayTinhLuong.toISOString()],["or",["ngaythoiviec","is",null],["ngaythoiviec",">",nam+"-"+thang+"-"+ngay]]]},function(thamnien){							
										var lookupThamNien={};
										for(var i=0;i<thamnien.length;i++)lookupThamNien[thamnien[i].idnhansu]=true;
										var lookup={};
										if(res.length){
											var pcBA=phucaps[0];
											var win=window.open(html);
											win.onload=function(){
												this.labThangNam.innerHTML="THÁNG " +thang+" NĂM "+nam;
												this.labThiTruong.innerHTML=_context.user.kvhcs.length?_context.user.kvhcnames:cboTinhCong_ThiTruong.value;
												var oldMaNhanVien=null;
												var row=null;
												var sum=0;
												var total=[];
												var grandTotal=0;
												var data=[];c=[];
												c[5]="";c[6]="";c[7]="";c[11]=0;c[20]=0;c[24]=0;

												for(var i=0;i<res.length;i++){
													var rec=res[i];
													if(rec.manhanvien!=oldMaNhanVien){
														if(oldMaNhanVien){
															row=this.tblData.insertRow();
															for(var j=0;j<c.length;j++){
																var cell=row.insertCell();
																var isNum=!window.isNaN(c[j]);
																cell.innerHTML=isNum?w2utils.formatNumber(c[j]):c[j];
																if(isNum)cell.align="right";
																if(j==2)cell.className="frozen";
																if(j==5)cell.className="frozen2";
															}
															var json={
																nam:nam,
																thang:thang,
																madoitac:"HABECO",
																manhanvien:c.manhanvien,
																dulieu:1,
																vitrilv:vitrilv,
																makhuvuc:c.makhuvuc,
																madiemban:c.madiemban
															}
															for(var j=10;j<=45;j++)json["c"+j]=c[j]||null;
															data.push(json);
															
															if(lookup[c.manhanvien])
																alert('Duplicate ' + c.manhanvien);
															else
																lookup[c.manhanvien]=true;

															c[5]="";c[6]="";c[7]="";c[11]=0;c[20]=0;c[24]=0;
														}
														oldMaNhanVien=rec.manhanvien;
														sum=0;
													}
													c.manhanvien=rec.manhanvien;
													c.makhuvuc=rec.makhuvuc;
													c.madiemban=rec.madiemban;
													c[0]=i+1;
													c[1]=lookupTF[rec.makhuvuc]||lookupTL[rec.makhuvuc];
													c[2]=rec.hoten;
													c[3]=rec.sohoso;
													c[4]=rec.loaihinh;
													c[5]+=c[5]?"<br/>"+rec.tendiemban:rec.tendiemban;
													c[6]+=c[6]?"<br/>"+rec.sonha:rec.sonha;
													c[7]+=c[7]?"<br/>"+rec.duong:rec.duong;
													c[8]=rec.huyen;
													c[9]=rec.tenkhuvuc;
													if(pcBA){
														c[10]=pcBA.chitieungaycong;
														c[11]+=rec.ngaycong;
														var tilengay=(c[11]<c[10]?c[11]/c[10]:1);
														c[12]=tilengay*pcBA.luongcoban;
														c[13]=lookupThamNien[rec.idnhansu]&&c[11]<20?0:tilengay*pcBA.pcthamnien;
														c[14]=tilengay*pcBA.pcxangxe;
														c[15]=tilengay*pcBA.pctrangdiem;
														c[16]=tilengay*pcBA.pcdienthoai;
														c[17]=tilengay*rec.pcdiemban;
														c[18]=c[13]+c[14]+c[15]+c[16]+c[17];
													}
													var sanluong=rec.bold/20+rec.boldl/24+rec.light/20+rec.lightl/24+rec.trucbach/24+rec.hanoipre/20;
													c[19]=rec.sanluongkhoan;
													c[20]+=sanluong;
													c[21]=c[19]?100*c[20]/c[19]:"";
													
													var trongdiem=rec.bold/20+rec.boldl/24+rec.light/20+rec.lightl/24;
													c[23]=rec.sltrongdiem;
													c[24]+=trongdiem;
													c[25]=c[23]?100*c[24]/c[23]:0;
													c[27]=c[20]-c[19];

													c[22]=tilengay*eval(pcBA.kpi1);
													c[26]=tilengay*eval(pcBA.kpi2);
													c[28]=eval(pcBA.kpi3);
													
													c[29]=c[12]+c[18]+c[22]+c[26]+c[28];
													
													var bhxh=lookupBHXH[rec.manhanvien];
													c[30]=bhxh?0.205*pcBA.luongcoban:0;
													c[31]=bhxh?0.02*pcBA.luongcoban:0;
													
													c[32]=lookupNghiLe&&lookupNghiLe[rec.manhanvien]?pcBA.luongcoban*numTinhCong_SoNgayNghi.value/pcBA.chitieungaycong:0;
													c[33]=lookupNghiLe&&lookupNghiLe[rec.manhanvien]?numTinhCong_TienThuongLe.value:0;
													
													c[34]=c[29]+c[30]+c[31]+c[32]+c[33];
													
													c[35]=bhxh?0.105*pcBA.luongcoban:0;
													c[36]=bhxh?0.01*pcBA.luongcoban:0;
													c[37]=bhxh&&rec.ngaysinh&&parseInt(rec.ngaysinh.split("-")[1])==thang?200000:0;
													c[38]=c[29]+c[32]+c[33]+c[37]-c[35];
													c[39]=11000000;
													c[40]=lookupNPT[rec.idnhansu]||0;
													c[41]=4400000*c[40];
													c[42]=c[39]+c[41];
													c[43]=c[38]>c[42]?c[38]-c[42]:0;
													c[44]=bhxh?c[43]<=5000000?0.05*c[43]:(c[43]<=10000000?0.1*c[43]-250000:(c[43]<=18000000?0.15*c[43]-750000:(c[43]<=32000000?0.2*c[43]-1650000:(c[43]<=52000000?0.25*c[43]-3250000:(c[43]<=80000000?0.30*c[43]-5850000:0.35*c[43]-9850000))))):0.1*c[43];
													c[45]=c[38]-c[36]-c[44];
												}
												if(row){
													row=this.tblData.insertRow();
													for(var j=0;j<c.length;j++){
														var cell=row.insertCell();
														var isNum=!window.isNaN(c[j]);
														cell.innerHTML=isNum?w2utils.formatNumber(c[j]):c[j];
														if(isNum)cell.align="right";
														if(j==2)cell.className="frozen";
														if(j==5)cell.className="frozen2";
													}
													var json={
														nam:nam,
														thang:thang,
														madoitac:"HABECO",
														manhanvien:c.manhanvien,
														dulieu:1,
														vitrilv:vitrilv,
														makhuvuc:c.makhuvuc,
														madiemban:c.madiemban
													}
													for(var j=10;j<=45;j++)json["c"+j]=c[j]||null;
													data.push(json);
												}
												if(chkTinhCong_Save.checked){
													NUT_DS.upsert({url:url+"bangluong",data:data,keys:"nam,thang,madoitac,manhanvien,vitrilv,dulieu"},function(res){
														NUT.tagMsg("Record upserted.","lime",document.activeElement);
													});
												}
											}
										} else NUT.tagMsg("No data to report!","yellow");
									});
								});
							});
						});
					});
				} else {//lay trong du lieu da luu
					NUT_DS.select({url:url+"nhansu",select:"idnhansu,manhanvien,sohoso,hoten,quanlytructiep,makhuvuc,diadiemlv",where:[["madoitac","=","HABECO"],["vitrilv","=",vitrilv]]},function(res){
						var lookupNv={};
						for(var i=0;i<res.length;i++){
							lookupNv[res[i].manhanvien]=res[i];
						}
						NUT_DS.select({url:url+"rpt_bangluong",where:[["nam","=",numTinhCong_Year.value],["thang","=",numTinhCong_Month.value],["madoitac","=","HABECO"],["vitrilv","=",vitrilv],(_context.user.kvhcs.length?["makhuvuc","in",_context.user.kvhcs]:["thitruong","=",cboTinhCong_ThiTruong.value]),["dulieu","=",dulieu]]},function(res){
							if(res.length){
								var win=window.open(html);
								win.onload=function(){
									this.labThangNam.innerHTML="THÁNG " +numTinhCong_Month.value+" NĂM "+numTinhCong_Year.value;
									this.labThiTruong.innerHTML=_context.user.kvhcs.length?_context.user.kvhcs:cboTinhCong_ThiTruong.value;
									var row=null;
									var sum=0;
									var total=[];
									var grandTotal=0;
									var i0=(vitrilv=="BA"?10:9);
									for(var i=0;i<res.length;i++){
										var rec=res[i];
										row=this.tblData.insertRow();
										for(var j=0;j<=45;j++){
											var cell=row.insertCell();
											if(j>=i0){
												cell.align="center";
												var val=rec["c"+j];
												cell.innerHTML=window.isNaN(val)?val:w2utils.formatNumber(val);
											}
										}
										var c=row.cells;
										c[0].align="center";
										c[0].innerHTML=i+1;
										var nv=lookupNv[rec.manhanvien];
										if(nv){
											if(vitrilv=="BA"){
												c[1].innerHTML=nv.quanlytructiep;
												c[2].className="frozen";
												c[2].innerHTML=nv.hoten;
												c[3].innerHTML=nv.sohoso;
												c[5].className="frozen2";
												c[5].innerHTML=nv.diadiemlv;
												c[9].innerHTML=rec.tenkhuvuc;
											}else if(vitrilv=="SM"){
												c[1].innerHTML=nv.manhanvien;
												c[2].innerHTML=nv.sohoso;
												c[3].className="frozen";
												c[3].innerHTML=nv.hoten;
												c[5].innerHTML=nv.quanlytructiep;
												c[6].className="frozen2";
												c[6].innerHTML=nv.diadiemlv;
												c[8].innerHTML=rec.tenkhuvuc;
											}
										}
									}
								}
							}else NUT.tagMsg("No data to report!","yellow");
						});
					});
				}
			});
		} else NUT.tagMsg("Nhập năm, tháng trước khi thực hiện!","yellow");
	}
}