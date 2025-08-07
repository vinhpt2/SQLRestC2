var Com_RptDoanhThuChiPhi={
	run:function(p){
		w2popup.open({
			title: '📜 <i>Doanh thu chi phí</i>',
			modal:true,
			width: 360,
			height: 180,
			body: "<table style='margin:auto'><caption><i><b>Báo cáo</b></i></caption><tr><td>Từ ngày</td><td><input id='datTuNgay' type='date'/></td><td>Đến ngày</td><td><input id='datDenNgay' type='date'/></td></tr></table>",
			buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="Com_RptDoanhThuChiPhi.runReport()">✔️ Report</button>'
		})

	},
	runReport:function(){
		NUT_DS.select({url:_context.service["fin"].urledit+"v_sumhoadon"},function(hoadon){
			var lookupHoaDon={};
			for(var i=0;i<hoadon.length;i++)lookupHoaDon[hoadon[i].maduan]=hoadon[i];
			NUT_DS.select({url:_context.service["fin"].urledit+"v_sumthanhtoan"},function(thanhtoan){
				var lookupThanhToan={};
				for(var i=0;i<thanhtoan.length;i++)lookupThanhToan[thanhtoan[i].maduan]=thanhtoan[i];
			
				var where=[];
				if(datTuNgay.value)where.push([["ngayhopdong",">=",datTuNgay.value]]);
				if(datDenNgay.value)where.push(["ngayhopdong","<=",datDenNgay.value]);
				var p={url:_context.service["fin"].urledit+"duan",order:"maduan",select:["maduan","tenduan","ngayhopdong"]};
				if(where.length)p.where=where;
				NUT_DS.select(p,function(res){
					if(res.length){
						var win=window.open("client/"+_context.user.clientid+"/"+_context.curApp.applicationid+"/RptDoanhThuChiPhi.html");
						win.onload=function(){
							this.labNgay.innerHTML=(datTuNgay.value?datTuNgay.value:"Trước")+" ~ "+(datDenNgay.value?datDenNgay.value:(new Date()).toLocaleDateString());
							var sum=[0,0,0,0,0,0,0,0,0,0,0,0,0,0];
							for(var i=0;i<res.length;i++){
								var rec=res[i];
								var key=rec.maduan;
								var tt=lookupThanhToan[key];
								var hd=lookupHoaDon[key];
								if(tt&&hd){
									var doanhthuthuan=hd.doanhthu-hd.giamtrudt;
									var congchiphi=tt.cpnvl+tt.cpnhancong+tt.cpmuangoai+tt.cpchung;
									var giavon=tt.cphoahong+congchiphi;
									var lailo=doanhthuthuan-tt.cphoahong-congchiphi-tt.cpbanhang-tt.cpquanly-tt.cpkhac;
									var row=this.tblData.insertRow();
									row.innerHTML="<td>"+(i+1)+"</td><td>"+key+"</td><td align='right'>"+Math.round(hd.doanhthu).toLocaleString()+"</td><td align='right'>"+Math.round(hd.giamtrudt).toLocaleString()+"</td><td align='right'>"+Math.round(doanhthuthuan).toLocaleString()+"</td><td align='right'>"+Math.round(tt.cphoahong).toLocaleString()+"</td><td align='right'>"+Math.round(tt.cpnvl).toLocaleString()+"</td><td align='right'>"+Math.round(tt.cpnhancong).toLocaleString()+"</td><td align='right'>"+Math.round(tt.cpmuangoai).toLocaleString()+"</td><td align='right'>"+Math.round(tt.cpchung).toLocaleString()+"</td><td align='right'>"+Math.round(congchiphi).toLocaleString()+"</td><td>"+Math.round(giavon).toLocaleString()+"</td><td>"+Math.round(tt.cpbanhang).toLocaleString()+"</td><td>"+Math.round(tt.cpquanly).toLocaleString()+"</td><td>"+Math.round(tt.cpkhac).toLocaleString()+"</td><td>"+Math.round(lailo).toLocaleString()+"</td><td>"+(Math.round(1000*lailo/doanhthuthuan)/10).toLocaleString()+"%</td>";
									if(hd.doanhthu)sum[0]+=hd.doanhthu;
									if(hd.doanhthugt)sum[1]+=hd.doanhthugt;
									if(doanhthuthuan)sum[2]+=doanhthuthuan;
									if(tt.cphoahong)sum[3]+=tt.cphoahong;
									if(tt.cpnvl)sum[4]+=tt.cpnvl;
									if(tt.cpnhancong)sum[5]+=tt.cpnhancong;
									if(tt.cpmuangoai)sum[6]+=tt.cpmuangoai;
									if(tt.cpchung)sum[7]+=tt.cpchung;
									if(congchiphi)sum[8]+=congchiphi;
									if(giavon)sum[9]+=giavon;
									if(tt.cpbanhang)sum[10]+=tt.cpbanhang;
									if(tt.cpquanly)sum[11]+=tt.cpquanly;
									if(tt.cpkhac)sum[12]+=tt.cpkhac;
									if(lailo)sum[13]+=lailo;
								}
							}
							var row=this.tblData.insertRow();
							row.innerHTML="<th colspan='2'>TỔNG</th>"
							for(var i=0;i<sum.length;i++){
								var cell=row.insertCell();
								cell.align='right';
								cell.innerHTML="<b>"+Math.round(sum[i]).toLocaleString()+"</b>";
							}
						}
					} else NUT.tagMsg("No data to report!","yellow");
				});
			});
		});
	}
}