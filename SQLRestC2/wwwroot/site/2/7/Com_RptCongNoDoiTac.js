var Com_RptCongNoDoiTac={
	run:function(p){
		w2popup.open({
			title: '📜 <i>Công nợ đối tác</i>',
			modal:true,
			width: 300,
			height: 150,
			body: "<table style='margin:auto'><tr><td>Từ ngày*</td><td><input id='datTuNgay' type='date'/></td></tr><tr><td>Đến ngày*</td><td><input id='datDenNgay' type='date'/></td></tr></table>",
			buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="Com_RptCongNoDoiTac.runReport()">✔️ Report</button>'
		});
		var now=(new Date()).toISOString().substring(0,10);
		datTuNgay.value=now;
		datDenNgay.value=now;
	},
	runReport:function(){
		if(datTuNgay.value&&datDenNgay.value){
			var data={
				tungay:(datTuNgay.value?datTuNgay.value:null),
				denngay:(datDenNgay.value?datDenNgay.value:null),
			};
			NUT_DS.call({url:_context.service["fin"].urledit+"rpc/f_congnothanhtoan",data:data},function(thanhtoan){
				var lookupThanhToan={};
				for(var i=0;i<thanhtoan.length;i++)lookupThanhToan[thanhtoan[i].madoitac]=thanhtoan[i];
				NUT_DS.call({url:_context.service["fin"].urledit+"rpc/f_congnohoadon",data:data},function(hoadon){
					var win=window.open("client/"+_context.user.clientid+"/"+_context.curApp.applicationid+"/RptCongNoDoiTac.html");
					win.Com_RptCongNoDoiTac=Com_RptCongNoDoiTac;
					win.onload=function(){
						this.labNgay.innerHTML=datTuNgay.value+" ~ "+datDenNgay.value;
						var t1=0,t2=0,t3=0;
						for(var i=0;i<hoadon.length;i++){
							var hd=hoadon[i];
							var tt=lookupThanhToan[hd.madoitac];
							var row=this.tblData.insertRow();
							var co1=(hd.co1+(tt?tt.co1:0))-(hd.no1+(tt?tt.no1:0));
							var co2=(hd.co2+(tt?tt.co2:0))-(hd.no2+(tt?tt.no2:0));
							var co3=(hd.co3+(tt?tt.co3:0))-(hd.no3+(tt?tt.no3:0));
							t1+=co1;t2+=co2;t3+=co3;
							row.innerHTML="<td align='center'>"+(i+1)+"</td><td align='center'><a style='color:brown;cursor:pointer' onclick='Com_RptCongNoDoiTac.drillDown(window.open(\"RptCongNoDoiTac_Detail.html\"),this.innerHTML,"+co1+")'>"+hd.madoitac+"</a></td><td align='right'>"+(co1<0?-Math.round(co1).toLocaleString():"")+"</td><td align='right'>"+(co1>0?Math.round(co1).toLocaleString():"")+"</td><td align='right'>"+(co2<0?-Math.round(co2).toLocaleString():"")+"</td><td align='right'>"+(co2>0?Math.round(co2).toLocaleString():"")+"</td><td align='right'>"+(co3<0?-Math.round(co3).toLocaleString():"")+"</td><td align='right'>"+(co3>0?Math.round(co3).toLocaleString():"")+"</td>";
						}
						row=this.tblData.insertRow();
						row.innerHTML="<th align='center' colspan='2'>TỔNG</th><th align='right'>"+(t1<0?-Math.round(t1).toLocaleString():"")+"</th><th align='right'>"+(t1>0?Math.round(t1).toLocaleString():"")+"</th><th align='right'>"+(t2<0?-Math.round(t2).toLocaleString():"")+"</th><th align='right'>"+(t2>0?Math.round(t2).toLocaleString():"")+"</th><th align='right'>"+(t3<0?-Math.round(t3).toLocaleString():"")+"</th><th align='right'>"+(t3>0?Math.round(t3).toLocaleString():"")+"</th>";
					}
				});
			});
		} else NUT.tagMsg("Chọn Ngày bắt đầu và Ngày kết thức để thực hiện!","yellow",document.activeElement);
	},
	drillDown:function(win,madoitac,ton){
		var self=this;
		NUT_DS.select({url:_context.service["fin"].urledit+"rpt_congnodoitac_detail",where:["madoitac","=",madoitac]},function(congno){
			//var win=win.open("client/"+_context.user.clientid+"/"+_context.curApp.applicationid+"/RptCongNoDoiTac_Detail.html");
			//win.onload=function(){
			if(win.tblData)self.render(win,madoitac,ton,congno);
			else win.onload=function(){
				self.render(win,madoitac,ton,congno);
			}
		});
	},
	render:function(win,madoitac,ton,congno){
		win.labDoiTac.innerHTML=madoitac;
		win.labNgay.innerHTML=datTuNgay.value+" ~ "+datDenNgay.value;
		win.labTon.innerHTML=ton.toLocaleString();
		var tongNo=0,tongCo=0;
		for(var i=0;i<congno.length;i++){
			var rec=congno[i];
			ton+=(rec.co?rec.giatri:-rec.giatri);
			if(rec.co)tongCo+=rec.giatri;
			else tongNo+=rec.giatri;
			var row=win.tblData.insertRow();
			row.innerHTML="<td align='center'>"+(i+1)+"</td><td align='center'>"+rec.ngay+"</td><td align='center'>"+rec.sochungtu+"</td><td>"+rec.noidung+"</td><td align='right'>"+(rec.co?Math.round(rec.giatri).toLocaleString():"")+"</td><td align='right'>"+(rec.co?"":Math.round(rec.giatri).toLocaleString())+"</td><td align='right'>"+Math.round(ton).toLocaleString()+"</td>";
		}
		var row=win.tblData.insertRow();
		row.innerHTML="<th colspan='4'>TỔNG</th><th align='right'>"+Math.round(tongCo).toLocaleString()+"</th><th align='right'>"+Math.round(tongNo).toLocaleString()+"</th><th align='right'>"+Math.round(ton).toLocaleString()+"</th>";
	}
}