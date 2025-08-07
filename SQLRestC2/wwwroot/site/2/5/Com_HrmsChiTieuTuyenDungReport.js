var Com_HrmsChiTieuTuyenDungReport={
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
		w2popup.open({
			title: '📜 <i>Chỉ tiêu tuyển dụng</i>',
			modal:true,
			width: 360,
			height: 220,
			body: "<table style='margin:auto'><tr><td>Đối tác</td><td>"+cbo.outerHTML+"</td><td>Thị trường</td><td><select id='cboTinhCong_ThiTruong'><option></option><option value='ĐBSH'>ĐBSH</option><option value='ĐTBB'>ĐTBB</option></select></td></tr><tr><td>Ví trí tuyển</td><td colspan='3'><select id='cboTinhCong_ViTriLv'><option value='BA'>BA. Nhân viên tiếp thị</option><option value='SM'>SM. Đại diện kinh doanh</option></select></td></tr><tr><td>Ngày</td><td colspan='3'><input id='datTinhCong_Ngay' type='date'/></td></tr><tr><td></td><td colspan='3'>Không chọn ngày để báo cáo ở thời điểm hiện tại</td></tr></table>",
			buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="Com_HrmsChiTieuTuyenDungReport.runReport()">✔️ Report</button>'
		});
	},
	runReport:function(){
		var self=this;
		if(datTinhCong_Ngay.value)
			NUT_DS.call({url:_context.service["hrms"].urledit+"rpc/f_rptchitieutuyendung",data:{ngay:datTinhCong_Ngay.value,madt:cboTinhCong_DoiTac.value,vtlv:cboTinhCong_ViTriLv.value}},function(res){
				self.openReport(res);
			});
		else{
			var where=[["madoitac","=",cboTinhCong_DoiTac.value],["vitrilv","=",cboTinhCong_ViTriLv.value]];
			if(cboTinhCong_ThiTruong.value)where.push(["thitruong","=",cboTinhCong_ThiTruong.value]);
			
			NUT_DS.select({url:_context.service["hrms"].urledit+"rpt_chitieutuyendung",where:where},function(res){
				self.openReport(res);
			});
		}
	},
	openReport:function(res){
		if(res.length){
			var win=window.open("client/"+_context.user.clientid+"/"+_context.curApp.applicationid+"/ChiTieuTuyenDungReport.html");
			win.onload=function(){
				this.labViTriLv.innerHTML=cboTinhCong_ViTriLv.options[cboTinhCong_ViTriLv.selectedIndex].innerHTML;
				this.labDoiTac.innerHTML="Đối tác: "+cboTinhCong_DoiTac.value;
				this.labThiTruong.innerHTML="Thị trường: "+(cboTinhCong_ThiTruong.value||"ALL");
				if(datTinhCong_Ngay.value)this.labThoiDiem.innerHTML="Thời điểm: "+datTinhCong_Ngay.value;
				this.labNgayBaoCao.innerHTML=(new Date()).toLocaleString();
				var sum=[0,"",0,0,0,0,0,0,0];
				for(var i=0;i<res.length;i++){
					var rec=res[i];
					var row=this.tblData.insertRow();
					row.innerHTML="<td align='center'>"+(i+1)+"</td><td align='center'>"+rec.vitrilv+"</td><td align='center'>"+rec.makhuvuc+"</td><td align='center'>"+rec.soluong+"</td><td align='center'>"+rec.ngaynhanchitieu.toLocaleString()+"</td><td align='center'>"+rec.danglam+"</td><td align='center'>"+(rec.soluong-rec.danglam)+"</td><td align='center'>"+rec.ungvien+"</td><td align='center'>"+(rec.soluong-rec.ungvien)+"</td><td align='center'>"+rec.sapnghi+"</td><td align='center'>"+rec.chophongvan+"</td><td align='center'>"+rec.phongvandat+"</td><td></td>";
					sum[0]+=rec.soluong;
					sum[2]+rec.danglam;
					sum[3]+=(rec.soluong-rec.danglam);
					sum[4]+=rec.ungvien;
					sum[5]+=(rec.soluong-rec.ungvien);
					sum[6]+=rec.sapnghi;
					sum[7]+=rec.chophongvan;
					sum[8]+=rec.phongvandat;
				}
				var row=this.tblData.insertRow();
				row.innerHTML="<td align='right' colspan='3'><b>TỔNG</b></td>";
				for(var i=0;i<sum.length;i++){
					var cell=row.insertCell();
					cell.align="center";
					cell.innerHTML="<b>"+sum[i]+"</b>";
				}
			}
		} else NUT.tagMsg("No data to report!","yellow");
	}
}