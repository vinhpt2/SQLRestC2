var Com_HrmsMonthlyMS01ReportBA={
	run:function(p){
		this.urledit=_context.service["hrms"].urledit;
		var self=this;
		NUT_DS.select({url:this.urledit+"nhanvien_v",select:"makhuvuc,hoten",where:["manhanvien","=",_context.user.username]},function(nv){
			if(nv.length){
				self.makhuvuc=nv[0].makhuvuc;
				self.hoten=nv[0].hoten;
				var items=_context.domain[9].items;
				var cbo=document.createElement("select");
				cbo.id="cboTinhCong_MaKhuVuc";
				cbo.innerHTML="<option value='"+self.makhuvuc+"' selected>"+_context.domain[9].lookup[self.makhuvuc]+"</option>";
				for(var i=0;i<items.length;i++){
					if(items[i].id!=self.makhuvuc){
						var opt=document.createElement("option");
						opt.value=items[i].id;
						opt.innerHTML=items[i].text;
						cbo.options.add(opt);
					}
				}
				cbo.setAttribute("onchange","Com_HrmsMonthlyMS01ReportBA.cboTinhCong_MaKhuVuc_onChange(this.value)");
				var now=new Date();
				w2popup.open({
					title: '📜 <i>MS01 - Nhật ký hành trình BA</i>',
					modal:true,
					width: 360,
					height: 220,
					body: "<table style='margin:auto'><tr><td>Năm</td><td><input id='numTinhCong_Year' style='width:60px' type='number' value='"+now.getFullYear()+"'/></td><td>Tháng</td><td><input id='numTinhCong_Month' style='width:60px' type='number' value='"+(now.getMonth()+1)+"'/></td></tr><tr><td>Khu vực*</td><td colspan='3'>"+cbo.outerHTML+"</td></tr><tr><td>Điểm bán</td><td colspan='3'><select id='cboTinhCong_DiemBan'></select></td></tr><tr><td></td><td colspan='3'><input id='chkTinhCong_Blank' type='checkbox'/><label for='chkTinhCong_Blank'>In bản trắng (không có dữ liệu)</label></td></tr></tr><tr><td></td><td colspan='3'><input id='chkTinhCong_Edit' type='checkbox'/><label for='chkTinhCong_Edit'>Dùng dữ liệu Hiệu chỉnh</label></td></tr></table>",
					buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="Com_HrmsMonthlyMS01ReportBA.runReport()">✔️ Report</button>'
				});
				self.cboTinhCong_MaKhuVuc_onChange(self.makhuvuc);
			}
		});
	},
	cboTinhCong_MaKhuVuc_onChange:function(val){
		cboTinhCong_DiemBan.innerHTML="<option value='ALL'>-Tất cả-</option>";
		this.lookupDiemBan={};
		var self=this;
		if(val) NUT_DS.select({url:this.urledit+"diemban",where:["makhuvuc","=",val]},function(res){
			for(var i=0;i<res.length;i++){
				var rec=res[i];
				var opt=document.createElement("option");
				opt.value=rec.madiemban;
				opt.innerHTML=rec.tendiemban;
				cboTinhCong_DiemBan.options.add(opt);
				self.lookupDiemBan[rec.madiemban]=rec;
			}
		})
	},
	runReport:function(){
		if(cboTinhCong_MaKhuVuc.value){
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
				NUT_DS.select({url:self.urledit+"chitieu",where:[["manhanvien","=",_context.user.username],["madoitac","=","HABECO"],["nam","=",nam],["thang","=",thang]]},function(khoans){
					self.khoan=khoans[0];
					if(cboTinhCong_DiemBan.value=="ALL"){
						NUT_DS.call({url:self.urledit+"rpc/f_distincttext",data:{col:"madiemban", tab: "chamcong_v", wclause:"manhanvien='"+_context.user.username+"' and madoitac='HABECO' and makhuvuc='"+cboTinhCong_MaKhuVuc.value+"' and nam="+nam+" and thang="+thang + " and ngaycong>0"}},function(diembans){
							for(var i=0;i<diembans.length;i++)self.reportPage(diembans[i].text,nam,thang);
						})
					}else self.reportPage(cboTinhCong_DiemBan.value,nam,thang);
				});
			});
			
		}else NUT.tagMsg("Chọn mã khu vực trước khi thực hiện", "yellow",document.activeElement);
	},
	reportPage:function(madiemban,nam,thang){
		var self=this;
		var diemban=this.lookupDiemBan[madiemban];
		NUT_DS.select({url:this.urledit+"chamcong_v",where:[["manhanvien","=",_context.user.username],["madoitac","=","HABECO"],["makhuvuc","=",cboTinhCong_MaKhuVuc.value],["madiemban","=",madiemban],["nam","=",nam],["thang","=",thang],["dulieu","=",chkTinhCong_Edit.checked?1:0]]},function(res){
			var lookup={};
			var ngaycong=0;
			for(var i=0;i<res.length;i++){
				var rec=res[i];
				rec.bold3=rec.bold1+rec.bold2-rec.bold;
				rec.light3=rec.light1+rec.light2-rec.light;
				rec.boldl3=rec.boldl1+rec.boldl2-rec.boldl;
				rec.lightl3=rec.lightl1+rec.lightl2-rec.lightl;
				rec.trucbach3=rec.trucbach1+rec.trucbach2-rec.trucbach;
				rec.hanoipre3=rec.hanoipre1+rec.hanoipre2-rec.hanoipre;
				lookup[rec.ngay]=rec;
				ngaycong+=rec.ngaycong;
			}
			var win=window.open("client/"+_context.user.clientid+"/"+_context.curApp.applicationid+"/MonthlyMS01ReportBA.html");
			win.onload=function(){
				this.labThangNam.innerHTML="Tháng "+numTinhCong_Month.value+" Năm "+numTinhCong_Year.value;
				//this.labNgayBaoCao.innerHTML=(new Date()).toLocaleDateString();
				
				this.idHoTen.innerHTML=self.hoten;
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
					var day=THU[(new Date(nam+"-"+thang+"-"+i)).getDay()];
					var data=lookup[i];
					var row=this.tblData.insertRow();
					var str="<td align='center'><b>"+i+"</b></td><td align='center'><i>"+day+"<i></td>";
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
				
				var str="<th colspan='2'>TỔNG (chai)</th>";
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
					this.idNgayCong.innerHTML=ngaycong;
					
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