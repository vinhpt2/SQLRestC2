var Com_HrmsImportBangLuong={
	run:function(p){
		this.conf=p.config;
		var id="divCom_HrmsImportBangLuong";
		var fieldnames=["madoitac","nam","thang","makhuvuc","manhavien","diadiemlv","chitieungaycong","tongngaycong","phucapngaycong","hotrothamnien","hotroxangxe","hotrotrangdiem","hotrodienthoai","hotrokhuvuc","phucapdiemban","dinhmuckpi1","thucdatkpi1","tylekpi1","phucapkpi1","dinhmuckpi2","thucdatkpi2","tylekpi2","phucapkpi2","sanluongvuotkhoan","phucapsanluong","tongphucap","chiphibhxh","chiphicongdoan","chiphihotroluong","chiphiletet","thunhaptruocthue","khautrucanhan","songuoiphuthuoc","khautruphuthuoc","tongsokhautru","tongtnkhautruthue","stkhautruthuetncn","thuclinh"];
		var header=fieldnames.join('\t')+"\n";
		w2popup.open({
			title:"📥 <i>Import bảng lương từ Excel</i>",
			modal:true,
			width: 1000,
			height: 700,
			body: '<textarea cols='+(header.length+8*fieldnames.length)+' id="'+id+'" style="height:100%">'+header+'</textarea>',
			buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="Com_HrmsImportBangLuong.insert('+id+'.value)">✔️ Import</button>'
		});
	},
	insert:function(csv){
		NUT.ds.insertCsv({url:this.conf.urledit,data:csv.replaceAll('\t',',')},function(res){
			if(res.length)NUT.tagMsg("Data imported.","lime");
		});
	}
}