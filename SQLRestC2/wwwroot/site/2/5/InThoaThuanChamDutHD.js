var InThoaThuanChamDutHD={
	run:function(p){
		InThoaThuanChamDutHD.url = NUT.services[2].url;
		if (p) {
			if (p.records.length) {
				for (var i = 0; i < p.records.length; i++)InThoaThuanChamDutHD.inThoaThuan(p.records[i]);
			} else NUT.notify("⚠️ Không có bản ghi nào được chọn!", "yellow");
		} else NUT.ds.select({ url: InThoaThuanChamDutHD.url + "data/hopdonglaodong", orderby: "ngaykyhd desc", where: ["manhanvien", "=", n$.user.username] }, function (res) {
			InThoaThuanChamDutHD.inThoaThuan(res.result[0], true);
		});
	},
	inThoaThuan:function(hd){
		NUT.ds.select({ url: InThoaThuanChamDutHD.url +"data/nhansu",where:["manhanvien","=",hd.manhanvien]},function(res){
			if (res.success && res.result.length) {
				var nv = res.result[res.result.length - 1];
				
				var win_hd = window.open("site/" + n$.user.siteid + "/" + n$.app.appid +"/In_ThoaThuanChamDutHD.html");
				win_hd.onload=function(){
					var ymd=hd.ngaythoiviec?hd.ngaythoiviec.split("-"):["","",""];
					
					//hopdong
					this.sohopdong.innerHTML=(nv.sohoso||"..........")+"/"+(ymd[0]||"....")+"/HĐLĐ-"+nv.vitrilv;
					this.ngaythangnam.innerHTML=(ymd[2]||".....")+" tháng "+(ymd[1]||".....")+" năm "+(ymd[0]||"........");
					this.hoten.innerHTML=this.hoten2.innerHTML=nv.hoten||"";
					this.quoctich.innerHTML = NUT.domains[82].lookup[nv.quoctich][1]||"";
					this.ngaysinh.innerHTML=NUT.dmy(nv.ngaysinh)||"";
					this.gioitinh.innerHTML = NUT.domains[76].lookup[nv.gioitinh][1]||"";
					this.noio.innerHTML=nv.noio||"";
					this.hokhau.innerHTML=nv.diachitt||"";
					this.socmt.innerHTML=nv.socmt||"";
					this.ngaycap.innerHTML = NUT.dmy(nv.ngaycapcmt)||"";
					this.noicap.innerHTML=nv.noicapcmt||"";

					this.ngaykyhd.innerHTML=NUT.dmy(hd.ngaykyhd)||"";
					this.ngaythoiviec.innerHTML=this.ngaythoiviec2.innerHTML=NUT.dmy(hd.ngaythoiviec)||"";

					//this.print();
				}
			} else NUT.notify("⚠️ Không có dữ liệu hợp đồng!", "yellow");
		});
	}
}