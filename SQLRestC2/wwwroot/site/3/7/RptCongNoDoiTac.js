var RptCongNoDoiTac={
	run:function(p){
		RptCongNoDoiTac.url = NUT.services[3].url;
		var now=(new Date()).toISOString().substring(0,10);
		NUT.w2popup.open({
			title: '📃 <i>Công nợ đối tác</i>',
			modal:true,
			width: 300,
			height: 160,
			body: "<table style='margin:auto'><tr><td>Từ ngày*</td><td><input id='datTuNgay' type='date' value='"+now+"'/></td></tr><tr><td>Đến ngày*</td><td><input id='datDenNgay' type='date' value='"+now+"'/></td></tr></table>",
			actions: {
				"_Close": function () {
					NUT.w2popup.close();
				},
				"_Ok": function () {
					if(datTuNgay.value&&datDenNgay.value){
						NUT.ds.select({url:RptCongNoDoiTac.url+"data/thanh_toan",select:"sum(case when ngay_thanh_toan<'"+datTuNgay.value+"' then giao_dich*gia_tri else 0 end)TON,sum(case when ngay_thanh_toan>='"+datTuNgay.value+"' then giao_dich*gia_tri else 0 end)GIA_TRI,MA_DOI_TAC",groupby:"ma_doi_tac",where:[["ngay_thanh_toan","<=",datDenNgay.value],["ma_tai_khoan","=","131"],["ma_doi_tac","!is",null]]},function(res2){
							if(res2.success&&res2.result.length){
								var lookupTT={};
								for(var i=0;i<res2.result.length;i++)lookupTT[res2.result[i].MA_DOI_TAC]=res2.result[i];
								NUT.ds.select({url:RptCongNoDoiTac.url+"data/hoa_don",select:"sum(case when ngay_hoa_don<'"+datTuNgay.value+"' then giao_dich*gia_tri else 0 end)TON,sum(case when ngay_hoa_don>='"+datTuNgay.value+"' then giao_dich*gia_tri else 0 end)GIA_TRI,MA_DOI_TAC",groupby:"ma_doi_tac",where:[["ngay_hoa_don","<=",datDenNgay.value],["ma_doi_tac","!is",null]]},function(res){
									var win=window.open("site/" + n$.user.siteid + "/" + n$.app.appid +"/RptCongNoDoiTac.html");
									win.onload=function(){
										this.RptCongNoDoiTac=RptCongNoDoiTac;
										this.labNgay.innerHTML=datTuNgay.value+" ~ "+datDenNgay.value;
										var t1=0,t2=0,t3=0;
										for(var i=0;i<res.result.length;i++){
											var hd=res.result[i];
											var tt=lookupTT[hd.MA_DOI_TAC]||{TON:0,GIA_TRI:0};
											var dau=hd.TON+tt.TON;
											t1+=dau;
											var trong=hd.GIA_TRI+tt.GIA_TRI;
											t2+=trong;
											var cuoi=dau+trong;
											t3+=cuoi;
											var row=this.tblData.insertRow();
											row.innerHTML="<td align='center'>"+(i+1)+"</td><td align='center'><a style='color:brown;cursor:pointer' onclick='RptCongNoDoiTac.drillDown(window.open(\"RptCongNoDoiTac_Detail.html\"),\""+hd.MA_DOI_TAC+"\","+dau+")'>"+hd.MA_DOI_TAC+"</a></td><td align='right'>"+(dau<0?(-dau).toLocaleString():"")+"</td><td align='right'>"+(dau<0?"":dau.toLocaleString())+"</td><td align='right'>"+(trong<0?(-trong).toLocaleString():"")+"</td><td align='right'>"+(trong<0?"":trong.toLocaleString())+"</td><td align='right'>"+(cuoi<0?(-cuoi).toLocaleString():"")+"</td><td align='right'>"+(cuoi<0?"":cuoi.toLocaleString())+"</td>";
										}
										row=this.tblData.insertRow();
										row.innerHTML="<th align='center' colspan='2'>TỔNG</th><th align='right'>"+(t1<0?(-t1).toLocaleString():"")+"</th><th align='right'>"+(t1<0?"":t1.toLocaleString())+"</th><th align='right'>"+(t2<0?(-t2).toLocaleString():"")+"</th><th align='right'>"+(t2<0?"":t2.toLocaleString())+"</th><th align='right'>"+(t3<0?(-t3).toLocaleString():"")+"</th><th align='right'>"+(t3<0?"":Math.round(t3).toLocaleString())+"</th>";
									}
								});
							}else NUT.notify("⚠️ No data to report!","yellow");
						});
					} else NUT.notify("⚠️ Select from date and to date!","yellow");
				}
			}
		});
	},
	drillDown:function(win,madoitac,ton){
		var self=this;
		NUT.ds.select({url:RptCongNoDoiTac.url+"data/CHUNG_TU_V",where:["ma_doi_tac","=",madoitac],orderby:"ngay"},function(res){
			//var win=win.open("client/"+_context.user.clientid+"/"+_context.curApp.applicationid+"/RptCongNoDoiTac_Detail.html");
			//win.onload=function(){
			if(win.tblData)self.render(win,madoitac,ton,res);
			else win.onload=function(){
				self.render(win,madoitac,ton,res);
			}
		});
	},
	render:function(win,madoitac,ton,res){
		win.labDoiTac.innerHTML=madoitac;
		win.labNgay.innerHTML=datTuNgay.value+" ~ "+datDenNgay.value;
		win.labTon.innerHTML=ton.toLocaleString();
		var tongNo=0;var tongCo=0;;
		for(var i=0;i<res.result.length;i++){
			var rec=res.result[i];
			ton+=rec.GIAO_DICH*rec.GIA_TRI;
			if(rec.GIAO_DICH<0)
				tongNo+=rec.GIA_TRI;
			else
				tongCo+=rec.GIA_TRI;
			var row=win.tblData.insertRow();
			row.innerHTML="<td align='center'>"+(i+1)+"</td><td>"+rec.NGAY.substring(0,10)+"</td><td align='center'>"+(rec.MA_TAI_KHOAN||"")+"</td><td>"+rec.ID+"</td><td>"+(rec.SO_CHUNG_TU||"")+"</td><td>"+(rec.GHI_CHU||"")+"</td><td>"+(rec.MA_DOI_TAC||"")+"</td><td>"+(rec.MA_DU_AN||"")+"</td><td align='right'>"+(rec.GIAO_DICH==-1?rec.GIA_TRI.toLocaleString():"")+"</td><td align='right'>"+(rec.GIAO_DICH==1?rec.GIA_TRI.toLocaleString():"")+"</td><td align='right'>"+ton.toLocaleString()+"</td>";
		}
		var row=win.tblData.insertRow();
		row.innerHTML="<th colspan='8'>TỔNG</th><th align='right'>"+tongNo.toLocaleString()+"</th><th align='right'>"+tongCo.toLocaleString()+"</th><th align='right'>"+ton.toLocaleString()+"</th>";
	}
}