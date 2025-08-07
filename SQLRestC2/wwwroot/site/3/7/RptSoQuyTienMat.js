var RptSoQuyTienMat={
	run:function(p){
		RptSoQuyTienMat.url = NUT.services[3].url;
		var items=NUT.dmlinks[164].items;
		var cbo=document.createElement("select");
		cbo.id="cboQuy";
		for(var i=items.length-1;i>=0;i--){
			var opt=document.createElement("option");
			opt.value=items[i].id;
			opt.innerHTML=items[i].id+" - "+items[i].text;
			cbo.add(opt);
		}
		var now=(new Date()).toISOString().substring(0,10);
		NUT.w2popup.open({
			title: '📜 <i>Sổ quỹ tiền mặt</i>',
			modal:true,
			width: 360,
			height: 180,
			body: "<table style='margin:auto'><caption><i><b>Báo cáo</b></i></caption><tr><td>Quỹ *</td><td colspan='3'>"+cbo.outerHTML+"</td></tr><tr><td>Từ ngày</td><td><input id='datTuNgay' type='date' value='"+now+"'/></td><td>Đến ngày</td><td><input id='datDenNgay' type='date'/></td></tr></table>",
			actions: {
				"_Close": function () {
					NUT.w2popup.close();
				},
				"_Ok": function () {
					if(cboQuy.value&&datTuNgay.value){
						var where=[["ma_quy","=",cboQuy.value],["ngay_thanh_toan","<",datTuNgay.value]];
						NUT.ds.select({url:RptSoQuyTienMat.url+"data/thanh_toan",select:"sum(giao_dich*gia_tri) TON",where:where},function(res2){
							var tonQuy=res2.result.length?res2.result[0].TON||0:0;
							where=[["ma_quy","=",cboQuy.value],["ngay_thanh_toan",">=",datTuNgay.value]];
							if(datDenNgay.value)where.push(["ngay_thanh_toan","<=",datDenNgay.value]);
							NUT.ds.select({url:RptSoQuyTienMat.url+"data/thanh_toan",orderby:"id_thanh_toan",where:where,limit:NUT.QUERY_LIMIT},function(res){
								if(res.success&&res.result.length){
									var win=window.open("site/" + n$.user.siteid + "/" + n$.app.appid +"/RptSoQuyTienMat.html");
									win.onload=function(){
										this.labNgay.innerHTML=(datTuNgay.value?datTuNgay.value:"Trước")+" ~ "+(datDenNgay.value?datDenNgay.value:(new Date()).toLocaleDateString());
										this.labQuy.innerHTML=cboQuy.value;
										this.labTonQuy.innerHTML=tonQuy.toLocaleString();
										var tongThu=0,tongChi=0;
										for(var i=0;i<res.result.length;i++){
											var rec=res.result[i];
											tonQuy+=rec.GIAO_DICH*rec.GIA_TRI;
											if(rec.GIAO_DICH==1)tongThu+=rec.GIA_TRI;
											else tongChi+=rec.GIA_TRI;
											var row=this.tblData.insertRow();
											row.innerHTML="<td align='center'>"+(i+1)+"</td><td>"+rec.NGAY_THANH_TOAN.substring(0,10)+"</td><td align='center'>"+(rec.MA_TAI_KHOAN||"")+"</td><td>"+(rec.SO_CHUNG_TU||"")+"</td><td>"+(rec.GHI_CHU||"")+"</td><td>"+(rec.MA_DOI_TAC||"")+"</td><td>"+(rec.MA_DU_AN||"")+"</td><td align='right'>"+(rec.GIAO_DICH==1?rec.GIA_TRI.toLocaleString():"")+"</td><td align='right'>"+(rec.GIAO_DICH==-1?rec.GIA_TRI.toLocaleString():"")+"</td><td align='right'>"+tonQuy.toLocaleString()+"</td>";
										}
										var row=this.tblData.insertRow();
										row.innerHTML="<th colspan='7'>TỔNG</th><th align='right'>"+tongThu.toLocaleString()+"</th><th align='right'>"+tongChi.toLocaleString()+"</th><th align='right'>"+tonQuy.toLocaleString()+"</th>";
									}
								} else NUT.notify("⚠️ No data to report!","yellow");
							});
						});
					} else NUT.notify("⚠️ Select fund and from date!","yellow");
				}
			}
		})
	}
}