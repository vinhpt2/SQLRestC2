var Com_HrmsMonthlyMS01Report={
	run:function(p){
		this.urledit=_context.service["hrms"].urledit;
		var self=this;
		var items=_context.domain[9].items;
		var cbo=document.createElement("select");
		cbo.id="cboTinhCong_MaKhuVuc";
		if(_context.user.kvhcs.length){
			var lookup=_context.domain[9].lookup;
			cbo.innerHTML="<option></option>";
			for(var i=0;i<_context.user.kvhcs.length;i++){
				var kvhc=_context.user.kvhcs[i];
				var opt=document.createElement("option");
				opt.value=kvhc;
				opt.innerHTML=lookup[kvhc];
				cbo.options.add(opt);
			}
		}else{
			for(var i=0;i<items.length;i++){
				var opt=document.createElement("option");
				opt.value=items[i].id;
				opt.innerHTML=items[i].text;
				cbo.options.add(opt);
			}
		}
		cbo.setAttribute("onchange","Com_HrmsMonthlyMS01Report.cboTinhCong_MaKhuVuc_onChange(this.value)");
		var now=new Date();
		w2popup.open({
			title: '📜 <i>MS01 - Nhật ký hành trình BA</i>',
			modal:true,
			width: 360,
			height: 220,
			body: "<table style='margin:auto'><tr><td>Năm</td><td><input id='numTinhCong_Year' style='width:60px' type='number' value='"+now.getFullYear()+"'/></td><td>Tháng</td><td><input id='numTinhCong_Month' style='width:60px' type='number' value='"+(now.getMonth()+1)+"'/></td></tr><tr><td>Khu vực*</td><td colspan='3'>"+cbo.outerHTML+"</td></tr><tr><td>Nhân viên*</td><td colspan='3'><select id='cboTinhCong_NhanVien'></select></td></tr><tr><td></td><td colspan='3'><input id='chkTinhCong_Blank' type='checkbox'/><label for='chkTinhCong_Blank'>In bản trắng (không có dữ liệu)</label></td></tr><tr><td></td><td colspan='3'><input id='chkTinhCong_Edit' type='checkbox'/><label for='chkTinhCong_Edit'>Dùng dữ liệu Hiệu chỉnh</label></td></tr></table>",
			buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="Com_HrmsMonthlyMS01Report.runReport()">✔️ Report</button>'
		});
		self.cboTinhCong_MaKhuVuc_onChange(self.makhuvuc);
	},
	cboTinhCong_MaKhuVuc_onChange:function(val){
		this.lookupNhanVien={};
		var self=this;
		if(val) NUT_DS.select({url:this.urledit+"nhanvien_v",select:"manhanvien,hoten,sohoso",where:[["makhuvuc","=",val],["vitrilv","like","BA*"]]},function(res){
			cboTinhCong_NhanVien.innerHTML="";
			for(var i=0;i<res.length;i++){
				var rec=res[i];
				var opt=document.createElement("option");
				opt.value=rec.manhanvien;
				opt.innerHTML=rec.hoten+"."+rec.sohoso;
				cboTinhCong_NhanVien.options.add(opt);
				self.lookupNhanVien[rec.manhanvien]=rec;
			}
		})
	},
	runReport:function(){
		if(cboTinhCong_MaKhuVuc.value&&cboTinhCong_NhanVien.value){
			var self=this;
			var nam=numTinhCong_Year.value;
			var thang=numTinhCong_Month.value;
			var date=nam+"-"+thang+"-15";
			this.chucVu={};
			this.khoan={};
			NUT_DS.select({url:this.urledit+"chucvuhabeco",where:[["makhuvuc","=",cboTinhCong_MaKhuVuc.value],["or",["ngaybatdau","is","null"],["ngaybatdau","<=",date]],["or",["ngayketthuc","is","null"],["ngayketthuc",">=",date]]]},function(cvs){
				for(var i=0;i<cvs.length;i++){
					var cv=cvs[i];
					self.chucVu[cv.machucvu]=cv.hoten;
				}
				NUT_DS.select({url:self.urledit+"chitieu",where:[["manhanvien","=",cboTinhCong_NhanVien.value],["madoitac","=","HABECO"],["nam","=",nam],["thang","=",thang]]},function(khoans){
					self.khoan=khoans[0];
					self.lookupDiemBan={};
						NUT_DS.call({url:self.urledit+"rpc/f_distincttext",data:{col:"madiemban", tab: "chamcong_v", wclause:"manhanvien='"+cboTinhCong_NhanVien.value+"' and madoitac='HABECO' and makhuvuc='"+cboTinhCong_MaKhuVuc.value+"' and nam="+nam+" and thang="+thang + " and ngaycong>0"}},function(diembans){
							if(diembans.length){
								var dban=[];
								for(var i=0;i<diembans.length;i++)dban.push(diembans[i].text);
								NUT_DS.select({url:self.urledit+"diemban",where:["madiemban","in",dban]},function(dbs){
									for(var i=0;i<dbs.length;i++){
										self.reportPage(dbs[i],nam,thang);
									}
								});
							}else NUT.tagMsg("Không có dữ liệu điểm bán trong tháng "+thang+"/"+nam,"yellow");
						});

				});
			});
			
		}else NUT.tagMsg("Chọn mã khu vực và Nhân viên trước khi thực hiện", "yellow",document.activeElement);
	},
	reportPage:function(diemban,nam,thang){
		var self=this;
		NUT_DS.select({url:this.urledit+"rpt_ms01",where:[["manhanvien","=",cboTinhCong_NhanVien.value],["madoitac","=","HABECO"],["makhuvuc","=",cboTinhCong_MaKhuVuc.value],["madiemban","=",diemban.madiemban],["nam","=",nam],["thang","=",thang],["dulieu","=",chkTinhCong_Edit.checked?1:0]]},function(res){
			var lookup={};
			var tongngaycong=0;
			for(var i=0;i<res.length;i++){
				var rec=res[i];
				rec.bold3=rec.bold1+rec.bold2-rec.bold;
				rec.light3=rec.light1+rec.light2-rec.light;
				rec.boldl3=rec.boldl1+rec.boldl2-rec.boldl;
				rec.lightl3=rec.lightl1+rec.lightl2-rec.lightl;
				rec.trucbach3=rec.trucbach1+rec.trucbach2-rec.trucbach;
				rec.hanoipre3=rec.hanoipre1+rec.hanoipre2-rec.hanoipre;
				lookup[rec.ngay]=rec;
				tongngaycong+=rec.ngaycong;
			}
			var win=window.open("client/"+_context.user.clientid+"/"+_context.curApp.applicationid+"/MonthlyMS01Report.html");
			win.onload=function(){
				this.labThangNam.innerHTML="Tháng "+numTinhCong_Month.value+" Năm "+numTinhCong_Year.value;
				this.labThiTruong.innerHTML=_context.domain[9].lookup[diemban.makhuvuc];
				//this.labNgayBaoCao.innerHTML=(new Date()).toLocaleDateString();
				
				this.idHoTen.innerHTML=cboTinhCong_NhanVien.options[cboTinhCong_NhanVien.selectedIndex].innerHTML;
				this.idTF.innerHTML=self.chucVu.TF||"";
				this.idTL.innerHTML=self.chucVu.TL||"";
				this.idTL2.innerHTML=self.chucVu.TF||self.chucVu.TL||"";
				this.idASM.innerHTML=this.idASM2.innerHTML=self.chucVu.ASM||"";
				this.idSalesSup.innerHTML=this.idSalesSup2.innerHTML=self.chucVu.SalesSup||"";
				
				this.idTenNhaHang.innerHTML=diemban.tendiemban;
				this.idDcNhaHang.innerHTML=(diemban.sonha||"") + " " + (diemban.duong||"") + " " + (diemban.huyen||"");
				this.idMaDiemBan.innerHTML=diemban.dms||"";
				var sum=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
				var sp=["bold2","light2","boldl2","lightl2","trucbach2","hanoipre2","bold1","light1","boldl1","lightl1","trucbach1","hanoipre1","bold","light","boldl","lightl","trucbach","hanoipre","bold3","light3","boldl3","lightl3","trucbach3","hanoipre3"];
				var dv=[20,20,24,24,24,20];
				for(var i=1;i<=31;i++){
					var rec=res[i];
					
					var day=THU[(new Date(nam+"-"+thang+"-"+i)).getDay()];
					var data=lookup[i];
					var row=this.tblData.insertRow();
					var str="<td align='center'><b>"+i+"</b></td><td align='center'><i>"+day+"<i></td><td align='center'>"+(data?data.ngaycong:"")+"</td>";
					for(var j=0;j<sp.length;j++){
						if(chkTinhCong_Blank.checked||!data){
							str+="<td align='center'></td>";
						}else {
							var val=data[sp[j]];
							str+="<td align='center'>"+val+"</td>";
							if(j<6||11<j&&j<18)sum[j]+=val;
						}
					}
					if(i==1)str+="<td rowspan='33'></td>";
					row.innerHTML=str;							
						
				}
				
				var str="<th colspan='2'>TỔNG (chai)</th><th rowspan='2'>"+tongngaycong+"</th>";
				var str2="<th colspan='2'>TỔNG (két)</th>";
				for(var j=0;j<sp.length;j++){
					if(chkTinhCong_Blank.checked || !(j<6||11<j&&j<18)){
						str+="<th></th>";
						str2+="<th></th>";
					}else {
						str+="<th>"+sum[j]+"</th>";
						str2+="<th>"+Math.round(10*sum[j]/dv[j%6])/10+"</th>";
					}
				}
				this.tblData.insertRow().innerHTML=str;
				this.tblData.insertRow().innerHTML=str2;
				
				if(!chkTinhCong_Blank.checked){
					this.idBanBold.innerHTML=Math.round((sum[12]/20+sum[14]/24)*10)/10;
					this.idBanLight.innerHTML=Math.round((sum[13]/20+sum[15]/24)*10)/10;
					this.idBanTB.innerHTML=Math.round((sum[16]/24)*10)/10;
					this.idBanHN.innerHTML=Math.round((sum[17]/20)*10)/10;
					this.idNgayCong.innerHTML=tongngaycong;
					
					this.idKhoanBold.innerHTML=self.khoan.bold||"-/-";
					this.idKhoanLight.innerHTML=self.khoan.light||"-/-";
					this.idKhoanTB.innerHTML=self.khoan.trucbach||"-/-";
					this.idKhoanHN.innerHTML=self.khoan.hanoipre||"-/-";
					
					this.idChenhBold.innerHTML=Math.round((sum[12]/20+sum[14]/24-self.khoan.bold)*10)/10;
					this.idChenhLight.innerHTML=Math.round((sum[13]/20+sum[15]/24-self.khoan.light)*10)/10;
					this.idChenhTB.innerHTML=Math.round((sum[16]/24-self.khoan.trucbach/24)*10)/10;
					this.idChenhHN.innerHTML=Math.round((sum[17]/20-self.khoan.hanoipre/20)*10)/10;
					
					var tongKhoan=self.khoan.bold+self.khoan.light+self.khoan.trucbach+self.khoan.hanoipre;
					var tongBan=(sum[12]+sum[13]+sum[17])/20+(sum[14]+sum[15]+sum[16])/24;
					this.idTongKhoan.innerHTML=tongKhoan;
					this.idTongBan.innerHTML=Math.round(tongBan*10)/10;
					this.idTongChenh.innerHTML=Math.round((tongBan-tongKhoan)*10)/10;
				}
			}
		});
	}
}