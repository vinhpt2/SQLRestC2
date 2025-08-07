var Com_HrmsSalemanChamCongReport={
	run:function(p){
		w2popup.open({
			title: '📜 <i>Thông tin chấm công</i>',
			modal:true,
			width: 360,
			height: 180,
			body: "<table style='margin:auto'><caption><b><i>Tháng</i></b></caption><tr><td><select id='cboTinhCong_Month'><option value=0>Tháng này</option><option value=1>Tháng trước</option></select></td></tr></table>",
			buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="Com_HrmsSalemanChamCongReport.runReport(cboTinhCong_Month.value)">✔️ Report</button>'
		})
	},
	runReport:function(val){
		var now=new Date();
		now.setMonth(now.getMonth()-parseInt(val));
		var nam=now.getFullYear();
		var thang=now.getMonth()+1;
		
		var win=window.open("client/"+_context.user.clientid+"/"+_context.curApp.applicationid+"/SalemanChamCongReport.html");
		win.onload=function(){
			NUT_DS.select({url:_context.service["hrms"].urledit+"nhanvien_v",select:"hoten",where:["manhanvien","=",_context.user.username]},function(nv){
				NUT_DS.select({url:_context.service["hrms"].urledit+"chamcong_v",where:[["nam","=",nam],["thang","=",thang],["manhanvien","=",_context.user.username]]},function(res){
					if(res.length){
						win.labThangNam.innerHTML=thang+"/"+nam;
						win.labMaNhanVien.innerHTML=_context.user.username;
						win.labHoTen.innerHTML=nv[0].hoten;
						win.labNgayBaoCao.innerHTML=(new Date()).toLocaleString();
						var lookup=_context.domain[35].lookup;
						for(var i=0;i<res.length;i++){
							var rec=res[i];
							var row=win.tblData.insertRow();
							var nguyennhan=lookup[rec.nguyennhan];
							row.innerHTML="<td>"+rec.ngay+"</td><td align='right'>"+(rec.ngaycong||rec.chamcong||"-/-")+"</td><td>"+(nguyennhan?nguyennhan:"-/-")+"</td><td>"+(rec.lydo?rec.lydo:"-/-")+"</td><td align='center'>"+(rec.hinhanh?"<a href='http://oritholdings.hopto.org/nut/upload/"+rec.hinhanh+"' target=_blank'>Hình ảnh</a>":"-/-")+"</td>";
						}
					} else NUT.tagMsg("No data to report!","yellow");
				})
			})
		}
	}
}