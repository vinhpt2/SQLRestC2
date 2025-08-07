var Com_HrmsMonthlyMS03Report={
	run:function(p){
		var items=_context.domain[24].items;
		var cbo=document.createElement("select");
		cbo.id="cboTinhCong_DoiTac";
		cbo.style.width="100%";
		for(var i=items.length-1;i>=0;i--){
			var opt=document.createElement("option");
			opt.value=items[i].id;
			opt.innerHTML=items[i].text;
			cbo.add(opt);
		}
		
		var now=new Date();
		w2popup.open({
			title: '📜 <i>Monthly MS03 - Chỉ tiêu Sản lượng Report</i>',
			modal:true,
			width: 360,
			height: 180,
			body: "<table style='margin:auto'><tr><td>Năm</td><td><input id='numTinhCong_Year' style='width:60px' type='number' value='"+now.getFullYear()+"'/></td><td>Tháng</td><td><input id='numTinhCong_Month' style='width:60px' type='number' value='"+(now.getMonth()+1)+"'/></td></tr><tr><td>Đối tác</td><td>"+cbo.outerHTML+"</td><td>Thị trường</td><td><select id='cboTinhCong_ThiTruong'><option value='ĐBSH' selected>ĐBSH</option><option value='ĐTBB'>ĐTBB</option></select></td></tr><tr><td></td><td colspan='3'><input id='chkTinhCong_Edit' type='checkbox' checked/><label for='chkTinhCong_Edit'>Dùng dữ liệu Hiệu chỉnh</label></td></tr></table>",
			buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="Com_HrmsMonthlyMS03Report.runReport()">✔️ Report</button>'
		})
	},
	runReport:function(){
		if(numTinhCong_Year.value&&numTinhCong_Month.value){
			var url=_context.service["hrms"].urledit;
			NUT.ds.select({url:url+"phucap",where:[["nam","=",numTinhCong_Year.value],["thang","=",numTinhCong_Month.value],["vitrilv","=","PG"]]},function(phucaps){
				if(phucaps.length)NUT.ds.select({url:url+"rpt_weeklysanluong",where:[["nam","=",numTinhCong_Year.value],["thang","=",numTinhCong_Month.value],["madoitac","=",cboTinhCong_DoiTac.value],["thitruong","=",cboTinhCong_ThiTruong.value],["dulieu","=",chkTinhCong_Edit.checked?1:0]]},function(res){
					if(res.length){
						var pcPG=phucaps[0];
						var win=window.open("client/"+_context.user.siteid+"/html/MonthlyMS03Report.html");
						win.onload=function(){
							this.labThangNam.innerHTML="THÁNG "+numTinhCong_Month.value+" NĂM "+numTinhCong_Year.value;
							this.labThiTruong.innerHTML=cboTinhCong_ThiTruong.value;
							this.labNgayBaoCao.innerHTML=(new Date()).toLocaleString();
							var oldMaNhanVien=null;
							var oldMaDiemBan=null;
							var oldTuan=null;
							var offset=0;
							var row=null;
							var total=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
							var sumSanLuong=0;
							var sumTrongDiem=0;
							for(var i=0;i<res.length;i++){
								var rec=res[i];
								if(rec.manhanvien!=oldMaNhanVien){
									if(row){
										row.cells[32].innerHTML="<b>"+sumSanLuong+"</b>";
										total[32]+=sumSanLuong;
										row.cells[39].innerHTML="<b>"+sumTrongDiem+"</b>";
										total[39]+=sumTrongDiem;
									}
									row=this.tblData.insertRow();
									row.innerHTML="<td>"+(i+1)+"</td><td>"+rec.quanlytructiep+"</td><td>"+rec.hoten+"</td><td>"+rec.sohoso+"</td><td>"+rec.loaihinh+"</td><td>"+rec.tendiemban+"</td><td>"+rec.sonha+"</td><td>"+rec.duong+"</td><td>"+rec.huyen+"</td><td>"+rec.makhuvuc+"</td>";
									for(var j=0;j<62;j++)row.insertCell();
									oldMaNhanVien=rec.manhanvien;
									oldMaDiemBan=rec.madiemban;
									sumSanLuong=0;
									sumTrongDiem=0;
									offset=-4;
									total[j]=0;
								}
								if(oldTuan!=rec.tuan){
									offset+=4;
									oldTuan=rec.tuan;
								}
								var sanluong=Math.round(rec.bold+rec.boldl+rec.light+rec.lightl+rec.trucbach+rec.trucbachl+rec.hanoipre+rec.hanoiprel);
								sumSanLuong+=sanluong;
								var sltrongdiem=Math.round(rec.bold+rec.boldl+rec.light+rec.lightl);
								sumTrongDiem+=sltrongdiem;
								row.cells[10].innerHTML=pcPG.ngaycongthang;
								row.cells[11].innerHTML=rec.ngaycong;
								row.cells[12+offset].innerHTML=rec.bold+rec.boldl;
								row.cells[13+offset].innerHTML=rec.light+rec.lightl;
								row.cells[14+offset].innerHTML=rec.trucbach+rec.trucbachl;
								row.cells[15+offset].innerHTML=rec.hanoipre+rec.hanoiprel;
								row.cells[38].innerHTML=rec.sanluongkhoan;
								row.cells[39].innerHTML=rec.sltrongdiem;
								
								total[0]+=pcPG.ngaycongthang;
								total[1]+=rec.ngaycong;
								total[2+offset]+=rec.bold+rec.boldl;
								total[3+offset]+=rec.light+rec.lightl;
								total[4+offset]+=rec.trucbach+rec.trucbachl;
								total[5+offset]+=rec.hanoipre+rec.hanoiprel;
							}
							
							if(row){
								row.cells[32].innerHTML="<b>"+sumSanLuong+"</b>";
								total[32]+=sumSanLuong;
								row.cells[39].innerHTML="<b>"+sumTrongDiem+"</b>";
								total[39]+=sumTrongDiem;
							}
							row=this.tblData.insertRow();
							row.innerHTML="<td colspan='10' align='right'><b>Tổng cộng: </b></td>";
							for(var i=0;i<total.length;i++){
								var cell=row.insertCell();
								cell.innerHTML="<b>"+total[i]+"</b>";
							}
							
						}
					} else NUT.tagMsg("No data to report!","yellow");
				});else NUT.tagMsg("Không có dữ liệu Phụ cấp "+numTinhCong_Year.value+"/"+numTinhCong_Month.value,"yellow");
			});
		} else NUT.tagMsg("Nhập năm, tháng trước khi thực hiện!","yellow");
	}
}