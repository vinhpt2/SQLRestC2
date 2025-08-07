var PhanTichTinBao = {
	run: function (p) {
		if (p.records.length) {
			PhanTichTinBao.obj=p.records[0];
			PhanTichTinBao.url = NUT.services[6].url;
			NUT.ds.select({url:TinMonitor.url+"data/SuCoKhanNguy",where:[["status","<>","DRAFT"],["status","<>","FINISH"]]},function(res){
				if(res.success){
					var items=[NUT.DM_NIL,{id:"NEW",text:"Tạo sự cố mới"}];
					for(var i=0;i<res.result.length;i++){
						var rec=res.result[i];
						items.push({id:rec.id,text:rec.tenSuCo});
					}
				
					var now=new Date();
					NUT.openDialog({
						title: '📃 <i>Phân tích tin báo</i>',
						width: 360,
						height: 320,
						div: "<table style='margin:auto'><tr><td align='right'>Tin báo</td><td><textarea id='txtTinBao' readonly class='w2ui-input'>"+(PhanTichTinBao.obj.moTaTinBao||"")+"</textarea></td></tr><tr><td align='right'>Phân loại tin</td><td colspan='2'><select id='cboPhanLoai' class='w2ui-input'><option></option><option value='NORMAL'>Bỏ qua</option><option value='INCERFA'>Hồ nghi</option><option value='ALERFA'>Báo động</option><option value='DETRESFA'>Khẩn nguy</option></select></td></tr><tr><td align='right'>Thuộc sự cố</td><td>"+NUT.outerCboHTML(items,"cboThuocSuCo")+"</td></tr><tr><td align='right'>Tên sự cố</td><td><input id='txtTenSuCo' class='w2ui-input'/></td></tr><tr><td align='right'>Ghi chú</td><td><textarea id='txtGhiChu' class='w2ui-input'></textarea></td></tr></table>",
						actions: {
							"_Cancel": function () {
								NUT.closeDialog();
							}, "_Ok": function () {
								var isUrgent=cboPhanLoai.value=="INCERFA"||cboPhanLoai.value=="ALERFA"||cboPhanLoai.value=="DETRESFA";
								var data={status:isUrgent?"URGENT":"OK"};
								if(txtGhiChu.value)data.ghiChu=txtGhiChu.value;
								if(cboThuocSuCo.value&&cboThuocSuCo.value!="NEW")data.idSuCo=cboThuocSuCo.value;
								NUT.ds.update({url:NUT.services[6].url+"data/TinBaoSuCo",data:data, where:["id","=",PhanTichTinBao.obj.id]},function (res) {
									if (res.success) {
										if(cboThuocSuCo.value=="NEW"){
											var data={idTinBao:PhanTichTinBao.obj.id,mucDo:cboPhanLoai.value,status:'COLLECT',thoiGianXayRa:PhanTichTinBao.obj.thoiGianXayRa};
											if(txtTenSuCo.value)data.tenSuCo=txtTenSuCo.value;
											if(txtGhiChu.value)data.ghiChu=txtGhiChu.value;
											NUT.ds.insert({url:NUT.services[6].url+"data/SuCoKhanNguy",data:data},function (res2) {
												if (res2.success)NUT.notify("Tạo sự cố thành công", "lime");
												else NUT.notify("🛑 ERROR: " + res2.result, "red");
											});
										}
										NUT.w2ui["grid_"+p.config.tabid].reload();
										NUT.notify("Tin báo đã được phân loại", "lime");
										NUT.closeDialog();
									} else NUT.notify("🛑 ERROR: " + res.result, "red");
								});
							}
						}
					});
				}else NUT.notify("🛑 ERROR: " + res.result, "red");
			});
		}else NUT.notify("No record selected!", "yellow");
	}
}