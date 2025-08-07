var Com_RptKetQuaKinhDoanh={
	run:function(p){
		w2popup.open({
			title: '📜 <i>Kết quả kinh doanh</i>',
			modal:true,
			width: 360,
			height: 180,
			body: "<table style='margin:auto'><caption><i><b>Báo cáo</b></i></caption><tr><td>Từ ngày</td><td><input id='datTuNgay' type='date'/></td><td>Đến ngày</td><td><input id='datDenNgay' type='date'/></td></tr></table>",
			buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="Com_RptKetQuaKinhDoanh.runReport()">✔️ Report</button>'
		})

	},
	runReport:function(){
		var url=_context.service["fin"].urledit;
		var data={
			tungay:datTuNgay.value?datTuNgay.value:null,
			denngay:datDenNgay.value?datDenNgay.value:null,
			dautk:"511%",
			isout:true
		};
		NUT_DS.call({url:_context.service["fin"].urledit+"rpc/f_sumhoadon",data:data},function(doanhthu){
			data.dautk="521%";
			NUT_DS.call({url:_context.service["fin"].urledit+"rpc/f_sumhoadon",data:data},function(giamtrudt){
				data.dautk="711%";
				NUT_DS.call({url:_context.service["fin"].urledit+"rpc/f_sumthanhtoan",data:data},function(thunhapkhac){					
					data.dautk="632%";
					NUT_DS.call({url:_context.service["fin"].urledit+"rpc/f_sumthanhtoan",data:data},function(giavon){
						data.dautk="635%";
						NUT_DS.call({url:_context.service["fin"].urledit+"rpc/f_sumthanhtoan",data:data},function(cptaichinh){
							data.dautk="642%";
							NUT_DS.call({url:_context.service["fin"].urledit+"rpc/f_sumthanhtoan",data:data},function(cpquanly){
								data.dautk="811%";
								NUT_DS.call({url:_context.service["fin"].urledit+"rpc/f_sumthanhtoan",data:data},function(cpkhac){
									data.dautk="8211%";
									NUT_DS.call({url:_context.service["fin"].urledit+"rpc/f_sumthanhtoan",data:data},function(cpthuedn){
										data.dautk="515%";
										data.isout=false;
										NUT_DS.call({url:_context.service["fin"].urledit+"rpc/f_sumthanhtoan",data:data},function(dttaichinh){
											var win=window.open("client/"+_context.user.clientid+"/"+_context.curApp.applicationid+"/RptKetQuaKinhDoanh.html");
											win.onload=function(){
												this.labNgay.innerHTML=(datTuNgay.value?datTuNgay.value:"Trước")+" ~ "+(datDenNgay.value?datDenNgay.value:(new Date()).toLocaleDateString());
												this.lab1.innerHTML=Math.round(doanhthu).toLocaleString();
												this.lab2.innerHTML=Math.round(giamtrudt).toLocaleString();
												this.lab3.innerHTML=Math.round(doanhthu-giamtrudt).toLocaleString();
												this.lab4.innerHTML=Math.round(giavon).toLocaleString();
												var loinhuangop=doanhthu-giamtrudt-giavon;
												this.lab5.innerHTML=Math.round(loinhuangop).toLocaleString();
												this.lab6.innerHTML=Math.round(dttaichinh).toLocaleString();
												this.lab7.innerHTML=Math.round(cptaichinh).toLocaleString();
												this.lab8.innerHTML=Math.round(cpquanly).toLocaleString();
												var loinhuanthuan=loinhuangop+dttaichinh-cptaichinh-cpquanly;
												this.lab9.innerHTML=Math.round(loinhuanthuan).toLocaleString();
												this.lab10.innerHTML=Math.round(thunhapkhac).toLocaleString();
												this.lab11.innerHTML=Math.round(cpkhac).toLocaleString();
												this.lab12.innerHTML=Math.round(thunhapkhac-cpkhac).toLocaleString();
												var loinhuantruocthue=loinhuanthuan+thunhapkhac-cpkhac;
												this.lab13.innerHTML=Math.round(loinhuantruocthue).toLocaleString();
												this.lab14.innerHTML=Math.round(cpthuedn).toLocaleString();
												this.lab15.innerHTML=Math.round(loinhuantruocthue-cpthuedn).toLocaleString();
											}
										});
									});
								});
							});
						});
					});
				});
			});
		});
	}
}