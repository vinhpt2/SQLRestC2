var Com_HrmsTinhNgayCong={
	run:function(){
		var now=new Date();
		w2popup.open({
			title: '🏃 <i>Tính ngày công</i>',
			modal:true,
			width: 360,
			height: 180,
			body: "<table style='margin:auto'><caption><b>Tính từ dữ liệu Check IN-OUT</b></caption><tr><td>Năm</td><td><input id='numTinhCong_Year' style='width:60px' type='number' value='"+now.getFullYear()+"'/></td><td>Tháng</td><td><input id='numTinhCong_Month' style='width:60px' type='number' value='"+(now.getMonth()+1)+"'</td></tr><tr><td></td><td colspan='3'><input id='chkTinhCong_Edit' type='checkbox'/><label for='chkTinhCong_Edit'>Chạy trên dữ liệu Hiệu chỉnh</label></td></tr></table>",
			buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="Com_HrmsTinhNgayCong.runTinhCong()">✔️ Run</button>'
		});
	},
	runTinhCong:function(){
		if(numTinhCong_Year.value&&numTinhCong_Month.value){
			NUT.ds.call({url:_context.service["hrms"].urledit+"rpc/f_tinhngaycong",data:{nam:numTinhCong_Year.value,thang:numTinhCong_Month.value,doitac:'HABECO',dulieu:(chkTinhCong_Edit.checked?1:0)}},function(){
				NUT.tagMsg("Thực hiện thành công!","lime");
			});
		} else NUT.tagMsg("Nhập năm, tháng trước khi thực hiện!","yellow");
	}
}