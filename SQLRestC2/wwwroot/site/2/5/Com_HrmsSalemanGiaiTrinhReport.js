var Com_HrmsSalemanGiaiTrinhReport={
	run:function(p){
		var now=new Date();
		w2popup.open({
			title: '📜 <i>Saleman giải trình</i>',
			modal:true,
			width: 360,
			height: 180,
			body: "<table style='margin:auto'><caption><b><i>Báo cáo</i></b></caption><tr><td>Năm</td><td><input id='numTinhCong_Year' style='width:60px' type='number' value='"+now.getFullYear()+"'/></td><td>Tháng</td><td><input id='numTinhCong_Month' style='width:60px' type='number' value='"+(now.getMonth()+1)+"'/></td></tr></table>",
			buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="Com_HrmsSalemanGiaiTrinhReport.runReport()">✔️ Report</button>'
		})

	},
	runReport:function(){
		if(numTinhCong_Year.value&&numTinhCong_Month.value){
			NUT_DS.select({url:_context.service["hrms"].urledit+"rpt_salemangiaitrinh",where:[["nam","=",numTinhCong_Year.value],["thang","=",numTinhCong_Month.value]]},function(res){
				if(res.length){
					var win=window.open("client/"+_context.user.clientid+"/"+_context.curApp.applicationid+"/SalemanGiaiTrinhReport.html");
					win.onload=function(){
						this.labThangNam.innerHTML=numTinhCong_Month.value+"/"+numTinhCong_Year.value;
						this.labNgayBaoCao.innerHTML=(new Date()).toLocaleString();
						var lookup=_context.domain[35].lookup;
						for(var i=0;i<res.length;i++){
							var rec=res[i];
							var row=this.tblData.insertRow();
							row.innerHTML="<td align='right'>"+(i+1)+"</td><td>"+rec.makhuvuc+"</td><td align='center'>"+rec.manhanvien+"</td><td>"+rec.hoten+"</td><td>"+(rec.ngay+"/"+rec.thang+"/"+rec.nam)+"</td><td align='right'>"+rec.ngaycong+"</td><td>"+lookup[rec.nguyennhan]+"</td><td>"+rec.lydo+"</td><td align='center'>"+(rec.hinhanh?"<a href='http://oritholdings.hopto.org/nut/upload/"+rec.hinhanh+"' target=_blank'>Hình ảnh</a>":"")+"</td>";
						}
					}
				} else NUT.tagMsg("No data to report!","yellow");
			});
		} else NUT.tagMsg("Nhập năm, tháng trước khi thực hiện!","yellow");
	}
}