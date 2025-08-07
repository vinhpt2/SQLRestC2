var Com_RptSoQuyTienMat={
	run:function(p){
		var items=_context.domain[49].items;
		var cbo=document.createElement("select");
		cbo.id="cboQuy";
		cbo.style.width="100%";
		for(var i=items.length-1;i>=0;i--){
			var opt=document.createElement("option");
			opt.value=items[i].id;
			opt.innerHTML=items[i].text;
			cbo.add(opt);
		}
		
		w2popup.open({
			title: '📜 <i>Sổ quỹ tiền mặt</i>',
			modal:true,
			width: 360,
			height: 180,
			body: "<table style='margin:auto'><caption><i><b>Báo cáo</b></i></caption><tr><td>Quỹ *</td><td colspan='3'>"+cbo.outerHTML+"</td></tr><tr><td>Từ ngày</td><td><input id='datTuNgay' type='date'/></td><td>Đến ngày</td><td><input id='datDenNgay' type='date'/></td></tr></table>",
			buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="Com_RptSoQuyTienMat.runReport()">✔️ Report</button>'
		})
	},
	runReport:function(){
		if(cboQuy.value){
			var data={
				ngay:datTuNgay.value?datTuNgay.value:null,
				quy:cboQuy.value
			}
			NUT_DS.call({url:_context.service["fin"].urledit+"rpc/f_tonquy",data:data},function(tonQuy){
				if(!tonQuy)tonQuy=0;
				var where=[["maquy","=",cboQuy.value]];
				where.push(["ngaythanhtoan",">=",datTuNgay.value>"2022-08-01"?datTuNgay.value:"2022-08-01"]);
				if(datDenNgay.value)where.push(["ngaythanhtoan","<=",datDenNgay.value]);
				NUT_DS.select({url:_context.service["fin"].urledit+"thanhtoan",order:"idthanhtoan",where:where},function(res){
					if(res.length){
						var win=window.open("client/"+_context.user.clientid+"/7/RptSoQuyTienMat.html");
						win.onload=function(){
							this.labNgay.innerHTML=(datTuNgay.value?datTuNgay.value:"Trước")+" ~ "+(datDenNgay.value?datDenNgay.value:(new Date()).toLocaleDateString());
							this.labQuy.innerHTML=cboQuy.value;
							this.labTonQuy.innerHTML=tonQuy.toLocaleString();
							var tongThu=0,tongChi=0;
							for(var i=0;i<res.length;i++){
								var rec=res[i];
								tonQuy+=(rec.lachi?-rec.giatri:rec.giatri);
								if(rec.lachi)tongChi+=rec.giatri;
								else tongThu+=rec.giatri;
								row=this.tblData.insertRow();
								row.innerHTML="<td>"+(i+1)+"</td><td>"+rec.ngaythanhtoan+"</td><td>"+rec.sochungtu+"</td><td>"+rec.noidung+"</td><td>"+(rec.macongty?rec.macongty:"")+"</td><td>"+(rec.maduan?rec.maduan:"")+"</td><td align='right'>"+(rec.lachi?"":rec.giatri.toLocaleString())+"</td><td align='right'>"+(rec.lachi?rec.giatri.toLocaleString():"")+"</td><td align='right'>"+tonQuy.toLocaleString()+"</td>";
							}
							row=this.tblData.insertRow();
							row.innerHTML="<th colspan='6'>TỔNG</th><th align='right'>"+tongThu.toLocaleString()+"</th><th align='right'>"+tongChi.toLocaleString()+"</th><th align='right'>"+tonQuy.toLocaleString()+"</th>";
						}
					} else NUT.tagMsg("No data to report!","yellow");
				});
			});
		} else NUT.tagMsg("Nhập Quỹ trước khi thực hiện!","yellow");
	}
}