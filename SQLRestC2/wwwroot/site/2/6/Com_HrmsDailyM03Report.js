var Com_HrmsDailyM03Report={
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
			title: '📜 <i>M03 Sản lượng Report</i>',
			modal:true,
			width: 320,
			height: 160,
			body: "<table style='margin:auto'><tr><td>Năm</td><td><input id='numTinhCong_Year' style='width:60px' type='number' value='"+now.getFullYear()+"'/></td><td>Tháng</td><td><input id='numTinhCong_Month' style='width:60px' type='number' value='"+(now.getMonth()+1)+"'/></td></tr><tr><td>Đối tác</td><td colspan='3'>"+cbo.outerHTML+"</td></tr><tr><td></td><td colspan='3'><input id='chkTinhCong_Edit' type='checkbox'/><label for='chkTinhCong_Edit'>Dùng dữ liệu Hiệu chỉnh</label></td></tr></table>",
			buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="Com_HrmsDailyM03Report.runReport()">✔️ Report</button>'
		})
	},
	runReport:function(){
		if(numTinhCong_Year.value&&numTinhCong_Month.value){
			var url=_context.service["hrms"].urledit;
			NUT.ds.select({url:url+"phucap",where:[["nam","=",numTinhCong_Year.value],["thang","=",numTinhCong_Month.value],["vitrilv","=","PG"]]},function(phucaps){
				if(phucaps.length)NUT.ds.select({url:url+"rpt_weeklysanluong",where:[["nam","=",numTinhCong_Year.value],["thang","=",numTinhCong_Month.value],["madoitac","=",cboTinhCong_DoiTac.value],["dulieu","=",chkTinhCong_Edit.checked?1:0]]},function(res){
					if(res.length){
						var pcPG=phucaps[0];
						var win=window.open("client/"+_context.user.siteid+"/html/DailyM03Report.html");
						win.onload=function(){
							this.labThangNam.innerHTML=numTinhCong_Month.value+"/"+numTinhCong_Year.value;
							var oldMaNhanVien=null;
							var oldMaDiemBan=null;
							var oldTuan=null;
							var offset=1;
							var row=null;
							var total=[0,0,0,0,0,0,0,0];
							var sum=0;
							var stt=0;
							for(var i=0;i<res.length;i++){
								var rec=res[i];
								if(rec.manhanvien!=oldMaNhanVien||rec.madiemban!=oldMaDiemBan){
									if(row){
										row.cells[19].innerHTML="<b>"+sum+"</b>";
										total[7]+=sum;
									}
									row=this.tblData.insertRow();
									row.innerHTML="<td>"+(++stt)+"</td><td>"+rec.dms+"</td><td>"+rec.thitruong+"</td><td>"+rec.quanlytructiep+"</td><td>"+rec.hoten+"</td><td>"+rec.sohoso+"</td><td>"+rec.loaihinh+"</td><td>"+rec.tendiemban+"</td><td>"+rec.sonha+"</td><td>"+rec.duong+"</td><td>"+rec.huyen+"</td><td>"+rec.makhuvuc+"</td>";
									for(var j=0;j<9;j++)row.insertCell();
									oldMaNhanVien=rec.manhanvien;
									oldMaDiemBan=rec.madiemban;
									sum=0;
									offset=1;
								}
								if(oldTuan!=rec.tuan){
									offset++;
									oldTuan=rec.tuan;
								}
								var sanluong=Math.round(rec.bold+rec.boldl+rec.light+rec.lightl+rec.trucbach+rec.trucbachl+rec.hanoipre+rec.hanoiprel+rec.b1890);
								sum+=sanluong;
								row.cells[12].innerHTML=pcPG.ngaycongthang;
								total[0]+=pcPG.ngaycongthang;
								row.cells[13].innerHTML=rec.ngaycong;
								total[1]+=rec.ngaycong;
								row.cells[12+offset].innerHTML=sanluong;
								total[offset]+=sanluong;
								row.cells[13+offset].innerHTML=rec.sanluongkhoan;
								total[offset+1]+=rec.sanluongkhoan;
							}
							if(row){
								row.cells[19].innerHTML="<b>"+sum+"</b>";
								total[7]+=sum;
							}
							row=this.tblData.insertRow();
							row.innerHTML="<td colspan='12' align='right'><b>Tổng cộng: </b></td>";
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