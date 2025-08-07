var DongTinBao = {
	run: function (p) {
		if (p.records.length) {
			NUT.confirm("Đóng tin báo sự cố?",function(awnser){
				if (awnser == "yes") {
					NUT.ds.update({url:NUT.services[6].url+"data/TinBaoSuCo",data:{status:'FINISH'},where:["id","=",p.records[0].id]},function(res){
						if(res.success){
							NUT.w2ui["grid_"+p.config.tabid].reload();
							NUT.notify("Đóng tin báo sự cố thành công!", "lime");
						}else NUT.notify("🛑 ERROR: " + res.result, "red");
					});
				}
			});
		}else NUT.notify("No record selected!", "yellow");
	}
}