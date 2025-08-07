var Com_HrmsDailySanLuongReport={
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
			title: '📜 <i>Daily Sản lượng Report</i>',
			modal:true,
			width: 360,
			height: 180,
			body: "<table style='margin:auto'><tr><td>Năm</td><td><input id='numTinhCong_Year' style='width:60px' type='number' value='"+now.getFullYear()+"'/></td><td>Tháng</td><td><input id='numTinhCong_Month' style='width:60px' type='number' value='"+(now.getMonth()+1)+"'/></td></tr><tr><td>Đối tác</td><td>"+cbo.outerHTML+"</td><td>Thị trường</td><td><select id='cboTinhCong_ThiTruong'><option value='ĐBSH' selected>ĐBSH</option><option value='ĐTBB'>ĐTBB</option></select></td></tr><tr><td></td><td colspan='3'><input id='chkTinhCong_Edit' type='checkbox'/><label for='chkTinhCong_Edit'>Dùng dữ liệu Hiệu chỉnh</label></td></tr></table>",
			buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="Com_HrmsDailySanLuongReport.runReport()">✔️ Report</button>'
		})
	},
	runReport:function(){
		if(numTinhCong_Year.value&&numTinhCong_Month.value){
			NUT.ds.select({url:_context.service["hrms"].urledit+"rpt_dailysanluong",where:[["nam","=",numTinhCong_Year.value],["thang","=",numTinhCong_Month.value],["madoitac","=",cboTinhCong_DoiTac.value],["thitruong","=",cboTinhCong_ThiTruong.value],["dulieu","=",chkTinhCong_Edit.checked?1:0]]},function(res){
				if(res.length){
					var win=window.open("client/"+_context.user.siteid+"/html/DailySanLuongReport.html");
					win.onload=function(){
						this.labThangNam.innerHTML=numTinhCong_Month.value+"/"+numTinhCong_Year.value;
						this.labThiTruong.innerHTML=cboTinhCong_ThiTruong.value;
						this.labNgayBaoCao.innerHTML=(new Date()).toLocaleString();
						var oldMaNhanVien=null;
						var oldMaDiemBan=null;
						var row=null;
						var sp=["bold","light","boldl","lightl","trucbach","hanoipre"];
						var dv=["20","20","24","24","24","20"];
						var total=[];
						for(var j=0;j<sp.length;j++)total[sp.length*31+j+1]=0;
						var sum=[0,0,0,0,0,0],grandSum=0;
						var grandTotal=0;
						var stt=0;
						var length=sp.length*32+1;
						for(var i=0;i<res.length;i++){
							var rec=res[i];
							if(rec.manhanvien!=oldMaNhanVien||rec.madiemban!=oldMaDiemBan){
								if(row){
									for(var j=0;j<=sp.length;j++)
										row.cells[sp.length*33+j].innerHTML="<b>"+Math.round((j==sp.length?grandSum:sum[j])*10)/10+"</b>";
									grandTotal+=grandSum;
								}
								row=this.tblData.insertRow();
								row.innerHTML="<td>"+(++stt)+"</td><td>"+rec.dms+"</td><td>"+rec.thitruong+"</td><td>"+rec.quanlytructiep+"</td><td>"+rec.hoten+"</td><td>"+rec.sohoso+"</td><td>"+rec.loaihinh+"</td><td>"+rec.tendiemban+"</td><td>"+rec.sonha+"</td><td>"+rec.duong+"</td><td>"+rec.huyen+"</td><td>"+rec.makhuvuc+"</td>";
								for(var j=0;j<length;j++)row.insertCell();
								oldMaNhanVien=rec.manhanvien;
								oldMaDiemBan=rec.madiemban;
								sum=[0,0,0,0,0,0];
								grandSum=0;
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
										total[sp.length*31+j+1]+=ket;
										sum[j]+=ket;
										grandSum+=ket;
									}
								}
							}
						}
						if(row){
							for(var j=0;j<=sp.length;j++){
								row.cells[sp.length*33+j].innerHTML="<b>"+Math.round((j==sp.length?grandSum:sum[j])*10)/10+"</b>";
							}
							grandTotal+=grandSum;
						}
						row=this.tblData.insertRow();
						row.innerHTML="<td colspan='12' align='right'><b>Tổng cộng: </b></td>";
						for(var i=1;i<=length;i++){
							var cell=row.insertCell();
							cell.innerHTML="<b>"+Math.round((i==length?grandTotal:(total[i]?total[i]:0))*10)/10+"</b>";
						}
						
					}
				} else NUT.tagMsg("No data to report!","yellow");
			});
		} else NUT.tagMsg("Nhập năm, tháng trước khi thực hiện!","yellow");
	}
}