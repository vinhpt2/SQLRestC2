var Com_HrmsMonthlyMS10Report={
	run:function(p){
		
		var now=new Date();
		w2popup.open({
			title: '📜 <i>Monthly MS10-Tổng hợp phí dịch vụ tháng</i>',
			modal:true,
			width: 500,
			height: 220,
			body: "<table style='margin:auto'><tr><td>Năm</td><td><input id='numTinhCong_Year' style='width:60px' type='number' value='"+now.getFullYear()+"'/></td><td>Tháng</td><td><input id='numTinhCong_Month' style='width:60px' type='number' value='"+(now.getMonth()+1)+"'/></td></tr><tr><td>Đối tác</td><td>HABECO</td>"+(_context.user.kvhcs.length?"<td></td><td>":"<td>Thị trường</td><td><select id='cboTinhCong_ThiTruong'><option value='ĐBSH' selected>ĐBSH</option><option value='ĐTBB'>ĐTBB</option></select>")+"</td></tr><tr><td>Vị trí LV</td><td><select id='cboTinhCong_ViTriLV'><option value='BA'>BA</option><option value='BA_'>BA_PartTime</option><option value='SM'>SM</option></select></td></tr></table>",
			buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="Com_HrmsMonthlyMS10Report.runReport()">✔️ Report</button>'
		})
	},
	runReport:function(){
		if(numTinhCong_Year.value&&numTinhCong_Month.value){
			var vitrilv=cboTinhCong_ViTriLV.value;
			var url=_context.service["hrms"].urledit;
			var html="client/"+_context.user.clientid+"/"+_context.curApp.applicationid+"/MonthlyMS10Report.html";
			var nam=numTinhCong_Year.value;
			var thang=numTinhCong_Month.value;

			NUT_DS.select({url:url+"rpt_ms10",where:[["nam","=",numTinhCong_Year.value],["thang","=",numTinhCong_Month.value],["madoitac","=","HABECO"],["vitrilv","=",vitrilv]]},function(res){
				if(res.length){
					var win=window.open(html);
					win.onload=function(){
						this.labThangNam.innerHTML="THÁNG " +numTinhCong_Month.value+" NĂM "+numTinhCong_Year.value;
						this.labThiTruong.innerHTML=_context.user.kvhcs.length?_context.user.kvhcs:cboTinhCong_ThiTruong.value;
						var sum=0;
						for(var i=0;i<res.length;i++){
							var rec=res[i];
							var row=this.tblData.insertRow();
							var c11=1.23*rec.traluong+rec.bhxh+rec.congdoan+rec.luongcoban+rec.nghile;
							row.innerHTML="<td align='center'>"+(i+1)+"</td><td align='center'>"+rec.makhuvuc+"</td><td align='center'>"+rec.count+"</td><td>"+Math.round(rec.traluong).toLocaleString()+"</td><td>"+(rec.bhxh?Math.round(rec.bhxh).toLocaleString():0)+"</td><td>"+(rec.congdoan?Math.round(rec.congdoan).toLocaleString():0)+"</td><td>"+(rec.luongcoban?Math.round(rec.luongcoban).toLocaleString():0)+"</td><td>"+(rec.nghile?Math.round(rec.nghile).toLocaleString():0)+"</td><td></td><td>"+Math.round(0.23*rec.traluong).toLocaleString()+"</td><td>"+Math.round(c11).toLocaleString()+"</td><td>"+Math.round(0.08*c11).toLocaleString()+"</td><td>"+Math.round(1.08*c11).toLocaleString()+"</td>";
						}
					}
				}else NUT.tagMsg("No data to report!","yellow");
			});

		} else NUT.tagMsg("Nhập năm, tháng trước khi thực hiện!","yellow");
	}
}